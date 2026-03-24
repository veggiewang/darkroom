# Digital Darkroom: Film Photo Processing Station

## 1. Overview
A specialized, lightweight desktop application built with Tauri and React designed exclusively for film photographers. It acts as a "processing station" to efficiently batch-add EXIF metadata to high-resolution scanned film photos (JPG/TIFF), bridging the gap between analog shooting and digital archiving. 

It breaks away from traditional "library management" paradigms (like Lightroom) and instead offers a highly visual, immersive single-roll workflow.

## 2. Product Experience & Workflow

### 2.1 The "Digital Light Table" (Core Paradigm)
The application simulates the experience of looking at a light table. Instead of managing a massive database of thousands of photos, the user focuses on **one roll at a time**.

**The Workflow:**
1.  **Select a Roll (Folder):** The user is presented with a beautiful, minimalist "drop zone" or browser to select a folder containing the scanned images of a single roll (e.g., a folder of 36 JPGs or 12 TIFFs).
2.  **Apply Roll-Level Metadata:** Before diving into individual frames, the user sets the overarching context for the entire roll.
    *   **Camera Body:** (e.g., Leica M6, Hasselblad 500CM)
    *   **Lens:** (e.g., Summicron 35mm f/2)
    *   **Film Stock:** (e.g., Kodak Portra 400, Ilford HP5+)
    *   **Date Shot/Scanned:** Approximate date.
    *   *(Crucial: These settings are instantly applied to all frames in the selected roll in memory).*
3.  **Frame-by-Frame Adjustment (The "Loupe" View):**
    *   The interface transitions to an immersive view. A large preview of the current frame sits in the center.
    *   A horizontal "Film Strip" runs along the bottom, showing thumbnails of all frames (1-36 or 1-12).
    *   **Rapid Input:** The user can quickly adjust frame-specific data (Aperture, Shutter Speed, Notes) using keyboard shortcuts.
    *   **Smart Memory:** When moving to the next frame, the system defaults to the previous frame's exposure settings, saving time when shooting a scene with consistent lighting.
4.  **Process & Burn (Export):**
    *   With a single click (or hotkey), the application invokes the backend to physically write the EXIF data into the image files.
    *   *Design Decision Needed:* Whether to overwrite original files or create a duplicate folder (e.g., `./Processed`).

### 2.2 Aesthetic & Vibe
- **Immersive:** Dark mode by default to make the images pop.
- **Analog Feel, Digital Speed:** Clean typography, subtle textures reminiscent of film boxes or contact sheets, but entirely keyboard-driven for modern efficiency.

## 3. Architecture & Tech Stack

### Frameworks
- **Application Core:** Tauri (v2) - Chosen for native file system access, cross-platform support, and minimal resource usage compared to Electron.
- **Frontend:** React + TypeScript + Tailwind CSS (or similar utility-first styling) - Handles the immersive UI, film strip interactions, and state management.
- **Backend (Tauri/Rust):** Handles intensive I/O operations, specifically parsing and modifying EXIF/IPTC data in large image files (especially TIFFs) without blocking the frontend UI thread.

### Key Components

- **Frontend (`src/`):**
  - `WorkspaceCanvas`: The main immersive view holding the film box visualization.
  - `RollMetadataPanel`: Floating or integrated panel for camera/lens/stock input.
  - `FilmStripView`: Horizontal scrollable list of thumbnails representing the imported folder.
  - `FrameEditor`: The rapid keyboard-driven input component for aperture/shutter speed.

- **Rust Backend (`src-tauri/`):**
  - `fs_handler`: Scans directories for supported image formats.
  - `thumbnail_gen`: Generates lightweight thumbnails for the frontend without loading full TIFFs into memory.
  - `exif_engine`: Uses efficient Rust libraries (e.g., `rexif`, `kamadak-exif`, or wrapping `exiftool`) to safely read/write standard EXIF tags.
