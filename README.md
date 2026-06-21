# 🎃 Spooksie's Stinky Sprite Tool v2.0

**Professional-grade pixel art sprite editor and animator** built with HTML5 Canvas. Create sprites, animate them, and export with industry-standard tools!

**🎊 NEW in v2.0:** 74 new features including 20 blend modes, layer masks & effects, auto-save, onion skinning, custom brushes, pattern fills, symmetry modes, transform tools, sprite atlas export, and much more! [See full changelog below](#-version-history)

## 👻 Credits

**Foundation & Core Development:** 🎃 **Spooki** of CoraTO  
**Additional Features & Refinements:** 🐱 **Mewsie** of CoraTO

---

# View a live version [here](https://tools.mewsie.world/SpriteEditor.html)!


[![Preview](preview.gif)](https://tools.mewsie.world/SpriteEditor.html)

---

## 🚀 Quick Start (not uploading live)

Open `index.html` in your web browser. That's it.

**Remember**: You CANNOT export as a `.gif` if you plan on using this method!
  Please see the section below labeled `Solutions` or `Deployment` below for
    utilizing `.gif` export.

---

## 🛠️ System Requirements

- Modern web browser with HTML5 Canvas support
- Recommended: Chrome, Firefox, Edge, or Safari
- Mouse or drawing tablet recommended
- Keyboard for shortcuts (optional but recommended)

---

## ✨ Features

### 🔲 Selection Tools (6 tools)

- **Rectangle** - Rectangular selection with drag-to-move
- **Circle** - Circular selection area with drag-to-move
- **Color** - Magic wand: select connected pixels of same color (flood fill style)
- **Lasso** - Freeform selection with 35% overlap threshold and drag-to-move
- **Edge Detect** - Select edges using Sobel operator
- **Pan** - Drag canvas around (or use RMB/middle mouse)

### 🖌️ Brush Tools (12 tools)

- **Pencil (Circle)** - Round brush for smooth organic drawing
- **Pencil (Square)** - Square brush for blocky, pixel-perfect drawing
- **1px** - Single-pixel precision (click-only, no dragging)
- **Fill** - Flood fill contiguous areas
- **Pattern Fill** - Fill with 8 different texture patterns (dots, grid, diagonal, etc.)
- **Dither** - Checkerboard dithering between primary and secondary colors
- **Jumble** - Randomly scrambles pixels in brush area (respects selections)
- **Spray** - True scatter brush placing individual pixels randomly within radius
- **Clone Stamp** - Alt+click to set source, then paint to copy pixels
- **Erase Color** - Click a color to erase all instances within selection (requires active selection)
- **Magic Eraser** - Tolerance-based eraser (removes similar colors)
- **Eraser** - Remove pixels with circular brush

### 🎨 Color & Effect Tools (8 tools)

- **Blend** - Smudge/blur by averaging neighbor colors
- **Sharpen** - Increase contrast with neighbors for crisp edges
- **Depth** - Darkens pixels progressively (depth/shadow effect)
- **Highlight** - Brightens pixels (dodge/highlight effect)
- **Rainbow** - Shifts hue while preserving saturation/lightness
- **Gradient** - Fades from primary to secondary color over distance
- **Mirror** - Symmetrical drawing with 6 modes (horizontal, vertical, quad, radial 8/16-way)
- **Color Curves** - Adjust RGB channels using interactive bezier curves

### 📐 Shape Tools (8 tools)

- **Line** - Click twice for pixel-perfect straight lines (Bresenham's algorithm)
- **Curve** - Three-click quadratic bezier curves (start, end, control point)
- **Bezier Brush** - Four-click cubic bezier curves for smooth flowing lines
- **Contour** - Click points, double-click to close outline
- **Polygon** - Click points, double-click to fill/outline (toggle fill checkbox)
- **Rectangle** - Click opposite corners to draw rectangles (fill + gradient options)
- **Circle** - Click opposite points to draw circles (fill + gradient options, midpoint algorithm)
- **Gradient Mesh** - Click 3+ points, press Enter to fill with smooth color gradients

### 🪄 Advanced Tools (3 tools)

- **Liquify** - Push and warp pixels in the direction of brush movement
- **Swap Colors** - Global color replacement across all frames
- **Color Remap (Multi)** - Remap multiple colors simultaneously

### 🔄 Transform Tools (3 tools)

- **Rotate 90°** - Rotate clockwise or counter-clockwise
- **Flip** - Flip horizontal or vertical
- **Perspective** - Apply perspective distortion to the sprite

### ⚡ Batch Processing (4 tools)

- **Batch Rotate** - Rotate all frames at once
- **Batch Flip** - Flip all frames horizontal or vertical
- **Batch Brightness** - Adjust brightness across all frames
- **Magenta Background** - Create magenta background across all frames

### 📺 Channel Operations (2 tools)

- **Extract Channels** - Isolate red, green, or blue channels
- **Invert Colors** - Invert colors of the current frame

### 📐 Layer System

- **Frame-Based Layers** - Each animation frame has independent layers
- **Layer Management** - Add, delete, reorder, and rename layers
- **Visibility Toggle** - Show/hide individual layers (👁 icon)
- **Drag & Drop Reordering** - Click the ☰ icon or anywhere on layer to reorder
- **Double-Click to Rename** - Quickly rename any layer
- **Z-Index Control** - Layer 1 on bottom, higher layers stack on top

### 🎬 Animation

- **Multi-Frame Animation** - Create frame-by-frame animations
- **Clone or Blank Frames** - Duplicate current frame or start fresh (inserts after current frame)
- **Frame Rearrangement** - Arrow buttons to move frames left/right with wraparound
- **Drag & Drop Frames** - Click and drag frame thumbnails to reorder
- **Live Preview** - Real-time animation playback with FPS display
- **Adjustable Speed** - Control animation timing (50-1000ms per frame)

### 🎨 Color Palette System

- **Live Palette Preview** - Shows all unique colors used across all frames
- **Persistent Colors** - Colors stay in palette even when not visible (prevents strobe effects)
- **Click to Select** - Click any palette color to set as primary color
- **Auto-Update** - Refreshes after drawing operations
- **JASC-PAL Import/Export** - Text-based palette format with deduplication
- **VGA 24-bit Import/Export** - Binary 768-byte format (256 colors, auto-deduplicates)
- **Background Fill** - Empty VGA palette slots filled with canvas background color
- **Color Counter** - Shows total number of unique colors

### 💾 Export Options

- **PNG Sprite Sheet** - Horizontal strip of all frames (composited layers)
- **BMP-v24 Frames** - True BMP format with background color replacing transparency
- **JASC-PAL** - Text-based palette format (variable size)
- **VGA 24-bit Palette** - Binary palette format (256 colors, 768 bytes)
- **Animated GIF** - Fully functional GIF export with gif.js library

### ⚙️ Advanced Features

- **Undo/Redo** - Up to 50 undo steps (saves all frames, layers, and settings)
- **Color Swapping** - Global color replacement across all frames
- **Canvas Zoom** - 0.5x to 16x zoom with scroll wheel support
- **Non-Square Canvas Support** - Width and height can be different (e.g., 16×20, 32×8)
- **Aspect Ratio Scaling** - Smart resize with nearest-neighbor interpolation
- **Customizable Grid** - High/low contrast or no grid with custom colors
- **Darkened Grid Pattern** - Optional major grid lines every N cells (auto-adjusts on resize)
- **Adjustable Sprite Size** - 8×8 to 64×64 pixels with linked/unlinked dimensions
- **Pan Tool** - Navigate large zoomed canvases
- **Secondary Color Auto-Hide** - Only shows when gradient tool is active

---

## 🔧 Technical Notes

### Browser Compatibility:
- Modern browsers (Chrome, Firefox, Edge, Safari)
- Requires JavaScript enabled
- Canvas API support required
- File API support for imports/exports

### GIF Export Limitation:
GIF export only works when the file is served via HTTP/HTTPS (not file://)
...which then requires:

### External Dependencies:
- GIF.js library (loaded from CDN): `https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js`

**Solutions:**
1. Use a local web server (e.g., Python: `python -m http.server 8000`)
2. Use VS Code Live Server extension
3. Upload to a web server
4. Use the BMP export as an alternative

## 📦 Deployment

To deploy this modular version:

1. Upload all three files to your web server:
   - `index.html`
   - Everything in the `js` folder

2. Keep files in the same directory

3. Access via `index.html`

---

## ⌨️ Keyboard Shortcuts

### Layer & Frame Management

| Shortcut | Action |
|----------|--------|
| `Shift+L` | Add New Layer |
| `Shift+F` | Add New Animation Frame (Blank) |

### Undo/Redo

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

### Canvas Navigation

| Action | Method |
|--------|--------|
| **Zoom In/Out** | Mouse Scroll Wheel (or zoom buttons) |
| **Pan Canvas** | Pan Tool, Right Mouse Drag, or Middle Mouse Button |

### Tool Selection

**Selection Tools:**

| Key | Tool |
|-----|------|
| `S` | Rectangle Select |
| `I` | Circle Select |
| `K` | Color Select (Magic Wand) |
| `L` | Lasso |
| `A` | Pan |

**Brush Tools:**

| Key | Tool |
|-----|------|
| `P` | Pencil (Circle) |
| `Q` | Pencil (Square) |
| `1` | 1px Precision |
| `F` | Fill |
| `J` | Jumble |
| `Y` | Spray |
| `T` | Erase Color |
| `E` | Eraser |

**Color & Effect Tools:**

| Key | Tool |
|-----|------|
| `B` | Blend |
| `X` | Sharpen |
| `D` | Depth (Shadow) |
| `H` | Highlight |
| `R` | Rainbow |
| `G` | Gradient |
| `M` | Mirror (Symmetrical) |

**Shape Tools:**

| Key | Tool |
|-----|------|
| `N` | Line |
| `U` | Curve (Quadratic Bezier) |
| `C` | Contour |
| `O` | Polygon |
| `V` | Rectangle (Draw) |
| `W` | Circle (Draw) |

### Other Select Actions

| Key | Action |
|-----|--------|
| `R-Click` | Cancel selection movement and restore original position |
| `Shift+A` | Clear selection (deselect without resetting pixels) |

### Export

| Shortcut | Action |
|----------|--------|
| `Shift+P` | Export PNG Sprite Sheet |
| `Shift+B` | Export BMP Frames |
| `Shift+G` | Export GIF Animation |
| `Shift+E` | Export VGA 24-bit Palette |

---

### Basic Workflow

1. **Select a Tool** - Click a tool button or use keyboard shortcut
2. **Choose Colors** - Use Primary (main) and Secondary (gradient end) color pickers
3. **Draw on Canvas** - Click and drag to create your sprite
4. **Add Layers** - Create multiple layers for complex sprites
5. **Animate** - Add frames to create animations
6. **Export** - Save your work as PNG, BMP, or GIF

### Creating a Simple Sprite

1. Start with the **Pencil Tool** (or press `P`)
2. Select your **Primary Color**
3. Adjust **Brush Size** if needed (1x1 to 8x8)
4. **Click and drag** on the canvas to draw
5. Use **Eraser** (`E`) to remove mistakes or **Undo** (`Ctrl+Z`)
6. **Export** when done (`Shift+P`)

### Creating Layered Art

1. Draw on **Layer 1** (bottom layer)
2. Click **Add Layer** or press `Shift+L`
3. Draw on **Layer 2** (appears on top)
4. Toggle visibility with 👁 icon to see individual layers
5. **Drag layers** by the ☰ icon to reorder
6. **Export** - all layers automatically composite per frame

### Creating Animations

1. Create your first frame
2. Click **Add New Frame (Clone)** or press `Shift+F` for blank
3. Modify the new frame
4. Repeat for more frames
5. Watch the **Animation Preview** (adjustable speed)
6. **Export** as sprite sheet or GIF

### Using Selections

#### Rectangle Select (`S`)

1. Press `S` or click **Rect Select**
2. **Drag** to create rectangular selection
3. **Click inside** the selection to grab it
4. **Drag** to move pixels
5. **Release** to paste at new location
6. **Right-Click** while moving to cancel

#### Lasso (`L`)

1. Press `L` or click **Lasso**
2. **Draw** around the pixels you want to select
3. **Release** - pixels with 35%+ overlap are selected
4. **Click inside** to grab selection
5. **Drag** to move
6. **Right-Click** to cancel movement

---

## 🎨 Tool Descriptions

### Canvas-Based Tools

**Rectangle (`S`)**  
Drag to create rectangular selection, then drag to move selected pixels.

**Circle (`I`)**  
Click and drag to create circular selection, then drag to move pixels.

**Color (`K`)**  
Magic wand tool - click any pixel to select all CONNECTED pixels of that color (flood fill style). Click inside selection to deselect.

**Lasso (`L`)**  
Draw freeform selection - automatically selects complete pixels based on 35% overlap threshold, then drag to move.

**Mirror (`M`)**  
Draws your stroke and its horizontal mirror copy simultaneously - perfect for symmetrical sprites.

**Pan (`A`)**  
Drag the canvas around when zoomed in (also works with RMB or middle mouse button).

### Brush Tools

**Pencil (Circle) (`P`)**  
Round brush for smooth organic drawing. Brush size creates circular pattern.

**Pencil (Square) (`Q`)**  
Square brush for blocky, pixel-perfect drawing. Brush size creates square pattern.

**1px (`1`)**  
Single-pixel precision tool - click once per pixel, no dragging allowed.

**Fill (`F`)**  
Flood fills contiguous areas with the selected color. Respects selection boundaries.

**Pattern Fill** *(Click button to activate)*  
Fill with 8 different texture patterns: dots, grid, diagonal stripes, crosshatch, bricks, waves, checkerboard, and triangles.

**Dither** *(Click button to activate)*  
Checkerboard dithering between primary and secondary colors for retro shading effects.

**Jumble (`J`)**  
Randomly scrambles pixels in brush area for hard-dithered texture effects. Respects selection boundaries - only scrambles within selection.

**Spray (`Y`)**  
True scatter brush - places individual pixels randomly within radius (based on brush size). More particles near center, fewer at edges. Respects selection boundaries.

**Clone Stamp** *(Click button to activate)*  
Alt+click to set source point, then paint to copy pixels from that location. Perfect for duplicating patterns or textures.

**Erase Color (`T`)**  
Click any pixel color to erase ALL instances of that color within the active selection. ONLY works when a selection is active.

**Magic Eraser** *(Click button to activate)*  
Tolerance-based eraser - removes clicked color and similar colors based on tolerance setting.

**Eraser (`E`)**  
Remove pixels with circular brush pattern. Respects selection boundaries.

### Color Tools

**Blend (`B`)**  
Smudge/blur by averaging surrounding pixel colors for smooth transitions. Respects selection boundaries when sampling.

**Sharpen (`X`)**  
Increase contrast with neighboring pixels for crisp, defined edges. Very subtle effect (15% factor) - use multiple passes for stronger sharpening.

**Depth (`D`)**  
Progressively darkens pixels (95% per pass) - build up depth and shadows gradually with multiple strokes.

**Highlight (`H`)**  
Brightens pixels (105% per pass) - build up highlights gradually with multiple strokes.

**Rainbow (`R`)**  
Shifts hue while maintaining the saturation and lightness of existing colors underneath. One-way hue rotation - each stroke shifts 5% through the color wheel.

**Gradient (`G`)**  
Stroke fades from Primary to Secondary color over adjustable distance (1-100px).

**Mirror (`M`)**  
Symmetrical drawing with 6 modes: Horizontal, Vertical, Quad (4-way), Radial 8-way, and Radial 16-way. Perfect for symmetrical sprites, mandalas, and patterns.

### Shape Tools

**Line (`N`)**  
Click start point, click end point to draw pixel-perfect straight lines using Bresenham's algorithm.

**Curve (`U`)**  
Three-click quadratic bezier: start point, end point, then control point for smooth curves.

**Bezier Brush** *(Click button to activate)*  
Four-click cubic bezier curves for ultra-smooth flowing lines. Click 4 control points, automatically draws on the 4th click.

**Contour (`C`)**  
Click to add points around a shape, double-click to close the outline.

**Polygon (`O`)**  
Click to add vertices, double-click to close. Respects "Fill Shape" checkbox for filled or outline mode.

**Rectangle (`V`)**  
Click opposite corners. Toggle "Fill Shape" for filled/outline. Enable "Gradient Fill" for diagonal gradient from primary to secondary color.

**Circle (`W`)**  
Click two opposite edge points (diameter). Center auto-calculated as midpoint. Toggle "Fill Shape" for filled/outline. Enable "Gradient Fill" for radial gradient.

**Gradient Mesh** *(Click button to activate)*  
Click 3+ points with different colors, press **Enter** to fill with smooth interpolated gradients between all points. Press **Escape** to cancel.

**Liquify** *(Click button to activate)*  
Push and warp pixels in the direction of brush movement. Creates flowing, melting, or organic distortion effects.

---

## Interface Guide

### Left Panel - Controls

- **Current Tool Display** - Blue label shows active tool + selection type (if any)
- **Color Pickers** - Primary and Secondary colors with **hex input** (type hex codes directly) and visual color picker swatch
- **Recent Colors** - Last 16 finalized colors, click to reuse
- **Brush Size** - 1×1 to 8×8 pixels (affects circular and square brushes)
- **Brush Speed** - Add timing delay between strokes for controlled drawing
- **Selection Info** - Yellow box shows pixel count when selection is active
- **Global Tools** - Clear frame, clear selection (keep pixels), color swap
- **Undo/Redo** - Visual buttons with keyboard support (Ctrl+Z/Ctrl+Y)
- **Collapsible Tool Categories** - 35+ tools organized in 9 expandable categories:
  - 🛠️ Global Tools (3) - Clear, selection, swap
  - 📐 Canvas Tools (6) - Selection tools and pan
  - 🖌️ Brush Tools (12) - Drawing, fill, pattern, dither, clone, erase
  - 🎨 Color Tools (7) - Blend, sharpen, depth, highlight, rainbow, gradient, mirror
  - ⬜ Shape Tools (8) - Line, curves, polygons, rectangles, circles, gradient mesh
  - 💾 Image Export (3) - PNG, BMP, GIF
  - 🎞️ Frame Tools (3) - Clone, blank, delete frame
  - 📥 Import Palette (2) - PAL, VGA
  - 📤 Export Palette (2) - PAL, VGA
- **Click-to-Lock** - Click category header to keep it expanded
- **Gradient Controls** - Max length slider (appears when Gradient tool active)
- **Fill Shape Controls** - Fill/outline checkbox + gradient fill option (Rectangle, Circle, Polygon)
- **Pattern Fill Controls** - 8 pattern presets (dots, grid, diagonal, crosshatch, bricks, waves, checker, triangles)
- **Symmetry Controls** - 6 modes for Mirror tool (horizontal, vertical, quad, radial 8/16)
- **Custom Brush Editor** - Draw your own brush patterns (8×8 grid)

### Center Panel - Canvas & Settings

- **Tool Status Bar** - Blue bar shows progress for multi-step tools (Line, Curve, Polygon, Bezier, Gradient Mesh, etc.)
- **Main Canvas** - 480×480px viewing area with dynamic aspect ratio support
- **Visual Indicators** - Colored dots show points for Line (red), Curve (blue), Polygon/Contour (green), Bezier (purple)
- **Sprite Size** - Adjust dimensions 8-64 pixels with linked/unlinked width/height (supports non-square like 16×32)
- **Grid Presets** - Quick dimension buttons: NES (8×8), SNES (16×16), GB (8×8), GBA (32×32)
- **Canvas Zoom** - 0.5× to 16× zoom with scroll wheel support
- **Grid Options** - Collapsible section with visibility, line color, darkened grid pattern
- **Canvas Background** - Presets (transparent, white, black, checker) or custom color (affects BMP export)
- **Export Options** - Collapsible sections for PNG sprite sheet, BMP frames, GIF animation, palettes

### Right Panel - Layers & Animation

- **Layers List** - Per-frame layer management with full controls:
  - ☰ Drag handle for reordering (drag and drop)
  - 👁 Visibility toggle
  - Click to select layer, double-click name to rename
  - **Opacity slider** (0-100%) per layer
  - **Blend mode dropdown** - 20 modes (Normal, Multiply, Screen, Overlay, Dodge, Burn, etc.)
  - **🎭 Mask button** - Enter mask editing mode (paint black to hide, white to reveal)
  - **✨ Effects button** - Drop shadow, outer glow, stroke effects
  - Visual indicator when editing mask (orange border)
- **Layer Controls** - Add layer (Shift+L), delete layer, merge down
- **Animation Frames** - Frame thumbnails (64×64px) with management:
  - ◄ ► Arrow buttons to move frames with wraparound
  - Drag & drop frame thumbnails to reorder
  - Right-click to add frame tags
  - New frames insert after current frame
  - Clone (copies all layers) or Blank frame options
- **Animation Timeline** - Scrubber with playback controls and frame duration editor
- **Animation Preview** - Live 128×128px playback with speed (50-1000ms) and FPS display
- **Playback Speed Multiplier** - 0.25× to 4× playback speed without changing frame data
- **Onion Skinning** - Toggle to see previous/next frames with adjustable opacity and frame count
- **Color Palette** - Live preview of all unique colors across all frames:
  - Click colors to select them as primary color
  - Refresh button to update palette
  - Palette management (generate gradients, add/remove colors manually)
  - Import PAL (JASC text format, auto-deduplicates)
  - Export PAL (JASC text format, variable size)
  - Import VGA (24-bit binary, auto-deduplicates)
  - Export VGA (24-bit binary, 256 colors with background fill)
  - Color count display
- **Advanced Features** (collapsible):
  - Histogram with per-channel RGB stats
  - Transform tools (rotate, flip, perspective) - apply to current frame OR all frames
  - Channel operations (extract R/G/B, invert)
  - Tilemap mode for game sprites

---

## 💡 Tips & Tricks

### Productivity

- Use **keyboard shortcuts** for rapid tool switching
- **Scroll wheel** zooms without switching to Pan tool
- **Middle mouse button** or **RMB** pans at any time
- **Undo freely** - 50 steps saved including layer changes

### Layer Workflow

- Keep **backgrounds on Layer 1** (bottom)
- Add **details on higher layers** for easy editing
- **Toggle visibility** to isolate specific elements
- **Drag layers** to adjust visual stacking order

### Animation Tips

- Use **Clone Frame** to maintain consistency between frames
- Adjust **Animation Speed** to find the perfect timing
- **Watch the preview** while editing for immediate feedback
- Each frame has **independent layers** for maximum flexibility

### Selection Tricks

- **Lasso** around complex shapes - 35% threshold captures intended pixels
- **Color Select (Magic Wand)** - Selects only connected pixels of the same color, click again to deselect
- **Right-click** anytime to clear selection (works while creating, moving, or just viewing)
- **Shift+A** or **Clear Selection** button to deselect without moving pixels (same as right-click)
- **Selection Masking** - Active selections constrain all drawing to selected area only
- **Mirror Tool** respects selections - both original and mirrored pixels must be in selection
- Selections work on **current layer only** - switch layers to select different content
- **Draw within bounds** - All tools (brushes, shapes, fill) respect selection boundaries
- **Abort Creation** - Right-click while dragging to cancel partial selections

### Brush Selection

- **Pencil (Circle)** - Best for organic, smooth shapes and curves
- **Pencil (Square)** - Best for pixel-perfect hard edges and geometric patterns
- **Larger Brush Sizes** - Increase spray area for spray tool, create bigger jumble effects
- **1px Tool** - Use for final touch-ups and single-pixel corrections

### Erase Color Tool

- **Requires Selection** - Only works when a selection is active
- **Click Color** - Erases all instances of that color within the selection
- **Perfect for Cleanup** - Remove unwanted colors from specific areas
- **Works with Any Selection** - Rectangle, Circle, Lasso, or Color Select

### Color Tools

- **Blend** - Subtle 50/50 mix with neighbors; only samples within selection boundaries; multiple passes for stronger effect
- **Sharpen** - Very subtle effect (15% factor); use many passes for edge enhancement
- **Shadow** - Darkens by 5% per pass; build up gradually for natural shadows
- **Highlight** - Brightens by 5% per pass; build up gradually for realistic highlights
- **Rainbow** - Paint over existing colors to shift hues
- **Gradient** - Adjust max length slider for fade control
- **Color Swap** - Click a pixel, then swap that color globally across all frames
- **Color Palette** - Click palette colors to quickly select them for drawing
- **JASC-PAL Import** - Load text-based palettes (automatically removes duplicates)
- **VGA Import** - Load 256-color binary palettes (automatically removes duplicates)
- **VGA Export** - Saves unique colors + background color fill (Shift+E)

### Shape Tools

- **Fill Shape Checkbox** - Toggle between filled and outline modes for Rectangle, Circle, and Polygon
- **All Click-Based** - No dragging required for any shape tools
- **Visual Indicators**: Line (red dot), Curve (blue dots), Polygon/Contour (green dots), Rectangle/Circle (orange dot)
- **Rectangle/Circle** - Click twice like line tool for precise control
- **Tool Status Bar** - Blue bar above canvas guides you through multi-step tools

### Canvas & Grid

- **Non-Square Sprites** - Create 16×8, 32×24, or any aspect ratio you need
- **Darkened Grid Pattern** - Enable major grid lines to organize larger sprites (e.g., 4×4 sections on 16×16 canvas)
- **Auto-Disable** - Darkened grid pattern grays out when "No Grid" is selected
- **Auto-Adjust Pattern** - When linked dimensions are checked, grid pattern auto-calculates based on √dimension

---

## 📋 Technical Specifications

- **Canvas Resolution**: 480×480px display area
- **Default Sprite Size**: 16×16 pixels
- **Default Sprite Size Range**: 8×8 to 64×64 pixels (width and height independent)
- **Aspect Ratio**: Supports non-square canvases (e.g., 16×20, 32×8, 8×24)
- **Pixel Scale**: Dynamic based on max(width, height)
- **Max Zoom**: 16×
- **Min Zoom**: 0.5×
- **Frame Support**: Unlimited animation frames
- **Layer Support**: Unlimited layers per frame
- **Undo Buffer**: 50 steps (includes dimension changes)
- **Export Formats**: PNG, BMP-v24 (true binary), JASC-PAL (text), VGA 24-bit (binary), Animated GIF
- **Palette Import**: JASC-PAL (.pal text) and VGA 24-bit (.pal, .vga binary)
- **Total Tools**: 46 unique tools across 8 categories
  - Canvas-Based: 6 tools
  - Brush: 12 tools
  - Color & Effect: 8 tools
  - Shape: 8 tools
  - Advanced: 3 tools
  - Transform: 3 tools
  - Batch Processing: 4 tools
  - Channel: 2 tools
- **Color Palette**: Automatic detection with deduplication on import
- **Brush Patterns**: Circular (Pencil, Eraser) and Square (Pencil Square, all others)
- **Spray Tool**: Scatter algorithm with radial distribution (not brush-based)
- **Erase Color**: Selection-only tool for targeted color removal

---

## 📄 Repository File Structure

Spooksies-Stinky-Sprite-Tool/
│
├── index.html                      (entry point - click here to run!)
├── README.md                       (documentation)
├── LICENSE                         (license)
├── changelog.md                    (changelog)
├── preview.gif                     (preview image)
│
├── code/                           (all code files)
│   ├── spooksies_sprite_tool.css   (styles)
│   ├── spooksies_sprite_tool.js    (main logic)
│   └── utils.js                    (utilities)
│
└── AAA OLD/                (archived old versions)
    └── v1.0/
    
---

## 🐛 Known Limitations

- **Canvas Display**: Fixed at 480×480px display (sprite dimensions are fully adjustable)
- **GIF Export Requires Hosting**: GIF export only works when the HTML file is hosted on a web server (http://), not when opened directly (file://). The button will be grayed out if unavailable. Use a local server (Python: `python -m http.server 8000` or VS Code Live Server) or export BMP frames and use online converters like ezgif.com.

---

## 📝 License & Usage

This tool is free to use for creating pixel art and sprites. Feel free to modify and extend it for your own projects!

---

**Happy Sprite Creating!** 🎃✨

Created with love by Spooki of CoraTO  
Enhanced by Mewsie of CoraTO

