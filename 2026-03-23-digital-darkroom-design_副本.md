# Digital Darkroom: Film Photo Processing Station

## 1. Overview
A specialized, lightweight desktop application built with Tauri and React designed exclusively for film photographers. It acts as a "processing station" to efficiently batch-add EXIF metadata to high-resolution scanned film photos (JPG/TIFF), bridging the gap between analog shooting and digital archiving. 

It breaks away from traditional "library management" paradigms (like Lightroom) and instead offers a highly visual, immersive single-roll workflow.


## 3. Architecture & Tech Stack

### Frameworks
- **Application Core:** Tauri (v2) - Chosen for native file system access, cross-platform support, and minimal resource usage compared to Electron.
- **Frontend:** React + TypeScript + Tailwind CSS (or similar utility-first styling) - Handles the immersive UI, film strip interactions, and state management.
- **Backend (Tauri/Rust):** Handles intensive I/O operations, specifically parsing and modifying EXIF/IPTC data in large image files (especially TIFFs) without blocking the frontend UI thread.

