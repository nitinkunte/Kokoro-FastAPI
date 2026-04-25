from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from loguru import logger
from typing import Optional

from ..structures import OpenAISpeechRequest
from ..services.streaming_audio_writer import StreamingAudioWriter
from ..services.tts_enhanced import EnhancedTTSService
from .openai_compatible import _openai_mappings, process_and_validate_voices

router = APIRouter(
    tags=["Enhanced TTS (Progress tracking)"],
    responses={404: {"description": "Not found"}},
)

# Use our enhanced service natively
_enhanced_tts_service = None
_enhanced_init_lock = None

async def get_enhanced_tts_service() -> EnhancedTTSService:
    global _enhanced_tts_service, _enhanced_init_lock
    if _enhanced_init_lock is None:
        import asyncio
        _enhanced_init_lock = asyncio.Lock()

    if _enhanced_tts_service is None:
        async with _enhanced_init_lock:
            if _enhanced_tts_service is None:
                _enhanced_tts_service = await EnhancedTTSService.create()
                logger.info("Created global EnhancedTTSService instance")
    return _enhanced_tts_service

class ProgressSpeechRequest(OpenAISpeechRequest):
    start_chunk_index: int = 0

@router.post("/audio/speech/progress_stream")
async def create_speech_progress_stream(
    request: ProgressSpeechRequest,
    client_request: Request,
):
    """
    NDJSON Streaming endpoint that yields {"chunk_index": int, "audio_base64": "...", "chunk_text": "..."}
    """
    if request.model not in _openai_mappings["models"]:
        raise HTTPException(
            status_code=400,
            detail={"error": "invalid_model", "message": f"Unsupported model: {request.model}"}
        )

    try:
        tts_service = await get_enhanced_tts_service()
        voice_name = await process_and_validate_voices(request.voice, tts_service)
        
        writer = StreamingAudioWriter(request.response_format, sample_rate=24000)

        async def generate_ndjson():
            count = 0
            try:
                unique_properties = {"return_timestamps": False}
                if hasattr(request, "return_timestamps"):
                    unique_properties["return_timestamps"] = request.return_timestamps
                    
                async for payload_line in tts_service.generate_audio_stream_with_progress(
                    text=request.input,
                    voice=voice_name,
                    writer=writer,
                    speed=request.speed,
                    output_format=request.response_format,
                    lang_code=request.lang_code,
                    volume_multiplier=request.volume_multiplier,
                    normalization_options=request.normalization_options,
                    return_timestamps=unique_properties["return_timestamps"],
                    start_chunk_index=request.start_chunk_index,
                ):
                    is_disconnected = client_request.is_disconnected
                    if callable(is_disconnected):
                        is_disconnected = await is_disconnected()
                    if is_disconnected:
                        logger.info("Client disconnected, stopping enhanced generation")
                        break
                    
                    count += 1
                    yield payload_line

            except Exception as e:
                logger.error(f"Error in enhanced streaming: {str(e)}")
                raise
            finally:
                writer.close()

        # We return NDJSON stream
        return StreamingResponse(
            generate_ndjson(),
            media_type="application/x-ndjson",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive"
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": "validation_error", "message": str(e)})
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail={"error": "server_error", "message": str(e)})
