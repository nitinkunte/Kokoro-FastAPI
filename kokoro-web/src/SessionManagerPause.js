// --- AudioService Enhanced: NDJSON Streaming and Progress State ---
// This file contains the pause/resume and NDJSON streaming functionality.
// It is separated from SessionManager.js to keep user setting persistence clean.
// Import this file AFTER SessionManager.js if you need pause/resume features.

import AudioService from './services/AudioService.js';
import { config } from './config.js';

const originalStreamAudio = AudioService.prototype.streamAudio;
AudioService.prototype.streamAudio = async function(text, voice, speed, onProgress, isResume = false) {
    try {
        console.log('AudioService Enhanced: Starting stream...', { text, voice, speed, isResume });
        
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
        
        this.controller = new AbortController();
        this.cleanup();
        
        this.textLength = text.length;
        this.shouldAutoplay = document.getElementById('autoplay-toggle').checked;
        
        const startIndex = isResume ? parseInt(sessionStorage.getItem('kokoro-progress-index') || '0', 10) : 0;
        const estimatedChunks = Math.max(1, Math.ceil(this.textLength / this.CHARS_PER_CHUNK));
        
        if (isResume) {
            onProgress?.(startIndex, estimatedChunks);
        } else {
            onProgress?.(0, 1);
        }
        
        // Dynamic endpoint selection depending on if the backend is configured properly.
        // We will default to the enhanced endpoint!
        const apiUrl = await config.getApiUrl('/enhanced/v1/audio/speech/progress_stream');
        
        if (!isResume) {
            sessionStorage.setItem('kokoro-progress-index', '0');
            this.audioBlobParts = [];
        } else {
            this.audioBlobParts = this.audioBlobParts || [];
        }
        

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: text,
                voice: voice,
                response_format: document.getElementById('format-select').value || 'mp3',
                stream: true,
                speed: speed,
                lang_code: document.getElementById('lang-select').value || undefined,
                start_chunk_index: startIndex
            }),
            signal: this.controller.signal
        });

        if (!response.ok) {
            const errResult = await response.json().catch(()=>({}));
            console.error('API error', errResult);
            // Fallback cleanly to standard path if enhanced router doesn't exist
            if (response.status === 404) {
               console.warn("Enhanced router not found! Falling back to standard streaming.");
               this.controller.abort();
               return originalStreamAudio.call(this, text, voice, speed, onProgress);
            }
            throw new Error(errResult.detail?.message || 'Failed to generate speech');
        }
        
        this.audio = new Audio();
        this.mediaSource = new MediaSource();
        this.audio.src = URL.createObjectURL(this.mediaSource);
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', this.audio ? this.audio.error : e);
        });

        this.audio.addEventListener('ended', () => {
            this.dispatchEvent('ended');
        });

        const setupPromise = new Promise((resolve, reject) => {
            this.mediaSource.addEventListener('sourceopen', async () => {
                try {
                    this.sourceBuffer = this.mediaSource.addSourceBuffer('audio/mpeg');
                    this.sourceBuffer.mode = 'sequence';
                    
                    this.sourceBuffer.addEventListener('updateend', () => {
                        this.processNextOperation();
                    });
                    
                    // --- Process NDJSON Stream ---
                    const ndjsonReader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    let receivedChunks = startIndex;
                    let hasStartedPlaying = false;
                    
                    try {
                        while (true) {
                            const { value, done } = await ndjsonReader.read();
                            if (done) {
                                if (this.mediaSource.readyState === 'open') {
                                    this.mediaSource.endOfStream();
                                }
                                
                                // Assemble Blob from buffered parts for Download button
                                if (this.audioBlobParts.length > 0) {
                                    const blob = new Blob(this.audioBlobParts, { type: 'audio/mpeg' });
                                    this.serverDownloadPath = URL.createObjectURL(blob);
                                }
                                
                                onProgress?.(estimatedChunks, estimatedChunks);
                                this.dispatchEvent('complete');
                                if (this.shouldAutoplay && !hasStartedPlaying && this.sourceBuffer.buffered.length > 0) {
                                    setTimeout(() => this.play(), 100);
                                }
                                setTimeout(() => {
                                    this.dispatchEvent('downloadReady');
                                }, 800);
                                break;
                            }
                            
                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split('\n');
                            buffer = lines.pop(); // Keep incomplete line
                            
                            for (const line of lines) {
                                if (!line.trim()) continue;
                                const data = JSON.parse(line);
                                
                                if (data.chunk_index === -1) {
                                    // Complete
                                    sessionStorage.removeItem('kokoro-progress-index');
                                } else {
                                    sessionStorage.setItem('kokoro-progress-index', data.chunk_index.toString());
                                }
                                
                                receivedChunks++;
                                onProgress?.(receivedChunks, estimatedChunks);
                                
                                if (data.audio_base64) {
                                    const binStr = atob(data.audio_base64);
                                    const binArray = new Uint8Array(binStr.length);
                                    for (let i = 0; i < binStr.length; i++) {
                                        binArray[i] = binStr.charCodeAt(i);
                                    }
                                    
                                    this.audioBlobParts.push(binArray);
                                    await this.appendChunk(binArray);
                                    
                                    if (!hasStartedPlaying && this.sourceBuffer.buffered.length > 0) {
                                        hasStartedPlaying = true;
                                        if (this.shouldAutoplay) {
                                            setTimeout(() => this.play(), 100);
                                        }
                                    }
                                }
                            }
                        }
                    } catch (error) {
                         if (error.name !== 'AbortError') {
                             throw error;
                         }
                    }

                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        await setupPromise;
        return this.audio;

    } catch (error) {
        this.cleanup();
        throw error;
    }
};

// --- Wire the App Generate and Resume Events ---
import PlayerControls from './components/PlayerControls.js';

// Patch PlayerControls update to handle partial state updates generated by Cancel/Pause button
const originalUpdateControls = PlayerControls.prototype.updateControls;
PlayerControls.prototype.updateControls = function(state) {
    if (state.speed === undefined) {
        state.speed = this.playerState.getState().speed || 1.0;
    }
    if (state.volume === undefined) {
        state.volume = this.playerState.getState().volume || 1.0;
    }
    
    // Protect the Cancel button from being hidden out of flex-flow by the legacy interface logic
    const originalCancelRef = this.elements.cancelBtn;
    this.elements.cancelBtn = { style: {} }; 
    
    originalUpdateControls.call(this, state);
    
    this.elements.cancelBtn = originalCancelRef;
};

const originalAppSetupEvents = App.prototype.setupEventListeners;
App.prototype.setupEventListeners = function() {
    originalAppSetupEvents.call(this);
    
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
             const isPaused = resumeBtn.textContent === 'Resume';
             if (isPaused) {
                 this.generateSpeech(true);
             } else {
                 this.audioService.cancel();
                 resumeBtn.textContent = 'Resume';
                 this.setGenerating(false);
             }
        });
    }
    
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
             sessionStorage.removeItem('kokoro-progress-index');
             // Original event already triggers audioService.cancel() and setGenerating(false)
             this.setGenerating(false); // Force update our overridden visual logic
        });
    }
};

// Patch setGenerating to manage the flex action container visibility
const originalSetGenerating = App.prototype.setGenerating;
App.prototype.setGenerating = function (isGenerating) {
    originalSetGenerating.call(this, isGenerating);
    
    const actionContainer = document.getElementById('action-buttons-container');
    const cancelBtn = document.getElementById('cancel-btn');
    const resumeBtn = document.getElementById('resume-btn');
    
    if (actionContainer && cancelBtn && resumeBtn) {
        const hasProgress = sessionStorage.getItem('kokoro-progress-index') !== null;
        if (isGenerating || hasProgress) {
            actionContainer.style.display = 'flex';
            cancelBtn.style.display = 'inline-block';
            resumeBtn.style.display = 'inline-block';
            resumeBtn.textContent = isGenerating ? 'Pause' : 'Resume';
        } else {
            actionContainer.style.display = 'none';
        }
    }
};

App.prototype.generateSpeech = async function(isResume = false) {
    if (!this.validateInput()) {
        return;
    }

    const text = this.textEditor.getText().trim();
    const voice = this.voiceService.getSelectedVoiceString();
    const speed = this.playerState.getState().speed;

    this.setGenerating(true);
    this.elements.downloadBtn.classList.remove('ready');

    if (!isResume) {
        this.waveVisualizer.updateProgress(0, 1);
    }
    
    try {
        console.log('Starting audio generation...', { text, voice, speed });
        
        if (!text || !voice) {
             throw new Error('Invalid input parameters');
        }
        
        await this.audioService.streamAudio(
            text,
            voice,
            speed,
            (loaded, total) => {
                this.waveVisualizer.updateProgress(loaded, total);
            },
            isResume // Pass boolean here seamlessly
        );
    } catch (error) {
        console.error('Generation error:', error);
        if (error.name !== 'AbortError') {
            this.showStatus('Error generating speech: ' + error.message, 'error');
            this.setGenerating(false);
        }
    }
};

// Check existance of previous pause state on UI load!
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const appInstance = window.app || null; 
        const idx = sessionStorage.getItem('kokoro-progress-index');
        if (idx && parseInt(idx, 10) > 0) {
            const container = document.getElementById('action-buttons-container');
            const resumeBtn = document.getElementById('resume-btn');
            if (container && resumeBtn) {
                container.style.display = 'flex';
                resumeBtn.textContent = 'Resume';
            }
        }
    }, 500);
});