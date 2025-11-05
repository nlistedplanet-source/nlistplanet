# Images Folder Structure

## Folder Organization

### `/public/images/`
- **Purpose**: Static images accessible via URL
- **Access**: Direct URL access like `/images/filename.png`

### `/public/images/logos/`
- **Purpose**: Logo files (PNG, SVG, JPG)
- **Usage**: Main logo, favicon, brand assets
- **Examples**: 
  - `logo.png` - Main logo
  - `logo-white.png` - White version
  - `logo-small.png` - Small size variant
  - `favicon.ico` - Browser tab icon

### `/src/assets/images/`
- **Purpose**: Component-specific images
- **Access**: Import via `import logo from '../assets/images/logo.png'`
- **Usage**: Images bundled with components

## How to Add Your Logo

1. **Main Logo**: Place in `/public/images/logos/logo.png`
2. **Favicon Files**: 
   - `/public/favicon.ico` (main favicon)
   - `/public/images/logos/favicon-32x32.png`
   - `/public/images/logos/favicon-16x16.png`
   - `/public/images/logos/apple-touch-icon.png` (for iOS)
3. **Other Assets**: Use respective folders

## Favicon Creation Tools
- Use `/public/images/logos/create-favicon.html` for manual creation
- Use online generators: favicon.io, convertio.co
- Current temporary favicon: `/public/favicon.svg`

## Current Logo Implementation
- **File**: `/public/images/logos/logo.png`
- **Component**: `src/components/Header.jsx`
- **Size**: 32x32px (h-8 w-8 classes)

## Supported Formats
- PNG (recommended for logos with transparency)
- SVG (best for scalable logos)
- JPG (for photos)
- WebP (modern format)