import asyncio
import json
import base64
from typing import AsyncGenerator, Optional
from loguru import logger
import numpy as np

from .tts_service import TTSService
from .audio import AudioNormalizer, AudioService
from ..structures.schemas import NormalizationOptions
from .streaming_audio_writer import StreamingAudioWriter
from .text_processing.text_processor import smart_split
from ..inference.base import AudioChunk

class EnhancedTTSService(TTSService):
    """Enhanced TTS service with progress tracking and chunk skipping."""
    
    async def generate_audio_stream_with_progress(
        self,
        text: str,
        voice: str,
        writer: StreamingAudioWriter,
        speed: float = 1.0,
        output_format: str = "wav",
        lang_code: Optional[str] = None,
        volume_multiplier: Optional[float] = 1.0,
        normalization_options: Optional[NormalizationOptions] = NormalizationOptions(),
        return_timestamps: Optional[bool] = False,
        start_chunk_index: int = 0,
    ) -> AsyncGenerator[str, None]:
        """
        Generate audio and stream NDJSON lines with progress state.
        Skips all chunks before start_chunk_index.
        """
        stream_normalizer = AudioNormalizer()
        chunk_index = 0
        current_offset = 0.0
        
        try:
            backend = self.model_manager.get_backend()
            voice_name, voice_path = await self._get_voices_path(voice)
            pipeline_lang_code = lang_code if lang_code else voice[:1].lower()
            
            async for chunk_text, tokens, pause_duration_s in smart_split(
                text,
                lang_code=pipeline_lang_code,
                normalization_options=normalization_options,
            ):
                # Always increment chunk_index for every item smart_split provides
                is_skipped = chunk_index < start_chunk_index
                
                # If skipped, just advance our loop without TTS processing
                if is_skipped:
                    chunk_index += 1
                    continue
                    
                chunk_audio_bytes = b""
                
                if pause_duration_s is not None and pause_duration_s > 0:
                    try:
                        silence_samples = int(pause_duration_s * 24000)
                        silence_audio = np.zeros(silence_samples, dtype=np.int16)
                        pause_chunk = AudioChunk(audio=silence_audio, word_timestamps=[])
                        
                        if output_format:
                            formatted_pause_chunk = await AudioService.convert_audio(
                                pause_chunk, output_format, writer, speed=speed, chunk_text="",
                                is_last_chunk=False, trim_audio=False, normalizer=stream_normalizer,
                            )
                            if formatted_pause_chunk.output:
                                chunk_audio_bytes = formatted_pause_chunk.output
                        else:
                            if len(pause_chunk.audio) > 0:
                                chunk_audio_bytes = pause_chunk.audio.tobytes() # Fallback, rarely used via stream
                                
                        current_offset += pause_duration_s
                        
                    except Exception as e:
                        logger.error(f"Failed to process pause chunk: {str(e)}")
                        chunk_index += 1
                        continue
                
                elif tokens or chunk_text.strip():
                    try:
                        # Process audio for chunk
                        async for chunk_data in self._process_chunk(
                            chunk_text, tokens, voice_name, voice_path, speed, writer,
                            output_format, is_first=(chunk_index == start_chunk_index),
                            volume_multiplier=volume_multiplier, is_last=False,
                            normalizer=stream_normalizer, lang_code=pipeline_lang_code,
                            return_timestamps=return_timestamps,
                        ):
                            if chunk_data.word_timestamps is not None:
                                for timestamp in chunk_data.word_timestamps:
                                    timestamp.start_time += current_offset
                                    timestamp.end_time += current_offset

                            chunk_duration = 0
                            if chunk_data.audio is not None and len(chunk_data.audio) > 0:
                                chunk_duration = len(chunk_data.audio) / 24000
                                current_offset += chunk_duration

                            if chunk_data.output is not None:
                                chunk_audio_bytes += chunk_data.output
                            elif chunk_data.audio is not None and len(chunk_data.audio) > 0:
                                chunk_audio_bytes += chunk_data.audio.tobytes()
                    except Exception as e:
                        logger.error(f"Failed to process audio for chunk: '{chunk_text[:50]}...'. Error: {str(e)}")
                        chunk_index += 1
                        continue
                
                # Check if we generated anything
                if chunk_audio_bytes:
                    payload = {
                        "chunk_index": chunk_index + 1,  # Predict the NEXT chunk index to start from if paused
                        "audio_base64": base64.b64encode(chunk_audio_bytes).decode("utf-8"),
                        "chunk_text": chunk_text
                    }
                    yield json.dumps(payload) + "\n"
                
                chunk_index += 1

            # Finalize only if we processed chunks
            if chunk_index > start_chunk_index:
                try:
                    chunk_audio_bytes = b""
                    async for chunk_data in self._process_chunk(
                        "", [], voice_name, voice_path, speed, writer, output_format,
                        is_first=False, is_last=True, volume_multiplier=volume_multiplier,
                        normalizer=stream_normalizer, lang_code=pipeline_lang_code,
                    ):
                        if chunk_data.output is not None:
                            chunk_audio_bytes += chunk_data.output
                    
                    if chunk_audio_bytes:
                        payload = {
                            "chunk_index": -1, # Sentinel flag for complete
                            "audio_base64": base64.b64encode(chunk_audio_bytes).decode("utf-8"),
                            "chunk_text": ""
                        }
                        yield json.dumps(payload) + "\n"
                except Exception as e:
                    logger.error(f"Failed to finalize audio stream: {str(e)}")

        except Exception as e:
            logger.error(f"Error in enhanced phoneme audio generation: {str(e)}")
            raise e
