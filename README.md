# 🎃 Spooksie's Stinky Sprite Tool v1.0

A powerful, feature-rich pixel art sprite editor and animator built with HTML5 Canvas. Create sprites, animate them, and export with professional-grade tools!

## 👻 Credits

**Foundation & Core Development:** 🎃 **Spooki** of CoraTO  
**Additional Features & Refinements:** 🐱 **Mewsie** of CoraTO

---

# View a live version [here](https://tools.mewsie.world/SpriteEditor.html)!


[![Preview](preview.gif)](https://tools.mewsie.world/SpriteEditor.html)

## ✨ Features

### 🔲 Canvas-Based Tools (6 tools)

- **Rectangle** - Rectangular selection with drag-to-move
- **Circle** - Circular selection area with drag-to-move
- **Color** - Magic wand: select connected pixels of same color (click to select, click again to deselect)
- **Lasso** - Freeform selection with 35% overlap threshold and drag-to-move
- **Mirror** - Symmetrical drawing (auto-mirrors horizontally, respects selections)
- **Pan** - Drag canvas around (or use RMB/middle mouse)

### 🖌️ Brush Tools (8 tools)

- **Pencil (Circle)** - Round brush for smooth organic drawing
- **Pencil (Square)** - Square brush for blocky, pixel-perfect drawing
- **1px** - Single-pixel precision (click-only, no dragging)
- **Fill** - Flood fill contiguous areas
- **Jumble** - Randomly scrambles pixels in brush area (respects selections)
- **Spray** - True scatter brush placing individual pixels randomly within radius
- **Erase Color** - Click a color to erase all instances within selection (requires active selection)
- **Eraser** - Remove pixels with circular brush

### 🎨 Color Tools (6 tools)

- **Blend** - Smudge/blur by averaging neighbor colors
- **Sharpen** - Increase contrast with neighbors for crisp edges
- **Shadow** - Darkens pixels (burn/shadow effect)
- **Highlight** - Brightens pixels (dodge/highlight effect)
- **Rainbow** - Shifts hue while preserving saturation/lightness
- **Gradient** - Fades from primary to secondary color

### 📐 Shape Tools (6 tools)

- **Line** - Click twice for pixel-perfect straight lines (Bresenham's algorithm)
- **Curve** - Three-click bezier curves (start, end, control point)
- **Contour** - Click points, double-click to close outline
- **Polygon** - Click points, double-click to fill/outline (toggle fill checkbox)
- **Rectangle** - Click and drag to draw rectangles (toggle fill)
- **Circle** - Click and drag to draw circles (toggle fill, midpoint algorithm)

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

**Canvas-Based Tools:**

| Key | Tool |
|-----|------|
| `S` | Rectangle (Select) |
| `I` | Circle (Select) |
| `K` | Color (Select) |
| `L` | Lasso |
| `M` | Mirror |
| `A` | Pan |

**Brush Tools:**

| Key | Tool |
|-----|------|
| `P` | Pencil (Circle) |
| `Q` | Pencil (Square) |
| `1` | 1px |
| `F` | Fill |
| `J` | Jumble |
| `Y` | Spray |
| `T` | Erase Color |
| `E` | Eraser |

**Color Tools:**

| Key | Tool |
|-----|------|
| `B` | Blend |
| `X` | Sharpen |
| `D` | Shadow |
| `H` | Highlight |
| `R` | Rainbow |
| `G` | Gradient |

**Shape Tools:**

| Key | Tool |
|-----|------|
| `N` | Line |
| `U` | Curve |
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

## 🚀 Quick Start Guide

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

**Jumble (`J`)**  
Randomly scrambles pixels in brush area for hard-dithered texture effects. Respects selection boundaries - only scrambles within selection.

**Spray (`Y`)**  
True scatter brush - places individual pixels randomly within radius (based on brush size). More particles near center, fewer at edges. Respects selection boundaries.

**Erase Color (`T`)**  
Click any pixel color to erase ALL instances of that color within the active selection. ONLY works when a selection is active.

**Eraser (`E`)**  
Remove pixels with circular brush pattern. Respects selection boundaries.

### Color Tools

**Blend (`B`)**  
Smudge/blur by averaging surrounding pixel colors for smooth transitions. Respects selection boundaries when sampling.

**Sharpen (`X`)**  
Increase contrast with neighboring pixels for crisp, defined edges. Very subtle effect (15% factor) - use multiple passes for stronger sharpening.

**Shadow (`D`)**  
Darkens pixels by 5% per pass - build up shadows gradually with multiple strokes.

**Highlight (`H`)**  
Brightens pixels by 5% per pass - build up highlights gradually with multiple strokes.

**Rainbow (`R`)**  
Shifts hue while maintaining the saturation and lightness of existing colors underneath.

**Gradient (`G`)**  
Stroke fades from Primary to Secondary color over adjustable distance.

### Shape Tools

**Line (`N`)**  
Click start point, click end point to draw pixel-perfect straight lines using Bresenham's algorithm.

**Curve (`U`)**  
Three-click process: start point, end point, then control point for smooth quadratic bezier curves.

**Contour (`C`)**  
Click to add points around a shape, double-click to close the outline.

**Polygon (`O`)**  
Click to add vertices, double-click to close. Respects "Fill Shape" checkbox for filled or outline mode.

**Rectangle (`V`)**  
Click twice for opposite corners. Toggle "Fill Shape" checkbox for filled or outline mode. Orange dot shows first corner.

**Circle (`W`)**  
Click two opposite edge points (diameter). Center auto-calculated as midpoint. Toggle "Fill Shape" for filled circles or outlines. Orange dot shows first edge point.

---

## 🎛️ Interface Guide

### Left Panel - Controls
- **Current Tool Display** - Blue label shows active tool + selection type (if any)
- **Color Pickers** - Primary and Secondary colors with hex display
- **Brush Size** - 1×1 to 8×8 pixels (affects circular and square brushes)
- **Pencil Stroke Delay** - Add timing delay for slower drawing
- **Selection Info** - Yellow box shows pixel count when selection is active
- **Global Tools** - Clear frame, clear selection (keep pixels), color swap
- **Undo/Redo** - Visual buttons with keyboard support
- **Tool Categories** - 26 tools organized in 4 categories (2-column grid):
  - Canvas-Based Tools (6) - Selections and special modes
  - Brush Tools (8) - Direct drawing and painting
  - Color Tools (6) - Color manipulation and effects
  - Shape Tools (6) - Geometric shapes with fill options
- **Hover Tooltips** - Each category label shows ⓘ with tool descriptions on hover
- **Fill Shape Toggle** - Appears for Rectangle, Circle, and Polygon shape tools

### Center Panel - Canvas & Settings
- **Tool Status Bar** - Blue bar shows progress for multi-step tools (Line, Curve, Polygon, etc.)
- **Main Canvas** - 480×480px viewing area with dynamic aspect ratio support
- **Visual Indicators** - Colored dots show points for Line (red), Curve (blue), Polygon/Contour (green)
- **Sprite Size** - Adjust dimensions with linked/unlinked width/height (supports non-square)
- **Change Size & Migrate Data** - Button to apply dimension changes with pixel scaling
- **Canvas Zoom** - 0.5× to 16× zoom controls
- **Grid Options** - Two-column layout:
  - **Left:** Grid visibility, line color, darkened grid pattern with custom color
  - **Right:** Canvas background presets and custom color
- **Darkened Grid Pattern** - Major grid lines every N cells (auto-adjusts with √dimension when linked)
- **Export Options** - PNG, BMP, and Palette export buttons

### Right Panel - Layers & Animation
- **Layers List** - Hierarchical layer management
  - ☰ Drag handle for reordering
  - 👁 Visibility toggle
  - Click to select layer
  - Double-click name to rename
- **Animation Frames** - Frame thumbnails with management buttons
  - ◄ ► Arrow buttons to move frames with wraparound
  - Drag & drop frame thumbnails to reorder
  - New frames insert after current frame
- **Animation Preview** - Live playback with speed and FPS controls
- **Color Palette** - Live preview of all unique colors
  - Click colors to select them
  - Refresh button to update palette
  - Import PAL (JASC text format, auto-deduplicates)
  - Export PAL (JASC text format)
  - Import VGA (24-bit binary, auto-deduplicates)
  - Export VGA (24-bit binary, 256 colors)
  - Color count display

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
- **Sprite Size Range**: 8×8 to 64×64 pixels (width and height independent)
- **Aspect Ratio**: Supports non-square canvases (e.g., 16×20, 32×8, 8×24)
- **Pixel Scale**: Dynamic based on max(width, height)
- **Max Zoom**: 16×
- **Min Zoom**: 0.5×
- **Frame Support**: Unlimited animation frames
- **Layer Support**: Unlimited layers per frame
- **Undo Buffer**: 50 steps (includes dimension changes)
- **Export Formats**: PNG, BMP-v24 (true binary), JASC-PAL (text), VGA 24-bit (binary), Animated GIF
- **Palette Import**: JASC-PAL (.pal text) and VGA 24-bit (.pal, .vga binary)
- **Total Tools**: 26 unique tools across 4 categories
  - Canvas-Based: 6 tools
  - Brush: 8 tools
  - Color: 6 tools
  - Shape: 6 tools
- **Color Palette**: Automatic detection with deduplication on import
- **Brush Patterns**: Circular (Pencil, Eraser) and Square (Pencil Square, all others)
- **Spray Tool**: Scatter algorithm with radial distribution (not brush-based)
- **Erase Color**: Selection-only tool for targeted color removal

---

## 🛠️ System Requirements

- Modern web browser with HTML5 Canvas support
- Recommended: Chrome, Firefox, Edge, or Safari
- Mouse or drawing tablet recommended
- Keyboard for shortcuts (optional but recommended)

---

## 🎮 Getting Started

1. Open `spooksies_sprite_tool.html` in your web browser
2. The tool loads with a 16×16 canvas and one layer
3. Browse **4 tool categories** - hover over ⓘ for descriptions
4. Select **Pencil (Circle)** (`P`) or **Pencil (Square)** (`Q`) and start drawing!
5. Use **Ctrl+Z** to undo mistakes
6. Try **Color Tools** for effects: Blend, Sharpen, Shadow, Highlight, Rainbow, Gradient
7. Create layers with **Shift+L** for complex artwork
8. Add frames with **Shift+F** to animate
9. Use **Shape Tools** for precise geometry (toggle fill option)
10. Export your palette: **JASC-PAL** or **VGA 24-bit** (**Shift+E**)
11. Import **JASC-PAL** or **VGA** palettes to load color schemes
12. Export your masterpiece with **Shift+P** for PNG

---

## 📝 License & Usage

This tool is free to use for creating pixel art and sprites. Feel free to modify and extend it for your own projects!

---

## 🐛 Known Limitations

- **Canvas Display**: Fixed at 480×480px display (sprite dimensions are fully adjustable)
- **GIF Export Requires Hosting**: GIF export only works when the HTML file is hosted on a web server (http://), not when opened directly (file://). The button will be grayed out if unavailable. Use a local server (Python: `python -m http.server 8000` or VS Code Live Server) or export BMP frames and use online converters like ezgif.com.

---

## 🎉 Version History

**v1.0** - Major Feature Release (26 Tools Total)
- Organized tools into 4 categories with hover tooltips
- Added Pencil (Square) and Sharpen tools
- Implemented circular vs square brush patterns
- Erase Color tool: removes clicked color within selection boundaries (replaces text tool)
- Blend tool: 50/50 mix with neighbors for subtle smudging
- Sharpen tool: 15% intensity for gentle edge enhancement
- Non-square canvas support with aspect ratio scaling
- Shape tools: Line, Rectangle, Circle, Contour, Polygon, Curve
- Color tools: Blend, Sharpen, Shadow (5%), Highlight (5%), Rainbow, Gradient
- Selection tools: Rectangle, Circle, Color Select (magic wand), Lasso
- Jumble tool respects selection boundaries
- True BMP-v24 export (proper binary format)
- Animated GIF export (gif.js library integration)
- Color palette system with live preview
- JASC-PAL import/export (text format)
- VGA 24-bit import/export (binary format)
- Automatic deduplication on all palette imports
- Darkened grid pattern with auto-adjustment
- Frame rearrangement with arrow buttons and drag-and-drop
- Visual feedback: tool status bar and colored point indicators
- Selection masking: active selections constrain all drawing tools
- Fill shape toggle for Rectangle, Circle, Polygon tools
- New frames insert after current frame
- 26 keyboard shortcuts + Shift+E for VGA export
- Added frame-based layer system
- Implemented Rect Select and Lasso tools
- Full undo/redo with 50-step history
- Comprehensive keyboard shortcuts
- Drag & drop layer reordering
- Layer renaming and visibility controls

---

**Happy Sprite Creating!** 🎃✨

Created with love by Spooki of CoraTO  
Enhanced by Mewsie of CoraTO

