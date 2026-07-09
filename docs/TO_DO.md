# Kokoro-Web Standalone Project - Task Tracker

## Goal
Create a web-only project that calls Kokoro API by organizing files under `kokoro-web` folder for a standalone repository. **Customizations must survive syncing with the original repo.**

## Architecture

The original `web/src/` files are kept **intact and unmodified** so they can be synced with the upstream repo. All customizations are placed in `kokoro-web/src/customizations/` folder.

### What the original files do:
- `config.js` - Detects `UVICORN_ROOT_PATH` from server config endpoint (for UVicorn deployment)
- `App.js` - Main app (identical to original, no changes)
- `SessionManagerPause.js` - Enhanced NDJSON streaming with pause/resume (optional, not loaded by default)

### What the user wants (customization):
- **Persist user-selected voices and speed to localStorage** - implemented in `SessionManager.js`

### How it works:
1. `index2.html` loads original `src/App.js` (registers DOMContentLoaded → creates App instance)
2. `index2.html` ALSO loads `src/customizations/session-persistence.js` (patches App, VoiceService, PlayerState for localStorage)
3. `config.json` provides API URL for standalone deployment
4. `src/config.js` remains **unchanged** from original

## Files Structure

```
kokoro-web/
├── config.json                    # NEW: API URL configuration
├── index2.html                    # Modified: loads customizations
├── favicon.svg                    # Unchanged
├── siriwave.js                    # Unchanged
├── styles/                        # All unchanged from web/styles/
│   ├── badges.css
│   ├── base.css
│   ├── controls.css
│   ├── forms.css
│   ├── header.css
│   ├── layout.css
│   ├── player.css
│   └── responsive.css
├── src/
│   ├── App.js                     # ORIGINAL (syncable)
│   ├── config.js                  # ORIGINAL (syncable)
│   ├── SessionManager.js          # ORIGINAL (syncable) — NOT loaded by index2.html
│   ├── SessionManagerPause.js     # ORIGINAL (syncable) — NOT loaded by index2.html
│   ├── components/                # ORIGINAL (syncable)
│   ├── services/                  # ORIGINAL (syncable)
│   ├── state/                     # ORIGINAL (syncable)
│   ├── utils/                     # ORIGINAL (syncable)
│   └── customizations/            # NEW: User customizations
│       └── session-persistence.js # Saves voices/speed to localStorage
└── tests/                         # Unchanged from web/tests/
```

## Tasks

### Phase 1: Restore original files (undo previous modifications)
- [ ] Restore `kokoro-web/src/config.js` from `web/src/config.js` (original)
- [ ] Verify `kokoro-web/src/App.js` matches `web/src/App.js` (already identical ✓)
- [ ] Verify all other `kokoro-web/src/` files match originals

### Phase 2: Create customization layer
- [ ] Create `kokoro-web/src/customizations/` folder
- [ ] Create `kokoro-web/src/customizations/session-persistence.js` with localStorage patches
  - Patches `PlayerState.setSpeed()` to save speed to localStorage
  - Patches `VoiceService.addVoice/updateWeight/removeVoice/clearSelectedVoices()` to save voices
  - Patches `VoiceService.loadVoices()` to restore voices from localStorage
  - Patches `App.initialize()` to restore speed from localStorage

### Phase 3: Update HTML to load customizations
- [ ] Update `kokoro-web/index2.html` to load both App.js and session-persistence.js

### Phase 4: Create config.json
- [ ] Update `kokoro-web/config.json` with correct API URL format

### Phase 5: Verify
- [ ] Verify `kokoro-web/src/` can be replaced with `web/src/` without losing customizations
- [ ] Document the sync process

## Deployment Steps (User)
1. Copy `kokoro-web/` to new repo
2. Set up nginx on VPS with git pull
3. Update `config.json` with right API URL
4. Test