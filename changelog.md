# 🎉 Version History

## **v2.0** - Upgrade

### Analysis and Visualization
- Added Histogram display with RGB color distribution visualization
- Added manual refresh button to regenerate histogram
- Added statistics display showing min/max/average values
- Created per-channel graphs for Red, Green, Blue channels
- Enhanced histogram with per-channel filtering (R/G/B/All toggle)
- Made semi-transparent overlay to see all channels at once

### Animation Enhancements
- Added onion skinning to see previous/next frames while drawing
- Separated opacity controls for previous and next frames (0-100%)
- Added adjustable onion skin range showing 1-5 frames before/after
- Created fade-out effect for frames further from current

### Animation Enhancements
- Added frame duration control: double-click thumbnail to set variable speed per frame
- Added frame tags: right-click thumbnail to add custom labels like "idle", "walk-1", "attack"
- Added onion skinning to see previous/next frames while drawing
- Added timeline controls: previous/next/first/last frame buttons
- Added toggle on/off checkbox to enable/disable onion skinning
- Built animation timeline with visual scrubber and playhead controls
- Created fade-out effect for frames further from current
- Created loop point markers to set animation loop start/end points
- Created visual labels with orange banner on tagged frames
- Implemented copy/paste frames to duplicate frame content to other frames
- Implemented playback speed multiplier control (0.25x to 4x)
- Made adjustable onion skin range showing 1-5 frames before/after
- Made tags follow frames when reordered
- Separated opacity controls for previous and next frames (0-100%)

### Canvas and Grid Tools
- Added 10 grid size presets for quick size selection
- Added generic size presets: Tiny (8×8), Small (16×16), Medium (32×32), Large (48×48), XLarge (64×64)
- Added Perspective grid with isometric overlay for pixel art
- Added Ruler & Guides with vertical and horizontal guide lines
- Added toggle on/off checkbox control
- Built guide management interface to list and remove individual guides
- Created blue dashed guide lines with toggle visibility
- Created retro console presets: NES Sprite (8×16), SNES (16×32), Game Boy (16×16), GBA Tile (8×8), GBA Sprite (32×32)
- Created visual tile grid with orange dashed overlay
- Implemented guide snapping: auto-snap drawing within 2 pixels of guides
- Implemented Tilemap Mode with snap-to-tile-grid functionality
- Made adjustable tile size (4×4 to 32×32 pixels)
- Made brush size sync with tile size automatically
- Made dropdown selector above dimension inputs with instant resize
- Made it so you can add guides by entering X or Y position
- Perfect for game tiles, level design, and tilesets
- Cancel your entire selection as well from the press of a button in case RClick isn't available to you

### Color Tools
- Added Apply/Cancel buttons with live preview
- Added Channel Operations: Extract R/G/B channels separately or Invert colors
- Added Color Curves adjustment for contrast control
- Added Color Remap tool for batch multi-color replacement
- Applied global scope to all frames and layers
- Built interactive histogram display showing RGB color distribution
- Created Image Eyedropper: load any image and click to pick colors from it (💧 button)
- Created visual curve graph with real-time preview
- Implemented Magic Eraser with tolerance-based erasing (adjustable 0-255)
- Implemented real-time preview slider for contrast adjustment (-1.0 to +1.0)
- Made interactive prompt to set tolerance (0=exact color, 50=similar, 100=broad)
- Made live color pickers to adjust target colors
- Created visual interface showing all colors in sprite with side-by-side comparison

### Drawing Tools
- Added 6 preset brush shapes: Circle, Square, Plus (+), X, Diamond, Star
- Added Dither brush using Bayer 4×4 matrix dithering algorithm for retro effects
- Added Liquify/Warp tool to push pixels with brush movement for organic distortions
- Built Custom Brush Editor: draw your own brushes on 4-16px grid editor
- Created dropdown selector for easy brush shape switching
- Implemented Clone Stamp tool: Alt+click to set source, paint to copy pixels
- Increased maximum brush size from 8px to 32px (4x larger than v1.0)
- Made dual-color dithering using primary and secondary colors
- Made it so you can save custom brushes for reuse
- Perfect for duplicating complex patterns and textures

### Import/Export Features
- Added Bulk Image Import: import multiple images as frames at once
- Added grid layout support for multi-row sprite sheets
- Added Sprite Atlas Export (PNG + JSON for Unity/Godot/Phaser)
- Added Sprite Sheet Import to automatically split sprite sheets into frames
- Auto-naming: untagged frames named `frame_0`, `frame_1`, etc.
- Created smart frame count calculation with preview
- Created system that uses frame tags: tagged frames use tag as frame name
- Made dual download: both PNG and JSON files exported
- Made frame metadata include position, size, rotation info
- Made it so you can specify custom frame dimensions (frame width/height)

### Layer System Enhancements
- Added individual layer opacity sliders (0-100% control per layer)
- Added Real-time visual feedback with percentage display during slider drag
- Added 20 blend modes: Normal, Multiply, Screen, Overlay, Add, Subtract, Darken, Lighten, 
    Difference, Exclusion, Hue, Saturation, Color Dodge, Color Burn, Vivid Light, Linear 
    Light, Soft Light, Hard Light, Pin Light, Hard Mix
- Added per-layer blend mode control with dropdown selector
- Added layer masks for non-destructive editing
- Added layer effects (Drop Shadow, Outer Glow, Stroke)
- Added painting on the mask to control layer visibility
- Added 24×24px layer thumbnails with preview
- Created simple keyboard shortcuts for layer effects (1=Shadow, 2=Glow, 3=Stroke, 0=All OFF)
- Expanded layer display to three-row format (drag/visibility/name, opacity slider, 
    blend mode)

### Palette and Color Management
- Added Add Current Color button to manually add colors to palette
- Added hover tooltip shows hex code
- Added Recent Colors palette tracking last 16 colors used
- Added Refresh from Sprite: auto-detect all colors in your artwork
- Built collapsible 🎨 Palette Tools section
- Created Clear Palette button to remove all colors
- Created visual display with 20×20px color swatches
- Implemented custom palette management tools
- Made Generate Gradient Palette: create smooth color ramps (2-32 steps)
- Made it so you can click to instantly reuse recent colors

### Project Management
- Added complete Project Save/Load in JSON format
- Added Crash Recovery to restore unsaved work after crashes
- Added version tracking for compatibility
- Created human-readable JSON format
- Created Workspace Layouts to save/load all UI preferences
- Implemented Auto-Save every 60 seconds
- Made it remember your interface state between sessions
- Made it save all frames, all layers, properties, and settings
- Made recovery prompt appear on reload after crash
- Never lose work: automatic background saving to browser storage

### Selection Tools
- Added Edge Detection selection using Sobel operator for smart edge-based selection
- Automatically selects regions bounded by detected edges
- Made adjustable threshold (50=sensitive to 150=less sensitive)
- Perfect for selecting complex shapes with intricate outlines

### Shape and Gradient Tools
- Added gradient fills for rectangle and circle shapes with smooth color transitions
- Added pixel-perfect circle algorithm toggle for perfect circle rendering
- Built advanced mesh editor UI to visually edit/remove points and change colors
- Implemented gradient mesh fills: click to place color points for smooth multi-color fills
- Upgraded Bezier curve from 3-point quadratic to 4-point cubic for enhanced control

### Symmetry and Pattern Tools
- Added 8 pattern fill types: Dots, Checkerboard, Horizontal Stripes, Vertical Stripes, Diagonal Lines, Crosshatch, Bricks, Hexagons
- Added Radial 16 symmetry (16-way radial for intricate mandalas)
- Added Vertical symmetry (mirror top-bottom, 2-way)
- Created dual-color pattern fills using primary and secondary colors
- Created Radial 8 symmetry (8-way radial)
- Expanded symmetry from horizontal-only to 5 modes
- Implemented Quad symmetry (4-way mirror)
- Made dropdown selector to choose symmetry mode
- Made pattern fills respect active selections

### Transform Tools
- Added Batch brightness adjustment for all frames
- Added Batch flip vertical for all frames
- Added Horizontal flip (↔) to mirror left-to-right
- Added Perspective transform with skew for 3D-style effects
- Added progress feedback showing pixel/frame count changed
- Added Rotate 90° clockwise for current layer (↻)
- Added Rotate 90° counter-clockwise for current layer (↺)
- Added Vertical flip (↕) to mirror top-to-bottom
- Built Batch rotate all frames (90° rotation applied to every frame)
- Created Batch flip horizontal for all frames
- Implemented Batch flip horizontal for all frames
- Made confirmation dialogs to prevent accidental batch operations
- Made single undo restore all frames in batch operations
- "Undo Recent Transformations" undos only the last set of transformations done
- Batch Process now has a "Create Magenta BG" button to automatically create the layer for you

### User Interface
- Added click-to-expand for categories (click header to open, only one non-locked category at a time)
- Added smooth animations for category expansion and tool reveals
- Added animated arrow rotation indicators (▼ → ▲)
- Added dark mode toggle for interface theme
- Added toggle effects dialog via ✨/🔘 icon on layer
- Added mask toggle with 🎭 icon to hide/show parts of layer without deleting
- Added visual indicator to show ⬜ when layer mask's off, 🎭 when mask on
- Added visual indicator to show ✨ when layer effects are active, 🔘 if none
- Added Keyboard Shortcuts UI displaying complete reference guide (⌨️ button)
- Added smooth transitions for all UI controls (0.3-0.4s animations)
- Changed category buttons to open instantly on hover (200ms)
- Changed Histogram, Frame Tools, Global Tools, Transform, Batch Process, and Channels to click-lock (click to lock open, click again to unlock)
- Changed Palette Tools and File Management categories to tool-lock (only lock when option selected)
- Made File Management stay open when Project/Image Import/Image Export is selected
- Changed tool organization from 4 categories to 15 collapsible categories
- Created visual shortcut reference accessible from toolbar
- Color-coded ghost frames: red tint for previous, blue tint for next
- Compacted interface by about 70-75% smaller by default
- Made dynamic control transitions for secondary color section when Gradient tool selected
- Made it so the tool remembers which categories you had expanded when you reload the page
- Made all 37+ shortcuts documented and searchable
- Organized tools into 15 collapsible categories with smooth hover-to-expand functionality

## **v1.0** - Major Feature Release (26 Tools Total)
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
