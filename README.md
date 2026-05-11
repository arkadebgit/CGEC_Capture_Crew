# Capture Crew - Photography Club Website

This is a premium, cinematic showcase platform for **Capture Crew**, the photography club of Cooch Behar Government Engineering College.

## ✨ Key Features

- **Dynamic Gallery**: Automatically populates from the `CC Galary` folder.
- **Metadata Parsing**: Extracts captions, photographer names, departments, and years from image filenames.
- **Premium Showcases**: Dedicated sections for "Capture of the Week" and "Capture of the Month".
- **Responsive & Modern**: Dark elegant theme with smooth transitions and lightbox support.

## ⚠️ Important: HEIC Compatibility

Several images in your gallery are in **.heic** format.
> [!WARNING]
> Most web browsers (Chrome, Firefox, Edge on Windows/Android) **cannot display .heic images** natively.
> 
> **Recommendation**: Please convert these files to **.webp** or **.jpg** and update the filenames to match the metadata pattern (Caption... Captured by Name, Dept, Year) for the best results.

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `public/gallery/`: Contains the processed images for the website.
- `src/App.jsx`: Main application logic and data mapping.
- `src/index.css`: Design system and premium styles.

---
*Framing Moments. Preserving Memories.*
