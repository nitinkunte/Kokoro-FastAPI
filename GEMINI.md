
# Implementation Roadmap: Kokoro-FastAPI Enhancements

## 🎯 Objective
Enhance the Kokoro-FastAPI implementation to support high-volume text processing with multi-threading, persistent progress tracking for Pause/Resume functionality, and configurable audio chunking—all while maintaining the ability to sync with the original upstream repository.

## 🛠 Rules of Engagement (Strict)
1.  **Sequential Execution:** Do not attempt multiple tasks at once. Focus on the current task until it is fully implemented and tested.
2.  **Verification Gate:** After completing a task, provide a summary of changes and wait for my explicit "PROCEED" command before starting the next item.
3.  **File Isolation & Upstream Sync Readiness:** * **DO NOT** modify original repository files (e.g., `index.html`, `main.py`) if an alternative exists.
    * Perform all frontend enhancements in `index2.html`.
    * If backend changes are required, suggest creating "extension" files (e.g., `main_enhanced.py` or separate module files) rather than overwriting the original source to prevent merge conflicts during future git pulls.
4.  **Context Preservation:** Maintain compatibility with the existing FastAPI structure and Pydantic models.

---

## 📍 Task 1: Multi-threaded Conversion Feasibility & Implementation
**Goal:** Speed up the conversion of large text blobs by processing segments in parallel.

* **Analysis:** Evaluate the thread-safety of the underlying Kokoro model inference. 
* **Implementation:** * Implement a worker pool or `asyncio` task grouping to handle text segments.
    * Ensure the audio segments are re-assembled in the correct order after parallel processing.
    * Manage memory usage to prevent crashes on large text files.
* **Verification:** Provide a benchmark of single-threaded vs. multi-threaded conversion for a 10,000-word sample.

---

## 📍 Task 2: Progress Tracking & Pause/Resume Functionality
**Goal:** Allow users to pause long conversions and resume without losing progress using `index2.html`.

* **Frontend Logic (index2.html):**
    * Implement logic to track the current index/character count of the text being processed.
    * Store the "last processed index" in the browser's **Session Storage**.
* **Backend Integration:**
    * Update the API (preferably via a new endpoint or extension file) to accept an `offset` or `start_index` parameter.
    * Implement a "Pause" signal that gracefully stops the current queue and returns the current progress state.
* **Verification:** Demonstrate that refreshing the browser or hitting "Resume" picks up exactly where the audio generation stopped.

---

## 📍 Task 3: Configurable Audio Chunking & Downloads
**Goal:** Break massive audio files into manageable, downloadable parts.

* **Logic:** If Task 2 is active, segment the output audio into "parts."
* **Configuration:**
    * Add a user-configurable setting in the UI (e.g., `chunk_duration_minutes`).
    * Default to 30 minutes.
* **Implementation:**
    * Automatically trigger a download or "Save to Disk" event every time the generated audio reaches the configured time limit.
    * Ensure metadata (Part 1, Part 2, etc.) is included in the filenames.
* **Verification:** Confirm that a 70-minute text conversion results in two 30-minute files and one 10-minute file.

---

## NOTE:
I will be using this solution via Docker. 

---

## 🚀 Current Status
* **Current Focus:** Task 2
* **Active Files:** `index2.html` (Frontend), `main.py` (Analysis only)
* **Status:** Task 1 deferred, Task 2 to be started

