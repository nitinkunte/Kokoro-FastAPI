# Kokoro-FastAPI Project Index

> Generated: 2026-06-20
> Last Updated: 2026-06-20
> Project Version: 0.3.0
> Repository: https://github.com/remsky/Kokoro-FastAPI

---

## 1. Project Overview

| Attribute | Value |
|-----------|-------|
| **Name** | Kokoro-FastAPI |
| **Description** | FastAPI wrapper for Kokoro-82M text-to-speech model |
| **Language** | Python >=3.10 |
| **Framework** | FastAPI 0.115.6 + Uvicorn 0.34.0 |
| **Model** | Kokoro-82M (via `kokoro==0.9.4` + `misaki==0.9.4`) |
| **Default Port** | 8880 |
| **License** | Apache 2.0 |

### Key Features
- OpenAI-compatible Speech REST API
- Multi-language support (English, Japanese, Chinese, Korean)
- GPU (CUDA) / CPU / MPS (Apple Silicon) inference
- Streaming audio generation (sentence-level chunking)
- Voice mixing with weighted combinations
- Per-word timestamped caption generation
- Phoneme-based audio generation
- Multiple output formats (mp3, wav, opus, flac, pcm, m4a)
- Integrated web UI (Gradio) + web player
- Kubernetes Helm chart deployment
- Enhanced TTS with progress tracking and chunk skipping

---

## 2. Directory Structure

```
Kokoro-FastAPI/
├── api/                              # Main API application
│   ├── src/
│   │   ├── main.py                   # FastAPI entry point + lifespan
│   │   ├── main_enhanced.py          # Enhanced entry point with additional features
│   │   ├── builds/v1_0/              # Versioned build artifacts
│   │   │   └── config.json           # Build configuration
│   │   ├── core/                     # Core configuration & utilities
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Settings (env-var driven)
│   │   │   ├── don_quixote.txt       # Test document
│   │   │   ├── model_config.py       # Kokoro model configuration
│   │   │   ├── paths.py              # Async file/path utilities
│   │   │   └── openai_mappings.json  # OpenAI voice/model name mappings
│   │   ├── inference/                # TTS inference engine layer
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Abstract ModelBackend + AudioChunk
│   │   │   ├── kokoro_v1.py          # Kokoro v1 backend implementation
│   │   │   ├── model_manager.py      # Model lifecycle management
│   │   │   └── voice_manager.py      # Voice pack management + caching
│   │   ├── models/v1_0/              # Versioned model files
│   │   │   ├── config.json           # Model configuration
│   │   │   └── kokoro-v1_0.pth       # Model weights
│   │   ├── routers/                  # FastAPI route handlers
│   │   │   ├── __init__.py
│   │   │   ├── audio_enhanced.py     # Enhanced audio endpoints
│   │   │   ├── debug.py              # Debug/monitoring endpoints
│   │   │   ├── development.py        # Dev-only endpoints (phonemes, captions)
│   │   │   ├── openai_compatible.py  # OpenAI-compatible Speech API
│   │   │   └── web_player.py         # Web UI static files + backend
│   │   ├── services/                 # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── audio.py              # Audio format conversion + normalization
│   │   │   ├── streaming_audio_writer.py  # Streaming audio format writer
│   │   │   ├── temp_manager.py       # Temp file management for downloads
│   │   │   ├── text_processing.py    # Legacy text processing entry point
│   │   │   ├── tts_service.py        # Core TTS service (generation + streaming)
│   │   │   ├── tts_enhanced.py       # Enhanced TTS with progress tracking
│   │   │   └── text_processing/      # Text processing subpackage
│   │   │       ├── __init__.py
│   │   │       ├── normalizer.py     # Text normalization (URLs, emails, numbers, etc.)
│   │   │       ├── phonemizer.py     # Phonemization for multiple languages
│   │   │       ├── text_processor.py # Unified text processing + smart_split
│   │   │       └── vocabulary.py     # Token vocabulary mapping
│   │   └── structures/               # Pydantic data models / schemas
│   │       ├── __init__.py
│   │       ├── custom_responses.py   # Custom StreamingResponse classes
│   │       ├── model_schemas.py      # Model-related schemas
│   │       ├── schemas.py            # Request/response schemas
│   │       └── text_schemas.py       # Text processing schemas
│   └── tests/                        # Test suite (pytest)
│       ├── conftest.py
│       ├── test_audio_service.py
│       ├── test_development.py
│       ├── test_kokoro_v1.py
│       ├── test_normalizer.py
│       ├── test_openai_endpoints.py
│       ├── test_paths.py
│       ├── test_text_processor.py
│       ├── test_tts_service.py
│       └── test_data/
├── ui/                               # Gradio-based web UI
│   ├── app.py
│   ├── lib/
│   │   ├── api.py
│   │   ├── config.py
│   │   ├── files.py
│   │   ├── handlers.py
│   │   ├── interface.py
│   │   ├── components/
│   │   │   ├── __init__.py
│   │   │   ├── input.py              # Input component (text, voice selection)
│   │   │   ├── model.py              # Model component (settings, status)
│   │   │   └── output.py             # Output component (audio player, waveform)
│   │   └── depr_tests/
│   ├── depr_tests/
│       ├── conftest.py
│       ├── test_api.py
│       ├── test_components.py
│       ├── test_files.py
│       ├── test_handlers.py
│       ├── test_input.py
│       ├── test_interface.py
├── web/                              # Frontend web player (vanilla JS)
│   ├── index.html
│   ├── index2.html
│   ├── index3.html
│   ├── favicon.svg
│   ├── siriwave.js
│   ├── src/
│   │   ├── App.js                    # Main application logic
│   │   ├── config.js                 # Configuration
│   │   ├── SessionManager.js         # WebSocket/streaming session management
│   │   ├── components/
│   │   │   ├── PlayerControls.js     # Audio playback controls
│   │   │   ├── TextEditor.js         # Text input editor
│   │   │   ├── VoiceSelector.js      # Voice selection dropdown
│   │   │   └── WaveVisualizer.js     # Waveform visualization
│   │   ├── services/
│   │   │   ├── AudioService.js       # Audio API client
│   │   │   └── VoiceService.js       # Voice management API client
│   │   ├── state/
│   │   │   └── PlayerState.js        # Player state management
│   │   └── utils/                    # Utility functions
│   └── styles/
│       ├── badges.css
│       ├── base.css
│       ├── controls.css
│       ├── forms.css
│       ├── header.css
│       ├── layout.css
│       ├── player.css
│       └── responsive.css
├── docker/                           # Docker configurations
│   ├── cpu/                          # CPU-only Docker setup
│   ├── gpu/                          # NVIDIA GPU Docker setup
│   ├── rocm/                         # AMD GPU Docker setup
│   │   └── kdb_install.sh
│   ├── scripts/
│   │   ├── download_model.py         # Model download script
│   │   ├── download_model.sh
│   │   └── entrypoint.sh
│   └── build.sh
├── charts/                           # Kubernetes Helm chart
│   └── kokoro-fastapi/
│       ├── .helmignore
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── templates/
│       └── examples/
├── examples/                         # Usage examples & scripts
│   ├── assorted_checks/
│   │   ├── __init__.py
│   │   ├── generate_readme_plots.py
│   │   ├── test_normalizer.py
│   │   ├── validate_wav.py
│   │   ├── validate_wavs.py
│   │   ├── benchmarks/
│   │   └── test_combinations/
│   ├── phoneme_examples/
│   │   ├── generate_phonemes.py
│   │   ├── test_phoneme_generation.py
│   │   └── examples/
│   ├── streaming_refactor/
│   │   ├── benchmark_unified_streaming.py
│   │   └── test_unified_streaming.py
│   ├── voice_samples/
│   ├── assorted_checks/test_formats/
│   ├── assorted_checks/test_openai/
│   ├── assorted_checks/test_voices/
│   ├── assorted_checks/__init__.py
│   ├── assorted_checks/generate_readme_plots.py
│   ├── assorted_checks/test_normalizer.py
│   ├── assorted_checks/validate_wav.py
│   ├── assorted_checks/validate_wavs.py
│   ├── assorted_checks/benchmarks/
│   ├── assorted_checks/test_combinations/
│   ├── assorted_checks/test_formats/
│   ├── assorted_checks/test_openai/
│   ├── assorted_checks/test_voices/
│   ├── phoneme_examples/
│   ├── streaming_refactor/
│   ├── voice_samples/
│   ├── __init__.py
│   ├── audio_analysis.png
│   ├── captioned_speech_example.py
│   ├── openai_streaming_audio.py
│   ├── requirements.txt
│   ├── simul_file_test.py
│   ├── simul_openai_streaming_audio.py
│   ├── simul_speaker_test.py
│   └── stream_tts_playback.py
├── scripts/                          # Utility scripts
│   ├── fix_misaki.py
│   ├── update_badges.py
│   └── update_version.py
├── docs/                             # Documentation
│   ├── PROJECT_INDEX.md
│   ├── requirements.in
│   ├── requirements.txt
│   └── architecture/
│       ├── espeak_setup_fix.md
│       └── streaming_audio_writer_analysis.md
├── dev/                              # Development scripts
│   ├── Test copy 2.py
│   ├── Test copy.py
│   ├── Test money.py
│   ├── Test num.py
│   ├── Test Phon.py
│   ├── Test Threads.py
│   └── Test.py
├── pyproject.toml                    # Project metadata + dependencies
├── README.md                         # Project README
├── start-cpu.sh / start-cpu.ps1      # Start scripts (CPU)
├── start-gpu.sh / start-gpu.ps1      # Start scripts (GPU)
└── start-gpu_mac.sh                  # Start script (Mac GPU)
```

---

## 3. Core Configuration

### 3.1 Settings (`api/src/core/config.py`)

**Class**: `Settings(BaseSettings)`

| Field | Type | Description |
|-------|------|-------------|
| `api_title` | str | API title (default: "Kokoro TTS API") |
| `api_description` | str | API description |
| `api_version` | str | API version |
| `host` | str | Bind address |
| `port` | int | Bind port (default: 8880) |
| `cors_enabled` | bool | Enable CORS middleware |
| `cors_origins` | list | Allowed CORS origins |
| `enable_web_player` | bool | Enable /web route |
| `allow_local_voice_saving` | bool | Allow saving combined voice packs |
| `temp_file_dir` | str | Temp directory for download files |
| `output_dir` | str | Output directory for generated audio |
| `advanced_text_normalization` | bool | Enable advanced text normalization |
| `target_min_tokens` | int | Target minimum tokens per chunk |
| `target_max_tokens` | int | Target maximum tokens per chunk |
| `absolute_max_tokens` | int | Absolute maximum tokens per chunk |

Environment variables can override all settings via `pydantic-settings`.

### 3.2 Model Configuration (`api/src/core/model_config.py`)

| Class | Purpose |
|-------|---------|
| `KokoroV1Config` | Kokoro v1 model parameters (lang codes, pipeline settings) |
| `PyTorchConfig` | PyTorch backend config (device selection, dtype) |
| `ModelConfig` | Aggregate config holding KokoroV1Config + PyTorchConfig |

### 3.3 OpenAI Mappings (`api/src/core/openai_mappings.json`)

Maps OpenAI-style model/voice names to internal names:
```json
{
  "models": { "kokoro": "kokoro-v1-0", "tts-1": "kokoro-v1-0", "tts-1-hd": "kokoro-v1-0" },
  "voices": { "af_bella": "af_bella", ... }
}
```

---

## 4. Inference Layer

### 4.1 Base Classes (`api/src/inference/base.py`)

| Class/Function | Description |
|----------------|-------------|
| `AudioChunk` | Holds audio data as numpy int16 array + optional word timestamps |
| `AudioChunk.combine()` | Static method to concatenate multiple AudioChunks |
| `ModelBackend` (ABC) | Abstract base for TTS backends — defines `load_model()`, `generate()`, `unload()` |
| `BaseModelBackend` | Concrete base with shared lifecycle state (`_loaded`, `_device`, `_model`) |

### 4.2 Kokoro V1 Backend (`api/src/inference/kokoro_v1.py`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `__init__` | `()` | Initialize with empty model/voice references |
| `load_model` | `async load_model(path: str) -> None` | Load Kokoro v1-0 model from path |
| `_get_pipeline` | `_get_pipeline(lang_code: str) -> KPipeline` | Create KPipeline for a language |
| `generate_from_tokens` | `async generate_from_tokens(tokens, voice, speed) -> AudioChunk` | Generate audio from token IDs |
| `generate` | `async generate(text, voice, speed, lang_code, ...) -> AudioChunk` | Full pipeline: text → phonemes → audio |
| `_check_memory` | `_check_memory() -> bool` | Check available GPU/CPU memory |
| `_clear_memory` | `_clear_memory() -> None` | Clear model from memory |
| `unload` | `unload() -> None` | Unload model |
| `is_loaded` | `is_loaded() -> bool` | Check if model is loaded |
| `device` | `device() -> str` | Return current device ("cpu"/"cuda"/"mps") |

### 4.3 Model Manager (`api/src/inference/model_manager.py`)

| Method | Description |
|--------|-------------|
| `__init__(config)` | Initialize with optional ModelConfig |
| `_determine_device()` | Auto-detect CUDA → MPS → CPU |
| `initialize()` | Create backend and load model |
| `initialize_with_warmup(voice_manager)` | Initialize + warm up with a sample voice generation; returns (device, model_name, voicepack_count) |
| `get_backend()` | Return active BaseModelBackend |
| `load_model(path)` | Load model from path |
| `generate(*args, **kwargs)` | Delegate to backend |
| `unload_all()` | Unload all models |
| `current_backend()` | Return backend name string |
| `get_manager()` | Singleton factory function |

### 4.4 Voice Manager (`api/src/inference/voice_manager.py`)

| Method | Description |
|--------|-------------|
| `__init__()` | Initialize with LRU voice cache |
| `get_voice_path(voice_name)` | Resolve voice name to file path |
| `load_voice(voice_name, device)` | Load voice .pt tensor into cache |
| `combine_voices(voices)` | Weighted combination of voice tensors |
| `list_voices()` | List all available voice names |
| `cache_info()` | Return cache hit/miss stats |
| `get_manager()` | Singleton factory function |

---

## 5. Service Layer

### 5.1 TTSService (`api/src/services/tts_service.py`)

| Method | Description |
|--------|-------------|
| `__init__(output_dir)` | Initialize with output directory |
| `create(cls, output_dir)` | Async factory — initializes model_manager + voice_manager |
| `_process_chunk()` | Process a text chunk through the inference pipeline |
| `_load_voice_from_path(path, weight)` | Load a voice tensor with optional weight |
| `_get_voices_path(voice)` | Resolve voice name → (path, weight) tuple |
| `generate_audio_stream()` | Streaming generation: yields AudioChunk objects as audio is produced |
| `generate_audio()` | Non-streaming: returns complete AudioChunk |
| `combine_voices(voices)` | Combine multiple voice packs |
| `list_voices()` | List available voices |
| `generate_from_phonemes()` | Generate audio directly from phoneme string |

### 5.2 Enhanced TTSService (`api/src/services/tts_enhanced.py`)

Extends `TTSService` with progress tracking and chunk skipping capabilities.

| Method | Description |
|--------|-------------|
| `generate_audio_stream_with_progress()` | Streaming generation with NDJSON progress output, supports resuming from `start_chunk_index` |

### 5.3 Audio Service (`api/src/services/audio.py`)

| Class/Method | Description |
|--------------|-------------|
| `AudioNormalizer` | Normalizes audio: finds non-silent bounds, applies normalization |
| `AudioNormalizer.__init__()` | Initialize normalizer |
| `AudioNormalizer.find_first_last_non_silent()` | Find audio boundaries |
| `AudioNormalizer.normalize()` | Normalize audio data to target range |
| `AudioService.convert_audio()` | Convert AudioChunk to requested format (mp3/wav/opus/flac/pcm) |
| `AudioService.trim_audio()` | Trim silence from audio start/end |

### 5.4 Streaming Audio Writer (`api/src/services/streaming_audio_writer.py`)

| Method | Description |
|--------|-------------|
| `__init__(format, sample_rate, channels)` | Initialize writer for specific audio format |
| `close()` | Close file handle and cleanup |
| `write_chunk()` | Write a chunk of audio data, return bytes for streaming |

### 5.5 Temp File Manager (`api/src/services/temp_manager.py`)

| Function/Class | Description |
|----------------|-------------|
| `cleanup_temp_files()` | Remove old temp files on startup |
| `TempFileWriter.__init__(format)` | Initialize temp file writer |
| `TempFileWriter.__aenter__()` | Async context manager entry — create temp file |
| `TempFileWriter.__aexit__()` | Cleanup on exit |
| `TempFileWriter.write()` | Write audio bytes to temp file |
| `TempFileWriter.finalize()` | Finalize and return download path |

### 5.6 Text Processing (`api/src/services/text_processing/`)

Subpackage for text normalization, phonemization, and tokenization.

#### 5.6.1 Text Processor (`api/src/services/text_processing/text_processor.py`)

| Function | Description |
|----------|-------------|
| `process_text_chunk()` | Process a chunk through normalization → phonemization → tokenization |
| `process_text()` | Process text into token IDs |
| `get_sentence_info()` | Process all sentences and return info with token counts |
| `handle_custom_phonemes()` | Handle custom phoneme patterns `[phonemes](/ipa/)` |
| `smart_split()` | Async generator: splits text into optimal chunks (300-400 tokens target), handles pause tags `[pause:Xs]` |

#### 5.6.2 Normalizer (`api/src/services/text_processing/normalizer.py`)

Handles text normalization for TTS. Converts various formats to speakable text.

| Function | Description |
|----------|-------------|
| `normalize_text()` | Main normalization entry point with `NormalizationOptions` |
| `handle_email()` | Convert email addresses to speakable format |
| `handle_url()` | Convert URLs to speakable format (protocol, domain, path) |
| `handle_money()` | Convert money expressions ($12.50 → "twelve dollars and fifty cents") |
| `handle_numbers()` | Convert numbers to words |
| `handle_units()` | Convert unit abbreviations to full form |
| `handle_phone_number()` | Convert phone numbers to spoken digits |
| `handle_time()` | Convert time expressions (14:30 → "four thirty") |
| `handle_decimal()` | Convert decimal numbers (3.14 → "three point one four") |

**Constants:**
- `VALID_TLDS` — List of valid top-level domains for URL detection
- `VALID_UNITS` — 60+ unit mappings (length, mass, time, volume, speed, temperature, pressure, frequency, voltage, current, power, energy, resistance, capacitance, frequency, data size, CSS units)
- `SYMBOL_REPLACEMENTS` — Symbol to word mappings (@, #, $, %, &, etc.)
- `MONEY_UNITS` — Currency mappings ($, £, €)

#### 5.6.3 Phonemizer (`api/src/services/text_processing/phonemizer.py`)

| Function | Description |
|----------|-------------|
| `phonemize()` | Convert text to phonemes using misaki for en/ja/ko/zh |

#### 5.6.4 Vocabulary (`api/src/services/text_processing/vocabulary.py`)

| Function | Description |
|----------|-------------|
| `tokenize()` | Convert phoneme string to token IDs using Kokoro vocabulary |

---

## 6. Data Models & Schemas

### 6.1 Request Schemas (`api/src/structures/schemas.py`)

| Schema | Fields |
|--------|--------|
| `OpenAISpeechRequest` | `model`, `input`, `voice`, `response_format`, `download_format`, `speed`, `stream`, `return_download_link`, `lang_code`, `volume_multiplier`, `normalization_options` |
| `CaptionedSpeechRequest` | Same as OpenAISpeechRequest + `return_timestamps` |
| `NormalizationOptions` | `normalize`, `unit_normalization`, `url_normalization`, `email_normalization`, `optional_pluralization_normalization`, `phone_normalization`, `replace_remaining_symbols` |
| `CaptionedSpeechResponse` | `audio` (base64), `audio_format`, `timestamps` (List[WordTimestamp]) |
| `WordTimestamp` | `word`, `start_time`, `end_time` |
| `VoiceCombineRequest` | `voices` (str or List[str]) |
| `TTSStatus` | Enum: PENDING, PROCESSING, COMPLETED, FAILED, DELETED |

### 6.2 Text Schemas (`api/src/structures/text_schemas.py`)

| Schema | Fields |
|--------|--------|
| `PhonemeRequest` | `text`, `language` |
| `PhonemeResponse` | `phonemes`, `tokens` |
| `GenerateFromPhonemesRequest` | `phonemes`, `voice`, `speed` |

### 6.3 Model Schemas (`api/src/structures/model_schemas.py`)

| Schema | Description |
|--------|-------------|
| Model info schemas | Model metadata, status, and configuration schemas |

### 6.4 Custom Responses (`api/src/structures/custom_responses.py`)

| Class | Description |
|-------|-------------|
| `JSONStreamingResponse` | StreamingResponse that serializes each chunk to JSON |

---

## 7. API Endpoints Reference

### 7.1 OpenAI-Compatible (`/v1`) — `routers/openai_compatible.py`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/audio/speech` | Generate TTS audio (streaming or non-streaming) |
| `GET` | `/v1/audio/voices` | List available voices |
| `POST` | `/v1/audio/voices/combine` | Combine voices → download .pt file |
| `GET` | `/v1/models` | List available models |
| `GET` | `/v1/models/{model}` | Get a specific model's info |
| `GET` | `/v1/download/{filename}` | Download a previously generated audio file |
| `GET` | `/v1/test` | Test endpoint |

### 7.2 Development (`/dev`) — `routers/development.py`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/dev/phonemize` | Convert text to phonemes + tokens |
| `POST` | `/dev/generate_from_phonemes` | Generate audio directly from phonemes |
| `POST` | `/dev/captioned_speech` | Generate audio with word-level timestamps |

### 7.3 Debug (`/debug`) — `routers/debug.py`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/debug/threads` | Thread info, active count, memory usage |
| `GET` | `/debug/storage` | Disk partition usage |
| `GET` | `/debug/system` | CPU, memory, GPU, network, process info |
| `GET` | `/debug/session_pools` | ONNX session / CUDA stream pool status |

### 7.4 Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check (returns `{"status": "healthy"}`) |

### 7.5 Web Player (`/web`) — `routers/web_player.py`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/web/` | Serve web player UI |
| `GET` | `/web/{filename}` | Serve static assets (JS, CSS, SVG) |

---

## 8. Application Entry Point

### 8.1 Main App (`api/src/main.py`)

```python
# Entry point
uvicorn.run("api.src.main:app", host=settings.host, port=settings.port, reload=True)

# FastAPI app configuration
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    lifespan=lifespan,
    openapi_url="/openapi.json",
)

# Routers mounted on app
app.include_router(openai_router, prefix="/v1")
app.include_router(dev_router)           # /dev/*
app.include_router(debug_router)         # /debug/*
app.include_router(web_router, prefix="/web")  # /web/*
```

### 8.2 Enhanced Main (`api/src/main_enhanced.py`)

Enhanced entry point with additional features including progress tracking and enhanced streaming capabilities.

### 8.3 Lifespan (`lifespan` context manager)

1. Clean old temp files
2. Get model manager + voice manager (singleton)
3. Initialize model with warmup
4. Log startup banner with device, model name, voicepack count

---

## 9. Dependencies

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.115.6 | Web framework |
| uvicorn | 0.34.0 | ASGI server |
| pydantic | 2.10.4 | Data validation |
| pydantic-settings | 2.7.0 | Environment config |
| sqlalchemy | 2.0.27 | Database ORM |
| loguru | 0.7.3 | Logging |

### ML / Inference
| Package | Version | Purpose |
|---------|---------|---------|
| kokoro | 0.9.4 | Kokoro TTS model |
| misaki | 0.9.4 | Phonemization (en/ja/ko/zh) |
| numpy | >=1.26.0 | Numerical operations |
| scipy | 1.14.1 | Signal processing |
| torch | varies* | Deep learning backend |

*PyTorch version varies by extra: `cpu` → CPU-only, `gpu` → CUDA 12.9, `rocm` → ROCm 6.4

### Audio
| Package | Version | Purpose |
|---------|---------|---------|
| soundfile | 0.13.0 | WAV file I/O |
| pydub | >=0.25.1 | Audio format conversion |
| mutagen | >=1.47.0 | Audio metadata |
| av | >=14.2.0 | FFmpeg bindings |

### Text Processing
| Package | Version | Purpose |
|---------|---------|---------|
| inflect | >=7.5.0 | Number-to-word conversion |
| regex | 2024.11.6 | Advanced regex |
| tiktoken | 0.8.0 | Token counting |

### Optional
| Extra | Packages |
|-------|----------|
| `gpu` | torch==2.8.0+cu129 |
| `cpu` | torch==2.8.0 |
| `rocm` | torch==2.8.0+rocm6.4, pytorch-triton-rocm |
| `test` | pytest, pytest-cov, httpx, pytest-asyncio |

---

## 10. Deployment

### Docker
| Profile | Directory | Description |
|---------|-----------|-------------|
| CPU | `docker/cpu/` | CPU-only image, no GPU required |
| GPU | `docker/gpu/` | NVIDIA CUDA 12.9 image |
| ROCm | `docker/rocm/` | AMD ROCm image |

### Kubernetes
| Path | Description |
|------|-------------|
| `charts/kokoro-fastapi/` | Helm chart with Chart.yaml + values.yaml + templates/ + examples/ |

### Start Scripts
| Script | Platform | Description |
|--------|----------|-------------|
| `start-cpu.sh` | Linux/macOS | Start with UV (CPU) |
| `start-cpu.ps1` | Windows PowerShell | Start with UV (CPU) |
| `start-gpu.sh` | Linux/macOS | Start with UV (GPU) |
| `start-gpu.ps1` | Windows PowerShell | Start with UV (GPU) |
| `start-gpu_mac.sh` | macOS | Start script for Mac GPU |

---

## 11. Test Suite

| Test File | Covers |
|-----------|--------|
| `test_audio_service.py` | Audio conversion, format handling |
| `test_development.py` | Dev endpoints (phonemize, captioned speech) |
| `test_kokoro_v1.py` | Kokoro v1 backend |
| `test_normalizer.py` | Text normalization |
| `test_openai_endpoints.py` | OpenAI-compatible endpoints |
| `test_paths.py` | File path utilities |
| `test_text_processor.py` | Text processing / smart_split |
| `test_tts_service.py` | TTS service layer |

---

## 12. Web UI

### Gradio UI (`ui/`)
- `app.py` — Gradio application entry point
- `lib/api.py` — API client for UI
- `lib/handlers.py` — Event handlers
- `lib/interface.py` — UI component layout
- `lib/config.py` — UI configuration
- `lib/components/input.py` — Input components (text, voice selection)
- `lib/components/model.py` — Model settings and status components
- `lib/components/output.py` — Output components (audio player, waveform)

### Web Player (`web/`)
- Vanilla JavaScript frontend (no framework)
- `App.js` — Main application logic
- `SessionManager.js` — WebSocket/streaming session management
- `config.js` — Configuration
- `siriwave.js` — Waveform visualization
- `components/PlayerControls.js` — Audio playback controls
- `components/TextEditor.js` — Text input editor
- `components/VoiceSelector.js` — Voice selection dropdown
- `components/WaveVisualizer.js` — Waveform visualization
- `services/AudioService.js` — Audio API client
- `services/VoiceService.js` — Voice management API client
- `state/PlayerState.js` — Player state management
- Multiple HTML entry points: `index.html`, `index2.html`, `index3.html`

---

## 13. Documentation

| File | Description |
|------|-------------|
| `docs/PROJECT_INDEX.md` | This file — comprehensive project index |
| `docs/requirements.in` | Documentation build requirements (source) |
| `docs/requirements.txt` | Documentation build requirements (pinned) |
| `docs/architecture/espeak_setup_fix.md` | eSpeak setup troubleshooting guide |
| `docs/architecture/streaming_audio_writer_analysis.md` | Streaming audio writer architecture analysis |

---

## 14. Utility Scripts

| Script | Description |
|--------|-------------|
| `scripts/fix_misaki.py` | Fix misaki phonemization issues |
| `scripts/update_badges.py` | Update README badges |
| `scripts/update_version.py` | Update project version |

---

## 15. Development Files

| File | Description |
|------|-------------|
| `dev/Test.py` | Development test script |
| `dev/Test Threads.py` | Threading tests |
| `dev/Test Phon.py` | Phoneme tests |
| `dev/Test money.py` | Money/number normalization tests |
| `dev/Test num.py` | Number processing tests |
| `dev/Test copy.py` | Copy/test scripts |

---

## 16. Assets

| File | Description |
|------|-------------|
| `assets/cpu_first_token_timeline_stream_openai.png` | CPU first token timeline (streaming, OpenAI) |
| `assets/docs-screenshot.png` | Documentation screenshot |
| `assets/format_comparison.png` | Audio format comparison |
| `assets/gpu_first_token_latency_direct.png` | GPU first token latency (direct) |
| `assets/gpu_first_token_latency_openai.png` | GPU first token latency (OpenAI) |
| `assets/gpu_first_token_timeline_direct.png` | GPU first token timeline (direct) |
| `assets/gpu_first_token_timeline_openai.png` | GPU first token timeline (OpenAI) |
| `assets/gpu_processing_time.png` | GPU processing time chart |
| `assets/gpu_realtime_factor.png` | GPU realtime factor chart |
| `assets/gpu_total_time_latency_direct.png` | GPU total time latency (direct) |
| `assets/gpu_total_time_latency_openai.png` | GPU total time latency (OpenAI) |
| `assets/voice_analysis.png` | Voice analysis chart |
| `assets/webui-screenshot.png` | Web UI screenshot |
| `assets/GUIBanner.png` | GUI banner image |

---

*End of Project Index*