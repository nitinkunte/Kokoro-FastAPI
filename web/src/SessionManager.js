
import { App } from './App.js';
import VoiceService from './services/VoiceService.js';
import PlayerState from './state/PlayerState.js';

// --- Patch PlayerState ---
const originalSetSpeed = PlayerState.prototype.setSpeed;
PlayerState.prototype.setSpeed = function (speed) {
    // Save to local storage
    try {
        localStorage.setItem('kokoro-speed', speed.toString());
    } catch (e) {
        console.warn('Failed to save speed:', e);
    }
    // Call original method
    originalSetSpeed.call(this, speed);
};

// Patch constructor or just initialize speed after app load?
// Since we can't easily patch the constructor of an ES6 class after definition in a simple way 
// without extending it, we will handle the initial load in the App patch or assume App uses default.
// Actually, we can just intercept the App initialization.

// --- Patch VoiceService ---
// Helper to save voices
const saveVoices = (service) => {
    try {
        const entries = Array.from(service.selectedVoices.entries());
        localStorage.setItem('kokoro-voices', JSON.stringify(entries));
    } catch (e) {
        console.warn('Failed to save voices:', e);
    }
};

const originalAddVoice = VoiceService.prototype.addVoice;
VoiceService.prototype.addVoice = function (voice, weight = 1) {
    const result = originalAddVoice.call(this, voice, weight);
    if (result) saveVoices(this);
    return result;
};

const originalUpdateWeight = VoiceService.prototype.updateWeight;
VoiceService.prototype.updateWeight = function (voice, weight) {
    const result = originalUpdateWeight.call(this, voice, weight);
    if (result) saveVoices(this);
    return result;
};

const originalRemoveVoice = VoiceService.prototype.removeVoice;
VoiceService.prototype.removeVoice = function (voice) {
    const result = originalRemoveVoice.call(this, voice);
    if (result) saveVoices(this);
    return result;
};

const originalClearSelectedVoices = VoiceService.prototype.clearSelectedVoices;
VoiceService.prototype.clearSelectedVoices = function () {
    originalClearSelectedVoices.call(this);
    saveVoices(this);
};

// Patch loadVoices to restore state
const originalLoadVoices = VoiceService.prototype.loadVoices;
VoiceService.prototype.loadVoices = async function () {
    // Read storage BEFORE originalLoadVoices is called 
    // because originalLoadVoices calls addVoice which overwrites localStorage
    const stored = localStorage.getItem('kokoro-voices');
    let savedVoices = null;
    if (stored) {
        try {
            savedVoices = JSON.parse(stored);
        } catch(e) {
            console.warn('Failed to parse stored voices', e);
        }
    }

    // Call original to load from API
    const voices = await originalLoadVoices.call(this);

    // Now restore from storage
    if (savedVoices) {
        // Clear default selection and restore from storage
        const tempSelected = new Map();
        for (const [voice, weight] of savedVoices) {
            if (this.availableVoices.includes(voice)) {
                tempSelected.set(voice, weight);
            }
        }
        this.selectedVoices = tempSelected;
        saveVoices(this); // Re-save the restored state to fix the overwrite
    }

    return voices;
};

// --- Patch App ---
const originalInitialize = App.prototype.initialize;
App.prototype.initialize = async function () {
    // Call original initialize
    // This will create services and components
    await originalInitialize.call(this);

    // After initialization, restore speed
    try {
        const savedSpeed = localStorage.getItem('kokoro-speed');
        if (savedSpeed) {
            const speed = parseFloat(savedSpeed);
            if (!isNaN(speed)) {
                this.playerState.setSpeed(speed);
            }
        }
    } catch (e) {
        console.warn('Failed to restore speed:', e);
    }
};

// Note: App.js already contains a DOMContentLoaded listener that instantiates App.
// Therefore, we do NOT need to instantiate it again here. By importing App.js,
// its listener is registered and it will create the one and only App instance.
