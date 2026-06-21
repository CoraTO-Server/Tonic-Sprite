// JAVASCRIPT: CORE LOGIC

        // --- DOM ELEMENTS & GLOBAL STATE ---
        const mainCanvas = document.getElementById('main-canvas');
        const mainCtx = mainCanvas.getContext('2d');
        const gridCanvas = document.getElementById('grid-canvas');
        const gridCtx = gridCanvas.getContext('2d');
        const selectionCanvas = document.getElementById('selection-canvas');
        const selectionCtx = selectionCanvas.getContext('2d');
        const colorPicker = document.getElementById('color-picker');
        const colorPickerSecondary = document.getElementById('color-picker-secondary'); 
        const gridWidthInput = document.getElementById('grid-width-input');
        const gridHeightInput = document.getElementById('grid-height-input');
        const linkDimensionsCheckbox = document.getElementById('link-dimensions');
        const brushSizeSlider = document.getElementById('brush-size-slider');
        const brushSizeDisplay = document.getElementById('brush-size-display');
        const brushSpeedSlider = document.getElementById('brush-speed-slider'); 
        const gridColorPicker = document.getElementById('grid-color-picker');
        const darkenedGridEnabled = document.getElementById('darkened-grid-enabled');
        const darkenedGridSize = document.getElementById('darkened-grid-size');
        const darkenedGridColor = document.getElementById('darkened-grid-color');
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvasContainer = document.getElementById('canvas-container');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const gradientLengthSlider = document.getElementById('gradient-length-slider');

        let GRID_SIZE = 16;
        let GRID_WIDTH = 16;
        let GRID_HEIGHT = 16;      
        let PIXEL_SCALE = 30;    
        let ZOOM_LEVEL = 1;      
        const CANVAS_DIM = 480;  
        const MAX_ZOOM = 16;
        let BRUSH_SIZE = 1;      
        let BRUSH_SPEED = 0;     
        let BRUSH_SHAPE = 'circle';     
        let isDrawing = false;
        let currentColor = colorPicker.value;
        let colorSecondary = colorPickerSecondary.value; 
        let frames = [];         
        let currentFrameIndex = 0;
        let currentTool = 'pencil';
        let previewInterval;
        let isPreviewPlaying = true; 
        let lastGridX = -1, lastGridY = -1;
        let maskEditingMode = false; // When true, draw on mask instead of layer
        let maskPaintColor = '#000000'; // Color to use when painting masks (black=hide, white=reveal)
        
        // Tool category management
        let categoryLongHoverTimeouts = new Map(); // Map of category elements to their 3-second hover timeouts
        let categoryLeaveTimeouts = new Map(); // Map to track leave grace period timeouts
        let categoryLastClickTime = new Map(); // Map to track last click times for double-click protection
        let categoryLockTimeouts = new Map(); // Map to track temporary lock timeouts
        const DOUBLE_CLICK_THRESHOLD = 400; // ms - clicks within this time are considered double-clicks
        const LONG_HOVER_DURATION = 3000; // ms - hover duration required to open category
        const CATEGORY_LOCK_DURATION = 3000; // ms - time to keep category locked after tool selection
        
        // Map tools to their category elements (will be populated on init)
        const toolToCategoryMap = new Map();
        
        // Categories that should stay open after button selection (unless another category is opened)
        const STAY_OPEN_CATEGORIES = [
            '🛠️ Global Tools',
            '🔄 Transform',
            '⚡ Batch Process',
            '📺 Channels',
            '📊 Histogram Options'
        ];
        
        // File Management and its subcategories have special behavior
        const FILE_MANAGEMENT_CATEGORY = '📁 File Management';
        const FILE_MANAGEMENT_SUBCATEGORIES = ['💾 Project', '📥 Image Import', '💾 Image Export'];
        
        // Shape tool state
        let shapePoints = [];
        let lineStart = null;
        let curvePoints = [];
        
        // Circle select state
        let circleSelectCenter = null;
        
        // Rectangle and Circle shape state
        let shapeStart = null;
        
        // Palette tracking
        let paletteColors = new Set();
        
        // Selection state
        let selection = null; // {x1, y1, x2, y2, data: ImageData}
        let selectionStartX = -1, selectionStartY = -1;
        let lassoPath = [];
        let isMovingSelection = false;
        let selectionOffsetX = 0, selectionOffsetY = 0;
        
        // Layer state - FRAME-BASED (each frame has its own layers array)
        let frameLayers = []; // Array of layer arrays, one per frame
        let currentLayerIndex = 0;
        
        // Track pixels modified in current stroke (for rainbow/depth tools)
        let strokeModifiedPixels = new Set();
        
        // Undo/Redo state
        let undoStack = [];
        let redoStack = [];
        const MAX_UNDO_STEPS = 50;
        
        // Panning State
        let isPanning = false;
        let panX = 0, panY = 0;
        let startMouseX, startMouseY;
        let brushTimeout; 
        
        // Gradient Tool State
        let gradientStartGridX = -1, gradientStartGridY = -1;
        let gradientStrokeLength = 0;
        let GRADIENT_MAX_LENGTH = 32; 
        
        // Frame Clipboard
        let copiedFrameLayers = null;
        
        // Onion Skinning State
        let onionSkinEnabled = false;
        let onionPrevOpacity = 0.3;
        let onionNextOpacity = 0.3;
        let onionFrameCount = 1;
        
        // Auto-save State
        let autoSaveInterval = null;
        let autoSaveEnabled = false;
        const AUTO_SAVE_DELAY = 60000; // 1 minute
        
        // Pattern Fill State
        let CURRENT_PATTERN = 'dots';
        
        // Tilemap Mode State
        let tilemapEnabled = false;
        let tileSize = 8;
        
        // Symmetry Mode State
        let SYMMETRY_MODE = 'horizontal';
        
        // Clone Stamp State
        let cloneSourceX = -1, cloneSourceY = -1;
        let cloneOffsetX = 0, cloneOffsetY = 0;
        
        // Frame Tags (array of tags, one per frame)
        let frameTags = [];
        
        // Frame Durations (milliseconds per frame, default to animation speed)
        let frameDurations = [];
        
        // Recent Colors (max 16 colors)
        let recentColors = [];
        const MAX_RECENT_COLORS = 16;
        
        // Guides and Rulers
        let guidesEnabled = false;
        let verticalGuides = []; // Array of X positions
        let horizontalGuides = []; // Array of Y positions
        
        // Playback Speed Multiplier
        let playbackSpeedMultiplier = 1.0;
        
        // Loop Point Marker
        let loopStartFrame = 0;
        let loopEndFrame = -1; // -1 means loop to end
        
        // Perspective Grid
        let perspectiveGridEnabled = false;
        
        // Gradient Mesh State
        let meshPoints = []; // Array of {x, y, color}
        
        // Bezier Curve Brush State
        let bezierPoints = [];
        
        // Custom Brush
        let customBrushPattern = null; // 2D array of boolean values
        let customBrushSize = 8;
        
        // --- CONSTANTS ---
        
        const THUMBNAIL_SIZE = 64;
        const PREVIEW_SIZE = 128;
        const VGA_PALETTE_SIZE = 256;
        const VGA_BYTES_PER_COLOR = 3;
        const BMP_HEADER_SIZE = 54;
        const LASSO_OVERLAP_THRESHOLD = 0.35;
        const BLEND_FACTOR = 0.5;
        const DEPTH_DARKEN_FACTOR = 0.95;
        const HIGHLIGHT_BRIGHTEN_FACTOR = 1.05;
        const SHARPEN_FACTOR = 0.15;
        const HUE_SHIFT_AMOUNT = 0.05;
        
        // --- HELPER FUNCTIONS ---
        
        function createTempCanvas(width, height) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            return { canvas, ctx };
        }
        
        function normalizeHexColor(hex) {
            if (!hex.startsWith('#')) hex = '#' + hex;
            return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toUpperCase() : null;
        }
        
        function cloneLayerData(layer) {
            return {
                name: layer.name,
                data: new ImageData(
                    new Uint8ClampedArray(layer.data.data),
                    layer.data.width,
                    layer.data.height
                ),
                visible: layer.visible,
                opacity: layer.opacity,
                blendMode: layer.blendMode || 'normal',
                mask: layer.mask ? new ImageData(
                    new Uint8ClampedArray(layer.mask.data),
                    layer.mask.width,
                    layer.mask.height
                ) : null,
                maskEnabled: layer.maskEnabled || false,
                effects: layer.effects || {
                    dropShadow: false,
                    glow: false,
                    stroke: false,
                    shadowColor: '#000000',
                    glowColor: '#FFFFFF',
                    strokeColor: '#000000'
                }
            };
        }
        
        function cloneAllFrameLayers() {
            return frameLayers.map(frameLayers => frameLayers.map(cloneLayerData));
        }
        
        function setPixelInLayer(layer, x, y, r, g, b, a) {
            if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;
            const index = (y * GRID_WIDTH + x) * 4;
            layer.data.data[index] = r;
            layer.data.data[index + 1] = g;
            layer.data.data[index + 2] = b;
            layer.data.data[index + 3] = a;
        }
        
        // --- INITIALIZATION ---
        
        function initEditor() {
            mainCanvas.width = CANVAS_DIM;
            mainCanvas.height = CANVAS_DIM;
            gridCanvas.width = CANVAS_DIM;
            gridCanvas.height = CANVAS_DIM;
            selectionCanvas.width = CANVAS_DIM;
            selectionCanvas.height = CANVAS_DIM;
            mainCtx.imageSmoothingEnabled = false;
            gridCtx.imageSmoothingEnabled = false;
            selectionCtx.imageSmoothingEnabled = false;

            if (frames.length === 0) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = GRID_WIDTH;
                tempCanvas.height = GRID_HEIGHT;
                frames.push(tempCanvas.getContext('2d').getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT));
                
                // Initialize frame-based layers
                frameLayers.push([]);
            }
            
            // Ensure current frame has at least one layer
            if (!frameLayers[currentFrameIndex] || frameLayers[currentFrameIndex].length === 0) {
                addLayer();
            }

            // Skip resizeSprite during init - layers already exist from addLayer
            // resizeSprite(false); 
            
            // Drawing/Action Listeners
            canvasWrapper.addEventListener('mousedown', startAction); 
            canvasWrapper.addEventListener('mousemove', moveAction);
            canvasWrapper.addEventListener('mouseup', stopAction);
            canvasWrapper.addEventListener('mouseleave', stopAction);
            
            // Primary Color Listener (updates global state and display)
            colorPicker.addEventListener('input', (e) => {
                currentColor = e.target.value;
                document.getElementById('current-color-display').value = currentColor.toUpperCase();
            });
            
            // Only add to recent colors when user finishes picking (not while dragging)
            colorPicker.addEventListener('change', (e) => {
                addToRecentColors(e.target.value);
            });
            
            // Primary Color Hex Input
            document.getElementById('current-color-display').addEventListener('change', (e) => {
                const hex = normalizeHexColor(e.target.value.trim());
                if (hex) {
                    colorPicker.value = hex;
                    currentColor = hex;
                    e.target.value = hex;
                    addToRecentColors(hex);
                } else {
                    e.target.value = currentColor.toUpperCase();
                }
            });
            
            // Secondary Color Listener (updates global state and display)
            colorPickerSecondary.addEventListener('input', (e) => {
                colorSecondary = e.target.value;
                document.getElementById('secondary-color-display').value = colorSecondary.toUpperCase();
            });
            
            // Secondary Color Hex Input
            document.getElementById('secondary-color-display').addEventListener('change', (e) => {
                const hex = normalizeHexColor(e.target.value.trim());
                if (hex) {
                    colorPickerSecondary.value = hex;
                    colorSecondary = hex;
                    e.target.value = hex;
                } else {
                    e.target.value = colorSecondary.toUpperCase();
                }
            });
            
            // Initial setting of displays
            document.getElementById('current-color-display').value = colorPicker.value.toUpperCase();
            document.getElementById('secondary-color-display').value = colorPickerSecondary.value.toUpperCase();


            gradientLengthSlider.addEventListener('input', (e) => {
                GRADIENT_MAX_LENGTH = parseInt(e.target.value);
            });
            
            // Grid Line Color Hex Input
            document.getElementById('grid-color-hex').addEventListener('change', (e) => {
                const hex = normalizeHexColor(e.target.value.trim());
                if (hex) {
                    gridColorPicker.value = hex;
                    e.target.value = hex;
                    drawGrid();
                } else {
                    e.target.value = gridColorPicker.value.toUpperCase();
                }
            });
            
            // Darkened Grid Color Hex Input
            document.getElementById('darkened-grid-hex').addEventListener('change', (e) => {
                const hex = normalizeHexColor(e.target.value.trim());
                if (hex) {
                    document.getElementById('darkened-grid-color').value = hex;
                    e.target.value = hex;
                    drawGrid();
                } else {
                    e.target.value = document.getElementById('darkened-grid-color').value.toUpperCase();
                }
            });
            
            // Canvas BG Hex Input
            document.getElementById('canvas-bg-hex').addEventListener('change', (e) => {
                const hex = normalizeHexColor(e.target.value.trim());
                if (hex) {
                    document.getElementById('canvas-bg-color').value = hex;
                    document.getElementById('canvas-bg-preset').value = 'custom';
                    e.target.value = hex;
                    updateCanvasBackground();
                } else {
                    e.target.value = document.getElementById('canvas-bg-color').value.toUpperCase();
                }
            });

            // Set scroll wheel handler for zooming
            canvasWrapper.addEventListener('wheel', handleZoomWheel);
            
            // Middle-click (button 1) for universal drag/pan
            canvasWrapper.addEventListener('mousedown', (e) => {
                if (e.button === 1) { 
                    e.preventDefault(); 
                    startPan(e);
                }
            });
            canvasWrapper.addEventListener('contextmenu', e => e.preventDefault()); 

            brushSizeSlider.addEventListener('input', updateBrushSize);
            brushSpeedSlider.addEventListener('input', updateBrushSpeed); 
            updateBrushSize(); 
            updateBrushSpeed();

            updateAnimationPreview();
            startPreviewLoop();
            
            activateTool('pencil');
            zoomCanvas(0); 
            drawGrid(); 
            
            // Add keyboard shortcuts
            document.addEventListener('keydown', handleKeyboardShortcuts);
            
            // Initialize palette
            updatePalette();
            
            // Check if file is hosted (GIF export only works on http://, not file://)
            const isHosted = window.location.protocol !== 'file:';
            const gifBtn = document.getElementById('gif-export-btn');
            
            if (!isHosted) {
                gifBtn.disabled = true;
                gifBtn.style.opacity = '0.5';
                gifBtn.style.cursor = 'not-allowed';
                gifBtn.style.backgroundColor = '#999';
                gifBtn.title = 'GIF export only works when hosted on a web server (not file://)';
            }
        }
        
        // --- QoL / BRUSH SPEED ---

        function updateBrushSpeed() {
            BRUSH_SPEED = parseInt(brushSpeedSlider.value);
            document.getElementById('brush-speed-display').textContent = `${BRUSH_SPEED}ms`;
        }
        
        // --- DIMENSION LINK TOGGLE ---
        
        function toggleDimensionLink() {
            const isLinked = linkDimensionsCheckbox.checked;
            if (isLinked) {
                // Sync both to width value when linking
                gridHeightInput.value = gridWidthInput.value;
                GRID_HEIGHT = GRID_WIDTH;
            }
        }
        
        function updateGridVisibility() {
            const visibility = document.getElementById('grid-visibility').value;
            const isNoGrid = (visibility === 'none');
            
            // Disable darkened grid pattern when no grid is shown
            darkenedGridEnabled.disabled = isNoGrid;
            darkenedGridSize.disabled = isNoGrid || !darkenedGridEnabled.checked;
            darkenedGridColor.disabled = isNoGrid || !darkenedGridEnabled.checked;
            document.getElementById('darkened-grid-hex').disabled = isNoGrid || !darkenedGridEnabled.checked;
            
            if (isNoGrid) {
                darkenedGridEnabled.checked = false;
            }
            
            drawGrid();
        }
        
        function updateGridLineColor() {
            const hex = gridColorPicker.value.toUpperCase();
            document.getElementById('grid-color-hex').value = hex;
            drawGrid();
        }
        
        function updateDarkenedGridColor() {
            const hex = document.getElementById('darkened-grid-color').value.toUpperCase();
            document.getElementById('darkened-grid-hex').value = hex;
            drawGrid();
        }
        
        function updateCanvasBGColor() {
            const hex = document.getElementById('canvas-bg-color').value.toUpperCase();
            document.getElementById('canvas-bg-hex').value = hex;
            document.getElementById('canvas-bg-preset').value = 'custom';
            updateCanvasBackground();
        }
        
        function toggleDarkenedGrid() {
            const enabled = darkenedGridEnabled.checked;
            darkenedGridSize.disabled = !enabled;
            darkenedGridColor.disabled = !enabled;
            document.getElementById('darkened-grid-hex').disabled = !enabled;
            drawGrid();
        }
        
        function applyPreset(preset) {
            if (!preset) return;
            const [width, height] = preset.split(',').map(Number);
            gridWidthInput.value = width;
            gridHeightInput.value = height;
            // Auto-apply preset
            resizeSprite(true);
        }
        
        function updateDimensions(changedField) {
            const isLinked = linkDimensionsCheckbox.checked;
            
            if (changedField === 'width') {
                const newWidth = parseInt(gridWidthInput.value);
                if (!isNaN(newWidth) && newWidth >= 8) {
                    if (isLinked) {
                        gridHeightInput.value = newWidth;
                    }
                }
            } else if (changedField === 'height') {
                const newHeight = parseInt(gridHeightInput.value);
                if (!isNaN(newHeight) && newHeight >= 8) {
                    if (isLinked) {
                        gridWidthInput.value = newHeight;
                    }
                }
            }
            
            // Just update the display, don't resize yet
            // User needs to click the resize button to actually apply changes
        }

        // --- PIXEL SCALE FIX ---

        function updatePixelScale() {
            PIXEL_SCALE = CANVAS_DIM / GRID_SIZE; 
            drawGrid(); 
            zoomCanvas('update');
        }

        // --- PANNING / ZOOM FUNCTIONS (Unchanged from V16) ---

        function updateCanvasDimensions() {
            const displaySize = CANVAS_DIM * ZOOM_LEVEL;
            mainCanvas.style.width = `${displaySize}px`;
            mainCanvas.style.height = `${displaySize}px`;
            gridCanvas.style.width = `${displaySize}px`;
            gridCanvas.style.height = `${displaySize}px`;
            selectionCanvas.style.width = `${displaySize}px`;
            selectionCanvas.style.height = `${displaySize}px`;
            
            // Center the canvas initially
            if (ZOOM_LEVEL === 1) {
                panX = (canvasWrapper.clientWidth - displaySize) / 2;
                panY = (canvasWrapper.clientHeight - displaySize) / 2;
            }
            updateCanvasPosition();
        }
        
        function updateCanvasPosition() {
            canvasContainer.style.transform = `translate(${panX}px, ${panY}px)`;
        }

        function zoomCanvas(direction) {
            const ZOOM_INCREMENT = 0.25;
            const MIN_ZOOM = 0.5; 
            const oldZoom = ZOOM_LEVEL;
            
            if (direction === 1) { 
                ZOOM_LEVEL += ZOOM_INCREMENT;
            } else if (direction === -1) { 
                ZOOM_LEVEL -= ZOOM_INCREMENT;
            } else if (direction === 0) { 
                ZOOM_LEVEL = 1;
            } else if (direction === 'update') {
                // Just update display
            }
            
            ZOOM_LEVEL = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, ZOOM_LEVEL)); 
            ZOOM_LEVEL = Math.round(ZOOM_LEVEL * 4) / 4; // Round to nearest 0.25
            
            if (oldZoom !== ZOOM_LEVEL || direction === 'update') {
                updateCanvasDimensions();
                document.getElementById('zoom-level').textContent = `${ZOOM_LEVEL}x`;
                drawGrid(); 
            }
        }
        
        function handleZoomWheel(e) {
            e.preventDefault();
            
            // In mask editing mode, scroll wheel toggles between black and white
            if (maskEditingMode) {
                maskPaintColor = maskPaintColor === '#000000' ? '#ffffff' : '#000000';
                const colorName = maskPaintColor === '#000000' ? 'BLACK (hide)' : 'WHITE (reveal)';
                updateToolStatus(`🎭 MASK EDITING - Paint with ${colorName} - Scroll to switch - Right-click to exit`);
                return;
            }
            
            const direction = e.deltaY < 0 ? 1 : -1;
            zoomCanvas(direction);
        }

        function startPan(e) {
            isPanning = true;
            canvasWrapper.classList.add('panning');
            startMouseX = e.clientX;
            startMouseY = e.clientY;
        }

        // --- ACTION HANDLERS ---
        
        function startAction(e) {
            e.preventDefault();
            // Check if click is within canvas area (on any canvas or the container)
            const targetIsCanvas = e.target === mainCanvas || e.target === gridCanvas || e.target === selectionCanvas || e.target === canvasContainer || e.target === canvasWrapper;
            
            // Right-click handling
            if (e.button === 2) {
                // In mask editing mode, right-click exits mask editing
                if (maskEditingMode) {
                    toggleMaskEditingMode(currentLayerIndex);
                    return;
                } else if (isMovingSelection) {
                    // Cancel selection movement
                    cancelSelection();
                    isMovingSelection = false;
                    return;
                } else if (selection) {
                    // Clear selection if one exists
                    clearSelection();
                    return;
                } else if (currentTool === 'swap') {
                    // Cancel swap tool on right-click
                    document.getElementById('swap-info').innerHTML = '';
                    activateTool('pencil');
                    return;
                } else if (ZOOM_LEVEL > 1) {
                    // Pan if zoomed in
                    startPan(e);
                    return;
                }
            }
            
            const isToolPan = currentTool === 'pan' && targetIsCanvas;
            if (isToolPan) {
                startPan(e);
                return;
            } 
            if (e.button !== 0 || !targetIsCanvas) return;
            const coords = getGridCoords(e);
            if (!coords || isPanning) return;
            lastGridX = coords.gridX;
            lastGridY = coords.gridY;
            
            if (currentTool === 'gradient') {
                isDrawing = true;
                gradientStartGridX = coords.gridX;
                gradientStartGridY = coords.gridY;
                gradientStrokeLength = 0; 
                const color = getGradientColor(0);
                drawPixel(coords.gridX, coords.gridY, color, false, currentTool);
                return; 
            }
            
            if (currentTool === 'rectselect') {
                // Check if clicking inside existing selection to move it
                if (selection && isPointInSelection(coords.gridX, coords.gridY)) {
                    isMovingSelection = true;
                    selectionOffsetX = coords.gridX - Math.min(selection.x1, selection.x2);
                    selectionOffsetY = coords.gridY - Math.min(selection.y1, selection.y2);
                    // Don't capture yet - wait until first move
                } else {
                    // Start new selection
                    clearSelection();
                    isDrawing = true;
                    selectionStartX = coords.gridX;
                    selectionStartY = coords.gridY;
                    selection = {x1: coords.gridX, y1: coords.gridY, x2: coords.gridX, y2: coords.gridY, layerIndex: currentLayerIndex};
                }
                return;
            } else if (currentTool === 'lasso') {
                if (selection && isPointInSelection(coords.gridX, coords.gridY)) {
                    isMovingSelection = true;
                    selectionOffsetX = coords.gridX - Math.min(selection.x1, selection.x2);
                    selectionOffsetY = coords.gridY - Math.min(selection.y1, selection.y2);
                    // Don't capture yet - wait until first move
                } else {
                    clearSelection();
                    isDrawing = true;
                    lassoPath = [{x: coords.gridX, y: coords.gridY}];
                }
                return;
            } else if (currentTool === 'colorselect') {
                if (selection && isPointInSelection(coords.gridX, coords.gridY)) {
                    // Clicking inside selection deselects it
                    clearSelection();
                } else {
                    // Clicking outside creates new magic wand selection
                    saveState();
                    selectByColor(coords.gridX, coords.gridY);
                }
                return;
            } else if (currentTool === 'edgeselect') {
                saveState();
                selectByEdgeDetection(coords.gridX, coords.gridY);
                return;
            } else if (currentTool === 'circleselect') {
                if (selection && isPointInSelection(coords.gridX, coords.gridY)) {
                    isMovingSelection = true;
                    selectionOffsetX = coords.gridX - Math.min(selection.x1, selection.x2);
                    selectionOffsetY = coords.gridY - Math.min(selection.y1, selection.y2);
                } else {
                    clearSelection();
                    isDrawing = true;
                    circleSelectCenter = {x: coords.gridX, y: coords.gridY};
                }
                return;
            } else if (currentTool === 'erasecolor') {
                if (!selection) {
                    alert("Erase Color only works within a selection!\nPlease create a selection first.");
                    return;
                }
                saveState();
                eraseColorInSelection(coords.gridX, coords.gridY);
                return;
            } else if (currentTool === 'magiceraser') {
                saveState();
                magicErase(coords.gridX, coords.gridY);
                return;
            } else if (currentTool === 'gradientmesh') {
                // Gradient mesh - click to add color points, fills with smooth gradient
                meshPoints.push({x: coords.gridX, y: coords.gridY, color: currentColor});
                updateToolStatus(`Mesh point ${meshPoints.length} added. Press Enter to fill, ESC to cancel.`);
                drawSelectionOverlay();
                return;
            } else if (currentTool === 'beziercurve') {
                // Bezier curve brush - 4 points for cubic bezier
                bezierPoints.push({x: coords.gridX, y: coords.gridY});
                if (bezierPoints.length < 4) {
                    updateToolStatus(`Bezier point ${bezierPoints.length}/4. Click ${4 - bezierPoints.length} more.`);
                    drawSelectionOverlay();
                } else {
                    saveState();
                    drawBezierCurve(bezierPoints, currentColor);
                    bezierPoints = [];
                    updateToolStatus('');
                    drawSelectionOverlay();
                }
                return;
            } else if (currentTool === 'rectangle' || currentTool === 'circle') {
                if (!shapeStart) {
                    saveState();
                    shapeStart = {x: coords.gridX, y: coords.gridY};
                    updateToolStatus(currentTool === 'rectangle' ? 'Rectangle: Click opposite corner' : 'Circle: Click edge point');
                    drawSelectionOverlay();
                } else {
                    // Draw shape
                    const shapeFillCheckbox = document.getElementById('shape-fill-checkbox');
                    const isFilled = shapeFillCheckbox ? shapeFillCheckbox.checked : true;
                    
                    // Ensure we have a valid color
                    const shapeColor = currentColor || '#000000';
                    
                    if (currentTool === 'rectangle') {
                        drawRectangle(shapeStart.x, shapeStart.y, coords.gridX, coords.gridY, shapeColor, isFilled);
                    } else if (currentTool === 'circle') {
                        // Calculate center as midpoint between the two clicked points
                        const centerX = Math.round((shapeStart.x + coords.gridX) / 2);
                        const centerY = Math.round((shapeStart.y + coords.gridY) / 2);
                        // Radius is half the distance between points
                        const radius = Math.sqrt(
                            Math.pow(coords.gridX - shapeStart.x, 2) + 
                            Math.pow(coords.gridY - shapeStart.y, 2)
                        ) / 2;
                        drawCircle(centerX, centerY, radius, shapeColor, isFilled);
                    }
                    
                    shapeStart = null;
                    compositeLayersToCanvas();
                    updateThumbnail(currentFrameIndex);
                    updatePalette();
                    updateToolStatus('');
                    drawSelectionOverlay();
                }
                return;
            }
            
            if (currentTool === 'line') {
                if (!lineStart) {
                    saveState();
                    lineStart = {x: coords.gridX, y: coords.gridY};
                    updateToolStatus('Line: Click end point');
                    drawSelectionOverlay(); // Show start point
                } else {
                    // Draw line from lineStart to current point
                    drawLine(lineStart.x, lineStart.y, coords.gridX, coords.gridY, currentColor);
                    lineStart = null;
                    compositeLayersToCanvas();
                    updateThumbnail(currentFrameIndex);
                    updateToolStatus('');
                    drawSelectionOverlay(); // Clear indicators
                }
                return;
            } else if (currentTool === 'contour' || currentTool === 'polygon') {
                // Handle double-click to close shape
                if (e.detail === 2 && shapePoints.length >= 2) {
                    saveState();
                    const isFilled = document.getElementById('shape-fill-checkbox').checked;
                    
                    // Contour always draws outline, polygon respects fill checkbox
                    if (isFilled && currentTool === 'polygon') {
                        fillPolygon(shapePoints, currentColor);
                    } else {
                        // Draw outline only (contour or unfilled polygon)
                        for (let i = 0; i < shapePoints.length; i++) {
                            const p1 = shapePoints[i];
                            const p2 = shapePoints[(i + 1) % shapePoints.length];
                            drawLine(p1.x, p1.y, p2.x, p2.y, currentColor);
                        }
                    }
                    shapePoints = [];
                    compositeLayersToCanvas();
                    updateThumbnail(currentFrameIndex);
                    updatePalette();
                    updateToolStatus('');
                    drawSelectionOverlay(); // Clear indicators
                } else {
                    shapePoints.push({x: coords.gridX, y: coords.gridY});
                    updateToolStatus(currentTool === 'polygon' ? `Polygon: ${shapePoints.length} points - Double-click to finish` : `Contour: ${shapePoints.length} points - Double-click to close`);
                    drawSelectionOverlay(); // Show points
                }
                return;
            } else if (currentTool === 'curve') {
                if (curvePoints.length === 0) {
                    saveState();
                    curvePoints.push({x: coords.gridX, y: coords.gridY});
                    updateToolStatus('Curve: Click end point');
                    drawSelectionOverlay(); // Show point
                } else if (curvePoints.length === 1) {
                    curvePoints.push({x: coords.gridX, y: coords.gridY});
                    updateToolStatus('Curve: Click control point');
                    drawSelectionOverlay(); // Show points
                } else if (curvePoints.length === 2) {
                    // Third point defines the curve
                    drawQuadraticCurve(curvePoints[0].x, curvePoints[0].y, coords.gridX, coords.gridY, curvePoints[1].x, curvePoints[1].y, currentColor);
                    curvePoints = [];
                    compositeLayersToCanvas();
                    updateThumbnail(currentFrameIndex);
                    updateToolStatus('');
                    drawSelectionOverlay(); // Clear indicators
                }
                return;
            } else if (currentTool === 'pencil' || currentTool === 'pencilsquare' || currentTool === 'eraser' || currentTool === 'blend' || currentTool === 'depth' || currentTool === 'symmetrical' || currentTool === 'rainbow' || currentTool === 'highlight' || currentTool === 'sharpen' || currentTool === 'jumble' || currentTool === 'spray' || currentTool === 'dither' || currentTool === 'clone' || currentTool === 'liquify') {
                if (currentTool === 'clone' && e.altKey) {
                    // Alt+click to set clone source
                    cloneSourceX = coords.gridX;
                    cloneSourceY = coords.gridY;
                    cloneOffsetX = 0;
                    cloneOffsetY = 0;
                    updateToolStatus(`Clone source set at (${cloneSourceX}, ${cloneSourceY})`);
                    return;
                }
                
                if (currentTool === 'clone' && !e.altKey) {
                    if (cloneSourceX !== -1 && cloneSourceY !== -1) {
                        cloneOffsetX = coords.gridX - cloneSourceX;
                        cloneOffsetY = coords.gridY - cloneSourceY;
                    }
                }
                
                isDrawing = true;
                strokeModifiedPixels.clear(); // Clear for new stroke (important for rainbow/depth tools)
                const isErase = (currentTool === 'eraser');
                // In mask editing mode, use mask paint color (black/white)
                const color = maskEditingMode ? maskPaintColor : (isErase ? 'rgba(0,0,0,0)' : currentColor);
                drawPixel(coords.gridX, coords.gridY, color, isErase, currentTool);
            } else if (currentTool === 'refined') {
                // In mask editing mode, use mask paint color (black/white)
                const color = maskEditingMode ? maskPaintColor : currentColor;
                drawPixel(coords.gridX, coords.gridY, color, false, currentTool);
                isDrawing = false; 
                return;
            } else if (currentTool === 'fill') {
                saveState(); // Save before fill
                if(isPreviewPlaying) togglePreviewLoop(); 
                floodFill(coords.gridX, coords.gridY, hexToRgb(currentColor));
                isDrawing = false;
            } else if (currentTool === 'pattern') {
                saveState(); // Save before pattern fill
                if(isPreviewPlaying) togglePreviewLoop(); 
                patternFill(coords.gridX, coords.gridY, CURRENT_PATTERN);
                isDrawing = false;
            } else if (currentTool === 'swap') {
                selectSourceColor(coords.gridX, coords.gridY);
                isDrawing = false;
            }
        }
        
        function moveAction(e) {
            if (isPanning) {
                e.preventDefault();
                const dx = e.clientX - startMouseX;
                const dy = e.clientY - startMouseY;
                
                // Update pan position with boundary constraints
                const displaySize = CANVAS_DIM * ZOOM_LEVEL;
                const wrapperWidth = canvasWrapper.clientWidth;
                const wrapperHeight = canvasWrapper.clientHeight;
                
                // Calculate boundaries - allow panning until edges touch wrapper edges
                const maxPanX = wrapperWidth - (3 * PIXEL_SCALE * ZOOM_LEVEL); // 3 pixels from edge
                const minPanX = -(displaySize - (3 * PIXEL_SCALE * ZOOM_LEVEL));
                const maxPanY = wrapperHeight - (3 * PIXEL_SCALE * ZOOM_LEVEL);
                const minPanY = -(displaySize - (3 * PIXEL_SCALE * ZOOM_LEVEL));
                
                panX += dx;
                panY += dy;
                
                // Clamp to boundaries
                panX = Math.max(minPanX, Math.min(maxPanX, panX));
                panY = Math.max(minPanY, Math.min(maxPanY, panY));
                
                startMouseX = e.clientX;
                startMouseY = e.clientY;
                updateCanvasPosition();
                return;
            }
            
            const coords = getGridCoords(e);
            if (!coords) return;
            
            // Handle moving selection
            if (isMovingSelection && (currentTool === 'rectselect' || currentTool === 'lasso' || currentTool === 'circleselect')) {
                if (selection) {
                    // Capture pixels on first move
                    if (!selection.data) {
                        captureSelection();
                    }
                    
                    const newX = coords.gridX - selectionOffsetX;
                    const newY = coords.gridY - selectionOffsetY;
                    const width = Math.abs(selection.x2 - selection.x1);
                    const height = Math.abs(selection.y2 - selection.y1);
                    selection.x1 = newX;
                    selection.y1 = newY;
                    selection.x2 = newX + width;
                    selection.y2 = newY + height;
                    
                    // Update pixel positions for lasso, color select, and circle select
                    if ((selection.isLasso || selection.isColorSelect || selection.isCircle) && selection.pixels) {
                        const dx = newX - Math.min(...selection.pixels.map(p => p.x));
                        const dy = newY - Math.min(...selection.pixels.map(p => p.y));
                        // Don't update pixel positions, they're relative to bounding box
                    }
                    
                    drawSelectionOverlay();
                }
                return;
            }
            
            if (!isDrawing) return;
            
            // Handle rect select dragging
            if (currentTool === 'rectselect') {
                selection.x2 = coords.gridX;
                selection.y2 = coords.gridY;
                drawSelectionOverlay();
                updateSelectionInfo();
                updateCurrentToolDisplay();
                return;
            }
            
            // Handle lasso dragging
            if (currentTool === 'lasso' && lassoPath.length > 0) {
                const lastPoint = lassoPath[lassoPath.length - 1];
                if (lastPoint.x !== coords.gridX || lastPoint.y !== coords.gridY) {
                    lassoPath.push({x: coords.gridX, y: coords.gridY});
                    drawSelectionOverlay();
                }
                return;
            }
            
            // Handle circle select dragging - show preview
            if (currentTool === 'circleselect' && circleSelectCenter && isDrawing) {
                // Draw preview circle while dragging
                const radius = Math.sqrt(
                    Math.pow(coords.gridX - circleSelectCenter.x, 2) + 
                    Math.pow(coords.gridY - circleSelectCenter.y, 2)
                ) / 2; // Half distance for true radius
                
                selectionCtx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);
                selectionCtx.strokeStyle = '#000';
                selectionCtx.lineWidth = 2;
                selectionCtx.setLineDash([5, 5]);
                selectionCtx.beginPath();
                selectionCtx.arc(
                    circleSelectCenter.x * PIXEL_SCALE + PIXEL_SCALE/2, 
                    circleSelectCenter.y * PIXEL_SCALE + PIXEL_SCALE/2, 
                    radius * PIXEL_SCALE, 
                    0, 
                    2 * Math.PI
                );
                selectionCtx.stroke();
                selectionCtx.setLineDash([]);
                return;
            }
            
            if (currentTool === 'gradient') {
                const dx = coords.gridX - gradientStartGridX;
                const dy = coords.gridY - gradientStartGridY;
                const currentStrokeLength = Math.sqrt(dx * dx + dy * dy); 
                if (coords.gridX !== lastGridX || coords.gridY !== lastGridY) {
                    const steps = Math.max(Math.abs(coords.gridX - lastGridX), Math.abs(coords.gridY - lastGridY));
                    for (let i = 0; i <= steps; i++) {
                        const x = Math.round(lastGridX + (coords.gridX - lastGridX) * i / steps);
                        const y = Math.round(lastGridY + (coords.gridY - lastGridY) * i / steps);
                        const stepRatio = Math.min(1, (gradientStrokeLength + (currentStrokeLength - gradientStrokeLength) * (i / steps)) / GRADIENT_MAX_LENGTH);
                        const stepColor = getGradientColor(stepRatio);
                        drawPixel(x, y, stepColor, false, 'pencil'); 
                    }
                    gradientStrokeLength = currentStrokeLength; 
                    lastGridX = coords.gridX;
                    lastGridY = coords.gridY;
                }
                return; 
            }
            
            if (BRUSH_SPEED > 0 && brushTimeout) return;
            const isErase = (currentTool === 'eraser');
            // In mask editing mode, use mask paint color (black/white)
            const color = maskEditingMode ? maskPaintColor : (isErase ? 'rgba(0,0,0,0)' : currentColor);
            const dx = Math.abs(coords.gridX - lastGridX);
            const dy = Math.abs(coords.gridY - lastGridY);
            const steps = Math.max(dx, dy);
            
            for (let i = 0; i <= steps; i++) {
                const x = Math.round(lastGridX + (coords.gridX - lastGridX) * i / steps);
                const y = Math.round(lastGridY + (coords.gridY - lastGridY) * i / steps);
                drawPixel(x, y, color, isErase, currentTool);
            }
            
            lastGridX = coords.gridX;
            lastGridY = coords.gridY;
            
            if (BRUSH_SPEED > 0) {
                brushTimeout = setTimeout(() => {
                    brushTimeout = null; 
                }, BRUSH_SPEED);
            }
        }

        function stopAction(e) {
            if (isPanning) {
                isPanning = false;
                canvasWrapper.classList.remove('panning');
            }
            
            // Handle finishing selection movement
            if (isMovingSelection) {
                isMovingSelection = false;
                if (selection && selection.data) {
                    saveState(); // Save before pasting moved selection
                    const targetX = Math.min(selection.x1, selection.x2);
                    const targetY = Math.min(selection.y1, selection.y2);
                    pasteSelection(targetX, targetY);
                    clearSelection();
                }
                return;
            }
            
            // Handle finishing lasso selection
            if (currentTool === 'lasso' && isDrawing && lassoPath.length > 0) {
                // Convert lasso path to selected pixels (complete rectangles only)
                const selectedPixels = createLassoPath(lassoPath);
                
                if (selectedPixels.length > 0) {
                    // Calculate bounding box
                    let minX = selectedPixels[0].x, maxX = selectedPixels[0].x;
                    let minY = selectedPixels[0].y, maxY = selectedPixels[0].y;
                    for (const pixel of selectedPixels) {
                        minX = Math.min(minX, pixel.x);
                        maxX = Math.max(maxX, pixel.x);
                        minY = Math.min(minY, pixel.y);
                        maxY = Math.max(maxY, pixel.y);
                    }
                    
                    selection = {
                        x1: minX, 
                        y1: minY, 
                        x2: maxX, 
                        y2: maxY,
                        isLasso: true,
                        pixels: selectedPixels,
                        layerIndex: currentLayerIndex
                    };
                }
                lassoPath = [];
                drawSelectionOverlay();
                updateSelectionInfo();
                updateCurrentToolDisplay();
            }
            
            // Handle finishing circle selection
            if (currentTool === 'circleselect' && isDrawing && circleSelectCenter) {
                const coords = getGridCoords(e);
                if (coords) {
                    const radius = Math.sqrt(
                        Math.pow(coords.gridX - circleSelectCenter.x, 2) + 
                        Math.pow(coords.gridY - circleSelectCenter.y, 2)
                    ) / 2; // Half distance for true radius
                    
                    // Only create selection if radius is meaningful
                    if (radius >= 0.5) {
                        const selectedPixels = createCircleSelection(circleSelectCenter.x, circleSelectCenter.y, radius);
                        
                        if (selectedPixels.length > 0) {
                            // Calculate bounding box
                            let minX = selectedPixels[0].x, maxX = selectedPixels[0].x;
                            let minY = selectedPixels[0].y, maxY = selectedPixels[0].y;
                            for (const pixel of selectedPixels) {
                                minX = Math.min(minX, pixel.x);
                                maxX = Math.max(maxX, pixel.x);
                                minY = Math.min(minY, pixel.y);
                                maxY = Math.max(maxY, pixel.y);
                            }
                            
                            selection = {
                                x1: minX, 
                                y1: minY, 
                                x2: maxX, 
                                y2: maxY,
                                isCircle: true,
                                pixels: selectedPixels,
                                layerIndex: currentLayerIndex
                            };
                        }
                    }
                }
                circleSelectCenter = null;
                drawSelectionOverlay();
                updateSelectionInfo();
                updateCurrentToolDisplay();
            }
            
            
            if (isDrawing) {
                isDrawing = false;
                lastGridX = -1;
                lastGridY = -1;
                gradientStartGridX = -1;
                gradientStartGridY = -1;
                gradientStrokeLength = 0;
                strokeModifiedPixels.clear(); // Clear modified pixels tracker
                updatePalette(); // Update palette after drawing
                updateThumbnail(currentFrameIndex);
                renderLayerList();
            }
            clearTimeout(brushTimeout);
            brushTimeout = null;
        }
        
        // --- DRAWING / PIXEL LOGIC ---
        
        function getGridCoords(e) {
            const containerRect = canvasContainer.getBoundingClientRect();
            const x = e.clientX - containerRect.left;
            const y = e.clientY - containerRect.top;
            let gridX = Math.floor(x / (PIXEL_SCALE * ZOOM_LEVEL));
            let gridY = Math.floor(y / (PIXEL_SCALE * ZOOM_LEVEL));
            
            // Apply tilemap snapping if enabled
            if (tilemapEnabled) {
                gridX = Math.floor(gridX / tileSize) * tileSize;
                gridY = Math.floor(gridY / tileSize) * tileSize;
            }
            
            // Apply guide snapping if enabled (within 2 pixels)
            if (guidesEnabled) {
                const snapDistance = 2;
                for (const guideX of verticalGuides) {
                    if (Math.abs(gridX - guideX) <= snapDistance) {
                        gridX = guideX;
                        break;
                    }
                }
                for (const guideY of horizontalGuides) {
                    if (Math.abs(gridY - guideY) <= snapDistance) {
                        gridY = guideY;
                        break;
                    }
                }
            }
            
            if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
                return null;
            }
            return { gridX, gridY };
        }
        
        function updateBrushSize() {
            BRUSH_SIZE = parseInt(brushSizeSlider.value);
            document.getElementById('brush-size-display').textContent = `${BRUSH_SIZE}x${BRUSH_SIZE}`;
        }
        
        function updateBrushShape(shape) {
            BRUSH_SHAPE = shape;
            
            // Show/hide custom brush controls based on selection
            const customBrushControls = document.getElementById('custom-brush-controls');
            if (customBrushControls) {
                customBrushControls.style.display = (shape === 'custom') ? 'block' : 'none';
            }
        }
        
        function updateSymmetryMode(mode) {
            SYMMETRY_MODE = mode;
        }
        
        function updateCurrentPattern(pattern) {
            CURRENT_PATTERN = pattern;
        }
        
        function updateGradientLength(length) {
            GRADIENT_MAX_LENGTH = parseInt(length);
        }
        
        function getGradientColor(ratio) {
            const startColor = hexToRgb(currentColor);
            const endColor = hexToRgb(colorSecondary);
            const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
            const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
            const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
            const a = Math.round(startColor[3] + (endColor[3] - startColor[3]) * ratio);
            return `rgba(${r},${g},${b},${a / 255})`;
        }
        
        function getPixelColorFromCanvas(x, y) {
            // Get pixel color from the composited main canvas at grid coordinates
            const imageData = mainCtx.getImageData(x * PIXEL_SCALE, y * PIXEL_SCALE, 1, 1);
            return [imageData.data[0], imageData.data[1], imageData.data[2], imageData.data[3]];
        }
        
        // **NEW CORE DRAWING FUNCTION**
        function drawPixelCore(gridX, gridY, color, isErase = false, tool = 'pencil') {
            let currentBrushSize = BRUSH_SIZE;
            if (tool === 'refined') {
                 currentBrushSize = 1; 
            }
            
            // Center the brush on the click point
            const halfBrush = Math.floor(currentBrushSize / 2);
            const startX = gridX - halfBrush;
            const startY = gridY - halfBrush;
            
            // Determine brush shape for pencil/eraser tools (but NOT pencilsquare which forces square)
            const useCustomShape = (tool === 'pencil' || tool === 'eraser') && BRUSH_SHAPE !== 'square' && tool !== 'pencilsquare';
            
            for (let yOffset = 0; yOffset < currentBrushSize; yOffset++) {
                for (let xOffset = 0; xOffset < currentBrushSize; xOffset++) {
                    const drawX = startX + xOffset;
                    const drawY = startY + yOffset;
                    
                    // Apply brush shape filtering
                    if (useCustomShape && currentBrushSize > 1) {
                        const relX = drawX - gridX;
                        const relY = drawY - gridY;
                        const distFromCenter = Math.sqrt(relX * relX + relY * relY);
                        const effectiveRadius = currentBrushSize / 2 - 0.25;
                        
                        switch(BRUSH_SHAPE) {
                            case 'circle':
                                if (distFromCenter > effectiveRadius) continue;
                                break;
                            case 'plus':
                                if (relX !== 0 && relY !== 0) continue;
                                break;
                            case 'x':
                                if (Math.abs(relX) !== Math.abs(relY)) continue;
                                break;
                            case 'diamond':
                                if (Math.abs(relX) + Math.abs(relY) > halfBrush) continue;
                                break;
                            case 'star':
                                if (relX !== 0 && relY !== 0 && Math.abs(relX) !== Math.abs(relY)) continue;
                                break;
                            case 'custom':
                                if (customBrushPattern) {
                                    // Center the custom brush pattern on the cursor
                                    const customHalfBrush = Math.floor(customBrushSize / 2);
                                    const customX = xOffset - halfBrush + customHalfBrush;
                                    const customY = yOffset - halfBrush + customHalfBrush;
                                    
                                    // Check if within custom brush bounds
                                    if (customX >= 0 && customX < customBrushSize && 
                                        customY >= 0 && customY < customBrushSize) {
                                        if (!customBrushPattern[customY][customX]) continue;
                                    } else {
                                        continue;
                                    }
                                } else {
                                    continue;
                                }
                                break;
                        }
                    }
                    
                    if (drawX >= 0 && drawX < GRID_WIDTH && drawY >= 0 && drawY < GRID_HEIGHT) {
                        // Check if drawing is constrained by active selection
                        if (selection && !isMovingSelection && !isPointInSelection(drawX, drawY)) {
                            continue; // Skip pixels outside selection
                        }
                        
                        let finalColor = color; 
                        
                        // Tool-specific logic (Clone, Blend, Depth, Rainbow)
                        if (tool === 'clone') {
                            if (cloneSourceX === -1 || cloneSourceY === -1) {
                                continue; // No clone source set
                            }
                            
                            // Calculate source position based on current pixel position and offset
                            const srcX = drawX - cloneOffsetX;
                            const srcY = drawY - cloneOffsetY;
                            
                            if (srcX >= 0 && srcX < GRID_WIDTH && srcY >= 0 && srcY < GRID_HEIGHT) {
                                const [r, g, b, a] = getPixelColor(srcX, srcY);
                                if (a > 0) { // Only clone non-transparent pixels
                                    finalColor = `rgba(${r},${g},${b},${a/255})`;
                                } else {
                                    continue; // Skip transparent source pixels
                                }
                            } else {
                                continue; // Source out of bounds
                            }
                            isErase = false;
                        } else if (tool === 'blend') {
                            // Blend pixel with surrounding neighbors (smudge/blur effect)
                            let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
                            let count = 0;
                            
                            // Sample 8 surrounding pixels (3x3 grid)
                            for (let ny = -1; ny <= 1; ny++) {
                                for (let nx = -1; nx <= 1; nx++) {
                                    const sampleX = drawX + nx;
                                    const sampleY = drawY + ny;
                                    if (sampleX >= 0 && sampleX < GRID_WIDTH && sampleY >= 0 && sampleY < GRID_HEIGHT) {
                                        // Only sample from pixels within selection (if selection is active)
                                        if (selection && !isMovingSelection && !isPointInSelection(sampleX, sampleY)) {
                                            continue;
                                        }
                                        const [sr, sg, sb, sa] = getPixelColor(sampleX, sampleY);
                                        if (sa > 0) { // Only blend with non-transparent pixels
                                            totalR += sr;
                                            totalG += sg;
                                            totalB += sb;
                                            totalA += sa;
                                            count++;
                                        }
                                    }
                                }
                            }
                            
                            if (count > 0) {
                                // Average surrounding colors
                                const avgR = totalR / count;
                                const avgG = totalG / count;
                                const avgB = totalB / count;
                                const avgA = totalA / count;
                                
                                // Mix original pixel with averaged neighbors (blend for subtlety)
                                const [origR, origG, origB, origA] = getPixelColor(drawX, drawY);
                                const blendR = Math.round(origR * BLEND_FACTOR + avgR * (1 - BLEND_FACTOR));
                                const blendG = Math.round(origG * BLEND_FACTOR + avgG * (1 - BLEND_FACTOR));
                                const blendB = Math.round(origB * BLEND_FACTOR + avgB * (1 - BLEND_FACTOR));
                                const blendA = Math.round(origA * BLEND_FACTOR + avgA * (1 - BLEND_FACTOR));
                                finalColor = `rgba(${blendR},${blendG},${blendB},${blendA/255})`;
                            } else {
                                continue; // Skip if no neighbors
                            }
                            isErase = false;
                        } else if (tool === 'depth') { 
                            const [r, g, b, a] = getPixelColor(drawX, drawY);
                            if (a > 0) {
                                const newR = Math.max(0, Math.floor(r * DEPTH_DARKEN_FACTOR));
                                const newG = Math.max(0, Math.floor(g * DEPTH_DARKEN_FACTOR));
                                const newB = Math.max(0, Math.floor(b * DEPTH_DARKEN_FACTOR));
                                finalColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
                            } else {
                                continue; 
                            }
                            isErase = false; 
                        } else if (tool === 'highlight') {
                            const [r, g, b, a] = getPixelColor(drawX, drawY);
                            if (a > 0) {
                                const newR = Math.min(255, Math.floor(r * HIGHLIGHT_BRIGHTEN_FACTOR));
                                const newG = Math.min(255, Math.floor(g * HIGHLIGHT_BRIGHTEN_FACTOR));
                                const newB = Math.min(255, Math.floor(b * HIGHLIGHT_BRIGHTEN_FACTOR));
                                finalColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
                            } else {
                                continue;
                            }
                            isErase = false;
                        } else if (tool === 'sharpen') {
                            // Sharpen by increasing contrast with neighbors
                            const [r, g, b, a] = getPixelColor(drawX, drawY);
                            if (a > 0) {
                                // Sample neighboring pixels
                                let avgR = 0, avgG = 0, avgB = 0, count = 0;
                                for (let ny = -1; ny <= 1; ny++) {
                                    for (let nx = -1; nx <= 1; nx++) {
                                        if (nx === 0 && ny === 0) continue;
                                        const sampleX = drawX + nx;
                                        const sampleY = drawY + ny;
                                        if (sampleX >= 0 && sampleX < GRID_WIDTH && sampleY >= 0 && sampleY < GRID_HEIGHT) {
                                            // Only sample from pixels within selection (if selection is active)
                                            if (selection && !isMovingSelection && !isPointInSelection(sampleX, sampleY)) {
                                                continue;
                                            }
                                            const [sr, sg, sb, sa] = getPixelColor(sampleX, sampleY);
                                            if (sa > 0) {
                                                avgR += sr;
                                                avgG += sg;
                                                avgB += sb;
                                                count++;
                                            }
                                        }
                                    }
                                }
                                
                                if (count > 0) {
                                    avgR /= count;
                                    avgG /= count;
                                    avgB /= count;
                                    
                                    // Increase contrast: move away from average (very subtle)
                                    const newR = Math.min(255, Math.max(0, Math.round(r + (r - avgR) * SHARPEN_FACTOR)));
                                    const newG = Math.min(255, Math.max(0, Math.round(g + (g - avgG) * SHARPEN_FACTOR)));
                                    const newB = Math.min(255, Math.max(0, Math.round(b + (b - avgB) * SHARPEN_FACTOR)));
                                    finalColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
                                } else {
                                    continue;
                                }
                            } else {
                                continue;
                            }
                            isErase = false;
                        } else if (tool === 'jumble') {
                            // Scramble pixels within brush area
                            const pixelsInBrush = [];
                            // Collect all pixels in current brush area (only within selection)
                            const validPositions = [];
                            for (let jy = 0; jy < currentBrushSize; jy++) {
                                for (let jx = 0; jx < currentBrushSize; jx++) {
                                    const px = startX + jx;
                                    const py = startY + jy;
                                    if (px >= 0 && px < GRID_WIDTH && py >= 0 && py < GRID_HEIGHT) {
                                        // Apply brush shape filtering
                                        let skip = false;
                                        if (useCustomShape && currentBrushSize > 1) {
                                            const relX = px - gridX;
                                            const relY = py - gridY;
                                            const distFromCenter = Math.sqrt(relX * relX + relY * relY);
                                            const effectiveRadius = currentBrushSize / 2 - 0.25;
                                            
                                            switch(BRUSH_SHAPE) {
                                                case 'circle': if (distFromCenter > effectiveRadius) skip = true; break;
                                                case 'plus': if (relX !== 0 && relY !== 0) skip = true; break;
                                                case 'x': if (Math.abs(relX) !== Math.abs(relY)) skip = true; break;
                                                case 'diamond': if (Math.abs(relX) + Math.abs(relY) > halfBrush) skip = true; break;
                                                case 'star': if (relX !== 0 && relY !== 0 && Math.abs(relX) !== Math.abs(relY)) skip = true; break;
                                            }
                                        }

                                        if (!skip && (!selection || isMovingSelection || isPointInSelection(px, py))) {
                                            const pixel = getPixelColor(px, py);
                                            pixelsInBrush.push(pixel);
                                            validPositions.push({x: px, y: py});
                                        }
                                    }
                                }
                            }
                            
                            if (pixelsInBrush.length === 0) {
                                return; // No valid pixels to jumble
                            }
                            
                            // Shuffle the pixels
                            for (let i = pixelsInBrush.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [pixelsInBrush[i], pixelsInBrush[j]] = [pixelsInBrush[j], pixelsInBrush[i]];
                            }
                            
                            // Redistribute shuffled pixels
                            for (let pixelIndex = 0; pixelIndex < pixelsInBrush.length; pixelIndex++) {
                                const [r, g, b, a] = pixelsInBrush[pixelIndex];
                                const {x: px, y: py} = validPositions[pixelIndex];
                                finalColor = `rgba(${r},${g},${b},${a/255})`;
                                mainCtx.fillStyle = finalColor;
                                mainCtx.fillRect(px * PIXEL_SCALE, py * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                                savePixelToFrame(px, py, finalColor);
                            }
                            return; // Exit early since we handled all pixels
                        } else if (tool === 'dither') {
                            // Bayer 4x4 dithering matrix
                            const bayerMatrix = [
                                [ 0,  8,  2, 10],
                                [12,  4, 14,  6],
                                [ 3, 11,  1,  9],
                                [15,  7, 13,  5]
                            ];
                            
                            // Determine if this pixel should be drawn based on dither pattern
                            const matrixValue = bayerMatrix[drawY % 4][drawX % 4];
                            const threshold = (matrixValue / 16) * 255; // Convert to 0-255 range
                            
                            // Get target color brightness
                            const [tr, tg, tb] = hexToRgb(color);
                            const brightness = (tr + tg + tb) / 3;
                            
                            // Only draw if brightness exceeds threshold
                            if (brightness > threshold) {
                                mainCtx.fillStyle = color;
                                mainCtx.fillRect(drawX * PIXEL_SCALE, drawY * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                                savePixelToFrame(drawX, drawY, color);
                            } else {
                                // Draw secondary color or erase
                                if (colorSecondary && colorSecondary !== color) {
                                    mainCtx.fillStyle = colorSecondary;
                                    mainCtx.fillRect(drawX * PIXEL_SCALE, drawY * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                                    savePixelToFrame(drawX, drawY, colorSecondary);
                                }
                            }
                            continue; // Skip normal pixel drawing
                        } else if (tool === 'spray') {
                            // Spray tool: scatter individual pixels within radius
                            // This special case handles spray differently - scatter pixels, then exit
                            const radius = currentBrushSize;
                            const numParticles = Math.ceil(currentBrushSize * 2); // More particles for larger brush
                            
                            for (let i = 0; i < numParticles; i++) {
                                // Random angle and distance with density falloff
                                const angle = Math.random() * Math.PI * 2;
                                const maxDist = radius;
                                const randDist = Math.random();
                                
                                // Density falloff: more likely to be near center
                                const distance = Math.pow(randDist, 0.5) * maxDist; // Square root for better distribution
                                
                                const offsetX = Math.round(Math.cos(angle) * distance);
                                const offsetY = Math.round(Math.sin(angle) * distance);
                                const sprayX = gridX + offsetX;
                                const sprayY = gridY + offsetY;
                                
                                if (sprayX >= 0 && sprayX < GRID_WIDTH && sprayY >= 0 && sprayY < GRID_HEIGHT) {
                                    // Check selection
                                    if (!selection || isMovingSelection || isPointInSelection(sprayX, sprayY)) {
                                        mainCtx.fillStyle = color;
                                        mainCtx.fillRect(sprayX * PIXEL_SCALE, sprayY * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                                        savePixelToFrame(sprayX, sprayY, color);
                                    }
                                }
                            }
                            return; // Exit early
                        } else if (tool === 'liquify') {
                            // Liquify/warp - push pixels in direction of brush movement
                            if (lastGridX === -1 || lastGridY === -1) {
                                continue; // Need movement for liquify
                            }
                            
                            const dx = gridX - lastGridX;
                            const dy = gridY - lastGridY;
                            
                            if (dx === 0 && dy === 0) continue;
                            
                            // Calculate distance from brush center
                            const distFromCenter = Math.sqrt(
                                Math.pow(drawX - gridX, 2) + 
                                Math.pow(drawY - gridY, 2)
                            );
                            const effectiveRadius = currentBrushSize / 2;
                            
                            if (distFromCenter > effectiveRadius) continue;
                            
                            // Calculate push strength (stronger at center)
                            const strength = 1 - (distFromCenter / effectiveRadius);
                            const pushX = Math.round(dx * strength);
                            const pushY = Math.round(dy * strength);
                            
                            // Get source pixel from pushed position
                            const sourceX = drawX - pushX;
                            const sourceY = drawY - pushY;
                            
                            if (sourceX >= 0 && sourceX < GRID_WIDTH && sourceY >= 0 && sourceY < GRID_HEIGHT) {
                                const [r, g, b, a] = getPixelColor(sourceX, sourceY);
                                if (a > 0) {
                                    finalColor = `rgba(${r},${g},${b},${a/255})`;
                                } else {
                                    continue;
                                }
                            } else {
                                continue;
                            }
                            isErase = false;
                        } else if (tool === 'rainbow') {
                            // Check if this pixel was already modified in this stroke
                            const pixelKey = `${drawX},${drawY}`;
                            if (strokeModifiedPixels.has(pixelKey)) {
                                continue; // Skip pixels already modified in this stroke
                            }
                            
                            const [r, g, b, a] = getPixelColor(drawX, drawY);
                            if (a > 0) {
                                // Convert existing color to HSL
                                const [h, s, l] = rgbToHsl(r, g, b);
                                
                                // Apply the same hue shift amount uniformly
                                const newHue = (h + HUE_SHIFT_AMOUNT) % 1;
                                const [newR, newG, newB] = hslToRgb(newHue, s, l);
                                
                                finalColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
                                strokeModifiedPixels.add(pixelKey); // Mark as modified
                            } else {
                                continue; // Don't draw on transparent pixels
                            }
                            isErase = false;
                        }

                        // Apply color/erase
                        if (isErase) {
                            mainCtx.clearRect(drawX * PIXEL_SCALE, drawY * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                            savePixelToFrame(drawX, drawY, 'rgba(0,0,0,0)'); 
                        } else {
                            mainCtx.fillStyle = finalColor;
                            mainCtx.fillRect(drawX * PIXEL_SCALE, drawY * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                            savePixelToFrame(drawX, drawY, finalColor);
                        }
                    }
                }
            }
        }

        // **MAIN DRAW PIXEL FUNCTION**
        function drawPixel(gridX, gridY, color, isErase = false, tool = 'pencil') {
            // Save state before first pixel of a stroke
            if (lastGridX === -1 && lastGridY === -1) {
                saveState();
            }
            
            // When editing a mask, force simple pencil mode (complex tools don't make sense for masks)
            let drawTool = (tool === 'symmetrical') ? 'pencil' : tool;
            if (maskEditingMode) {
                drawTool = 'pencil'; // Simplify to basic drawing when editing masks
            }
            
            // 1. Draw at the original position
            drawPixelCore(gridX, gridY, color, isErase, drawTool);
            
            // 2. Symmetrical logic: Draw at mirrored positions
            if (tool === 'symmetrical') {
                const centerX = GRID_WIDTH / 2;
                const centerY = GRID_HEIGHT / 2;
                
                switch(SYMMETRY_MODE) {
                    case 'horizontal':
                        const mirrorX = GRID_WIDTH - 1 - gridX;
                if (mirrorX !== gridX) {
                    drawPixelCore(mirrorX, gridY, color, isErase, 'pencil');
                }
                        break;
                        
                    case 'vertical':
                        const mirrorY = GRID_HEIGHT - 1 - gridY;
                        if (mirrorY !== gridY) {
                            drawPixelCore(gridX, mirrorY, color, isErase, 'pencil');
                        }
                        break;
                        
                    case 'quad':
                        // 4-way symmetry
                        const mX = GRID_WIDTH - 1 - gridX;
                        const mY = GRID_HEIGHT - 1 - gridY;
                        if (mX !== gridX) drawPixelCore(mX, gridY, color, isErase, 'pencil');
                        if (mY !== gridY) drawPixelCore(gridX, mY, color, isErase, 'pencil');
                        if (mX !== gridX && mY !== gridY) drawPixelCore(mX, mY, color, isErase, 'pencil');
                        break;
                        
                    case 'radial8':
                    case 'radial16':
                        const points = SYMMETRY_MODE === 'radial8' ? 8 : 16;
                        const relX = gridX - centerX;
                        const relY = gridY - centerY;
                        const angle = Math.atan2(relY, relX);
                        const dist = Math.sqrt(relX * relX + relY * relY);
                        
                        for (let i = 1; i < points; i++) {
                            const newAngle = angle + (i * 2 * Math.PI / points);
                            const newX = Math.round(centerX + dist * Math.cos(newAngle));
                            const newY = Math.round(centerY + dist * Math.sin(newAngle));
                            if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
                                drawPixelCore(newX, newY, color, isErase, 'pencil');
                            }
                        }
                        break;
                }
            }
            
            updateThumbnail(currentFrameIndex); 
        }

        // --- RAINBOW MAGIC HELPER FUNCTIONS ---
        
        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return [h, s, l];
        }
        
        function hslToRgb(h, s, l) {
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
        
        function shiftHueToRainbow(h) {
            // Shift hue by a small amount to create rainbow effect
            // Rainbow hue cycle: 0=red, 0.17=yellow, 0.33=green, 0.5=cyan, 0.67=blue, 0.83=magenta
            const hueShift = 0.05; // Adjust this for speed of color change
            return (h + hueShift) % 1;
        }
        
        // --- UTILITY FUNCTIONS (Unchanged from V16) ---
        
        function savePixelToFrame(gridX, gridY, color) {
            // Always save to current layer of current frame
            const layers = getCurrentLayers();
            if (layers.length > 0) {
                savePixelToLayer(gridX, gridY, color);
                compositeLayersToCanvas();
            }
        }

        function hexToRgb(color) {
            if (!color) return [0, 0, 0, 0];
            
            if (color.startsWith('rgba') && color.includes(',0)')) {
                return [0, 0, 0, 0];
            }
            if (color.startsWith('rgba')) {
                const parts = color.match(/\d+(\.\d+)?/g);
                if (parts && parts.length >= 4) {
                    return [
                        parseInt(parts[0]), 
                        parseInt(parts[1]), 
                        parseInt(parts[2]), 
                        Math.round(parseFloat(parts[3]) * 255)
                    ];
                }
            }
            if (color.startsWith('#')) color = color.slice(1);
            if (color.length === 3) { 
                color = color.split('').map(c => c + c).join('');
            }
            const r = parseInt(color.substring(0, 2), 16) || 0;
            const g = parseInt(color.substring(2, 4), 16) || 0;
            const b = parseInt(color.substring(4, 6), 16) || 0;
            return [r, g, b, 255]; 
        }

        function getPixelColor(x, y) {
            // Get pixel from current layer of current frame
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return [0, 0, 0, 0];
            const index = (y * GRID_WIDTH + x) * 4;
            return [
                currentLayer.data.data[index],     
                currentLayer.data.data[index + 1], 
                currentLayer.data.data[index + 2], 
                currentLayer.data.data[index + 3]  
            ];
        }

        function colorMatch(color1, color2, tolerance = 0) {
            return Math.abs(color1[0] - color2[0]) <= tolerance &&
                   Math.abs(color1[1] - color2[1]) <= tolerance &&
                   Math.abs(color1[2] - color2[2]) <= tolerance &&
                   Math.abs(color1[3] - color2[3]) <= tolerance;
        }

        // --- TOOL CATEGORY MANAGEMENT ---
        
        function initializeToolCategories() {
            // Build the tool-to-category mapping by finding which category each tool button belongs to
            const allToolButtons = document.querySelectorAll('.category-tools button[id$="-btn"]');
            allToolButtons.forEach(btn => {
                const toolId = btn.id.replace('-btn', '');
                const categoryElement = btn.closest('.tool-category');
                if (categoryElement) {
                    toolToCategoryMap.set(toolId, categoryElement);
                }
            });
            
            // Add click handlers to all category headers
            const categoryHeaders = document.querySelectorAll('.category-main-btn');
            categoryHeaders.forEach(header => {
                const category = header.closest('.tool-category');
                if (!category) return;
                
                // Click handler with double-click protection
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleCategoryHeaderClick(category);
                });
                
                // Long hover handler
                category.addEventListener('mouseenter', () => {
                    handleCategoryHover(category, true);
                });
                
                category.addEventListener('mouseleave', () => {
                    handleCategoryHover(category, false);
                });
            });
            
            // Add click handlers to all buttons within categories (for collapse behavior)
            const allCategoryButtons = document.querySelectorAll('.category-tools button');
            allCategoryButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    handleCategoryButtonClick(btn);
                });
            });
        }
        
        // Helper function to get category name from category element
        function getCategoryName(category) {
            const headerBtn = category.querySelector('.category-main-btn');
            return headerBtn ? headerBtn.textContent.trim() : '';
        }
        
        // Helper function to check if category should stay open after button click
        function shouldStayOpen(categoryName) {
            return STAY_OPEN_CATEGORIES.includes(categoryName) || 
                   categoryName === FILE_MANAGEMENT_CATEGORY ||
                   FILE_MANAGEMENT_SUBCATEGORIES.includes(categoryName);
        }
        
        // Helper function to close all other open categories except the specified one
        function closeOtherCategories(exceptCategory) {
            const allCategories = document.querySelectorAll('.tool-category');
            allCategories.forEach(category => {
                if (category !== exceptCategory && category.classList.contains('open')) {
                    // Check if this category is a parent of exceptCategory
                    if (!category.contains(exceptCategory)) {
                        category.classList.remove('open');
                    }
                }
            });
        }
        
        function handleCategoryHeaderClick(category) {
            const now = Date.now();
            const lastClick = categoryLastClickTime.get(category) || 0;
            
            // Double-click protection
            if (now - lastClick < DOUBLE_CLICK_THRESHOLD) {
                return; // Ignore double-click
            }
            categoryLastClickTime.set(category, now);
            
            const isCurrentlyOpen = category.classList.contains('open');
            
            // Close other categories first
            closeOtherCategories(category);
            
            // Toggle this category
            if (isCurrentlyOpen) {
                category.classList.remove('open');
            } else {
                category.classList.add('open');
            }
        }
        
        function handleCategoryHover(category, entering) {
            if (entering) {
                // Start 3-second timer to open category
                const timeout = setTimeout(() => {
                    category.classList.add('open');
                    categoryLongHoverTimeouts.delete(category);
                }, LONG_HOVER_DURATION);
                categoryLongHoverTimeouts.set(category, timeout);
                
                // Cancel any pending close
                const leaveTimeout = categoryLeaveTimeouts.get(category);
                if (leaveTimeout) {
                    clearTimeout(leaveTimeout);
                    categoryLeaveTimeouts.delete(category);
                }
            } else {
                // Clear the hover timer
                const timeout = categoryLongHoverTimeouts.get(category);
                if (timeout) {
                    clearTimeout(timeout);
                    categoryLongHoverTimeouts.delete(category);
                }
                // Close the category on mouse leave with a grace period
                const leaveTimeout = setTimeout(() => {
                    category.classList.remove('open');
                    categoryLeaveTimeouts.delete(category);
                }, 400); // 400ms grace period
                categoryLeaveTimeouts.set(category, leaveTimeout);
            }
        }
        
        function handleCategoryButtonClick(button) {
            const category = button.closest('.tool-category');
            if (!category) return;
            
            const categoryName = getCategoryName(category);
            const isToolButton = button.id && button.id.endsWith('-btn');
            
            // Check if this is within File Management or its subcategories
            const parentCategory = category.parentElement.closest('.tool-category');
            const isInFileManagement = parentCategory && getCategoryName(parentCategory) === FILE_MANAGEMENT_CATEGORY;
            
            // Determine behavior based on category type
            if (isToolButton) {
                // Tool buttons: Lock category for a few seconds, then collapse
                clearTimeout(categoryLockTimeouts.get(category));
                const timeout = setTimeout(() => {
                    if (category.classList.contains('open')) {
                        category.classList.remove('open');
                    }
                    categoryLockTimeouts.delete(category);
                }, CATEGORY_LOCK_DURATION);
                categoryLockTimeouts.set(category, timeout);
            } else if (shouldStayOpen(categoryName)) {
                // Categories that should stay open: keep them open unless another category is clicked
                // Do nothing - keep category open
            } else if (isInFileManagement) {
                // Special File Management subcategory behavior
                const isBulkImport = button.textContent.includes('Bulk Import');
                if (isBulkImport) {
                    // Close bulk import option after selection
                    category.classList.remove('open');
                } else {
                    // Keep other File Management subcategories open
                    // Do nothing
                }
            } else {
                // Default behavior: collapse the category
                category.classList.remove('open');
            }
        }

        // --- TOOL/MODE MANAGEMENT ---

        function activateTool(tool) {
            currentTool = tool;
            
            // Clear shape tool states when switching tools
            shapePoints = [];
            lineStart = null;
            curvePoints = [];
            circleSelectCenter = null;
            shapeStart = null;
            
            // Set tool-specific status messages
            const toolMessages = {
                'rectselect': '🔲 Rectangle Select: Hold left click and drag to make a selection, right click to cancel',
                'circleselect': '⭕ Circle Select: Hold left click and drag from center, right click to cancel',
                'lasso': '✏️ Lasso: Hold left click and drag to draw selection path, release to close, right click to cancel',
                'colorselect': '🎨 Color Select: Left click a color to select all matching pixels, right click to cancel',
                'edgeselect': '📐 Edge Detect: Left click to auto-detect edges and create selection, right click to cancel',
                'pan': '✋ Pan: Hold left click and drag to move canvas view, right click to reset position',
                'symmetrical': '🔄 Symmetry: Draw normally, strokes will mirror based on selected symmetry mode',
                'clone': '📋 Clone Stamp: Alt+Click to set source point, then left click to clone from that point',
                'line': '📏 Line: Click start point, then click end point to draw line',
                'curve': '〰️ Curve: Click to add curve points, right click to finish curve',
                'contour': '🗺️ Contour: Click to add contour points, right click or double-click to finish',
                'polygon': '⬡ Polygon: Click to add polygon vertices, right click or double-click to close shape',
                'rectangle': '▭ Rectangle: Click and drag to draw rectangle shape',
                'circle': '⭕ Circle: Click and drag from center to draw circle',
                'beziercurve': '〰️ Bezier Brush: Click to place control points for smooth curves, right click to finish',
                'gradientmesh': '🎨 Gradient Mesh: Click to place mesh points with colors for complex gradients',
                'gradient': '🌈 Gradient: Click start point, then drag to end point to apply gradient',
                'fill': '🪣 Fill: Left click a pixel to fill connected area with current color',
                'magiceraser': '✨ Magic Eraser: Left click to erase all connected pixels of the same color',
                'liquify': '💧 Liquify: Click and drag to push/warp pixels in the direction of movement'
            };
            
            updateToolStatus(toolMessages[tool] || '');
            
            // Update current tool display
            updateCurrentToolDisplay();
            
            // Clear visual indicators
            drawSelectionOverlay();
            
            document.querySelectorAll('#controls-panel button').forEach(btn => {
                btn.classList.remove('tool-active');
            });
            const toolBtn = document.getElementById(`${tool}-btn`);
            if (toolBtn) toolBtn.classList.add('tool-active');
            const gradientControls = document.getElementById('gradient-length-controls');
            const secondaryColorSection = document.getElementById('secondary-color-section');
            const shapeFillControls = document.getElementById('shape-fill-controls');
            
            if (tool === 'pan') {
                canvasWrapper.classList.add('tool-pan');
            } else {
                canvasWrapper.classList.remove('tool-pan');
            }
            
            const patternControls = document.getElementById('pattern-fill-controls');
            
            if (tool === 'gradient' || tool === 'dither') {
                secondaryColorSection.style.display = 'block';
                if (tool === 'gradient') {
                    gradientControls.style.display = 'block';
                } else {
                    gradientControls.style.display = 'none';
                }
            } else {
                gradientControls.style.display = 'none';
                secondaryColorSection.style.display = 'none';
            }
            
            const symmetryControls = document.getElementById('symmetry-controls');
            
            if (tool === 'pattern') {
                if (patternControls) patternControls.style.display = 'block';
                secondaryColorSection.style.display = 'block';
            } else {
                if (patternControls) patternControls.style.display = 'none';
            }
            
            if (tool === 'symmetrical') {
                if (symmetryControls) symmetryControls.style.display = 'block';
            } else {
                if (symmetryControls) symmetryControls.style.display = 'none';
            }
            
            if (tool === 'rectangle' || tool === 'circle' || tool === 'polygon') {
                shapeFillControls.style.display = 'block';
            } else {
                shapeFillControls.style.display = 'none';
            }
            
            // Refined brush size lock logic (Symmetrical tool does NOT lock size)
            if (tool === 'refined') {
                brushSizeSlider.disabled = true;
                if (!brushSizeSlider.hasAttribute('data-temp-size')) {
                    brushSizeSlider.setAttribute('data-temp-size', BRUSH_SIZE);
                }
                BRUSH_SIZE = 1;
                brushSizeDisplay.textContent = '1x1 (Locked)';
            } else {
                brushSizeSlider.disabled = false;
                if (brushSizeSlider.hasAttribute('data-temp-size')) {
                    BRUSH_SIZE = parseInt(brushSizeSlider.getAttribute('data-temp-size'));
                    brushSizeSlider.value = BRUSH_SIZE;
                    brushSizeSlider.removeAttribute('data-temp-size');
                }
                updateBrushSize();
            }
        }
        
        // --- FRAME MANAGEMENT & EXPORT (Unchanged from V16) ---

        function resizeSprite(migrateData = true) {
            const newWidth = parseInt(gridWidthInput.value);
            const newHeight = parseInt(gridHeightInput.value);
            const newGridSize = Math.max(newWidth, newHeight);
            
            if (newWidth === GRID_WIDTH && newHeight === GRID_HEIGHT && migrateData) {
                drawGrid(); 
                return;
            }
            
            const oldWidth = GRID_WIDTH;
            const oldHeight = GRID_HEIGHT;
            const oldGridSize = GRID_SIZE;
            
            // Get background color for filling extended areas
            const preset = document.getElementById('canvas-bg-preset').value;
            const customColor = document.getElementById('canvas-bg-color').value;
            let bgColor = preset === 'custom' ? customColor : (preset === 'checker' ? '#ffffff' : preset);
            const bgR = parseInt(bgColor.substring(1, 3), 16);
            const bgG = parseInt(bgColor.substring(3, 5), 16);
            const bgB = parseInt(bgColor.substring(5, 7), 16);
            
            if (migrateData && frameLayers.length > 0 && frameLayers[0] && frameLayers[0].length > 0) {
                // Migrate layer data for each frame (only if layers actually exist)
                const newFrameLayers = [];
                
                for (let frameIndex = 0; frameIndex < frameLayers.length; frameIndex++) {
                    const oldLayers = frameLayers[frameIndex];
                    const newLayers = [];
                    
                    for (let layerIndex = 0; layerIndex < oldLayers.length; layerIndex++) {
                        const oldLayer = oldLayers[layerIndex];
                        
                        // Create temp canvas for old layer data
                        const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(oldWidth, oldHeight);
                        tempCtx.putImageData(oldLayer.data, 0, 0);
                        
                        // Create new canvas for resized layer
                        const { canvas: newCanvas, ctx: newCtx } = createTempCanvas(newWidth, newHeight);
                        
                        // Fill with background color (transparent for layers)
                        newCtx.clearRect(0, 0, newWidth, newHeight);
                        
                        // Calculate scaling to fit the old image into new dimensions
                        // Use nearest neighbor interpolation
                        const scaleX = newWidth / oldWidth;
                        const scaleY = newHeight / oldHeight;
                        
                        // Scale the image to fit the new dimensions
                        newCtx.drawImage(
                            tempCanvas,
                            0, 0, oldWidth, oldHeight,
                            0, 0, newWidth, newHeight
                        );
                        
                        // Create new layer with resized data
                        newLayers.push({
                            name: oldLayer.name,
                            data: newCtx.getImageData(0, 0, newWidth, newHeight),
                            visible: oldLayer.visible,
                            opacity: oldLayer.opacity,
                            blendMode: oldLayer.blendMode || 'normal',
                            mask: oldLayer.mask,
                            maskEnabled: oldLayer.maskEnabled || false,
                            effects: oldLayer.effects || {
                                dropShadow: false,
                                glow: false,
                                stroke: false,
                                shadowColor: '#000000',
                                glowColor: '#FFFFFF',
                                strokeColor: '#000000'
                            }
                        });
                    }
                    
                    newFrameLayers.push(newLayers);
                }
                
                frameLayers = newFrameLayers;
            } else {
                // Initialize fresh layers for each frame with new size
                for (let frameIndex = 0; frameIndex < frameLayers.length; frameIndex++) {
                    const oldLayers = frameLayers[frameIndex];
                    const newLayers = [];
                    
                    for (let layerIndex = 0; layerIndex < oldLayers.length; layerIndex++) {
                        // Create ImageData from canvas context for compatibility
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = newWidth;
                        tempCanvas.height = newHeight;
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        newLayers.push({
                            name: oldLayers[layerIndex].name,
                            data: tempCtx.createImageData(newWidth, newHeight),
                            visible: oldLayers[layerIndex].visible,
                            opacity: oldLayers[layerIndex].opacity,
                            blendMode: oldLayers[layerIndex].blendMode || 'normal',
                            mask: null,
                            maskEnabled: false,
                            effects: oldLayers[layerIndex].effects || {
                                dropShadow: false,
                                glow: false,
                                stroke: false,
                                shadowColor: '#000000',
                                glowColor: '#FFFFFF',
                                strokeColor: '#000000'
                            }
                        });
                    }
                    
                    frameLayers[frameIndex] = newLayers;
                }
            }
            
            // Update grid dimensions
            GRID_WIDTH = newWidth;
            GRID_HEIGHT = newHeight;
            GRID_SIZE = newGridSize;
            
            // Update input fields to show actual values
            gridWidthInput.value = newWidth;
            gridHeightInput.value = newHeight;
            
            // Update frames array to match new size
            frames = new Array(frameLayers.length).fill(null).map(() => new ImageData(newWidth, newHeight));
            
            currentFrameIndex = Math.min(currentFrameIndex, frames.length - 1);
            currentLayerIndex = 0;
            
            // Auto-adjust darkened grid pattern if enabled and linked
            if (darkenedGridEnabled.checked && linkDimensionsCheckbox.checked) {
                // Calculate the square root of the dimension (assuming square when linked)
                const sqrtDimension = Math.sqrt(newWidth);
                // Round to nearest integer, with minimum of 1
                const newDarkenedSize = Math.max(1, Math.round(sqrtDimension));
                darkenedGridSize.value = newDarkenedSize;
            }
            
            // Force complete refresh of everything
            updatePixelScale(); 
            renderLayerList();
            compositeLayersToCanvas();
            renderFrameThumbnails();
            updateThumbnail(currentFrameIndex);
            loadFrame(currentFrameIndex); 
            drawGrid();
            updateAnimationPreview();
            
            // Force canvas redraw
            mainCtx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);
            compositeLayersToCanvas();
        }

        function drawGrid() {
            gridCtx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);
            const visibility = document.getElementById('grid-visibility').value;
            if (visibility === 'none') return;
            let gridColor = gridColorPicker.value;
            if (visibility === 'low') {
                const r = parseInt(gridColor.substring(1, 3), 16);
                const g = parseInt(gridColor.substring(3, 5), 16);
                const b = parseInt(gridColor.substring(5, 7), 16);
                const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b);
                const factor = luminance > 128 ? 0.7 : 1.5; 
                const newR = Math.min(255, Math.max(0, r * factor));
                const newG = Math.min(255, Math.max(0, g * factor));
                const newB = Math.min(255, Math.max(0, b * factor));
                gridColor = `rgb(${newR}, ${newG}, ${newB})`;
            }
            
            const offset = 0.5;
            const displayWidth = GRID_WIDTH * PIXEL_SCALE;
            const displayHeight = GRID_HEIGHT * PIXEL_SCALE;
            const darkenedEnabled = darkenedGridEnabled.checked;
            const darkenedSize = darkenedEnabled ? parseInt(darkenedGridSize.value) : 0;
            
            // Draw regular grid lines
            gridCtx.strokeStyle = gridColor;
            gridCtx.lineWidth = 1; 
            
            // Draw vertical lines
            for (let i = 0; i <= GRID_WIDTH; i++) {
                const pos = i * PIXEL_SCALE;
                gridCtx.beginPath();
                gridCtx.moveTo(pos + offset, 0);
                gridCtx.lineTo(pos + offset, displayHeight);
                gridCtx.stroke();
            }
            // Draw horizontal lines
            for (let i = 0; i <= GRID_HEIGHT; i++) {
                const pos = i * PIXEL_SCALE;
                gridCtx.beginPath();
                gridCtx.moveTo(0, pos + offset);
                gridCtx.lineTo(displayWidth, pos + offset);
                gridCtx.stroke();
            }
            
            // Draw darkened grid pattern if enabled
            if (darkenedEnabled && darkenedSize > 0) {
                // Use the custom darkened grid color
                gridCtx.strokeStyle = darkenedGridColor.value;
                gridCtx.lineWidth = 2;
                
                // Draw darkened vertical lines every N cells
                for (let i = 0; i <= GRID_WIDTH; i += darkenedSize) {
                    const pos = i * PIXEL_SCALE;
                    gridCtx.beginPath();
                    gridCtx.moveTo(pos + offset, 0);
                    gridCtx.lineTo(pos + offset, displayHeight);
                    gridCtx.stroke();
                }
                
                // Draw darkened horizontal lines every N cells
                for (let i = 0; i <= GRID_HEIGHT; i += darkenedSize) {
                    const pos = i * PIXEL_SCALE;
                    gridCtx.beginPath();
                    gridCtx.moveTo(0, pos + offset);
                    gridCtx.lineTo(displayWidth, pos + offset);
                    gridCtx.stroke();
                }
            }
            
            // Draw tilemap grid if enabled
            if (tilemapEnabled && tileSize > 0) {
                gridCtx.strokeStyle = '#FF9800'; // Orange for tilemap grid
                gridCtx.lineWidth = 3;
                gridCtx.setLineDash([4, 4]);
                
                // Draw vertical tile lines
                for (let i = 0; i <= GRID_WIDTH; i += tileSize) {
                    const pos = i * PIXEL_SCALE;
                    gridCtx.beginPath();
                    gridCtx.moveTo(pos + offset, 0);
                    gridCtx.lineTo(pos + offset, displayHeight);
                    gridCtx.stroke();
                }
                
                // Draw horizontal tile lines
                for (let i = 0; i <= GRID_HEIGHT; i += tileSize) {
                    const pos = i * PIXEL_SCALE;
                    gridCtx.beginPath();
                    gridCtx.moveTo(0, pos + offset);
                    gridCtx.lineTo(displayWidth, pos + offset);
                    gridCtx.stroke();
                }
                
                gridCtx.setLineDash([]);
            }
            
            // Draw perspective grid if enabled
            if (perspectiveGridEnabled) {
                gridCtx.strokeStyle = '#FF9800'; // Orange for perspective
                gridCtx.lineWidth = 1;
                gridCtx.setLineDash([4, 4]);
                
                // Isometric grid (30° angles)
                const gridSpacing = 8; // pixels between lines
                
                // Diagonal lines going up-right
                for (let i = -GRID_HEIGHT; i <= GRID_WIDTH; i += gridSpacing) {
                    gridCtx.beginPath();
                    gridCtx.moveTo(i * PIXEL_SCALE, 0);
                    gridCtx.lineTo((i + GRID_HEIGHT) * PIXEL_SCALE, displayHeight);
                    gridCtx.stroke();
                }
                
                // Diagonal lines going up-left
                for (let i = 0; i <= GRID_WIDTH + GRID_HEIGHT; i += gridSpacing) {
                    gridCtx.beginPath();
                    gridCtx.moveTo(i * PIXEL_SCALE, 0);
                    gridCtx.lineTo((i - GRID_HEIGHT) * PIXEL_SCALE, displayHeight);
                    gridCtx.stroke();
                }
                
                gridCtx.setLineDash([]);
            }
            
            // Draw guides if enabled
            if (guidesEnabled) {
                gridCtx.strokeStyle = '#2196F3'; // Blue guides
                gridCtx.lineWidth = 2;
                gridCtx.setLineDash([8, 4]);
                
                // Draw vertical guides
                verticalGuides.forEach(x => {
                    const pos = x * PIXEL_SCALE;
                    gridCtx.beginPath();
                    gridCtx.moveTo(pos + offset, 0);
                    gridCtx.lineTo(pos + offset, displayHeight);
                    gridCtx.stroke();
                });
                
                // Draw horizontal guides
                horizontalGuides.forEach(y => {
                    const pos = y * PIXEL_SCALE;
                    gridCtx.beginPath();
                    gridCtx.moveTo(0, pos + offset);
                    gridCtx.lineTo(displayWidth, pos + offset);
                    gridCtx.stroke();
                });
                
                gridCtx.setLineDash([]);
            }
            
            // Draw border rectangle to ensure edges are visible
            gridCtx.beginPath();
            gridCtx.strokeStyle = gridColor;
            gridCtx.lineWidth = 1;
            gridCtx.strokeRect(0.5, 0.5, displayWidth - 1, displayHeight - 1);
        }
        
        function togglePerspectiveGrid() {
            perspectiveGridEnabled = document.getElementById('perspective-grid-enabled').checked;
            drawGrid();
        }
        
        function toggleGuides() {
            guidesEnabled = document.getElementById('guides-enabled').checked;
            const controls = document.getElementById('guides-controls');
            if (controls) controls.style.display = guidesEnabled ? 'block' : 'none';
            drawGrid();
        }
        
        async function addVerticalGuide() {
            const result = await styledPrompt(`Add vertical guide at X position (0-${GRID_WIDTH-1}):`, Math.floor(GRID_WIDTH / 2).toString(), '📐 Add Vertical Guide');
            const x = parseInt(result);
            if (!isNaN(x) && x >= 0 && x < GRID_WIDTH) {
                verticalGuides.push(x);
                drawGrid();
            }
        }
        
        async function addHorizontalGuide() {
            const result = await styledPrompt(`Add horizontal guide at Y position (0-${GRID_HEIGHT-1}):`, Math.floor(GRID_HEIGHT / 2).toString(), '📐 Add Horizontal Guide');
            const y = parseInt(result);
            if (!isNaN(y) && y >= 0 && y < GRID_HEIGHT) {
                horizontalGuides.push(y);
                drawGrid();
            }
        }
        
        async function manageGuides() {
            let guideList = 'Current Guides:\n\n';
            guideList += 'VERTICAL:\n';
            verticalGuides.forEach((x, i) => {
                guideList += `  ${i + 1}: X=${x}\n`;
            });
            guideList += '\nHORIZONTAL:\n';
            horizontalGuides.forEach((y, i) => {
                guideList += `  ${i + 1}: Y=${y}\n`;
            });
            guideList += `\nTotal: ${verticalGuides.length + horizontalGuides.length} guides`;
            
            const action = await styledPrompt(guideList + '\n\nEnter "v" + number to remove vertical guide\nEnter "h" + number to remove horizontal guide\n(e.g., "v1" or "h2")', '', '📐 Manage Guides');
            
            if (action && action.length >= 2) {
                const type = action[0].toLowerCase();
                const userNumber = parseInt(action.substring(1));
                const index = userNumber - 1; // Convert from base-1 to base-0
                
                if (type === 'v' && !isNaN(index) && index >= 0 && index < verticalGuides.length) {
                    verticalGuides.splice(index, 1);
                    drawGrid();
                    alert(`Removed vertical guide #${userNumber}`);
                } else if (type === 'h' && !isNaN(index) && index >= 0 && index < horizontalGuides.length) {
                    horizontalGuides.splice(index, 1);
                    drawGrid();
                    alert(`Removed horizontal guide #${userNumber}`);
                }
            }
        }
        
        function clearAllGuides() {
            if (confirm(`Clear all ${verticalGuides.length + horizontalGuides.length} guides?`)) {
                verticalGuides = [];
                horizontalGuides = [];
                drawGrid();
            }
        }
        
        function updateCanvasBackground() {
            const preset = document.getElementById('canvas-bg-preset').value;
            const customColor = document.getElementById('canvas-bg-color').value;
            
            // Remove checkerboard class first
            canvasWrapper.classList.remove('checkerboard');
            
            if (preset === 'checker') {
                // Apply checkerboard pattern
                canvasWrapper.classList.add('checkerboard');
                canvasWrapper.style.backgroundColor = '';
            } else if (preset === 'custom') {
                // Use custom color from color picker
                canvasWrapper.style.backgroundColor = customColor;
            } else {
                // Use preset color
                canvasWrapper.style.backgroundColor = preset;
            }
        }
        
        function loadFrame(index) {
            currentFrameIndex = index;
            
            // Ensure frame has layers
            if (!frameLayers[index] || frameLayers[index].length === 0) {
                frameLayers[index] = [];
                const newLayer = {
                    name: 'Layer 1',
                    data: new ImageData(GRID_WIDTH, GRID_HEIGHT),
                    visible: true,
                    opacity: 1.0,
                    blendMode: 'normal'
                };
                frameLayers[index].push(newLayer);
            }
            
            currentLayerIndex = 0;
            compositeLayersToCanvas();
            renderLayerList();
            drawGrid();
            renderFrameThumbnails(); 
        }

        function addFrame(type = 'clone') {
            saveState(); // Save before adding frame
            const newFrameLayers = [];
            
            if (type === 'clone' && frameLayers[currentFrameIndex]) {
                // Clone all layers from current frame
                frameLayers[currentFrameIndex].forEach(layer => {
                    newFrameLayers.push(cloneLayerData(layer));
                });
            } else {
                // Create blank frame with one empty layer
                newFrameLayers.push({
                    name: 'Layer 1',
                    data: new ImageData(GRID_WIDTH, GRID_HEIGHT),
                    visible: true,
                    opacity: 1.0,
                    blendMode: 'normal'
                });
            }
            
            // Insert new frame right after the current frame
            const insertPosition = currentFrameIndex + 1;
            frameLayers.splice(insertPosition, 0, newFrameLayers);
            frames.splice(insertPosition, 0, new ImageData(GRID_WIDTH, GRID_HEIGHT)); // Placeholder
            frameTags.splice(insertPosition, 0, ''); // Empty tag for new frame
            frameDurations.splice(insertPosition, 0, undefined); // Use default duration
            currentFrameIndex = insertPosition;
            renderFrameThumbnails();
            loadFrame(currentFrameIndex);
            updateAnimationPreview();
            document.getElementById('preview-frame-count').textContent = frames.length;
        }

        function updateThumbnail(index) {
            const thumbnailCanvas = document.getElementById(`thumb-${index}`);
            if (!thumbnailCanvas) return;
            const thumbCtx = thumbnailCanvas.getContext('2d');
            thumbCtx.clearRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
            thumbCtx.imageSmoothingEnabled = false;
            
            // Composite layers for this frame
            const compositeData = compositeSingleFrameLayers(index);
            const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            tempCtx.putImageData(compositeData, 0, 0); 
            thumbCtx.drawImage(tempCanvas, 0, 0, GRID_WIDTH, GRID_HEIGHT, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
        }

        function renderFrameThumbnails() {
            const frameThumbnailsDiv = document.getElementById('frame-thumbnails');
            frameThumbnailsDiv.innerHTML = '';
            frames.forEach((data, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = `frame-thumbnail ${index === currentFrameIndex ? 'active' : ''}`;
                wrapper.onclick = () => loadFrame(index);
                wrapper.draggable = true;
                wrapper.dataset.frameIndex = index;
                
                // Drag and drop events
                wrapper.addEventListener('dragstart', (e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', index);
                    wrapper.style.opacity = '0.5';
                });
                
                wrapper.addEventListener('dragend', (e) => {
                    wrapper.style.opacity = '1';
                });
                
                wrapper.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });
                
                wrapper.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = index;
                    if (fromIndex !== toIndex) {
                        moveFrame(fromIndex, toIndex);
                    }
                });
                
                const thumbCanvas = document.createElement('canvas');
                thumbCanvas.id = `thumb-${index}`;
                thumbCanvas.width = 64;
                thumbCanvas.height = 64;
                
                const label = document.createElement('span');
                label.textContent = index + 1;
                label.style.cssText = 'position: absolute; bottom: 0; right: 0; background-color: rgba(0,0,0,0.6); color: white; padding: 1px 3px; font-size: 0.7em;';
                
                // Add tag label if exists
                const tag = frameTags[index];
                if (tag) {
                    const tagLabel = document.createElement('span');
                    tagLabel.textContent = tag;
                    tagLabel.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; background-color: rgba(255,165,0,0.8); color: white; padding: 2px; font-size: 0.6em; text-align: center; font-weight: bold;';
                    tagLabel.title = tag;
                    wrapper.appendChild(tagLabel);
                }
                
                // Right-click to tag frame
                wrapper.oncontextmenu = (e) => {
                    e.preventDefault();
                    tagFrame(index);
                };
                
                // Double-click to set frame duration
                wrapper.ondblclick = (e) => {
                    e.preventDefault();
                    setFrameDuration(index);
                };
                
                // Show duration indicator if custom
                const defaultDuration = parseInt(document.getElementById('frame-speed').value);
                const frameDuration = frameDurations[index] || defaultDuration;
                if (frameDuration !== defaultDuration) {
                    const durationLabel = document.createElement('span');
                    durationLabel.textContent = `${frameDuration}ms`;
                    durationLabel.style.cssText = 'position: absolute; top: 0; right: 0; background-color: rgba(33,150,243,0.8); color: white; padding: 1px 3px; font-size: 0.6em;';
                    wrapper.appendChild(durationLabel);
                }
                
                wrapper.appendChild(thumbCanvas);
                wrapper.appendChild(label);
                frameThumbnailsDiv.appendChild(wrapper);
                updateThumbnail(index); 
            });
            updateTimeline();
        }

        async function tagFrame(index) {
            const currentTag = frameTags[index] || '';
            const newTag = await styledPrompt(`Tag frame ${index + 1}:\n\nExamples: "idle", "walk-1", "attack"\n\nLeave empty to remove tag.`, currentTag, '🏷️ Tag Frame');
            
            if (newTag !== null) { // null = cancelled
                if (newTag.trim() === '') {
                    // Remove tag
                    frameTags[index] = '';
                } else {
                    // Set tag
                    frameTags[index] = newTag.trim();
                }
                renderFrameThumbnails();
            }
        }
        
        async function setFrameDuration(index) {
            const defaultDuration = parseInt(document.getElementById('frame-speed').value);
            const currentDuration = frameDurations[index] || defaultDuration;
            const result = await styledPrompt(`Frame ${index + 1} duration (milliseconds):\n\nDefault: ${defaultDuration}ms\nCurrent: ${currentDuration}ms\n\nLeave empty to use default.`, currentDuration.toString(), '⏱️ Frame Duration');
            const newDuration = parseInt(result);
            
            if (newDuration !== null && !isNaN(newDuration) && newDuration > 0) {
                frameDurations[index] = newDuration;
                renderFrameThumbnails();
            } else if (newDuration === 0) {
                // Reset to default
                frameDurations[index] = undefined;
                renderFrameThumbnails();
            }
        }

        function deleteFrame() {
            if (frames.length <= 1) {
                alert("Cannot delete the only frame.");
                return;
            }
            saveState(); // Save before deleting frame
            frames.splice(currentFrameIndex, 1);
            frameLayers.splice(currentFrameIndex, 1);
            frameTags.splice(currentFrameIndex, 1); // Remove tag too
            frameDurations.splice(currentFrameIndex, 1); // Remove duration too
            if (currentFrameIndex >= frames.length) {
                currentFrameIndex = frames.length - 1;
            }
            renderFrameThumbnails();
            loadFrame(currentFrameIndex);
            document.getElementById('preview-frame-count').textContent = frames.length;
        }
        
        function copyCurrentFrame() {
            const currentLayers = getCurrentLayers();
            if (currentLayers.length === 0) {
                alert("No layers to copy!");
                return;
            }
            
            // Deep clone all layers from current frame
            copiedFrameLayers = currentLayers.map(layer => cloneLayerData(layer));
            alert(`Frame ${currentFrameIndex + 1} copied to clipboard!\n(${copiedFrameLayers.length} layers)`);
        }
        
        function pasteToCurrentFrame() {
            if (!copiedFrameLayers || copiedFrameLayers.length === 0) {
                alert("No frame in clipboard!\nUse 'Copy Frame' first.");
                return;
            }
            
            saveState(); // Save before pasting
            
            // Replace current frame's layers with copied layers
            frameLayers[currentFrameIndex] = copiedFrameLayers.map(layer => cloneLayerData(layer));
            currentLayerIndex = 0;
            
            renderLayerList();
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
            alert(`Pasted to Frame ${currentFrameIndex + 1}!\n(${copiedFrameLayers.length} layers)`);
        }

        function moveFrame(fromIndex, toIndex) {
            if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
                fromIndex >= frames.length || toIndex >= frames.length) {
                return;
            }
            
            saveState(); // Save before moving frame
            
            // Move frame data
            const frameData = frames.splice(fromIndex, 1)[0];
            frames.splice(toIndex, 0, frameData);
            
            // Move frame layers
            const frameLayerData = frameLayers.splice(fromIndex, 1)[0];
            frameLayers.splice(toIndex, 0, frameLayerData);
            
            // Move frame tag and duration too
            const frameTag = frameTags.splice(fromIndex, 1)[0];
            frameTags.splice(toIndex, 0, frameTag);
            const frameDuration = frameDurations.splice(fromIndex, 1)[0];
            frameDurations.splice(toIndex, 0, frameDuration);
            
            // Update current frame index to follow the moved frame
            if (fromIndex === currentFrameIndex) {
                currentFrameIndex = toIndex;
            } else if (fromIndex < currentFrameIndex && toIndex >= currentFrameIndex) {
                currentFrameIndex--;
            } else if (fromIndex > currentFrameIndex && toIndex <= currentFrameIndex) {
                currentFrameIndex++;
            }
            
            renderFrameThumbnails();
            loadFrame(currentFrameIndex);
            updateAnimationPreview();
        }

        function moveFrameLeft() {
            if (currentFrameIndex > 0) {
                // Move to previous position
                moveFrame(currentFrameIndex, currentFrameIndex - 1);
            } else if (frames.length > 1) {
                // Wrap around: move from first to last position
                moveFrame(currentFrameIndex, frames.length - 1);
            }
        }

        function moveFrameRight() {
            if (currentFrameIndex < frames.length - 1) {
                // Move to next position
                moveFrame(currentFrameIndex, currentFrameIndex + 1);
            } else if (frames.length > 1) {
                // Wrap around: move from last to first position
                moveFrame(currentFrameIndex, 0);
            }
        }

        function eraseCanvas(clearFrameData = false) {
            if (clearFrameData) {
                saveState(); // Save before clearing
                const layers = getCurrentLayers();
                // Clear all layers in current frame
                layers.forEach(layer => {
                    for (let i = 0; i < layer.data.data.length; i += 4) {
                        layer.data.data[i + 3] = 0; 
                    }
                });
                compositeLayersToCanvas();
                updateThumbnail(currentFrameIndex);
            }
            drawGrid();
        }

        function exportSpriteAtlas() {
            if (frames.length === 0) {
                alert("No frames to export!");
                return;
            }
            
            const frameWidth = GRID_WIDTH;
            const frameHeight = GRID_HEIGHT;
            const numFrames = frames.length;
            
            // Export sprite sheet PNG
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = frameWidth * numFrames;
            exportCanvas.height = frameHeight;
            const exportCtx = exportCanvas.getContext('2d');
            exportCtx.imageSmoothingEnabled = false;
            
            frames.forEach((frameData, index) => {
                const compositeData = compositeSingleFrameLayers(index);
                const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(frameWidth, frameHeight);
                tempCtx.putImageData(compositeData, 0, 0);
                exportCtx.drawImage(tempCanvas, index * frameWidth, 0);
            });
            
            // Create JSON atlas data
            const atlasData = {
                meta: {
                    app: "Spooksie's Stinky Sprite Tool v2.0",
                    version: "2.0",
                    image: `sprite_atlas_${frameWidth}x${frameHeight}.png`,
                    format: "RGBA8888",
                    size: { w: frameWidth * numFrames, h: frameHeight },
                    scale: "1"
                },
                frames: {}
            };
            
            frames.forEach((frameData, index) => {
                const frameName = frameTags[index] ? frameTags[index] : `frame_${index}`;
                atlasData.frames[frameName] = {
                    frame: {
                        x: index * frameWidth,
                        y: 0,
                        w: frameWidth,
                        h: frameHeight
                    },
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
                    sourceSize: { w: frameWidth, h: frameHeight }
                };
            });
            
            // Export PNG
            const dataURL = exportCanvas.toDataURL('image/png');
            const aImg = document.createElement('a');
            aImg.href = dataURL;
            aImg.download = `sprite_atlas_${frameWidth}x${frameHeight}.png`;
            document.body.appendChild(aImg);
            aImg.click();
            document.body.removeChild(aImg);
            
            // Export JSON
            const jsonString = JSON.stringify(atlasData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const aJson = document.createElement('a');
            aJson.href = url;
            aJson.download = `sprite_atlas_${frameWidth}x${frameHeight}.json`;
            document.body.appendChild(aJson);
            aJson.click();
            document.body.removeChild(aJson);
            URL.revokeObjectURL(url);
            
            alert(`Exported sprite atlas!\n${numFrames} frames as ${exportCanvas.width}x${exportCanvas.height}px\n\nFiles:\n- sprite_atlas_${frameWidth}x${frameHeight}.png\n- sprite_atlas_${frameWidth}x${frameHeight}.json`);
        }

        function exportSpriteSheet() {
            if (frames.length === 0) {
                alert("No frames to export!");
                return;
            }
            const frameWidth = GRID_WIDTH;
            const frameHeight = GRID_HEIGHT;
            const numFrames = frames.length;
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = frameWidth * numFrames;
            exportCanvas.height = frameHeight;
            const exportCtx = exportCanvas.getContext('2d');
            exportCtx.imageSmoothingEnabled = false;
            
            // Composite layers for each frame and export
            frames.forEach((frameData, index) => {
                const compositeData = compositeSingleFrameLayers(index);
                const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(frameWidth, frameHeight);
                tempCtx.putImageData(compositeData, 0, 0);
                exportCtx.drawImage(tempCanvas, index * frameWidth, 0);
            });
            
            const dataURL = exportCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `trickster_sprite_${GRID_WIDTH}x${GRID_HEIGHT}x${numFrames}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            alert(`Exported ${numFrames} frames as a ${exportCanvas.width}x${exportCanvas.height} PNG sprite sheet!\n(All layers composited per frame)`);
        }
        
        function quickExportFuseTool() {
            // Save current settings before export
            const oldPreset = document.getElementById('canvas-bg-preset').value;
            const oldColor = document.getElementById('canvas-bg-color').value;
            const oldHex = document.getElementById('canvas-bg-hex').value;
            
            // Set to magenta temporarily
            document.getElementById('canvas-bg-preset').value = 'custom';
            document.getElementById('canvas-bg-color').value = '#ff00ff';
            document.getElementById('canvas-bg-hex').value = '#FF00FF';
            updateCanvasBackground();
            
            // Allow DOM to update before alert and export
            setTimeout(() => {
                alert("Please import the exported BMPs into the Fuse Tool and set the transparency color as #FF00FF (Magenta).\n\nIf you wish to change the background color, don't use this bulk action and instead set your canvas manually and use File Management > Image Export > Background Frames (BMP) instead.");
                
                exportFramesBMP();
                
                // Automatically revert background
                document.getElementById('canvas-bg-preset').value = oldPreset;
                document.getElementById('canvas-bg-color').value = oldColor;
                document.getElementById('canvas-bg-hex').value = oldHex;
                updateCanvasBackground();
            }, 50);
        }

        function exportFramesBMP() {
            if (frames.length === 0) {
                alert("No frames to export!");
                return;
            }
            
            // Get current canvas background color
            const preset = document.getElementById('canvas-bg-preset').value;
            const customColor = document.getElementById('canvas-bg-color').value;
            let bgColor;
            
            if (preset === 'checker') {
                bgColor = '#ffffff';
            } else if (preset === 'custom') {
                bgColor = customColor;
            } else {
                bgColor = preset;
            }
            
            // Convert hex to RGB
            const bgR = parseInt(bgColor.substring(1, 3), 16);
            const bgG = parseInt(bgColor.substring(3, 5), 16);
            const bgB = parseInt(bgColor.substring(5, 7), 16);
            
            frames.forEach((frameDataPlaceholder, index) => {
                const width = GRID_WIDTH;
                const height = GRID_HEIGHT;
                
                // Composite all layers for this frame
                const compositeData = compositeSingleFrameLayers(index);
                
                // Create BMP file (24-bit, bottom-up)
                const rowPadding = (4 - (width * 3) % 4) % 4;
                const pixelDataSize = (width * 3 + rowPadding) * height;
                const fileSize = BMP_HEADER_SIZE + pixelDataSize;
                
                const bmpFile = new Uint8Array(fileSize);
                let offset = 0;
                
                // BMP Header (14 bytes)
                bmpFile[offset++] = 0x42; // 'B'
                bmpFile[offset++] = 0x4D; // 'M'
                bmpFile[offset++] = fileSize & 0xFF;
                bmpFile[offset++] = (fileSize >> 8) & 0xFF;
                bmpFile[offset++] = (fileSize >> 16) & 0xFF;
                bmpFile[offset++] = (fileSize >> 24) & 0xFF;
                bmpFile[offset++] = 0; // Reserved
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0; // Reserved
                bmpFile[offset++] = 0;
                bmpFile[offset++] = BMP_HEADER_SIZE; // Pixel data offset
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0;
                
                // DIB Header (40 bytes - BITMAPINFOHEADER)
                bmpFile[offset++] = 40; // Header size
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0;
                bmpFile[offset++] = width & 0xFF; // Width
                bmpFile[offset++] = (width >> 8) & 0xFF;
                bmpFile[offset++] = (width >> 16) & 0xFF;
                bmpFile[offset++] = (width >> 24) & 0xFF;
                bmpFile[offset++] = height & 0xFF; // Height
                bmpFile[offset++] = (height >> 8) & 0xFF;
                bmpFile[offset++] = (height >> 16) & 0xFF;
                bmpFile[offset++] = (height >> 24) & 0xFF;
                bmpFile[offset++] = 1; // Planes
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 24; // Bits per pixel
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0; // Compression (none)
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0;
                bmpFile[offset++] = 0;
                bmpFile[offset++] = pixelDataSize & 0xFF; // Image size
                bmpFile[offset++] = (pixelDataSize >> 8) & 0xFF;
                bmpFile[offset++] = (pixelDataSize >> 16) & 0xFF;
                bmpFile[offset++] = (pixelDataSize >> 24) & 0xFF;
                for (let i = 0; i < 16; i++) bmpFile[offset++] = 0; // Resolution + palette
                
                // Pixel data (BGR format, bottom-up)
                for (let y = height - 1; y >= 0; y--) {
                    for (let x = 0; x < width; x++) {
                        const idx = (y * width + x) * 4;
                        const alpha = compositeData.data[idx + 3];
                        
                        if (alpha === 0) {
                            // Transparent pixel - use background color
                            bmpFile[offset++] = bgB; // B
                            bmpFile[offset++] = bgG; // G
                            bmpFile[offset++] = bgR; // R
                        } else {
                            // Normal pixel (BGR format)
                            bmpFile[offset++] = compositeData.data[idx + 2]; // B
                            bmpFile[offset++] = compositeData.data[idx + 1]; // G
                            bmpFile[offset++] = compositeData.data[idx];     // R
                        }
                    }
                    // Row padding
                    for (let p = 0; p < rowPadding; p++) {
                        bmpFile[offset++] = 0;
                    }
                }
                
                // Create download
                const blob = new Blob([bmpFile], { type: 'image/bmp' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `frame_${String(index + 1).padStart(3, '0')}_${width}x${height}.bmp`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
            
            alert(`Exported ${frames.length} frames as BMP-v24!\n(Background color: ${bgColor})`);
        }
        
        function exportAnimationGIF() {
            if (frames.length === 0) {
                alert("No frames to export!");
                return;
            }
            
            if (typeof GIF === 'undefined') {
                alert("GIF export requires hosting this file on a web server!\n\nThe file is currently opened with file:// protocol, which blocks the GIF library.\n\nOptions:\n1. Host on local server (Python: python -m http.server 8000)\n2. Use VS Code Live Server extension\n3. Export BMP frames and use ezgif.com to convert");
                return;
            }
            
            const speed = parseInt(document.getElementById('frame-speed').value);
            
            // Create GIF encoder
            const gif = new GIF({
                workers: 2,
                quality: 1, // 1-30, lower is better
                width: GRID_WIDTH,
                height: GRID_HEIGHT,
                workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
            });
            
            // Add each frame to GIF
            frames.forEach((frameData, index) => {
                // Composite all layers for this frame
                const compositeData = compositeSingleFrameLayers(index);
                
                // Create canvas for this frame
                const { canvas: frameCanvas, ctx: frameCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                frameCtx.putImageData(compositeData, 0, 0);
                
                // Add frame to GIF
                gif.addFrame(frameCanvas, {delay: speed});
            });
            
            // Render and download
            gif.on('finished', function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `animation_${GRID_WIDTH}x${GRID_HEIGHT}_${frames.length}frames.gif`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                alert(`Exported ${frames.length}-frame GIF animation!\n(${speed}ms per frame)`);
            });
            
            alert(`Creating GIF...\nThis may take a moment for ${frames.length} frames.`);
            gif.render();
        }
        
        function floodFill(startX, startY, newColor) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const originalColor = getPixelColor(startX, startY);
            if (colorMatch(originalColor, newColor)) return;
            
            const stack = [[startX, startY]];
            const visited = new Set();
            
            while (stack.length) {
                const [x, y] = stack.pop();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    // Check if filling is constrained by selection
                    if (selection && !isMovingSelection && !isPointInSelection(x, y)) {
                        continue;
                    }
                    
                    const pixelColor = getPixelColor(x, y);
                    
                    if (colorMatch(pixelColor, originalColor)) {
                        // Fill this pixel
                        const index = (y * GRID_WIDTH + x) * 4;
                        currentLayer.data.data[index]     = newColor[0]; 
                        currentLayer.data.data[index + 1] = newColor[1]; 
                        currentLayer.data.data[index + 2] = newColor[2]; 
                        currentLayer.data.data[index + 3] = newColor[3]; 
                        
                        stack.push([x + 1, y]);
                        stack.push([x - 1, y]);
                        stack.push([x, y + 1]);
                        stack.push([x, y - 1]);
                    }
                }
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
        }
        
        function getPatternColor(x, y, pattern) {
            const primary = hexToRgb(currentColor);
            const secondary = hexToRgb(colorSecondary);
            
            switch(pattern) {
                case 'dots':
                    return (x % 2 === 0 && y % 2 === 0) ? primary : secondary;
                    
                case 'checker':
                    return ((x + y) % 2 === 0) ? primary : secondary;
                    
                case 'stripes-h':
                    return (y % 2 === 0) ? primary : secondary;
                    
                case 'stripes-v':
                    return (x % 2 === 0) ? primary : secondary;
                    
                case 'diagonal':
                    return ((x - y) % 4 === 0) ? primary : secondary;
                    
                case 'crosshatch':
                    return (x % 3 === 0 || y % 3 === 0) ? primary : secondary;
                    
                case 'bricks':
                    const brickRow = Math.floor(y / 2);
                    const offset = (brickRow % 2) * 2;
                    return ((x + offset) % 4 < 2) ? primary : secondary;
                    
                case 'hexagon':
                    const hex = (x % 3 === 0 && y % 2 === 0) || ((x + 1) % 3 === 0 && y % 2 === 1);
                    return hex ? primary : secondary;
                    
                default:
                    return primary;
            }
        }
        
        function patternFill(startX, startY, pattern) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const originalColor = getPixelColor(startX, startY);
            const stack = [[startX, startY]];
            const visited = new Set();
            
            while (stack.length) {
                const [x, y] = stack.pop();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    if (selection && !isMovingSelection && !isPointInSelection(x, y)) {
                        continue;
                    }
                    
                    const pixelColor = getPixelColor(x, y);
                    
                    if (colorMatch(pixelColor, originalColor)) {
                        // Get pattern color for this position
                        const patternColor = getPatternColor(x, y, pattern);
                        const index = (y * GRID_WIDTH + x) * 4;
                        currentLayer.data.data[index]     = patternColor[0]; 
                        currentLayer.data.data[index + 1] = patternColor[1]; 
                        currentLayer.data.data[index + 2] = patternColor[2]; 
                        currentLayer.data.data[index + 3] = patternColor[3]; 
                        
                        stack.push([x + 1, y]);
                        stack.push([x - 1, y]);
                        stack.push([x, y + 1]);
                        stack.push([x, y - 1]);
                    }
                }
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
        }

        function drawLine(x0, y0, x1, y1, color) {
            // Bresenham's line algorithm
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const dx = Math.abs(x1 - x0);
            const dy = Math.abs(y1 - y0);
            const sx = x0 < x1 ? 1 : -1;
            const sy = y0 < y1 ? 1 : -1;
            let err = dx - dy;
            
            const rgba = hexToRgb(color);
            if (!rgba || rgba.length < 4) return;
            const [r, g, b, a] = rgba;
            
            while (true) {
                if (x0 >= 0 && x0 < GRID_WIDTH && y0 >= 0 && y0 < GRID_HEIGHT) {
                    // Check if drawing is constrained by selection
                    if (!selection || isMovingSelection || isPointInSelection(x0, y0)) {
                        const index = (y0 * GRID_WIDTH + x0) * 4;
                        currentLayer.data.data[index] = r;
                        currentLayer.data.data[index + 1] = g;
                        currentLayer.data.data[index + 2] = b;
                        currentLayer.data.data[index + 3] = a;
                    }
                }
                
                if (x0 === x1 && y0 === y1) break;
                
                const e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }
        }

        function fillPolygon(points, color) {
            if (points.length < 3) return;
            
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const rgba = hexToRgb(color);
            if (!rgba || rgba.length < 4) return;
            const [r, g, b, a] = rgba;
            
            // Find bounding box
            let minY = points[0].y, maxY = points[0].y;
            for (let p of points) {
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            }
            
            // Scan line fill
            for (let y = minY; y <= maxY; y++) {
                const intersections = [];
                for (let i = 0; i < points.length; i++) {
                    const p1 = points[i];
                    const p2 = points[(i + 1) % points.length];
                    
                    if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
                        const x = p1.x + (y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
                        intersections.push(Math.round(x));
                    }
                }
                
                intersections.sort((a, b) => a - b);
                
                for (let i = 0; i < intersections.length; i += 2) {
                    if (i + 1 < intersections.length) {
                        for (let x = intersections[i]; x <= intersections[i + 1]; x++) {
                            if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                                // Check if drawing is constrained by selection
                                if (!selection || isMovingSelection || isPointInSelection(x, y)) {
                                    const index = (y * GRID_WIDTH + x) * 4;
                                    currentLayer.data.data[index] = r;
                                    currentLayer.data.data[index + 1] = g;
                                    currentLayer.data.data[index + 2] = b;
                                    currentLayer.data.data[index + 3] = a;
                                }
                            }
                        }
                    }
                }
            }
        }

        function drawQuadraticCurve(x0, y0, x2, y2, x1, y1, color) {
            // Quadratic bezier curve
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const rgba = hexToRgb(color);
            if (!rgba || rgba.length < 4) return;
            const [r, g, b, a] = rgba;
            
            const steps = Math.max(Math.abs(x2 - x0), Math.abs(y2 - y0)) * 2;
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const invT = 1 - t;
                
                const x = Math.round(invT * invT * x0 + 2 * invT * t * x1 + t * t * x2);
                const y = Math.round(invT * invT * y0 + 2 * invT * t * y1 + t * t * y2);
                
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    // Check if drawing is constrained by selection
                    if (!selection || isMovingSelection || isPointInSelection(x, y)) {
                        const index = (y * GRID_WIDTH + x) * 4;
                        currentLayer.data.data[index] = r;
                        currentLayer.data.data[index + 1] = g;
                        currentLayer.data.data[index + 2] = b;
                        currentLayer.data.data[index + 3] = a;
                    }
                }
            }
        }

        function drawRectangle(x1, y1, x2, y2, color, filled) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer || !currentLayer.data || !currentLayer.data.data) return;
            
            const rgba = hexToRgb(color);
            if (!rgba || rgba.length < 4 || rgba[3] === 0) return;
            const [r, g, b, a] = rgba;
            
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            const useGradient = document.getElementById('shape-gradient-checkbox')?.checked || false;
            
            if (filled) {
                // Fill rectangle
                const width = maxX - minX + 1;
                const height = maxY - minY + 1;
                
                for (let y = minY; y <= maxY; y++) {
                    for (let x = minX; x <= maxX; x++) {
                        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                            // Check if drawing is constrained by selection
                            if (!selection || isMovingSelection || isPointInSelection(x, y)) {
                                let pixelColor = [r, g, b, a];
                                
                                if (useGradient) {
                                    // Calculate gradient ratio based on position
                                    const xRatio = (x - minX) / Math.max(1, width - 1);
                                    const yRatio = (y - minY) / Math.max(1, height - 1);
                                    const ratio = Math.sqrt(xRatio * xRatio + yRatio * yRatio) / Math.sqrt(2); // Diagonal gradient
                                    
                                    const startRGB = hexToRgb(currentColor);
                                    const endRGB = hexToRgb(colorSecondary);
                                    pixelColor = [
                                        Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * ratio),
                                        Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * ratio),
                                        Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * ratio),
                                        255
                                    ];
                                }
                                
                                const index = (y * GRID_WIDTH + x) * 4;
                                currentLayer.data.data[index] = pixelColor[0];
                                currentLayer.data.data[index + 1] = pixelColor[1];
                                currentLayer.data.data[index + 2] = pixelColor[2];
                                currentLayer.data.data[index + 3] = pixelColor[3];
                            }
                        }
                    }
                }
            } else {
                // Draw outline
                for (let x = minX; x <= maxX; x++) {
                    if (x >= 0 && x < GRID_WIDTH && minY >= 0 && minY < GRID_HEIGHT) {
                        if (!selection || isMovingSelection || isPointInSelection(x, minY)) {
                            const index = (minY * GRID_WIDTH + x) * 4;
                            currentLayer.data.data[index] = r;
                            currentLayer.data.data[index + 1] = g;
                            currentLayer.data.data[index + 2] = b;
                            currentLayer.data.data[index + 3] = a;
                        }
                    }
                    if (x >= 0 && x < GRID_WIDTH && maxY >= 0 && maxY < GRID_HEIGHT) {
                        if (!selection || isMovingSelection || isPointInSelection(x, maxY)) {
                            const index = (maxY * GRID_WIDTH + x) * 4;
                            currentLayer.data.data[index] = r;
                            currentLayer.data.data[index + 1] = g;
                            currentLayer.data.data[index + 2] = b;
                            currentLayer.data.data[index + 3] = a;
                        }
                    }
                }
                for (let y = minY; y <= maxY; y++) {
                    if (minX >= 0 && minX < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                        if (!selection || isMovingSelection || isPointInSelection(minX, y)) {
                            const index = (y * GRID_WIDTH + minX) * 4;
                            currentLayer.data.data[index] = r;
                            currentLayer.data.data[index + 1] = g;
                            currentLayer.data.data[index + 2] = b;
                            currentLayer.data.data[index + 3] = a;
                        }
                    }
                    if (maxX >= 0 && maxX < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                        if (!selection || isMovingSelection || isPointInSelection(maxX, y)) {
                            const index = (y * GRID_WIDTH + maxX) * 4;
                            currentLayer.data.data[index] = r;
                            currentLayer.data.data[index + 1] = g;
                            currentLayer.data.data[index + 2] = b;
                            currentLayer.data.data[index + 3] = a;
                        }
                    }
                }
            }
        }

        function drawCircle(centerX, centerY, radius, color, filled) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer || !currentLayer.data || !currentLayer.data.data) return;
            
            const rgba = hexToRgb(color);
            if (!rgba || rgba.length < 4 || rgba[3] === 0) return;
            const [r, g, b, a] = rgba;
            
            const useGradient = document.getElementById('shape-gradient-checkbox')?.checked || false;
            
            const setPixel = (x, y, pixelColor = [r, g, b, a]) => {
                // Round coordinates to ensure pixel-perfect drawing
                x = Math.round(x);
                y = Math.round(y);
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    // Check if drawing is constrained by selection
                    if (!selection || isMovingSelection || isPointInSelection(x, y)) {
                        const index = (y * GRID_WIDTH + x) * 4;
                        currentLayer.data.data[index] = pixelColor[0];
                        currentLayer.data.data[index + 1] = pixelColor[1];
                        currentLayer.data.data[index + 2] = pixelColor[2];
                        currentLayer.data.data[index + 3] = pixelColor[3];
                    }
                }
            };
            
            if (filled) {
                // Fill circle
                const radiusSq = radius * radius;
                for (let y = Math.floor(centerY - radius); y <= Math.ceil(centerY + radius); y++) {
                    for (let x = Math.floor(centerX - radius); x <= Math.ceil(centerX + radius); x++) {
                        const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
                        if (distSq <= radiusSq) {
                            let pixelColor = [r, g, b, a];
                            
                            if (useGradient) {
                                // Radial gradient from center
                                const dist = Math.sqrt(distSq);
                                const ratio = Math.min(1, dist / radius);
                                
                                const startRGB = hexToRgb(currentColor);
                                const endRGB = hexToRgb(colorSecondary);
                                pixelColor = [
                                    Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * ratio),
                                    Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * ratio),
                                    Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * ratio),
                                    255
                                ];
                            }
                            
                            setPixel(x, y, pixelColor);
                        }
                    }
                }
            } else{
                // Draw outline using midpoint circle algorithm
                let x = Math.round(radius);
                let y = 0;
                let err = 0;
                
                while (x >= y) {
                    // Draw 8 symmetric points
                    setPixel(centerX + x, centerY + y);
                    setPixel(centerX + y, centerY + x);
                    setPixel(centerX - y, centerY + x);
                    setPixel(centerX - x, centerY + y);
                    setPixel(centerX - x, centerY - y);
                    setPixel(centerX - y, centerY - x);
                    setPixel(centerX + y, centerY - x);
                    setPixel(centerX + x, centerY - y);
                    
                    if (err <= 0) {
                        y += 1;
                        err += 2 * y + 1;
                    }
                    if (err > 0) {
                        x -= 1;
                        err -= 2 * x + 1;
                    }
                }
            }
        }

        function drawBezierCurve(points, color) {
            // Draw smooth curve through 4 control points
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer || points.length !== 4) return;
            
            const [p0, p1, p2, p3] = points;
            const rgba = hexToRgb(color);
            
            // Draw bezier curve with many small steps
            const steps = 50;
            let lastX = p0.x, lastY = p0.y;
            
            for (let t = 0; t <= steps; t++) {
                const ratio = t / steps;
                const t2 = ratio * ratio;
                const t3 = t2 * ratio;
                const mt = 1 - ratio;
                const mt2 = mt * mt;
                const mt3 = mt2 * mt;
                
                // Cubic bezier formula
                const x = Math.round(mt3 * p0.x + 3 * mt2 * ratio * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x);
                const y = Math.round(mt3 * p0.y + 3 * mt2 * ratio * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y);
                
                // Draw line segment
                drawLine(lastX, lastY, x, y, color);
                lastX = x;
                lastY = y;
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
        }
        
        function fillGradientMesh() {
            if (meshPoints.length < 3) {
                alert('Need at least 3 points for gradient mesh!');
                return;
            }
            
            // Open visual editor for mesh points
            openMeshEditor();
        }
        
        function openMeshEditor() {
            let html = `<div id="mesh-editor" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 3px solid #9c27b0; border-radius: 10px; z-index: 10000; box-shadow: 0 4px 20px rgba(0,0,0,0.5); min-width: 400px;">
                <h3 style="margin-top: 0;">Gradient Mesh Editor</h3>
                <p style="font-size: 0.9em;">${meshPoints.length} control points - Click point to change color</p>
                <div id="mesh-point-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin: 10px 0;">`;
            
            meshPoints.forEach((point, i) => {
                html += `<div style="display: flex; align-items: center; gap: 10px; margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 3px;">
                    <span style="flex: 1;">Point ${i}: (${point.x}, ${point.y})</span>
                    <input type="color" value="${point.color}" onchange="updateMeshPointColor(${i}, this.value)" style="width: 40px; height: 30px;">
                    <button onclick="removeMeshPoint(${i})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✖</button>
                </div>`;
            });
            
            html += `</div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="applyMeshAndClose()" style="flex: 1; background: #28a745; border: none; color: white; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">Apply Mesh</button>
                    <button onclick="closeMeshEditor()" style="flex: 1; background: #dc3545; border: none; color: white; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">Cancel</button>
                </div>
            </div>
            <div id="mesh-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999;"></div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
        }
        
        window.updateMeshPointColor = function(index, color) {
            if (meshPoints[index]) {
                meshPoints[index].color = color;
            }
        };
        
        window.removeMeshPoint = function(index) {
            meshPoints.splice(index, 1);
            closeMeshEditor();
            if (meshPoints.length >= 3) {
                openMeshEditor();
            } else {
                alert('Need at least 3 points!');
            }
        };
        
        window.applyMeshAndClose = function() {
            closeMeshEditor();
            applyGradientMesh();
        };
        
        window.closeMeshEditor = function() {
            const editor = document.getElementById('mesh-editor');
            const overlay = document.getElementById('mesh-overlay');
            if (editor) editor.remove();
            if (overlay) overlay.remove();
        };
        
        function applyGradientMesh() {
            saveState();
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            let minX = meshPoints[0].x, maxX = meshPoints[0].x;
            let minY = meshPoints[0].y, maxY = meshPoints[0].y;
            meshPoints.forEach(p => {
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            });
            
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    let totalWeight = 0;
                    let r = 0, g = 0, b = 0;
                    
                    meshPoints.forEach(point => {
                        const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)) + 0.1;
                        const weight = 1 / dist;
                        const rgb = hexToRgb(point.color);
                        
                        r += rgb[0] * weight;
                        g += rgb[1] * weight;
                        b += rgb[2] * weight;
                        totalWeight += weight;
                    });
                    
                    if (totalWeight > 0) {
                        setPixelInLayer(currentLayer, x, y, 
                            Math.round(r / totalWeight),
                            Math.round(g / totalWeight),
                            Math.round(b / totalWeight),
                            255
                        );
                    }
                }
            }
            
            meshPoints = [];
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateToolStatus('Gradient mesh filled!');
        }
        
        function selectByColor(clickX, clickY) {
            // Magic wand: Select only CONNECTED pixels matching the clicked color (flood fill style)
            const targetColor = getPixelColor(clickX, clickY);
            const selectedPixels = [];
            const stack = [[clickX, clickY]];
            const visited = new Set();
            
            while (stack.length) {
                const [x, y] = stack.pop();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    const pixelColor = getPixelColor(x, y);
                    
                    if (colorMatch(pixelColor, targetColor, 0)) {
                        selectedPixels.push({x: x, y: y});
                        
                        // Add neighbors to stack
                        stack.push([x + 1, y]);
                        stack.push([x - 1, y]);
                        stack.push([x, y + 1]);
                        stack.push([x, y - 1]);
                    }
                }
            }
            
            if (selectedPixels.length > 0) {
                // Calculate bounding box
                let minX = selectedPixels[0].x, maxX = selectedPixels[0].x;
                let minY = selectedPixels[0].y, maxY = selectedPixels[0].y;
                for (const pixel of selectedPixels) {
                    minX = Math.min(minX, pixel.x);
                    maxX = Math.max(maxX, pixel.x);
                    minY = Math.min(minY, pixel.y);
                    maxY = Math.max(maxY, pixel.y);
                }
                
                selection = {
                    x1: minX,
                    y1: minY,
                    x2: maxX,
                    y2: maxY,
                    isColorSelect: true,
                    pixels: selectedPixels,
                    layerIndex: currentLayerIndex
                };
                drawSelectionOverlay();
                updateSelectionInfo();
                updateCurrentToolDisplay();
            }
        }
        
        async function selectByEdgeDetection(clickX, clickY) {
            // Smart selection using edge detection (Sobel operator)
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const result = await styledPrompt('Edge detection threshold (0-255):\n\n50 = Sensitive\n100 = Moderate\n150 = Less sensitive', '100', '🔍 Edge Detection');
            const threshold = parseInt(result);
            if (isNaN(threshold)) return;
            
            // Calculate edge map using Sobel operator
            const edgeMap = new Uint8Array(GRID_WIDTH * GRID_HEIGHT);
            
            for (let y = 1; y < GRID_HEIGHT - 1; y++) {
                for (let x = 1; x < GRID_WIDTH - 1; x++) {
                    // Sobel kernels
                    let gx = 0, gy = 0;
                    
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            // Use composited canvas to detect edges across all visible layers
                            const [r, g, b, a] = getPixelColorFromCanvas(x + kx, y + ky);
                            const intensity = (r + g + b) / 3;
                            
                            // Sobel X
                            if (kx === -1) gx -= intensity * (ky === 0 ? 2 : 1);
                            if (kx === 1) gx += intensity * (ky === 0 ? 2 : 1);
                            
                            // Sobel Y
                            if (ky === -1) gy -= intensity * (kx === 0 ? 2 : 1);
                            if (ky === 1) gy += intensity * (kx === 0 ? 2 : 1);
                        }
                    }
                    
                    const magnitude = Math.sqrt(gx * gx + gy * gy);
                    edgeMap[y * GRID_WIDTH + x] = magnitude > threshold ? 1 : 0;
                }
            }
            
            // Flood fill from click point, stopping at edges
            const selectedPixels = [];
            const stack = [[clickX, clickY]];
            const visited = new Set();
            
            while (stack.length) {
                const [x, y] = stack.pop();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    if (edgeMap[y * GRID_WIDTH + x] === 0) { // Not an edge
                        selectedPixels.push({x, y});
                        
                        stack.push([x + 1, y]);
                        stack.push([x - 1, y]);
                        stack.push([x, y + 1]);
                        stack.push([x, y - 1]);
                    }
                }
            }
            
            if (selectedPixels.length > 0) {
                let minX = selectedPixels[0].x, maxX = selectedPixels[0].x;
                let minY = selectedPixels[0].y, maxY = selectedPixels[0].y;
                for (const pixel of selectedPixels) {
                    minX = Math.min(minX, pixel.x);
                    maxX = Math.max(maxX, pixel.x);
                    minY = Math.min(minY, pixel.y);
                    maxY = Math.max(maxY, pixel.y);
                }
                
                selection = {
                    x1: minX,
                    y1: minY,
                    x2: maxX,
                    y2: maxY,
                    isEdgeSelect: true,
                    pixels: selectedPixels,
                    layerIndex: currentLayerIndex
                };
                drawSelectionOverlay();
                updateSelectionInfo();
                updateCurrentToolDisplay();
            } else {
                alert('No region found!\nTry adjusting the threshold.');
            }
        }

        function createCircleSelection(centerX, centerY, radius) {
            // Select all pixels within circular area
            const selectedPixels = [];
            const radiusSq = radius * radius;
            
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
                    if (distSq <= radiusSq) {
                        selectedPixels.push({x: x, y: y});
                    }
                }
            }
            
            return selectedPixels;
        }

        function eraseColorInSelection(clickX, clickY) {
            // Erase all instances of clicked color within active selection only
            if (!selection) return;
            
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const targetColor = getPixelColor(clickX, clickY);
            
            // Erase all matching colors within selection
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    // Only erase within selection
                    if (isPointInSelection(x, y)) {
                        const pixelColor = getPixelColor(x, y);
                        if (colorMatch(pixelColor, targetColor, 0)) {
                            const index = (y * GRID_WIDTH + x) * 4;
                            currentLayer.data.data[index] = 0;
                            currentLayer.data.data[index + 1] = 0;
                            currentLayer.data.data[index + 2] = 0;
                            currentLayer.data.data[index + 3] = 0;
                        }
                    }
                }
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updatePalette();
        }
        
        async function magicErase(clickX, clickY) {
            // Magic eraser - erase connected pixels with tolerance
            const result = await styledPrompt('Color tolerance (0-255):\n\n0 = Exact match only\n50 = Similar colors\n100 = Broader range', '30', '🪄 Magic Eraser');
            const tolerance = parseInt(result);
            if (isNaN(tolerance)) return;
            
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const targetColor = getPixelColor(clickX, clickY);
            const stack = [[clickX, clickY]];
            const visited = new Set();
            
            while (stack.length) {
                const [x, y] = stack.pop();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    const pixelColor = getPixelColor(x, y);
                    
                    if (colorMatch(pixelColor, targetColor, tolerance)) {
                        // Erase this pixel
                        const index = (y * GRID_WIDTH + x) * 4;
                        currentLayer.data.data[index] = 0;
                        currentLayer.data.data[index + 1] = 0;
                        currentLayer.data.data[index + 2] = 0;
                        currentLayer.data.data[index + 3] = 0;
                        
                        stack.push([x + 1, y]);
                        stack.push([x - 1, y]);
                        stack.push([x, y + 1]);
                        stack.push([x, y - 1]);
                    }
                }
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updatePalette();
        }

        function addColorToPalette() {
            const rgb = hexToRgb(currentColor);
            const colorKey = `${rgb[0]},${rgb[1]},${rgb[2]},${rgb[3]}`;
            paletteColors.add(colorKey);
            updatePalette();
        }
        
        function clearPalette() {
            if (!confirm('Clear all colors from palette?\n\nThis only clears the palette display, not your sprite.')) return;
            paletteColors.clear();
            updatePalette();
        }
        
        async function generateGradientPalette() {
            const result = await styledPrompt('How many color steps? (2-32)', '8', '🌈 Gradient Palette');
            const steps = parseInt(result);
            if (!steps || steps < 2 || steps > 32) return;
            
            const startRGB = hexToRgb(currentColor);
            const endRGB = hexToRgb(colorSecondary);
            
            paletteColors.clear();
            
            for (let i = 0; i < steps; i++) {
                const ratio = i / (steps - 1);
                const r = Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * ratio);
                const g = Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * ratio);
                const b = Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * ratio);
                paletteColors.add(`${r},${g},${b},255`);
            }
            
            updatePalette();
            alert(`Generated ${steps}-step gradient palette!`);
        }

        function updatePalette() {
            // Scan all frames and layers to collect unique colors (if no manual colors)
            if (paletteColors.size === 0) {
            paletteColors.clear();
            }
            
            for (let frameIndex = 0; frameIndex < frameLayers.length; frameIndex++) {
                const layers = frameLayers[frameIndex];
                for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                    const layer = layers[layerIndex];
                    const data = layer.data.data;
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const a = data[i + 3];
                        
                        // Only add non-transparent pixels
                        if (a > 0) {
                            const colorKey = `${r},${g},${b},${a}`;
                            paletteColors.add(colorKey);
                        }
                    }
                }
            }
            
            // Render palette preview
            const paletteDiv = document.getElementById('palette-preview');
            paletteDiv.innerHTML = '';
            
            const sortedColors = Array.from(paletteColors).sort();
            sortedColors.forEach(colorKey => {
                const [r, g, b, a] = colorKey.split(',').map(Number);
                const colorDiv = document.createElement('div');
                colorDiv.style.width = '24px';
                colorDiv.style.height = '24px';
                colorDiv.style.backgroundColor = `rgba(${r},${g},${b},${a/255})`;
                colorDiv.style.border = '1px solid #333';
                colorDiv.style.cursor = 'pointer';
                colorDiv.title = `RGB(${r},${g},${b},${a})`;
                
                // Click to set as primary color
                colorDiv.onclick = () => {
                    const hex = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
                    colorPicker.value = hex;
                    currentColor = hex;
                    document.getElementById('current-color-display').value = hex.toUpperCase();
                };
                
                paletteDiv.appendChild(colorDiv);
            });
            
            document.getElementById('palette-color-count').textContent = paletteColors.size;
        }

        function exportPalette() {
            if (paletteColors.size === 0) {
                alert('No colors in palette! Draw something first.');
                return;
            }
            
            // JASC-PAL format
            let palContent = 'JASC-PAL\n0100\n' + paletteColors.size + '\n';
            
            const sortedColors = Array.from(paletteColors).sort();
            sortedColors.forEach(colorKey => {
                const [r, g, b, a] = colorKey.split(',').map(Number);
                palContent += `${r} ${g} ${b}\n`;
            });
            
            // Create download
            const blob = new Blob([palContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sprite_palette_${paletteColors.size}_colors.pal`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(`Exported JASC-PAL with ${paletteColors.size} colors!`);
        }

        function exportVGAPalette() {
            // VGA 24-bit palette: 256 colors × 3 bytes (RGB)
            const paletteData = new Uint8Array(VGA_PALETTE_SIZE * VGA_BYTES_PER_COLOR);
            
            // Get background color to fill empty slots
            const preset = document.getElementById('canvas-bg-preset').value;
            const customColor = document.getElementById('canvas-bg-color').value;
            let bgColor = preset === 'custom' ? customColor : (preset === 'checker' ? '#ffffff' : preset);
            const bgR = parseInt(bgColor.substring(1, 3), 16);
            const bgG = parseInt(bgColor.substring(3, 5), 16);
            const bgB = parseInt(bgColor.substring(5, 7), 16);
            
            // Get unique colors (sorted)
            const sortedColors = Array.from(paletteColors).sort();
            
            // Fill palette data
            for (let i = 0; i < VGA_PALETTE_SIZE; i++) {
                if (i < sortedColors.length) {
                    // Use actual palette color
                    const [r, g, b, a] = sortedColors[i].split(',').map(Number);
                    paletteData[i * VGA_BYTES_PER_COLOR] = r;
                    paletteData[i * VGA_BYTES_PER_COLOR + 1] = g;
                    paletteData[i * VGA_BYTES_PER_COLOR + 2] = b;
                } else {
                    // Fill with background color
                    paletteData[i * VGA_BYTES_PER_COLOR] = bgR;
                    paletteData[i * VGA_BYTES_PER_COLOR + 1] = bgG;
                    paletteData[i * VGA_BYTES_PER_COLOR + 2] = bgB;
                }
            }
            
            // Create download
            const blob = new Blob([paletteData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sprite_vga_palette_${sortedColors.length}_colors.pal`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(`Exported VGA 24-bit palette!\n${sortedColors.length} unique colors + ${VGA_PALETTE_SIZE - sortedColors.length} background fill slots`);
        }

        function importJASCPalette(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                
                // Validate JASC-PAL format
                if (lines.length < 3 || lines[0] !== 'JASC-PAL' || lines[1] !== '0100') {
                    alert('Invalid JASC-PAL file!\nExpected format:\nJASC-PAL\n0100\n<color count>');
                    return;
                }
                
                const numColors = parseInt(lines[2]);
                if (isNaN(numColors) || numColors < 1) {
                    alert(`Invalid color count: ${lines[2]}`);
                    return;
                }
                
                // Clear current palette and add unique colors only
                paletteColors.clear();
                const uniqueColorSet = new Set();
                
                for (let i = 0; i < Math.min(numColors, lines.length - 3); i++) {
                    const colorLine = lines[3 + i];
                    const parts = colorLine.split(/\s+/);
                    
                    if (parts.length >= 3) {
                        const r = parseInt(parts[0]);
                        const g = parseInt(parts[1]);
                        const b = parseInt(parts[2]);
                        
                        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                            const colorKey = `${r},${g},${b},255`;
                            
                            // Only add if not already in set (ensures uniqueness)
                            if (!uniqueColorSet.has(colorKey)) {
                                uniqueColorSet.add(colorKey);
                                paletteColors.add(colorKey);
                            }
                        }
                    }
                }
                
                // Update palette display
                updatePalette();
                
                alert(`Imported JASC-PAL!\n${paletteColors.size} unique colors loaded.`);
            };
            
            reader.readAsText(file);
            
            // Reset file input so the same file can be imported again
            event.target.value = '';
        }

        function importVGAPalette(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                
                // VGA palette should be (256 colors × 3 bytes)
                const expectedSize = VGA_PALETTE_SIZE * VGA_BYTES_PER_COLOR;
                if (data.length !== expectedSize) {
                    alert(`Invalid VGA palette file!\nExpected ${expectedSize} bytes, got ${data.length} bytes.`);
                    return;
                }
                
                // Clear current palette and add unique colors only
                paletteColors.clear();
                const uniqueColorSet = new Set();
                
                for (let i = 0; i < VGA_PALETTE_SIZE; i++) {
                    const r = data[i * VGA_BYTES_PER_COLOR];
                    const g = data[i * VGA_BYTES_PER_COLOR + 1];
                    const b = data[i * VGA_BYTES_PER_COLOR + 2];
                    const colorKey = `${r},${g},${b},255`;
                    
                    // Only add if not already in set (ensures uniqueness)
                    if (!uniqueColorSet.has(colorKey)) {
                        uniqueColorSet.add(colorKey);
                        paletteColors.add(colorKey);
                    }
                }
                
                // Update palette display
                updatePalette();
                
                alert(`Imported VGA palette!\n${paletteColors.size} unique colors loaded.`);
            };
            
            reader.readAsArrayBuffer(file);
            
            // Reset file input so the same file can be imported again
            event.target.value = '';
        }

        // Universal palette import that auto-detects format
        function importPaletteAuto(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            // First try to read as text to check if it's JASC-PAL
            reader.onload = function(e) {
                const text = e.target.result;
                const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                
                // Check if it's JASC-PAL format
                if (lines.length >= 3 && lines[0] === 'JASC-PAL' && lines[1] === '0100') {
                    // It's a PAL file
                    const numColors = parseInt(lines[2]);
                    if (isNaN(numColors) || numColors < 1) {
                        alert(`Invalid color count: ${lines[2]}`);
                        return;
                    }
                    
                    paletteColors.clear();
                    const uniqueColorSet = new Set();
                    
                    for (let i = 0; i < Math.min(numColors, lines.length - 3); i++) {
                        const colorLine = lines[3 + i];
                        const parts = colorLine.split(/\s+/);
                        
                        if (parts.length >= 3) {
                            const r = parseInt(parts[0]);
                            const g = parseInt(parts[1]);
                            const b = parseInt(parts[2]);
                            
                            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                                const colorKey = `${r},${g},${b},255`;
                                if (!uniqueColorSet.has(colorKey)) {
                                    uniqueColorSet.add(colorKey);
                                    paletteColors.add(colorKey);
                                }
                            }
                        }
                    }
                    
                    updatePalette();
                    alert(`Imported JASC-PAL!\n${paletteColors.size} unique colors loaded.`);
                } else {
                    // Not a text PAL file, try as binary VGA
                    const reader2 = new FileReader();
                    reader2.onload = function(e2) {
                        const data = new Uint8Array(e2.target.result);
                        
                        // VGA palette should be exactly 768 bytes (256 colors × 3 bytes)
                        const expectedSize = VGA_PALETTE_SIZE * VGA_BYTES_PER_COLOR;
                        if (data.length !== expectedSize) {
                            alert(`Could not detect palette format!\n\nFile is not JASC-PAL format and is ${data.length} bytes (expected ${expectedSize} for VGA format).`);
                            return;
                        }
                        
                        paletteColors.clear();
                        const uniqueColorSet = new Set();
                        
                        for (let i = 0; i < VGA_PALETTE_SIZE; i++) {
                            const r = data[i * VGA_BYTES_PER_COLOR];
                            const g = data[i * VGA_BYTES_PER_COLOR + 1];
                            const b = data[i * VGA_BYTES_PER_COLOR + 2];
                            const colorKey = `${r},${g},${b},255`;
                            
                            if (!uniqueColorSet.has(colorKey)) {
                                uniqueColorSet.add(colorKey);
                                paletteColors.add(colorKey);
                            }
                        }
                        
                        updatePalette();
                        alert(`Imported VGA palette!\n${paletteColors.size} unique colors loaded.`);
                    };
                    
                    reader2.readAsArrayBuffer(file);
                }
            };
            
            reader.readAsText(file);
            
            // Reset file input
            event.target.value = '';
        }

        function toggleColorSwap() {
            const swapDiv = document.getElementById('swap-info');
            const swapBtn = document.getElementById('swap-btn');
            
            // If already open, close it
            if (swapDiv.innerHTML !== '') {
                swapDiv.innerHTML = '';
                swapBtn.classList.remove('tool-active');
                updateToolStatus('');
                // Reset tool to pencil
                if (currentTool === 'swap') {
                    currentTool = 'pencil';
                    updateCurrentToolDisplay();
                }
                return;
            }
            
            // Otherwise, open it
            startColorSwap();
        }
        
        function startColorSwap() {
            const swapBtn = document.getElementById('swap-btn');
            swapBtn.classList.add('tool-active');
            
            // Set the tool to 'swap' so clicking pixels works
            currentTool = 'swap';
            
            updateToolStatus('🎨 Color Swap is active - Click a pixel to select source color, or type colors below');
            
            document.getElementById('swap-info').innerHTML = `
                <div style="margin-top: 8px;">
                    <label style="font-size: 0.75em;">Source Color (click pixel or type):</label>
                    <input type="text" id="swap-source-hex" value="#000000" maxlength="7" style="width: 100%; margin-top: 3px; text-transform: uppercase; font-family: monospace;">
                    <label style="font-size: 0.75em; margin-top: 5px; display: block;">Replace With (type or use primary color):</label>
                    <input type="text" id="swap-target-hex" value="${currentColor.toUpperCase()}" maxlength="7" style="width: 100%; margin-top: 3px; text-transform: uppercase; font-family: monospace;">
                    <button id="apply-swap-btn" style="width: 100%; margin-top: 8px; background-color: #8a2be2; border-color: #8a2be2;">Apply Color Swap to ALL Frames</button>
                    <button onclick="toggleColorSwap()" style="width: 100%; margin-top: 5px; background-color: #6c757d; border-color: #6c757d;">Cancel</button>
                </div>
            `;
            
            document.getElementById('apply-swap-btn').onclick = () => {
                const sourceHex = document.getElementById('swap-source-hex').value.trim();
                const targetHex = document.getElementById('swap-target-hex').value.trim();
                applyColorSwapByHex(sourceHex, targetHex);
            };
        }

        function selectSourceColor(x, y) {
            const sourceColor = getPixelColor(x, y);
            const [r, g, b, a] = sourceColor;
            const sourceHex = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
            document.getElementById('swap-source-hex').value = sourceHex.toUpperCase();
            document.getElementById('swap-target-hex').value = currentColor.toUpperCase();
        }
        
        function applyColorSwapByHex(sourceHex, targetHex) {
            // Validate hex colors
            sourceHex = normalizeHexColor(sourceHex);
            targetHex = normalizeHexColor(targetHex);
            
            if (!sourceHex || !targetHex) {
                alert("Invalid hex color! Use format: #RRGGBB");
                return;
            }
            
            saveState(); // Save before color swap
            const sourceRGBA = hexToRgb(sourceHex);
            const targetRGBA = hexToRgb(targetHex);
            targetRGBA[3] = 255;
            
            // Swap color in all layers of all frames
            frameLayers.forEach((frameLayers, frameIndex) => {
                frameLayers.forEach((layer, layerIndex) => {
                    for (let i = 0; i < layer.data.data.length; i += 4) {
                        const pixelColor = [
                            layer.data.data[i], 
                            layer.data.data[i + 1], 
                            layer.data.data[i + 2], 
                            layer.data.data[i + 3]
                        ];
                        if (colorMatch(pixelColor, sourceRGBA)) {
                            layer.data.data[i] = targetRGBA[0];
                            layer.data.data[i + 1] = targetRGBA[1];
                            layer.data.data[i + 2] = targetRGBA[2];
                            layer.data.data[i + 3] = targetRGBA[3];
                        }
                    }
                });
                updateThumbnail(frameIndex); 
            });
            
            compositeLayersToCanvas();
            renderLayerList();
            updatePalette();
            
            // Deactivate swap tool and clear UI
            document.getElementById('swap-info').innerHTML = '';
            const swapBtn = document.getElementById('swap-btn');
            if (swapBtn) {
                swapBtn.classList.remove('tool-active');
            }
            updateToolStatus('');
            
            alert(`Color swap complete!\n${sourceHex} → ${targetHex} across all frames and layers!`);
        }
        
        function applyColorSwapAllFrames(sourceColor) {
            // Legacy function for clicking pixels
            const [r, g, b, a] = sourceColor;
            const sourceHex = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
            const targetHex = document.getElementById('swap-target-hex').value.trim();
            applyColorSwapByHex(sourceHex, targetHex);
        }

        let animationFrame = 0;
        
        function togglePreviewLoop() {
            if (isPreviewPlaying) {
                clearInterval(previewInterval);
                playPauseBtn.textContent = 'Play Preview';
                playPauseBtn.style.backgroundColor = '#28a745';
                isPreviewPlaying = false;
            } else {
                startPreviewLoop();
                playPauseBtn.textContent = 'Pause Preview';
                playPauseBtn.style.backgroundColor = '#dc3545'; 
                isPreviewPlaying = true;
            }
        }

        function startPreviewLoop() {
            clearInterval(previewInterval);
            playPauseBtn.textContent = 'Pause Preview';
            playPauseBtn.style.backgroundColor = '#dc3545'; 
            isPreviewPlaying = true;
            updateAnimationPreview(); // Start immediately
        }

        function updateAnimationPreview() {
            if (frames.length === 0 || !isPreviewPlaying) return;
            
            const animationPreviewCtx = document.getElementById('animation-preview').getContext('2d');
            animationPreviewCtx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
            
            // Composite all layers for the current animation frame
            const compositeData = compositeSingleFrameLayers(animationFrame);
            const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            tempCtx.putImageData(compositeData, 0, 0);
            animationPreviewCtx.imageSmoothingEnabled = false;
            animationPreviewCtx.drawImage(tempCanvas, 0, 0, GRID_WIDTH, GRID_HEIGHT, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
            document.getElementById('preview-frame-index').textContent = animationFrame + 1;
            
            // Get frame-specific duration or use default
            const defaultSpeed = parseInt(document.getElementById('frame-speed').value);
            const baseDuration = frameDurations[animationFrame] || defaultSpeed;
            const frameDuration = baseDuration / playbackSpeedMultiplier;
            const fps = (1000 / frameDuration).toFixed(1);
            document.getElementById('preview-fps').textContent = `~${fps}`;
            
            // Move to next frame with loop point support
            animationFrame = (animationFrame + 1);
            const endFrame = (loopEndFrame === -1) ? frames.length - 1 : Math.min(loopEndFrame, frames.length - 1);
            if (animationFrame > endFrame) {
                animationFrame = loopStartFrame;
            }
            
            // Schedule next frame with current frame's duration
            if (isPreviewPlaying) {
                setTimeout(updateAnimationPreview, frameDuration);
            }
        }
        
        function updatePlaybackSpeed() {
            playbackSpeedMultiplier = parseFloat(document.getElementById('playback-speed-multiplier').value);
            if (isPreviewPlaying) {
                startPreviewLoop();
            }
        }
        
        async function setLoopPoint() {
            const choice = await styledPrompt(`Loop Settings:

Current: Start=${loopStartFrame}, End=${loopEndFrame === -1 ? 'Last Frame' : loopEndFrame}

Options:
1 = Set CURRENT frame as loop START (${currentFrameIndex})
2 = Set CURRENT frame as loop END (${currentFrameIndex})
3 = Reset to full animation (0 to end)

Enter choice:`, '', '🔄 Loop Settings');
            
            switch(choice) {
                case '1':
                    loopStartFrame = currentFrameIndex;
                    alert(`Loop start set to frame ${currentFrameIndex}`);
                    break;
                case '2':
                    loopEndFrame = currentFrameIndex;
                    alert(`Loop end set to frame ${currentFrameIndex}`);
                    break;
                case '3':
                    loopStartFrame = 0;
                    loopEndFrame = -1;
                    alert('Loop reset to full animation');
                    break;
            }
        }

        // --- CUSTOM BRUSH EDITOR ---
        
        window.createCustomBrush = async function() {
            const result = await styledPrompt('Custom brush size (4-16 pixels):', '8', '🖌️ Create Custom Brush');
            const size = parseInt(result);
            if (!size || size < 4 || size > 16) return;
            
            customBrushSize = size;
            customBrushPattern = [];
            for (let y = 0; y < size; y++) {
                customBrushPattern[y] = new Array(size).fill(false);
            }
            
            // Create editor dialog
            let html = `<div id="brush-editor" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 3px solid #9c27b0; border-radius: 10px; z-index: 10000; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0;">Custom Brush Editor (${size}×${size})</h3>
                <div style="padding: 10px; background-color: #e3f2fd; border: 2px solid #2196f3; border-radius: 4px; margin-bottom: 15px; text-align: center;">
                    <strong style="color: #1565c0;">🖌️ Instructions:</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #333;">Left click pixels to toggle ON (black) or OFF (white). Black pixels will be drawn when you use this brush. Click "Save Brush" when done to use it!</p>
                </div>
                <div id="brush-grid" style="display: grid; grid-template-columns: repeat(${size}, 30px); gap: 2px; background: #f0f0f0; padding: 10px; border: 2px solid #ccc;">`;
            
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    html += `<div onclick="toggleBrushPixel(${x}, ${y})" id="brush-px-${x}-${y}" style="width: 30px; height: 30px; background: #fff; border: 1px solid #999; cursor: pointer;"></div>`;
                }
            }
            
            html += `</div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="saveBrushPattern()" style="flex: 1; background: #28a745; border: none; color: white; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">Save Brush</button>
                    <button onclick="cancelBrushEditor()" style="flex: 1; background: #dc3545; border: none; color: white; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">Cancel</button>
                </div>
            </div>
            <div id="brush-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999;" onclick="cancelBrushEditor()"></div>`;
            
            document.body.insertAdjacentHTML('beforeend', html);
        }
        
        window.toggleBrushPixel = function(x, y) {
            customBrushPattern[y][x] = !customBrushPattern[y][x];
            const el = document.getElementById(`brush-px-${x}-${y}`);
            el.style.background = customBrushPattern[y][x] ? '#000' : '#fff';
        };
        
        window.saveBrushPattern = function() {
            document.getElementById('brush-shape-select').value = 'custom';
            updateBrushShape('custom');
            cancelBrushEditor();
            alert(`Custom brush saved! (${customBrushSize}×${customBrushSize})\n\nSelect "Custom..." from brush shape dropdown to use it.`);
        };
        
        window.cancelBrushEditor = function() {
            const editor = document.getElementById('brush-editor');
            const overlay = document.getElementById('brush-overlay');
            if (editor) editor.remove();
            if (overlay) overlay.remove();
        };
        
        // --- SAVE/LOAD CUSTOM BRUSH ---
        
        window.saveCustomBrush = async function() {
            if (!customBrushPattern || customBrushPattern.length === 0) {
                alert('No custom brush to save! Create a custom brush first.');
                return;
            }
            
            const brushData = {
                version: '1.0',
                size: customBrushSize,
                pattern: customBrushPattern,
                created: new Date().toISOString()
            };
            
            const brushName = await styledPrompt('Enter a name for this brush:', 'MyCustomBrush', '💾 Save Custom Brush');
            if (!brushName) return;
            
            const jsonString = JSON.stringify(brushData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${brushName}.brush`;
            link.click();
            URL.revokeObjectURL(url);
            
            alert(`Custom brush saved as "${brushName}.brush"!`);
        };
        
        window.loadCustomBrush = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const brushData = JSON.parse(e.target.result);
                    
                    // Validate brush data
                    if (!brushData.pattern || !Array.isArray(brushData.pattern)) {
                        throw new Error('Invalid brush file format');
                    }
                    
                    if (brushData.size < 1 || brushData.size > 32) {
                        throw new Error('Invalid brush size');
                    }
                    
                    // Validate pattern is a 2D array of booleans
                    for (let y = 0; y < brushData.pattern.length; y++) {
                        if (!Array.isArray(brushData.pattern[y])) {
                            throw new Error('Invalid brush pattern');
                        }
                    }
                    
                    // Load the brush
                    customBrushSize = brushData.size;
                    customBrushPattern = brushData.pattern;
                    
                    // Automatically switch to custom brush
                    document.getElementById('brush-shape-select').value = 'custom';
                    updateBrushShape('custom');
                    
                    alert(`Custom brush loaded successfully! (${customBrushSize}×${customBrushSize})\n\nBrush shape set to "Custom".`);
                    
                } catch (error) {
                    alert('Error loading brush file: ' + error.message);
                }
            };
            reader.readAsText(file);
            
            // Reset input so same file can be loaded again
            event.target.value = '';
        };
        
        // --- PERSPECTIVE TRANSFORM ---
        
        async function perspectiveTransform() {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            const result = await styledPrompt('Perspective skew (-1.0 to +1.0):\n\n-1.0 = Skew left\n0 = No skew\n+1.0 = Skew right', '0.5', '📐 Perspective Transform');
            const skew = parseFloat(result);
            if (isNaN(skew)) return;
            
            saveState('transform');
            
            // Create temp canvas with current layer
            const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            tempCtx.putImageData(currentLayer.data, 0, 0);
            
            // Create result canvas
            const { canvas: resultCanvas, ctx: resultCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            
            // Apply perspective transform
            resultCtx.setTransform(1, skew * 0.3, 0, 1, 0, 0);
            resultCtx.drawImage(tempCanvas, 0, 0);
            resultCtx.setTransform(1, 0, 0, 1, 0, 0);
            
            currentLayer.data = resultCtx.getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT);
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            alert('Perspective transform applied!');
        }
        
        // --- ANIMATION TIMELINE ---
        
        function toggleTimelineView() {
            const enabled = document.getElementById('timeline-view-enabled').checked;
            const container = document.getElementById('timeline-container');
            if (container) {
                container.style.display = enabled ? 'block' : 'none';
                if (enabled) updateTimeline();
            }
        }
        
        function updateTimeline() {
            const scrubber = document.getElementById('timeline-scrubber');
            const current = document.getElementById('timeline-current');
            const total = document.getElementById('timeline-total');
            
            if (scrubber) {
                scrubber.max = Math.max(0, frames.length - 1);
                scrubber.value = currentFrameIndex;
            }
            if (current) current.textContent = currentFrameIndex + 1;
            if (total) total.textContent = frames.length;
        }
        
        function scrubToFrame(index) {
            if (index < 0) index = 0;
            if (index >= frames.length) index = frames.length - 1;
            if (index !== currentFrameIndex) {
                loadFrame(index);
                updateTimeline();
            }
        }
        // --- LAYER MANAGEMENT (FRAME-BASED) ---
        
        function getCurrentLayers() {
            if (!frameLayers[currentFrameIndex]) {
                frameLayers[currentFrameIndex] = [];
            }
            return frameLayers[currentFrameIndex];
        }
        
        function addLayer() {
            saveState(); // Save before adding layer
            const layers = getCurrentLayers();
            
            // Create ImageData from canvas context for maximum compatibility
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = GRID_WIDTH;
            tempCanvas.height = GRID_HEIGHT;
            const tempCtx = tempCanvas.getContext('2d');
            
            const newLayer = {
                name: `Layer ${layers.length + 1}`,
                data: tempCtx.createImageData(GRID_WIDTH, GRID_HEIGHT),
                visible: true,
                    opacity: 1.0,
                    blendMode: 'normal',
                    mask: null,  // Layer mask (ImageData or null)
                    maskEnabled: false,
                    effects: {
                        dropShadow: false,
                        glow: false,
                        stroke: false,
                        shadowColor: '#000000',
                        glowColor: '#FFFFFF',
                        strokeColor: '#000000'
                    }
            };
            // Add new layer on top (highest index)
            layers.push(newLayer);
            currentLayerIndex = layers.length - 1;
            renderLayerList();
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        function deleteLayer() {
            const layers = getCurrentLayers();
            if (layers.length <= 1) {
                alert("Cannot delete the only layer.");
                return;
            }
            saveState(); // Save before deleting layer
            layers.splice(currentLayerIndex, 1);
            if (currentLayerIndex >= layers.length) {
                currentLayerIndex = layers.length - 1;
            }
            renderLayerList();
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        function selectLayer(index) {
            // Exit mask editing mode when switching layers
            if (maskEditingMode && index !== currentLayerIndex) {
                maskEditingMode = false;
                updateToolStatus('');
                const toolDisplay = document.getElementById('current-tool-display');
                if (toolDisplay) {
                    const isDarkMode = document.getElementById('dark-mode-enabled')?.checked || false;
                    toolDisplay.style.borderColor = isDarkMode ? '#4a90e2' : '#2196f3';
                    toolDisplay.style.backgroundColor = isDarkMode ? '#1e3a5f' : '#e3f2fd';
                }
            }
            
            // Reset drawing state when switching layers to prevent stuck input
            if (index !== currentLayerIndex) {
                isDrawing = false;
                lastGridX = -1;
                lastGridY = -1;
            }
            
            currentLayerIndex = index;
            renderLayerList();
            compositeLayersToCanvas();
        }
        
        function toggleLayerVisibility(index) {
            saveState(); // Save before toggling visibility
            const layers = getCurrentLayers();
            layers[index].visible = !layers[index].visible;
            renderLayerList();
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        function updateLayerOpacity(index, opacity) {
            const layers = getCurrentLayers();
            if (!layers[index]) return;
            
            layers[index].opacity = Math.max(0, Math.min(1, opacity));
            
            // Update the display value
            const opacityValueSpan = document.getElementById(`opacity-value-${index}`);
            if (opacityValueSpan) {
                opacityValueSpan.textContent = Math.round(opacity * 100) + '%';
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        function updateLayerBlendMode(index, blendMode) {
            const layers = getCurrentLayers();
            if (!layers[index]) return;
            
            layers[index].blendMode = blendMode;
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        function toggleLayerMask(index) {
            const layers = getCurrentLayers();
            const layer = layers[index];
            if (!layer) return;
            
            saveState(); // Save before toggling mask
            
            if (!layer.mask) {
                // Create new mask (white = visible, black = hidden)
                layer.mask = new ImageData(GRID_WIDTH, GRID_HEIGHT);
                // Initialize as fully visible (white = 255,255,255,255)
                for (let i = 0; i < layer.mask.data.length; i++) {
                    layer.mask.data[i] = 255;
                }
                layer.maskEnabled = true;
            } else {
                // Toggle mask on/off
                layer.maskEnabled = !layer.maskEnabled;
            }
            
            renderLayerList();
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        function toggleMaskEditingMode(layerIndex) {
            const layers = getCurrentLayers();
            const layer = layers[layerIndex];
            if (!layer) return;
            
            // Can only edit mask if mask exists and is enabled
            if (!layer.mask || !layer.maskEnabled) {
                alert('Please enable the layer mask first by clicking the mask icon (🎭)');
                return;
            }
            
            // Make sure we're on the correct layer
            if (currentLayerIndex !== layerIndex) {
                selectLayer(layerIndex);
            }
            
            maskEditingMode = !maskEditingMode;
            
            // Reset mask paint color to black when entering mask editing mode
            if (maskEditingMode) {
                maskPaintColor = '#000000';
            }
            
            // Update UI to show mask editing mode
            updateToolStatus(maskEditingMode ? 
                '🎭 MASK EDITING - Paint with BLACK (hide) - Scroll to switch - Right-click to exit' : 
                'Layer editing mode');
            
            // Visual feedback on current tool display
            const toolDisplay = document.getElementById('current-tool-display');
            if (toolDisplay) {
                if (maskEditingMode) {
                    toolDisplay.style.borderColor = '#ff9800';
                    toolDisplay.style.backgroundColor = '#fff3cd';
                    toolDisplay.style.fontWeight = 'bold';
                } else {
                    const isDarkMode = document.getElementById('dark-mode-enabled')?.checked || false;
                    toolDisplay.style.borderColor = isDarkMode ? '#4a90e2' : '#2196f3';
                    toolDisplay.style.backgroundColor = isDarkMode ? '#1e3a5f' : '#e3f2fd';
                    toolDisplay.style.fontWeight = 'bold';
                }
            }
            
            renderLayerList(); // Refresh to show editing indicator
        }
        
        function showLayerEffectsDialog(index) {
            const layers = getCurrentLayers();
            const layer = layers[index];
            if (!layer) return;
            
            if (!layer.effects) {
                layer.effects = {
                    dropShadow: false,
                    glow: false,
                    stroke: false,
                    shadowColor: '#000000',
                    glowColor: '#FFFFFF',
                    strokeColor: '#000000'
                };
            }
            
            // Create modal overlay
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            // Create modal content
            const content = document.createElement('div');
            content.style.cssText = `
                background: #2c2c2c;
                color: #fff;
                padding: 30px;
                border-radius: 10px;
                min-width: 400px;
                max-width: 500px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            `;
            
            // Update function to refresh button states
            const updateButtons = () => {
                const shadowBtn = document.getElementById('effectDropShadow');
                const glowBtn = document.getElementById('effectGlow');
                const strokeBtn = document.getElementById('effectStroke');
                
                if (shadowBtn) {
                    shadowBtn.textContent = `🌑 Drop Shadow: ${layer.effects.dropShadow ? 'ON' : 'OFF'}`;
                    shadowBtn.style.background = layer.effects.dropShadow ? '#4CAF50' : '#666';
                }
                if (glowBtn) {
                    glowBtn.textContent = `✨ Outer Glow: ${layer.effects.glow ? 'ON' : 'OFF'}`;
                    glowBtn.style.background = layer.effects.glow ? '#4CAF50' : '#666';
                }
                if (strokeBtn) {
                    strokeBtn.textContent = `⬛ Stroke: ${layer.effects.stroke ? 'ON' : 'OFF'}`;
                    strokeBtn.style.background = layer.effects.stroke ? '#4CAF50' : '#666';
                }
            };
            
            content.innerHTML = `
                <h2 style="margin: 0 0 20px 0; text-align: center; color: #4CAF50;">✨ Layer Effects</h2>
                <h3 style="margin: 0 0 20px 0; text-align: center; color: #aaa; font-weight: normal; font-size: 16px;">"${layer.name}"</h3>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px;">
                    <button id="effectDropShadow" style="
                        padding: 15px;
                        font-size: 16px;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    ">🌑 Drop Shadow: ${layer.effects.dropShadow ? 'ON' : 'OFF'}</button>
                    
                    <button id="effectGlow" style="
                        padding: 15px;
                        font-size: 16px;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    ">✨ Outer Glow: ${layer.effects.glow ? 'ON' : 'OFF'}</button>
                    
                    <button id="effectStroke" style="
                        padding: 15px;
                        font-size: 16px;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s;
                    ">⬛ Stroke: ${layer.effects.stroke ? 'ON' : 'OFF'}</button>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="effectAllOff" style="
                        padding: 12px 20px;
                        font-size: 14px;
                        background: #f44336;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                    ">🚫 All OFF</button>
                    
                    <button id="closeEffectsModal" style="
                        padding: 12px 30px;
                        font-size: 14px;
                        background: #2196F3;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-weight: bold;
                    ">Close</button>
                </div>
            `;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Initialize button colors
            updateButtons();
            
            // Toggle Drop Shadow
            document.getElementById('effectDropShadow').onclick = () => {
                saveState();
                    layer.effects.dropShadow = !layer.effects.dropShadow;
                updateButtons();
                renderLayerList();
                compositeLayersToCanvas();
                updateThumbnail(currentFrameIndex);
                updateAnimationPreview();
            };
            
            // Toggle Outer Glow
            document.getElementById('effectGlow').onclick = () => {
                saveState();
                    layer.effects.glow = !layer.effects.glow;
                updateButtons();
                renderLayerList();
                compositeLayersToCanvas();
                updateThumbnail(currentFrameIndex);
                updateAnimationPreview();
            };
            
            // Toggle Stroke
            document.getElementById('effectStroke').onclick = () => {
                saveState();
                    layer.effects.stroke = !layer.effects.stroke;
                updateButtons();
                renderLayerList();
                compositeLayersToCanvas();
                updateThumbnail(currentFrameIndex);
                updateAnimationPreview();
            };
            
            // All OFF button
            document.getElementById('effectAllOff').onclick = () => {
                saveState();
                    layer.effects.dropShadow = false;
                    layer.effects.glow = false;
                    layer.effects.stroke = false;
                updateButtons();
            renderLayerList();
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
            };
            
            // Close button
            document.getElementById('closeEffectsModal').onclick = () => {
                document.body.removeChild(modal);
            };
            
            // Close on overlay click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            };
            
            // Close on ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
        
        function applyBlendMode(basePixel, layerPixel, blendMode, opacity) {
            // basePixel and layerPixel are [r, g, b, a] arrays
            const [br, bg, bb, ba] = basePixel;
            const [lr, lg, lb, la] = layerPixel;
            
            // If layer pixel is fully transparent, return base
            if (la === 0) return basePixel;
            
            // If base is transparent, use normal blending (no complex blend modes on empty pixels)
            if (ba === 0) {
                blendMode = 'normal';
            }
            
            let resultR = lr, resultG = lg, resultB = lb;
            
            // Apply blend mode
            switch(blendMode) {
                case 'multiply':
                    resultR = (br * lr) / 255;
                    resultG = (bg * lg) / 255;
                    resultB = (bb * lb) / 255;
                    break;
                    
                case 'screen':
                    resultR = 255 - ((255 - br) * (255 - lr)) / 255;
                    resultG = 255 - ((255 - bg) * (255 - lg)) / 255;
                    resultB = 255 - ((255 - bb) * (255 - lb)) / 255;
                    break;
                    
                case 'overlay':
                    resultR = br < 128 ? (2 * br * lr) / 255 : 255 - (2 * (255 - br) * (255 - lr)) / 255;
                    resultG = bg < 128 ? (2 * bg * lg) / 255 : 255 - (2 * (255 - bg) * (255 - lg)) / 255;
                    resultB = bb < 128 ? (2 * bb * lb) / 255 : 255 - (2 * (255 - bb) * (255 - lb)) / 255;
                    break;
                    
                case 'add':
                    resultR = Math.min(255, br + lr);
                    resultG = Math.min(255, bg + lg);
                    resultB = Math.min(255, bb + lb);
                    break;
                    
                case 'subtract':
                    resultR = Math.max(0, br - lr);
                    resultG = Math.max(0, bg - lg);
                    resultB = Math.max(0, bb - lb);
                    break;
                    
                case 'darken':
                    resultR = Math.min(br, lr);
                    resultG = Math.min(bg, lg);
                    resultB = Math.min(bb, lb);
                    break;
                    
                case 'lighten':
                    resultR = Math.max(br, lr);
                    resultG = Math.max(bg, lg);
                    resultB = Math.max(bb, lb);
                    break;
                    
                case 'difference':
                    resultR = Math.abs(br - lr);
                    resultG = Math.abs(bg - lg);
                    resultB = Math.abs(bb - lb);
                    break;
                    
                case 'exclusion':
                    resultR = br + lr - 2 * br * lr / 255;
                    resultG = bg + lg - 2 * bg * lg / 255;
                    resultB = bb + lb - 2 * bb * lb / 255;
                    break;
                    
                case 'hue':
                    // Replace hue from layer, keep saturation/lightness from base
                    const [baseH, baseS, baseL] = rgbToHsl(br, bg, bb);
                    const [layerH, layerS, layerL] = rgbToHsl(lr, lg, lb);
                    const [newR, newG, newB] = hslToRgb(layerH, baseS, baseL);
                    resultR = newR;
                    resultG = newG;
                    resultB = newB;
                    break;
                    
                case 'saturation':
                    // Replace saturation from layer, keep hue/lightness from base
                    const [bH, bS, bL] = rgbToHsl(br, bg, bb);
                    const [lH, lS, lL] = rgbToHsl(lr, lg, lb);
                    const [nR, nG, nB] = hslToRgb(bH, lS, bL);
                    resultR = nR;
                    resultG = nG;
                    resultB = nB;
                    break;
                    
                case 'colordodge':
                    resultR = br === 255 ? 255 : Math.min(255, (lr * 255) / (255 - br));
                    resultG = bg === 255 ? 255 : Math.min(255, (lg * 255) / (255 - bg));
                    resultB = bb === 255 ? 255 : Math.min(255, (lb * 255) / (255 - bb));
                    break;
                    
                case 'colorburn':
                    resultR = lr === 0 ? 0 : Math.max(0, 255 - ((255 - br) * 255) / lr);
                    resultG = lg === 0 ? 0 : Math.max(0, 255 - ((255 - bg) * 255) / lg);
                    resultB = lb === 0 ? 0 : Math.max(0, 255 - ((255 - bb) * 255) / lb);
                    break;
                    
                case 'vividlight':
                    resultR = lr < 128 ? (lr === 0 ? 0 : Math.max(0, 255 - ((255 - br) * 255) / (2 * lr))) : (lr === 255 ? 255 : Math.min(255, (br * 255) / (2 * (255 - lr))));
                    resultG = lg < 128 ? (lg === 0 ? 0 : Math.max(0, 255 - ((255 - bg) * 255) / (2 * lg))) : (lg === 255 ? 255 : Math.min(255, (bg * 255) / (2 * (255 - lg))));
                    resultB = lb < 128 ? (lb === 0 ? 0 : Math.max(0, 255 - ((255 - bb) * 255) / (2 * lb))) : (lb === 255 ? 255 : Math.min(255, (bb * 255) / (2 * (255 - lb))));
                    break;
                    
                case 'linearlight':
                    resultR = Math.max(0, Math.min(255, br + 2 * lr - 255));
                    resultG = Math.max(0, Math.min(255, bg + 2 * lg - 255));
                    resultB = Math.max(0, Math.min(255, bb + 2 * lb - 255));
                    break;
                    
                case 'softlight':
                    resultR = lr < 128 ? br - ((255 - br) * (128 - lr) / 128) : br + (br * (lr - 128) / 128);
                    resultG = lg < 128 ? bg - ((255 - bg) * (128 - lg) / 128) : bg + (bg * (lg - 128) / 128);
                    resultB = lb < 128 ? bb - ((255 - bb) * (128 - lb) / 128) : bb + (bb * (lb - 128) / 128);
                    break;
                    
                case 'hardlight':
                    resultR = lr < 128 ? (2 * br * lr) / 255 : 255 - (2 * (255 - br) * (255 - lr)) / 255;
                    resultG = lg < 128 ? (2 * bg * lg) / 255 : 255 - (2 * (255 - bg) * (255 - lg)) / 255;
                    resultB = lb < 128 ? (2 * bb * lb) / 255 : 255 - (2 * (255 - bb) * (255 - lb)) / 255;
                    break;
                    
                case 'pinlight':
                    resultR = lr < 128 ? Math.min(br, 2 * lr) : Math.max(br, 2 * (lr - 128));
                    resultG = lg < 128 ? Math.min(bg, 2 * lg) : Math.max(bg, 2 * (lg - 128));
                    resultB = lb < 128 ? Math.min(bb, 2 * lb) : Math.max(bb, 2 * (lb - 128));
                    break;
                    
                case 'hardmix':
                    resultR = (br + lr < 255) ? 0 : 255;
                    resultG = (bg + lg < 255) ? 0 : 255;
                    resultB = (bb + lb < 255) ? 0 : 255;
                    break;
                    
                case 'normal':
                default:
                    // Normal blend - just use layer pixel
                    break;
            }
            
            // Alpha blending with layer opacity
            const effectiveAlpha = (la / 255) * opacity;
            const finalR = Math.round(br * (1 - effectiveAlpha) + resultR * effectiveAlpha);
            const finalG = Math.round(bg * (1 - effectiveAlpha) + resultG * effectiveAlpha);
            const finalB = Math.round(bb * (1 - effectiveAlpha) + resultB * effectiveAlpha);
            const finalA = Math.min(255, ba + la * opacity);
            
            return [finalR, finalG, finalB, finalA];
        }
        
        function renderLayerList() {
            const layerListDiv = document.getElementById('layer-list');
            layerListDiv.innerHTML = '';
            const layers = getCurrentLayers();
            
            // Check if dark mode is enabled
            const isDarkMode = document.getElementById('dark-mode-enabled')?.checked || false;
            
            // Render layers in reverse order (top to bottom = highest index first)
            // But composite in forward order (Layer 0 on bottom, higher indices on top)
            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                const index = i;
                
                const layerDiv = document.createElement('div');
                const activeBg = isDarkMode ? '#1e3a5f' : '#e7f3ff';
                const inactiveBg = isDarkMode ? '#2d2d2d' : '#f9f9f9';
                layerDiv.style.cssText = 'display: flex; flex-direction: column; gap: 5px; padding: 5px; margin: 2px 0; background-color: ' + (index === currentLayerIndex ? activeBg : inactiveBg) + '; border-radius: 3px;';
                layerDiv.dataset.layerIndex = index;
                layerDiv.className = 'layer-item' + (index === currentLayerIndex ? ' active' : '');
                
                // Top row: controls and name
                const topRow = document.createElement('div');
                topRow.style.cssText = 'display: flex; align-items: center; gap: 5px; cursor: pointer;';
                topRow.onclick = () => selectLayer(index);
                
                // Drop events on the layer div (can drop onto any layer)
                layerDiv.ondragover = (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                };
                
                layerDiv.ondrop = (e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIndex = index;
                    
                    if (fromIndex !== toIndex) {
                        reorderLayers(fromIndex, toIndex);
                    }
                };
                
                // Drag handle icon - ONLY this is draggable
                const dragHandle = document.createElement('span');
                dragHandle.innerHTML = '&#9776;'; // ☰ hamburger menu
                const iconColor = isDarkMode ? '#aaa' : '#666';
                dragHandle.style.cssText = 'cursor: grab; font-size: 1.2em; color: ' + iconColor + '; user-select: none;';
                dragHandle.title = 'Drag to reorder';
                dragHandle.draggable = true;
                
                // Drag events ONLY on the drag handle
                dragHandle.ondragstart = (e) => {
                    e.stopPropagation();
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', index);
                    layerDiv.style.opacity = '0.5';
                };
                
                dragHandle.ondragend = (e) => {
                    layerDiv.style.opacity = '1';
                };
                
                const visToggle = document.createElement('span');
                visToggle.innerHTML = layer.visible ? '&#128065;' : '&#128683;'; // 👁 : 🚫
                visToggle.style.cursor = 'pointer';
                visToggle.onclick = (e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(index);
                };
                
                const maskToggle = document.createElement('span');
                maskToggle.innerHTML = layer.maskEnabled ? '🎭' : '⬜';
                maskToggle.style.cssText = 'cursor: pointer; font-size: 0.9em;';
                maskToggle.title = layer.maskEnabled ? 'Mask ON - Click to disable' : 'Mask OFF - Click to enable';
                maskToggle.onclick = (e) => {
                    e.stopPropagation();
                    toggleLayerMask(index);
                };
                
                // Edit Mask button (only show if mask is enabled)
                const maskEditButton = document.createElement('span');
                if (layer.maskEnabled && layer.mask) {
                    const isEditingThisMask = (maskEditingMode && index === currentLayerIndex);
                    maskEditButton.innerHTML = isEditingThisMask ? '✏️' : '🖊️';
                    maskEditButton.style.cssText = 'cursor: pointer; font-size: 0.8em;' + (isEditingThisMask ? ' opacity: 1; filter: drop-shadow(0 0 2px #ff9800);' : '');
                    maskEditButton.title = isEditingThisMask ? 'Stop editing mask' : 'Edit mask (paint to hide/reveal)';
                    maskEditButton.onclick = (e) => {
                        e.stopPropagation();
                        toggleMaskEditingMode(index);
                    };
                } else {
                    maskEditButton.style.display = 'none';
                }
                
                const effectsToggle = document.createElement('span');
                const hasEffects = layer.effects && (layer.effects.dropShadow || layer.effects.glow || layer.effects.stroke);
                effectsToggle.innerHTML = hasEffects ? '✨' : '🔘';
                effectsToggle.style.cssText = 'cursor: pointer; font-size: 0.9em;';
                effectsToggle.title = 'Layer Effects';
                effectsToggle.onclick = (e) => {
                    e.stopPropagation();
                    showLayerEffectsDialog(index);
                };
                
                // Layer thumbnail
                const thumbCanvas = document.createElement('canvas');
                thumbCanvas.width = 24;
                thumbCanvas.height = 24;
                const borderColor = isDarkMode ? '#555' : '#ccc';
                thumbCanvas.style.cssText = 'border: 1px solid ' + borderColor + '; image-rendering: pixelated; flex-shrink: 0;';
                const thumbCtx = thumbCanvas.getContext('2d');
                thumbCtx.imageSmoothingEnabled = false;
                const { canvas: layerPreview, ctx: layerPreviewCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                layerPreviewCtx.putImageData(layer.data, 0, 0);
                thumbCtx.drawImage(layerPreview, 0, 0, GRID_WIDTH, GRID_HEIGHT, 0, 0, 24, 24);
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = layer.name;
                const textColor = isDarkMode ? '#e0e0e0' : '#000';
                nameSpan.style.cssText = 'cursor: text; flex: 1; min-width: 0; color: ' + textColor + ';';
                nameSpan.ondblclick = (e) => {
                    e.stopPropagation();
                    renameLayer(index);
                };
                
                topRow.appendChild(dragHandle);
                topRow.appendChild(thumbCanvas);
                topRow.appendChild(visToggle);
                topRow.appendChild(maskToggle);
                topRow.appendChild(maskEditButton);
                topRow.appendChild(effectsToggle);
                topRow.appendChild(nameSpan);
                
                // Bottom row: opacity slider and blend mode
                const controlsRow = document.createElement('div');
                controlsRow.style.cssText = 'display: flex; flex-direction: column; gap: 3px; padding-left: 5px;';
                controlsRow.onclick = (e) => e.stopPropagation();
                
                // Opacity controls
                const opacityRow = document.createElement('div');
                opacityRow.style.cssText = 'display: flex; align-items: center; gap: 5px;';
                
                const opacityLabel = document.createElement('span');
                opacityLabel.textContent = 'Opacity:';
                const labelColor = isDarkMode ? '#aaa' : '#666';
                opacityLabel.style.cssText = 'font-size: 0.7em; color: ' + labelColor + '; white-space: nowrap; min-width: 50px;';
                
                const opacitySlider = document.createElement('input');
                opacitySlider.type = 'range';
                opacitySlider.min = '0';
                opacitySlider.max = '100';
                opacitySlider.value = Math.round(layer.opacity * 100);
                opacitySlider.style.cssText = 'flex: 1; height: 4px; margin: 0;';
                opacitySlider.oninput = (e) => {
                    e.stopPropagation();
                    updateLayerOpacity(index, parseInt(e.target.value) / 100);
                };
                
                const opacityValue = document.createElement('span');
                opacityValue.textContent = Math.round(layer.opacity * 100) + '%';
                opacityValue.style.cssText = 'font-size: 0.7em; color: ' + labelColor + '; min-width: 30px; text-align: right;';
                opacityValue.id = `opacity-value-${index}`;
                
                opacityRow.appendChild(opacityLabel);
                opacityRow.appendChild(opacitySlider);
                opacityRow.appendChild(opacityValue);
                
                // Blend mode controls
                const blendRow = document.createElement('div');
                blendRow.style.cssText = 'display: flex; align-items: center; gap: 5px;';
                
                const blendLabel = document.createElement('span');
                blendLabel.textContent = 'Blend:';
                blendLabel.style.cssText = 'font-size: 0.7em; color: ' + labelColor + '; white-space: nowrap; min-width: 50px;';
                
                const blendSelect = document.createElement('select');
                const selectBg = isDarkMode ? '#1a1a1a' : '#fff';
                const selectColor = isDarkMode ? '#e0e0e0' : '#000';
                blendSelect.style.cssText = 'flex: 1; font-size: 0.7em; padding: 2px; border: 1px solid ' + borderColor + '; border-radius: 3px; background-color: ' + selectBg + '; color: ' + selectColor + ';';
                blendSelect.innerHTML = `
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="add">Add</option>
                    <option value="subtract">Subtract</option>
                    <option value="darken">Darken</option>
                    <option value="lighten">Lighten</option>
                    <option value="difference">Difference</option>
                    <option value="exclusion">Exclusion</option>
                    <option value="hue">Hue</option>
                    <option value="saturation">Saturation</option>
                    <option value="colordodge">Color Dodge</option>
                    <option value="colorburn">Color Burn</option>
                    <option value="vividlight">Vivid Light</option>
                    <option value="linearlight">Linear Light</option>
                    <option value="softlight">Soft Light</option>
                    <option value="hardlight">Hard Light</option>
                    <option value="pinlight">Pin Light</option>
                    <option value="hardmix">Hard Mix</option>
                `;
                blendSelect.value = layer.blendMode || 'normal';
                blendSelect.onchange = (e) => {
                    e.stopPropagation();
                    updateLayerBlendMode(index, e.target.value);
                };
                
                blendRow.appendChild(blendLabel);
                blendRow.appendChild(blendSelect);
                
                controlsRow.appendChild(opacityRow);
                controlsRow.appendChild(blendRow);
                
                layerDiv.appendChild(topRow);
                layerDiv.appendChild(controlsRow);
                layerListDiv.appendChild(layerDiv);
            }
        }
        
        function reorderLayers(fromIndex, toIndex) {
            saveState(); // Save before reordering
            const layers = getCurrentLayers();
            const [movedLayer] = layers.splice(fromIndex, 1);
            layers.splice(toIndex, 0, movedLayer);
            
            // Update current layer index if needed
            if (currentLayerIndex === fromIndex) {
                currentLayerIndex = toIndex;
            } else if (fromIndex < currentLayerIndex && toIndex >= currentLayerIndex) {
                currentLayerIndex--;
            } else if (fromIndex > currentLayerIndex && toIndex <= currentLayerIndex) {
                currentLayerIndex++;
            }
            
            // Reset drawing state when reordering layers to prevent stuck input
            isDrawing = false;
            lastGridX = -1;
            lastGridY = -1;
            
            renderLayerList();
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        async function renameLayer(index) {
            const layers = getCurrentLayers();
            const newName = await styledPrompt('Enter new layer name:', layers[index].name, '✏️ Rename Layer');
            if (newName && newName.trim()) {
                saveState(); // Save before renaming
                layers[index].name = newName.trim();
                renderLayerList();
            }
        }
        
        function compositeLayersToCanvas() {
            // Composite all visible layers of current frame onto the main canvas
            // Layer 0 = bottom, higher indices = on top
            mainCtx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);
            
            const layers = getCurrentLayers();
            
            // Create a composited result using pixel-by-pixel blending
            const compositeData = compositeLayers(layers);
                    const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            tempCtx.putImageData(compositeData, 0, 0);
            
                    mainCtx.imageSmoothingEnabled = false;
                    const displayWidth = GRID_WIDTH * PIXEL_SCALE;
                    const displayHeight = GRID_HEIGHT * PIXEL_SCALE;
                    mainCtx.drawImage(tempCanvas, 0, 0, GRID_WIDTH, GRID_HEIGHT, 0, 0, displayWidth, displayHeight);
            
            // Draw onion skin AFTER current frame (so it's visible on top)
            drawOnionSkin();
                }
        
        function applyDropShadow(imageData) {
            // Simple drop shadow - offset pixels down-right
            const temp = new ImageData(new Uint8ClampedArray(imageData.data), GRID_WIDTH, GRID_HEIGHT);
            const offsetX = 1, offsetY = 1;
            
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const srcIndex = (y * GRID_WIDTH + x) * 4;
                    const destY = y + offsetY;
                    const destX = x + offsetX;
                    
                    if (destX < GRID_WIDTH && destY < GRID_HEIGHT) {
                        const destIndex = (destY * GRID_WIDTH + destX) * 4;
                        if (temp.data[srcIndex + 3] > 0 && imageData.data[destIndex + 3] === 0) {
                            // Add shadow pixel
                            imageData.data[destIndex] = 0;
                            imageData.data[destIndex + 1] = 0;
                            imageData.data[destIndex + 2] = 0;
                            imageData.data[destIndex + 3] = Math.round(temp.data[srcIndex + 3] * 0.5);
                        }
                    }
                }
            }
        }
        
        function applyGlow(imageData) {
            // Outer glow - expand alpha channel outward
            const temp = new ImageData(new Uint8ClampedArray(imageData.data), GRID_WIDTH, GRID_HEIGHT);
            
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const index = (y * GRID_WIDTH + x) * 4;
                    if (imageData.data[index + 3] === 0) { // Only glow empty pixels
                        // Check neighbors for glow
                        let maxAlpha = 0;
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const ny = y + dy, nx = x + dx;
                                if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                                    const nIndex = (ny * GRID_WIDTH + nx) * 4;
                                    maxAlpha = Math.max(maxAlpha, temp.data[nIndex + 3]);
                                }
                            }
                        }
                        
                        if (maxAlpha > 0) {
                            imageData.data[index] = 255;
                            imageData.data[index + 1] = 255;
                            imageData.data[index + 2] = 255;
                            imageData.data[index + 3] = Math.round(maxAlpha * 0.6);
                        }
                    }
                }
            }
        }
        
        function applyStroke(imageData) {
            // Outline stroke - add dark outline around non-transparent pixels
            const temp = new ImageData(new Uint8ClampedArray(imageData.data), GRID_WIDTH, GRID_HEIGHT);
            
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    const index = (y * GRID_WIDTH + x) * 4;
                    if (imageData.data[index + 3] === 0) { // Only stroke empty pixels
                        // Check if adjacent to non-transparent pixel
                        let hasNeighbor = false;
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const ny = y + dy, nx = x + dx;
                                if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                                    const nIndex = (ny * GRID_WIDTH + nx) * 4;
                                    if (temp.data[nIndex + 3] > 0) {
                                        hasNeighbor = true;
                                        break;
                                    }
                                }
                            }
                            if (hasNeighbor) break;
                        }
                        
                        if (hasNeighbor) {
                            imageData.data[index] = 0;
                            imageData.data[index + 1] = 0;
                            imageData.data[index + 2] = 0;
                            imageData.data[index + 3] = 255;
                        }
                    }
                }
            }
        }
        
        function compositeLayers(layers) {
            // Composite layers with blend modes applied pixel-by-pixel
            const result = new ImageData(GRID_WIDTH, GRID_HEIGHT);
            
            // Start with transparent base
            for (let i = 0; i < result.data.length; i++) {
                result.data[i] = 0;
            }
            
            // Render from bottom to top
            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                if (!layer.visible) continue;
                
                const blendMode = layer.blendMode || 'normal';
                const opacity = layer.opacity;
                const hasMask = layer.maskEnabled && layer.mask;
                
                // Create temp result for this layer (for effects)
                const layerResult = new ImageData(GRID_WIDTH, GRID_HEIGHT);
                
                // Composite each pixel
                for (let y = 0; y < GRID_HEIGHT; y++) {
                    for (let x = 0; x < GRID_WIDTH; x++) {
                        const index = (y * GRID_WIDTH + x) * 4;
                        
                        let layerPixel = [
                            layer.data.data[index],
                            layer.data.data[index + 1],
                            layer.data.data[index + 2],
                            layer.data.data[index + 3]
                        ];
                        
                        // Apply mask if enabled (mask RGB value controls visibility, not alpha)
                        if (hasMask) {
                            // Mask uses RGB values (average) as the mask strength
                            // Black (0,0,0) = hidden, White (255,255,255) = visible
                            const maskR = layer.mask.data[index];
                            const maskG = layer.mask.data[index + 1];
                            const maskB = layer.mask.data[index + 2];
                            const maskValue = (maskR + maskG + maskB) / 3;
                            const maskAlpha = maskValue / 255;
                            layerPixel[3] = Math.round(layerPixel[3] * maskAlpha);
                        }
                        
                        // Store layer pixel for effects processing
                        layerResult.data[index] = layerPixel[0];
                        layerResult.data[index + 1] = layerPixel[1];
                        layerResult.data[index + 2] = layerPixel[2];
                        layerResult.data[index + 3] = layerPixel[3];
                    }
                }
                
                // Apply layer effects if any
                if (layer.effects) {
                    if (layer.effects.dropShadow) applyDropShadow(layerResult);
                    if (layer.effects.glow) applyGlow(layerResult);
                    if (layer.effects.stroke) applyStroke(layerResult);
                }
                
                // Now blend the processed layer onto result
                for (let y = 0; y < GRID_HEIGHT; y++) {
                    for (let x = 0; x < GRID_WIDTH; x++) {
                        const index = (y * GRID_WIDTH + x) * 4;
                        
                        const basePixel = [
                            result.data[index],
                            result.data[index + 1],
                            result.data[index + 2],
                            result.data[index + 3]
                        ];
                        
                        const layerPixel = [
                            layerResult.data[index],
                            layerResult.data[index + 1],
                            layerResult.data[index + 2],
                            layerResult.data[index + 3]
                        ];
                        
                        const blended = applyBlendMode(basePixel, layerPixel, blendMode, opacity);
                        
                        result.data[index] = blended[0];
                        result.data[index + 1] = blended[1];
                        result.data[index + 2] = blended[2];
                        result.data[index + 3] = blended[3];
                    }
                }
            }
            
            return result;
        }
        
        function compositeSingleFrameLayers(frameIndex) {
            // Composite all layers of a specific frame and return ImageData
            // Layer 0 = bottom, higher indices = on top
            if (frameLayers[frameIndex]) {
                return compositeLayers(frameLayers[frameIndex]);
            }
            
            // Return empty ImageData if no layers
            return new ImageData(GRID_WIDTH, GRID_HEIGHT);
        }
        
        // --- SELECTION TOOLS ---
        
        function clearSelection() {
            // Clear selection completely and reset all selection state
            if (isMovingSelection && selection && selection.originalData) {
                // If moving, cancel first
                cancelSelection();
            }
            
            selection = null;
            isMovingSelection = false;
            selectionStartX = -1;
            selectionStartY = -1;
            selectionOffsetX = 0;
            selectionOffsetY = 0;
            lassoPath = [];
            circleSelectCenter = null;
            
            selectionCtx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);
            drawSelectionOverlay();
            updateSelectionInfo();
            updateCurrentToolDisplay();
        }
        
        function clearSelectionAndReset() {
            // Alias for clearSelection (now does everything)
            clearSelection();
        }
        
        function updateToolStatus(message) {
            const statusDiv = document.getElementById('tool-status');
            const statusText = document.getElementById('tool-status-text');
            
            if (message) {
                statusText.textContent = message;
                statusDiv.style.display = 'block';
            } else {
                statusDiv.style.display = 'none';
                statusText.textContent = '';
            }
        }
        
        function updateCurrentToolDisplay() {
            const toolNames = {
                'pencil': 'Pencil (Circle)',
                'pencilsquare': 'Pencil (Square)',
                'eraser': 'Eraser',
                'fill': 'Fill',
                'pattern': 'Pattern Fill',
                'dither': 'Dither',
                'clone': 'Clone Stamp',
                'blend': 'Blend',
                'depth': 'Shadow',
                'highlight': 'Highlight',
                'sharpen': 'Sharpen',
                'rainbow': 'Rainbow',
                'gradient': 'Gradient',
                'liquify': 'Liquify',
                'spray': 'Spray',
                'jumble': 'Jumble',
                'refined': '1px',
                'symmetrical': 'Symmetry',
                'rectselect': 'Rectangle',
                'circleselect': 'Circle',
                'lasso': 'Lasso',
                'colorselect': 'Color',
                'edgeselect': 'Edge Detect',
                'pan': 'Pan',
                'line': 'Line',
                'curve': 'Curve',
                'contour': 'Contour',
                'polygon': 'Polygon',
                'rectangle': 'Rectangle',
                'circle': 'Circle',
                'gradientmesh': 'Gradient Mesh',
                'beziercurve': 'Bezier Brush',
                'erasecolor': 'Erase Color',
                'magiceraser': 'Magic Eraser',
                'swap': 'Color Swap'
            };
            
            let toolName = toolNames[currentTool] || currentTool;
            
            if (selection) {
                let selType = '';
                if (selection.isLasso) selType = 'Lasso';
                else if (selection.isCircle) selType = 'Circle';
                else if (selection.isColorSelect) selType = 'Color';
                else if (selection.isEdgeSelect) selType = 'Edge Detect';
                else selType = 'Rectangle';
                
                toolName += ` + ${selType} Selection`;
            }
            
            document.getElementById('current-tool-text').textContent = toolName;
        }
        
        function updateSelectionInfo() {
            const infoDiv = document.getElementById('selection-info-display');
            const countSpan = document.getElementById('selection-pixel-count');
            
            if (selection) {
                let pixelCount = 0;
                if (selection.pixels) {
                    pixelCount = selection.pixels.length;
                } else {
                    const width = Math.abs(selection.x2 - selection.x1) + 1;
                    const height = Math.abs(selection.y2 - selection.y1) + 1;
                    pixelCount = width * height;
                }
                
                countSpan.textContent = pixelCount;
                infoDiv.style.display = 'block';
            } else {
                infoDiv.style.display = 'none';
            }
        }
        
        function drawSelectionOverlay() {
            selectionCtx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);
            
            if (selection) {
                const x1 = Math.min(selection.x1, selection.x2);
                const y1 = Math.min(selection.y1, selection.y2);
                const x2 = Math.max(selection.x1, selection.x2);
                const y2 = Math.max(selection.y1, selection.y2);
                
                // If we have captured pixel data, draw it
                if (selection.data) {
                    const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(selection.data.width, selection.data.height);
                    tempCtx.putImageData(selection.data, 0, 0);
                    
                    selectionCtx.imageSmoothingEnabled = false;
                    selectionCtx.drawImage(tempCanvas, 
                        0, 0, selection.data.width, selection.data.height,
                        x1 * PIXEL_SCALE, y1 * PIXEL_SCALE, 
                        selection.data.width * PIXEL_SCALE, selection.data.height * PIXEL_SCALE);
                }
                
                // Draw bold selection outline on the outer edge only
                if ((selection.isLasso || selection.isColorSelect || selection.isCircle) && selection.pixels) {
                    // For special selections, draw a bold outline around the perimeter
                    // Find edge pixels and draw thicker outline
                    const edgePixels = new Set();
                    
                    for (const pixel of selection.pixels) {
                        const isEdge = !selection.pixels.some(p => p.x === pixel.x - 1 && p.y === pixel.y) ||
                                       !selection.pixels.some(p => p.x === pixel.x + 1 && p.y === pixel.y) ||
                                       !selection.pixels.some(p => p.x === pixel.x && p.y === pixel.y - 1) ||
                                       !selection.pixels.some(p => p.x === pixel.x && p.y === pixel.y + 1);
                        
                        if (isEdge) {
                            edgePixels.add(`${pixel.x},${pixel.y}`);
                        }
                    }
                    
                    // Draw bold marching ants on edge pixels only
                    selectionCtx.strokeStyle = '#000';
                    selectionCtx.lineWidth = 3;
                    selectionCtx.setLineDash([6, 6]);
                    
                    const baseX = selection.originalX1 !== undefined ? x1 - selection.originalX1 : 0;
                    const baseY = selection.originalY1 !== undefined ? y1 - selection.originalY1 : 0;
                    
                    for (const pixelKey of edgePixels) {
                        const [px, py] = pixelKey.split(',').map(Number);
                        const displayX = selection.originalX1 !== undefined ? baseX + px : px;
                        const displayY = selection.originalY1 !== undefined ? baseY + py : py;
                        selectionCtx.strokeRect(displayX * PIXEL_SCALE, displayY * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                    }
                    selectionCtx.setLineDash([]);
                } else {
                    // Draw bold rectangle selection outline
                    selectionCtx.strokeStyle = '#000';
                    selectionCtx.lineWidth = 3;
                    selectionCtx.setLineDash([6, 6]);
                    selectionCtx.strokeRect(x1 * PIXEL_SCALE, y1 * PIXEL_SCALE, 
                                           (x2 - x1 + 1) * PIXEL_SCALE, (y2 - y1 + 1) * PIXEL_SCALE);
                    selectionCtx.setLineDash([]);
                }
            } else if (lassoPath.length > 0) {
                // Draw lasso path while drawing
                selectionCtx.strokeStyle = '#000';
                selectionCtx.lineWidth = 2;
                selectionCtx.setLineDash([5, 5]);
                selectionCtx.beginPath();
                selectionCtx.moveTo(lassoPath[0].x * PIXEL_SCALE + PIXEL_SCALE/2, lassoPath[0].y * PIXEL_SCALE + PIXEL_SCALE/2);
                for (let i = 1; i < lassoPath.length; i++) {
                    selectionCtx.lineTo(lassoPath[i].x * PIXEL_SCALE + PIXEL_SCALE/2, lassoPath[i].y * PIXEL_SCALE + PIXEL_SCALE/2);
                }
                selectionCtx.stroke();
                selectionCtx.setLineDash([]);
            }
            
            // Show visual feedback for multi-step tools
            if (lineStart) {
                // Show line start point
                selectionCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                selectionCtx.fillRect(lineStart.x * PIXEL_SCALE, lineStart.y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
            }
            
            if (shapePoints.length > 0) {
                // Show polygon/contour points
                selectionCtx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                shapePoints.forEach(p => {
                    selectionCtx.fillRect(p.x * PIXEL_SCALE, p.y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                });
                // Draw lines between points
                if (shapePoints.length > 1) {
                    selectionCtx.strokeStyle = '#00ff00';
                    selectionCtx.lineWidth = 2;
                    selectionCtx.beginPath();
                    selectionCtx.moveTo(shapePoints[0].x * PIXEL_SCALE + PIXEL_SCALE/2, shapePoints[0].y * PIXEL_SCALE + PIXEL_SCALE/2);
                    for (let i = 1; i < shapePoints.length; i++) {
                        selectionCtx.lineTo(shapePoints[i].x * PIXEL_SCALE + PIXEL_SCALE/2, shapePoints[i].y * PIXEL_SCALE + PIXEL_SCALE/2);
                    }
                    selectionCtx.stroke();
                }
            }
            
            if (curvePoints.length > 0) {
                // Show curve points
                selectionCtx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                curvePoints.forEach(p => {
                    selectionCtx.fillRect(p.x * PIXEL_SCALE, p.y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
                });
            }
            
            if (shapeStart) {
                // Show rectangle/circle start point
                selectionCtx.fillStyle = 'rgba(255, 165, 0, 0.5)';
                selectionCtx.fillRect(shapeStart.x * PIXEL_SCALE, shapeStart.y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
            }
        }
        
        function isPointInSelection(gridX, gridY) {
            if (!selection) return false;
            
            if ((selection.isLasso || selection.isColorSelect || selection.isCircle) && selection.pixels) {
                // Check if pixel is in selected pixels list (using original positions)
                if (selection.originalX1 !== undefined) {
                    // During movement, check against original positions
                    return selection.pixels.some(p => p.x === gridX && p.y === gridY);
                } else {
                    // Before movement, check normally
                    return selection.pixels.some(p => p.x === gridX && p.y === gridY);
                }
            } else {
                // Rectangle test
                const x1 = Math.min(selection.x1, selection.x2);
                const y1 = Math.min(selection.y1, selection.y2);
                const x2 = Math.max(selection.x1, selection.x2);
                const y2 = Math.max(selection.y1, selection.y2);
                return gridX >= x1 && gridX <= x2 && gridY >= y1 && gridY <= y2;
            }
        }
        
        function isPointInPolygon(x, y, polygon) {
            // Ray casting algorithm
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].x, yi = polygon[i].y;
                const xj = polygon[j].x, yj = polygon[j].y;
                
                const intersect = ((yi > y) !== (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }
        
        function createLassoPath(rawPath) {
            // Select complete rectangular pixels based on path coverage
            if (rawPath.length < 3) return [];
            
            // Find bounding box
            const minX = Math.min(...rawPath.map(p => p.x));
            const maxX = Math.max(...rawPath.map(p => p.x));
            const minY = Math.min(...rawPath.map(p => p.y));
            const maxY = Math.max(...rawPath.map(p => p.y));
            
            const selectedPixels = new Set();
            
            // Convert raw path to continuous pixel centers for polygon test
            const pathCenters = rawPath.map(p => ({x: p.x + 0.5, y: p.y + 0.5}));
            
            // Test each pixel in bounding box
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    // Test if pixel center is inside the lasso path
                    const centerX = x + 0.5;
                    const centerY = y + 0.5;
                    
                    if (isPointInPolygon(centerX, centerY, pathCenters)) {
                        selectedPixels.add(`${x},${y}`);
                    } else {
                        // Calculate overlap percentage
                        // Sample multiple points within the pixel
                        let insideCount = 0;
                        const samples = 5; // 5x5 grid = 25 samples
                        
                        for (let sy = 0; sy < samples; sy++) {
                            for (let sx = 0; sx < samples; sx++) {
                                const testX = x + (sx + 0.5) / samples;
                                const testY = y + (sy + 0.5) / samples;
                                if (isPointInPolygon(testX, testY, pathCenters)) {
                                    insideCount++;
                                }
                            }
                        }
                        
                        const coverage = insideCount / (samples * samples);
                        if (coverage >= LASSO_OVERLAP_THRESHOLD) {
                            selectedPixels.add(`${x},${y}`);
                        }
                    }
                }
            }
            
            // Convert selected pixels to array of rectangular pixels
            const edgePixels = Array.from(selectedPixels).map(key => {
                const [x, y] = key.split(',').map(Number);
                return {x, y};
            });
            
            return edgePixels;
        }
        
        function captureSelection() {
            if (!selection) return;
            
            const layers = getCurrentLayers();
            const targetLayer = layers[selection.layerIndex !== undefined ? selection.layerIndex : currentLayerIndex];
            if (!targetLayer) return;
            
            const x1 = Math.min(selection.x1, selection.x2);
            const y1 = Math.min(selection.y1, selection.y2);
            const x2 = Math.max(selection.x1, selection.x2);
            const y2 = Math.max(selection.y1, selection.y2);
            const width = x2 - x1 + 1;
            const height = y2 - y1 + 1;
            
            // Capture the selected pixels AND clear them
            const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(width, height);
            const tempImageData = tempCtx.createImageData(width, height);
            
            // Store original position and data for canceling
            selection.originalX1 = x1;
            selection.originalY1 = y1;
            selection.originalX2 = x2;
            selection.originalY2 = y2;
            selection.originalData = [];
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const srcX = x1 + x;
                    const srcY = y1 + y;
                    if (srcX >= 0 && srcX < GRID_WIDTH && srcY >= 0 && srcY < GRID_HEIGHT) {
                        // Check if pixel is within selection (for lasso, color select, and circle select)
                        if (!selection.isLasso && !selection.isColorSelect && !selection.isCircle || isPointInSelection(srcX, srcY)) {
                            const index = (srcY * GRID_WIDTH + srcX) * 4;
                            const pixelColor = [
                                targetLayer.data.data[index],
                                targetLayer.data.data[index + 1],
                                targetLayer.data.data[index + 2],
                                targetLayer.data.data[index + 3]
                            ];
                            
                            // Store original data
                            selection.originalData.push({
                                x: srcX,
                                y: srcY,
                                color: `rgba(${pixelColor[0]},${pixelColor[1]},${pixelColor[2]},${pixelColor[3]/255})`
                            });
                            
                            // Directly set pixel data in ImageData instead of using fillRect
                            const tempIndex = (y * width + x) * 4;
                            tempImageData.data[tempIndex] = pixelColor[0];
                            tempImageData.data[tempIndex + 1] = pixelColor[1];
                            tempImageData.data[tempIndex + 2] = pixelColor[2];
                            tempImageData.data[tempIndex + 3] = pixelColor[3];
                            
                            // Clear pixels from original position on the ORIGINAL layer
                            targetLayer.data.data[index] = 0;
                            targetLayer.data.data[index + 1] = 0;
                            targetLayer.data.data[index + 2] = 0;
                            targetLayer.data.data[index + 3] = 0;
                        }
                    }
                }
            }
            
            selection.data = tempImageData;
            compositeLayersToCanvas();
        }
        
        function pasteSelection(targetX, targetY) {
            if (!selection || !selection.data) return;
            
            const layers = getCurrentLayers();
            const targetLayer = layers[selection.layerIndex !== undefined ? selection.layerIndex : currentLayerIndex];
            if (!targetLayer) return;
            
            const width = selection.data.width;
            const height = selection.data.height;
            
            // Paste at new location on the ORIGINAL layer
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const destX = targetX + x;
                    const destY = targetY + y;
                    if (destX >= 0 && destX < GRID_WIDTH && destY >= 0 && destY < GRID_HEIGHT) {
                        const dataIndex = (y * width + x) * 4;
                        const r = selection.data.data[dataIndex];
                        const g = selection.data.data[dataIndex + 1];
                        const b = selection.data.data[dataIndex + 2];
                        const a = selection.data.data[dataIndex + 3];
                        
                        if (a > 0) {
                            const layerIndex = (destY * GRID_WIDTH + destX) * 4;
                            targetLayer.data.data[layerIndex] = r;
                            targetLayer.data.data[layerIndex + 1] = g;
                            targetLayer.data.data[layerIndex + 2] = b;
                            targetLayer.data.data[layerIndex + 3] = a;
                        }
                    }
                }
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex); // Update the frame thumbnail
        }
        
        function cancelSelection() {
            if (!selection || !selection.originalData) return;
            
            const layers = getCurrentLayers();
            const targetLayer = layers[selection.layerIndex !== undefined ? selection.layerIndex : currentLayerIndex];
            if (!targetLayer) {
                clearSelection();
                return;
            }
            
            // Restore original pixels to the ORIGINAL layer
            for (const pixel of selection.originalData) {
                const rgba = hexToRgb(pixel.color);
                if (rgba && rgba.length >= 4) {
                    const index = (pixel.y * GRID_WIDTH + pixel.x) * 4;
                    targetLayer.data.data[index] = rgba[0];
                    targetLayer.data.data[index + 1] = rgba[1];
                    targetLayer.data.data[index + 2] = rgba[2];
                    targetLayer.data.data[index + 3] = rgba[3];
                }
            }
            
            // Clear everything
            selection = null;
            isMovingSelection = false;
            selectionStartX = -1;
            selectionStartY = -1;
            selectionOffsetX = 0;
            selectionOffsetY = 0;
            lassoPath = [];
            circleSelectCenter = null;
            
            selectionCtx.clearRect(0, 0, CANVAS_DIM, CANVAS_DIM);
            compositeLayersToCanvas();
            updateSelectionInfo();
            updateCurrentToolDisplay();
        }
        
        function isPointInOriginalSelection(gridX, gridY) {
            if (!selection) return false;
            
            // Offset check - need to check against original position
            const offsetX = gridX - selection.originalX1;
            const offsetY = gridY - selection.originalY1;
            
            if (selection.isLasso && selection.pixels) {
                return selection.pixels.some(p => p.x === gridX && p.y === gridY);
            } else {
                return gridX >= selection.originalX1 && gridX <= selection.originalX2 && 
                       gridY >= selection.originalY1 && gridY <= selection.originalY2;
            }
        }
        
        function savePixelToLayer(gridX, gridY, color) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer || gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return;
            
            const rgba = hexToRgb(color);
            if (!rgba || rgba.length < 4) {
                return;
            }
            
            const [r, g, b, a] = rgba;
            const index = (gridY * GRID_WIDTH + gridX) * 4;
            
            // If in mask editing mode, edit the mask instead of the layer
            if (maskEditingMode && currentLayer.mask) {
                // For mask: white (255,255,255) = visible, black (0,0,0) = hidden
                // Use RGB values to control mask strength (average RGB = mask alpha)
                // Black = hide, White = show
                const maskValue = Math.round((r + g + b) / 3); // Average RGB as mask value
                currentLayer.mask.data[index]     = maskValue;
                currentLayer.mask.data[index + 1] = maskValue;
                currentLayer.mask.data[index + 2] = maskValue;
                currentLayer.mask.data[index + 3] = 255; // Keep mask alpha at full - RGB controls visibility
            } else {
                // Normal layer editing
                currentLayer.data.data[index]     = r;
                currentLayer.data.data[index + 1] = g;
                currentLayer.data.data[index + 2] = b;
                currentLayer.data.data[index + 3] = a;
            }
        }

        // --- UNDO/REDO SYSTEM ---
        
        function saveState(actionType = 'general') {
            // Save complete state including all frames and their layers
            const state = {
                actionType: actionType,
                gridSize: GRID_SIZE,
                gridWidth: GRID_WIDTH,
                gridHeight: GRID_HEIGHT,
                currentFrameIndex: currentFrameIndex,
                currentLayerIndex: currentLayerIndex,
                frameLayers: cloneAllFrameLayers(),
                canvasBgPreset: document.getElementById('canvas-bg-preset').value,
                canvasBgColor: document.getElementById('canvas-bg-color').value,
                canvasBgHex: document.getElementById('canvas-bg-hex').value
            };
            
            undoStack.push(state);
            if (undoStack.length > MAX_UNDO_STEPS) {
                undoStack.shift();
            }
            redoStack = []; // Clear redo stack when new action is performed
        }
        
        function undo() {
            if (undoStack.length === 0) {
                return;
            }
            
            // Save current state to redo stack
            const currentState = {
                gridSize: GRID_SIZE,
                gridWidth: GRID_WIDTH,
                gridHeight: GRID_HEIGHT,
                currentFrameIndex: currentFrameIndex,
                currentLayerIndex: currentLayerIndex,
                frameLayers: cloneAllFrameLayers(),
                canvasBgPreset: document.getElementById('canvas-bg-preset').value,
                canvasBgColor: document.getElementById('canvas-bg-color').value,
                canvasBgHex: document.getElementById('canvas-bg-hex').value
            };
            redoStack.push(currentState);
            
            // Restore previous state
            const state = undoStack.pop();
            GRID_SIZE = state.gridSize;
            GRID_WIDTH = state.gridWidth || state.gridSize;
            GRID_HEIGHT = state.gridHeight || state.gridSize;
            gridWidthInput.value = GRID_WIDTH;
            gridHeightInput.value = GRID_HEIGHT;
            currentFrameIndex = state.currentFrameIndex;
            currentLayerIndex = state.currentLayerIndex;
            frameLayers = state.frameLayers;

            if (state.canvasBgPreset !== undefined) {
                document.getElementById('canvas-bg-preset').value = state.canvasBgPreset;
                document.getElementById('canvas-bg-color').value = state.canvasBgColor;
                document.getElementById('canvas-bg-hex').value = state.canvasBgHex;
                updateCanvasBackground();
            }

            frames = new Array(frameLayers.length).fill(null).map(() => new ImageData(GRID_WIDTH, GRID_HEIGHT));
            
            updatePixelScale();
            compositeLayersToCanvas();
            renderLayerList();
            renderFrameThumbnails();
            updateThumbnail(currentFrameIndex);
        }
        
        function undoTransformations() {
            if (undoStack.length === 0) {
                alert("No recent actions to undo.");
                return;
            }
            
            let lastTransformState = null;
            
            // Look at the top of the stack. If it's not a transform, there are no recent transformations.
            if (undoStack[undoStack.length - 1].actionType !== 'transform') {
                alert("No recent transformations to undo. (Make sure you haven't used other tools since your last transform)");
                return;
            }
            
            // Pop all transform states, saving the oldest one to restore
            while (undoStack.length > 0 && undoStack[undoStack.length - 1].actionType === 'transform') {
                lastTransformState = undoStack.pop();
            }
            
            if (lastTransformState) {
                redoStack = []; // Clear redo stack
                
                GRID_SIZE = lastTransformState.gridSize;
                GRID_WIDTH = lastTransformState.gridWidth;
                GRID_HEIGHT = lastTransformState.gridHeight;
                currentFrameIndex = lastTransformState.currentFrameIndex;
                currentLayerIndex = lastTransformState.currentLayerIndex;
                
                frameLayers = lastTransformState.frameLayers.map(layers => 
                    layers.map(cloneLayerData)
                );
                
                // Keep the current canvas dimensions updated
                document.getElementById('grid-width-input').value = GRID_WIDTH;
                document.getElementById('grid-height-input').value = GRID_HEIGHT;
                
                rebuildFramesArray();
                updatePixelScale();
                renderLayerList();
                compositeLayersToCanvas();
                renderFrameThumbnails();
                updateThumbnail(currentFrameIndex);
                loadFrame(currentFrameIndex);
                drawGrid();
                updateAnimationPreview();
            }
        }

        function redo() {
            if (redoStack.length === 0) {
                return;
            }
            
            // Save current state to undo stack
            const currentState = {
                gridSize: GRID_SIZE,
                gridWidth: GRID_WIDTH,
                gridHeight: GRID_HEIGHT,
                currentFrameIndex: currentFrameIndex,
                currentLayerIndex: currentLayerIndex,
                frameLayers: cloneAllFrameLayers(),
                canvasBgPreset: document.getElementById('canvas-bg-preset').value,
                canvasBgColor: document.getElementById('canvas-bg-color').value,
                canvasBgHex: document.getElementById('canvas-bg-hex').value
            };
            undoStack.push(currentState);
            
            // Restore redo state
            const state = redoStack.pop();
            GRID_SIZE = state.gridSize;
            GRID_WIDTH = state.gridWidth || state.gridSize;
            GRID_HEIGHT = state.gridHeight || state.gridSize;
            gridWidthInput.value = GRID_WIDTH;
            gridHeightInput.value = GRID_HEIGHT;
            currentFrameIndex = state.currentFrameIndex;
            currentLayerIndex = state.currentLayerIndex;
            frameLayers = state.frameLayers;

            if (state.canvasBgPreset !== undefined) {
                document.getElementById('canvas-bg-preset').value = state.canvasBgPreset;
                document.getElementById('canvas-bg-color').value = state.canvasBgColor;
                document.getElementById('canvas-bg-hex').value = state.canvasBgHex;
                updateCanvasBackground();
            }

            frames = new Array(frameLayers.length).fill(null).map(() => new ImageData(GRID_WIDTH, GRID_HEIGHT));
            
            updatePixelScale();
            compositeLayersToCanvas();
            renderLayerList();
            renderFrameThumbnails();
            updateThumbnail(currentFrameIndex);
        }
        
        // --- KEYBOARD SHORTCUTS ---
        
        function showKeyboardShortcuts() {
            // Create modal overlay
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            // Create modal content
            const content = document.createElement('div');
            content.style.cssText = `
                background: #2c2c2c;
                color: #fff;
                padding: 25px;
                border-radius: 10px;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            `;
            
            content.innerHTML = `
                <h2 style="margin: 0 0 20px 0; text-align: center; color: #4CAF50;">⌨️ KEYBOARD SHORTCUTS REFERENCE</h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; font-family: monospace; font-size: 14px;">
                    <div>
                        <h3 style="color: #ff9800; margin-top: 0;">TOOLS (Part 1)</h3>
                        <div style="line-height: 1.8;">
                            <strong>P</strong> = Pencil (Circle)<br>
                            <strong>Q</strong> = Pencil (Square)<br>
                            <strong>1</strong> = 1px Tool<br>
                            <strong>E</strong> = Eraser<br>
                            <strong>F</strong> = Fill<br>
                            <strong>S</strong> = Rectangle Select<br>
                            <strong>L</strong> = Lasso<br>
                            <strong>M</strong> = Symmetry<br>
                            <strong>A</strong> = Pan<br>
                            <strong>B</strong> = Blend<br>
                        </div>
                    </div>
                    <div>
                        <h3 style="color: #ff9800; margin-top: 0;">TOOLS (Part 2)</h3>
                        <div style="line-height: 1.8;">
                            <strong>D</strong> = Shadow/Depth<br>
                            <strong>H</strong> = Highlight<br>
                            <strong>X</strong> = Sharpen<br>
                            <strong>R</strong> = Rainbow<br>
                            <strong>G</strong> = Gradient<br>
                            <strong>J</strong> = Jumble<br>
                            <strong>Y</strong> = Spray<br>
                            <strong>K</strong> = Color Select<br>
                            <strong>I</strong> = Circle Select<br>
                            <strong>T</strong> = Erase Color<br>
                        </div>
                    </div>
                    <div>
                        <h3 style="color: #ff9800; margin-top: 0;">TOOLS (Part 3)</h3>
                        <div style="line-height: 1.8;">
                            <strong>N</strong> = Line<br>
                            <strong>U</strong> = Curve<br>
                            <strong>C</strong> = Contour<br>
                            <strong>O</strong> = Polygon<br>
                            <strong>V</strong> = Rectangle Shape<br>
                            <strong>W</strong> = Circle Shape<br>
                        </div>
                        <h3 style="color: #2196F3; margin-top: 15px;">ACTIONS (Shift+)</h3>
                        <div style="line-height: 1.8;">
                            <strong>Shift+A</strong> = Clear Selection<br>
                            <strong>Shift+L</strong> = Add Layer<br>
                            <strong>Shift+F</strong> = Add Frame<br>
                            <strong>Shift+P</strong> = Export PNG<br>
                            <strong>Shift+B</strong> = Export BMP<br>
                            <strong>Shift+G</strong> = Export GIF<br>
                            <strong>Shift+E</strong> = Export VGA Palette<br>
                        </div>
                        <h3 style="color: #4CAF50; margin-top: 15px;">UNDO/REDO</h3>
                        <div style="line-height: 1.8;">
                            <strong>Ctrl+Z</strong> = Undo<br>
                            <strong>Ctrl+Y</strong> = Redo<br>
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 25px;">
                    <button id="closeShortcutsModal" style="
                        padding: 10px 30px;
                        font-size: 16px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            `;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Close on button click
            document.getElementById('closeShortcutsModal').onclick = () => {
                document.body.removeChild(modal);
            };
            
            // Close on overlay click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            };
            
            // Close on ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
        
        function handleKeyboardShortcuts(e) {
            // Don't trigger shortcuts if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;
            const shift = e.shiftKey;
            
            // Special keys for active tools
            if (key === 'enter' && currentTool === 'gradientmesh') {
                e.preventDefault();
                fillGradientMesh();
                return;
            }
            if (key === 'escape') {
                e.preventDefault();
                if (currentTool === 'gradientmesh') {
                    meshPoints = [];
                    updateToolStatus('Gradient mesh cancelled');
                } else if (currentTool === 'beziercurve') {
                    bezierPoints = [];
                    updateToolStatus('Bezier curve cancelled');
                }
                drawSelectionOverlay();
                return;
            }
            
            // Ctrl shortcuts
            if (ctrl && key === 'z') {
                e.preventDefault();
                undo();
                return;
            }
            if (ctrl && key === 'y') {
                e.preventDefault();
                redo();
                return;
            }
            
            // Shift shortcuts
            if (shift && key === 'a') {
                e.preventDefault();
                clearSelection();
                return;
            }
            if (shift && key === 'l') {
                e.preventDefault();
                addLayer();
                return;
            }
            if (shift && key === 'f') {
                e.preventDefault();
                addFrame('blank');
                return;
            }
            if (shift && key === 'p') {
                e.preventDefault();
                exportSpriteSheet();
                return;
            }
            if (shift && key === 'b') {
                e.preventDefault();
                exportFramesBMP();
                return;
            }
            if (shift && key === 'g') {
                e.preventDefault();
                exportAnimationGIF();
                return;
            }
            if (shift && key === 'e') {
                e.preventDefault();
                exportVGAPalette();
                return;
            }
            
            // Tool shortcuts (no modifiers)
            if (!ctrl && !shift) {
                switch(key) {
                    case 's':
                        e.preventDefault();
                        activateTool('rectselect');
                        break;
                    case 'l':
                        e.preventDefault();
                        activateTool('lasso');
                        break;
                    case 'p':
                        e.preventDefault();
                        activateTool('pencil');
                        break;
                    case 'q':
                        e.preventDefault();
                        activateTool('pencilsquare');
                        break;
                    case 'a':
                        e.preventDefault();
                        activateTool('pan');
                        break;
                    case 'm':
                        e.preventDefault();
                        activateTool('symmetrical');
                        break;
                    case 'r':
                        e.preventDefault();
                        activateTool('rainbow');
                        break;
                    case '1':
                        e.preventDefault();
                        activateTool('refined');
                        break;
                    case 'g':
                        e.preventDefault();
                        activateTool('gradient');
                        break;
                    case 'b':
                        e.preventDefault();
                        activateTool('blend');
                        break;
                    case 'x':
                        e.preventDefault();
                        activateTool('sharpen');
                        break;
                    case 'd':
                        e.preventDefault();
                        activateTool('depth');
                        break;
                    case 'e':
                        e.preventDefault();
                        activateTool('eraser');
                        break;
                    case 'f':
                        e.preventDefault();
                        activateTool('fill');
                        break;
                    case 'h':
                        e.preventDefault();
                        activateTool('highlight');
                        break;
                    case 'j':
                        e.preventDefault();
                        activateTool('jumble');
                        break;
                    case 'n':
                        e.preventDefault();
                        activateTool('line');
                        break;
                    case 'c':
                        e.preventDefault();
                        activateTool('contour');
                        break;
                    case 'o':
                        e.preventDefault();
                        activateTool('polygon');
                        break;
                    case 'u':
                        e.preventDefault();
                        activateTool('curve');
                        break;
                    case 'k':
                        e.preventDefault();
                        activateTool('colorselect');
                        break;
                    case 'i':
                        e.preventDefault();
                        activateTool('circleselect');
                        break;
                    case 't':
                        e.preventDefault();
                        activateTool('erasecolor');
                        break;
                    case 'v':
                        e.preventDefault();
                        activateTool('rectangle');
                        break;
                    case 'w':
                        e.preventDefault();
                        activateTool('circle');
                        break;
                    case 'y':
                        e.preventDefault();
                        activateTool('spray');
                        break;
                }
            }
        }

        // --- RECENT COLORS ---
        
        function addToRecentColors(color) {
            const hex = color.toUpperCase();
            // Remove if already exists
            recentColors = recentColors.filter(c => c !== hex);
            // Add to front
            recentColors.unshift(hex);
            // Limit to max
            if (recentColors.length > MAX_RECENT_COLORS) {
                recentColors = recentColors.slice(0, MAX_RECENT_COLORS);
            }
            updateRecentColors();
        }
        
        function updateRecentColors() {
            const recentDiv = document.getElementById('recent-colors-preview');
            if (!recentDiv) return;
            
            recentDiv.innerHTML = '';
            
            recentColors.forEach(hex => {
                const colorDiv = document.createElement('div');
                colorDiv.style.width = '20px';
                colorDiv.style.height = '20px';
                colorDiv.style.backgroundColor = hex;
                colorDiv.style.border = '1px solid #333';
                colorDiv.style.cursor = 'pointer';
                colorDiv.title = hex;
                
                colorDiv.onclick = () => {
                    colorPicker.value = hex;
                    currentColor = hex;
                    document.getElementById('current-color-display').value = hex;
                };
                
                recentDiv.appendChild(colorDiv);
            });
        }
        
        // --- HISTOGRAM DISPLAY ---
        
        let currentHistogramChannel = 'all';
        
        function updateHistogram() {
            showHistogramChannel(currentHistogramChannel);
        }
        
        function showHistogramChannel(channel) {
            currentHistogramChannel = channel;
            const histogramCanvas = document.getElementById('histogram-canvas');
            if (!histogramCanvas) return;
            
            const ctx = histogramCanvas.getContext('2d');
            const width = histogramCanvas.width;
            const height = histogramCanvas.height;
            
            ctx.fillStyle = '#f9f9f9';
            ctx.fillRect(0, 0, width, height);
            
            const layers = getCurrentLayers();
            const rHist = new Array(256).fill(0);
            const gHist = new Array(256).fill(0);
            const bHist = new Array(256).fill(0);
            
            let totalPixels = 0;
            layers.forEach(layer => {
                if (!layer.visible) return;
                for (let i = 0; i < layer.data.data.length; i += 4) {
                    const a = layer.data.data[i + 3];
                    if (a > 0) {
                        rHist[layer.data.data[i]]++;
                        gHist[layer.data.data[i + 1]]++;
                        bHist[layer.data.data[i + 2]]++;
                        totalPixels++;
                    }
                }
            });
            
            const maxR = Math.max(...rHist);
            const maxG = Math.max(...gHist);
            const maxB = Math.max(...bHist);
            const maxValue = Math.max(maxR, maxG, maxB, 1);
            
            const barWidth = width / 256;
            
            if (channel === 'all' || channel === 'r') {
                ctx.fillStyle = channel === 'r' ? 'rgba(255, 0, 0, 1)' : 'rgba(255, 0, 0, 0.5)';
                for (let i = 0; i < 256; i++) {
                    const barHeight = (rHist[i] / maxValue) * height;
                    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
                }
            }
            
            if (channel === 'all' || channel === 'g') {
                ctx.fillStyle = channel === 'g' ? 'rgba(0, 255, 0, 1)' : 'rgba(0, 255, 0, 0.5)';
                for (let i = 0; i < 256; i++) {
                    const barHeight = (gHist[i] / maxValue) * height;
                    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
                }
            }
            
            if (channel === 'all' || channel === 'b') {
                ctx.fillStyle = channel === 'b' ? 'rgba(0, 0, 255, 1)' : 'rgba(0, 0, 255, 0.5)';
                for (let i = 0; i < 256; i++) {
                    const barHeight = (bHist[i] / maxValue) * height;
                    ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
                }
            }
            
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(0, 0, width, height);
            
            // Update stats
            const avgR = rHist.reduce((a, b, i) => a + b * i, 0) / totalPixels || 0;
            const avgG = gHist.reduce((a, b, i) => a + b * i, 0) / totalPixels || 0;
            const avgB = bHist.reduce((a, b, i) => a + b * i, 0) / totalPixels || 0;
            
            document.getElementById('histogram-stats').textContent = 
                `Pixels: ${totalPixels} | Avg RGB: (${avgR.toFixed(0)}, ${avgG.toFixed(0)}, ${avgB.toFixed(0)})`;
        }
        
        // --- BATCH PROCESSING ---
        
        function batchRotateAll(degrees) {
            if (!confirm(`Rotate ALL frames by ${degrees}°?\nThis will affect all layers in all ${frames.length} frames.`)) return;
            
            saveState('transform');
            
            frameLayers.forEach((frameLayers, frameIndex) => {
                frameLayers.forEach(layer => {
                    const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                    tempCtx.putImageData(layer.data, 0, 0);
                    
                    const isQuarterTurn = Math.abs(degrees) === 90 || Math.abs(degrees) === 270;
                    const newWidth = isQuarterTurn ? GRID_HEIGHT : GRID_WIDTH;
                    const newHeight = isQuarterTurn ? GRID_WIDTH : GRID_HEIGHT;
                    const { canvas: rotatedCanvas, ctx: rotatedCtx } = createTempCanvas(newWidth, newHeight);
                    
                    rotatedCtx.translate(newWidth / 2, newHeight / 2);
                    rotatedCtx.rotate((degrees * Math.PI) / 180);
                    rotatedCtx.drawImage(tempCanvas, -GRID_WIDTH / 2, -GRID_HEIGHT / 2);
                    
                    layer.data = rotatedCtx.getImageData(0, 0, newWidth, newHeight);
                });
                updateThumbnail(frameIndex);
            });
            
            compositeLayersToCanvas();
            updateAnimationPreview();
            alert(`Rotated all ${frames.length} frames!`);
        }
        
        function batchFlipAll(direction) {
            if (!confirm(`Flip ALL frames ${direction}?\nThis will affect all layers in all ${frames.length} frames.`)) return;
            
            saveState('transform');
            
            frameLayers.forEach((frameLayers, frameIndex) => {
                frameLayers.forEach(layer => {
                    const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                    tempCtx.putImageData(layer.data, 0, 0);
                    
                    const { canvas: flippedCanvas, ctx: flippedCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                    
                    if (direction === 'horizontal') {
                        flippedCtx.scale(-1, 1);
                        flippedCtx.drawImage(tempCanvas, -GRID_WIDTH, 0);
                    } else {
                        flippedCtx.scale(1, -1);
                        flippedCtx.drawImage(tempCanvas, 0, -GRID_HEIGHT);
                    }
                    
                    layer.data = flippedCtx.getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT);
                });
                updateThumbnail(frameIndex);
            });
            
            compositeLayersToCanvas();
            updateAnimationPreview();
            alert(`Flipped all ${frames.length} frames ${direction}!`);
        }
        
        function batchCreateMagentaBackground() {
            if (!confirm(`Create/Replace Magenta Background for ALL ${frames.length} frames?`)) return;
            
            saveState('transform');
            
            frameLayers.forEach((layers, frameIndex) => {
                if (!layers || layers.length === 0) return;
                
                // Check if bottom layer (layers[0]) is a solid, fully opaque background
                let isSolidBg = false;
                const bottomLayer = layers[0];
                const data = bottomLayer.data.data;
                const totalPixels = GRID_WIDTH * GRID_HEIGHT;
                
                if (data.length === totalPixels * 4 && totalPixels > 0) {
                    let r = data[0], g = data[1], b = data[2], a = data[3];
                    // Must be fully opaque
                    if (a === 255) {
                        isSolidBg = true;
                        for (let i = 0; i < data.length; i += 4) {
                            if (data[i+3] !== 255 || data[i] !== r || data[i+1] !== g || data[i+2] !== b) {
                                isSolidBg = false;
                                break;
                            }
                        }
                    }
                }
                
                let bgLayer;
                if (isSolidBg) {
                    bgLayer = bottomLayer;
                } else {
                    // Create new layer
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = GRID_WIDTH;
                    tempCanvas.height = GRID_HEIGHT;
                    const tempCtx = tempCanvas.getContext('2d');
                    bgLayer = {
                        name: `Magenta BG`,
                        data: tempCtx.createImageData(GRID_WIDTH, GRID_HEIGHT),
                        visible: true,
                        opacity: 1.0,
                        blendMode: 'normal',
                        mask: null,
                        maskEnabled: false,
                        effects: {
                            dropShadow: false,
                            glow: false,
                            stroke: false,
                            shadowColor: '#000000',
                            glowColor: '#FFFFFF',
                            strokeColor: '#000000'
                        }
                    };
                    layers.unshift(bgLayer); // Insert at bottom
                    
                    // Since we shifted layers, currentLayerIndex needs to be updated if it's the current frame
                    if (frameIndex === currentFrameIndex) {
                        currentLayerIndex++;
                    }
                }
                
                // Fill bgLayer with magenta
                const bgData = bgLayer.data.data;
                for (let i = 0; i < bgData.length; i += 4) {
                    bgData[i] = 255;     // R
                    bgData[i+1] = 0;     // G
                    bgData[i+2] = 255;   // B
                    bgData[i+3] = 255;   // A
                }
                
                updateThumbnail(frameIndex);
            });
            
            renderLayerList();
            compositeLayersToCanvas();
            updateAnimationPreview();
            alert(`Magenta background applied to all ${frames.length} frames!`);
        }

        async function batchAdjustBrightness() {
            const result = await styledPrompt('Brightness adjustment (-1.0 to +1.0):\n\nNegative = darker, Positive = brighter\n\nSuggested: -0.2 to +0.2', '0.1', '☀️ Batch Brightness');
            const adjustment = parseFloat(result);
            if (isNaN(adjustment)) return;
            
            if (!confirm(`Adjust brightness by ${adjustment > 0 ? '+' : ''}${adjustment} for ALL frames?`)) return;
            
            saveState();
            
            const factor = 1 + adjustment;
            let pixelsChanged = 0;
            
            frameLayers.forEach((frameLayers, frameIndex) => {
                frameLayers.forEach(layer => {
                    for (let i = 0; i < layer.data.data.length; i += 4) {
                        const a = layer.data.data[i + 3];
                        if (a > 0) { // Only adjust non-transparent pixels
                            layer.data.data[i] = Math.min(255, Math.max(0, Math.round(layer.data.data[i] * factor)));
                            layer.data.data[i + 1] = Math.min(255, Math.max(0, Math.round(layer.data.data[i + 1] * factor)));
                            layer.data.data[i + 2] = Math.min(255, Math.max(0, Math.round(layer.data.data[i + 2] * factor)));
                            pixelsChanged++;
                        }
                    }
                });
                updateThumbnail(frameIndex);
            });
            
            compositeLayersToCanvas();
            updateAnimationPreview();
            updatePalette();
            alert(`Adjusted brightness for ${pixelsChanged} pixels across all frames!`);
        }
        
        // --- COLOR CURVES ADJUSTMENT ---
        
        async function showColorCurves() {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            // Store original data for preview/cancel
            const originalData = new Uint8ClampedArray(currentLayer.data.data);
            
            return new Promise((resolve) => {
                let currentAdjustment = 0.5;
                
                // Create modal overlay
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                `;
                
                // Create modal content
                const content = document.createElement('div');
                content.style.cssText = `
                    background: #2c2c2c;
                    color: #fff;
                    padding: 25px;
                    border-radius: 10px;
                    min-width: 600px;
                    max-width: 700px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                `;
                
                // Title
                const titleElem = document.createElement('h2');
                titleElem.textContent = '📊 Color Curves';
                titleElem.style.cssText = 'margin: 0 0 15px 0; text-align: center; color: #9c27b0;';
                
                // Histogram canvas
                const histogramCanvas = document.createElement('canvas');
                histogramCanvas.width = 550;
                histogramCanvas.height = 150;
                histogramCanvas.style.cssText = `
                    width: 100%;
                    height: auto;
                    border: 2px solid #555;
                    border-radius: 5px;
                    background: #1a1a1a;
                    margin-bottom: 15px;
                `;
                
                // Curve canvas
                const curveCanvas = document.createElement('canvas');
                curveCanvas.width = 550;
                curveCanvas.height = 200;
                curveCanvas.style.cssText = `
                    width: 100%;
                    height: auto;
                    border: 2px solid #555;
                    border-radius: 5px;
                    background: #1a1a1a;
                    margin-bottom: 15px;
                `;
                
                // Instructions container
                const instructionsContainer = document.createElement('div');
                instructionsContainer.style.cssText = 'margin-bottom: 20px; text-align: center; color: #ccc; font-size: 14px;';
                instructionsContainer.innerHTML = '<strong>Click</strong> on the curve to add points.<br><strong>Drag</strong> points to adjust the curve.<br><strong>Double-click</strong> a point to remove it.';
                
                // Button container
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';
                
                const applyButton = document.createElement('button');
                applyButton.textContent = 'Apply';
                applyButton.style.cssText = `
                    padding: 12px 30px;
                    font-size: 16px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                `;
                
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.style.cssText = `
                    padding: 12px 30px;
                    font-size: 16px;
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                `;
                
                buttonContainer.appendChild(applyButton);
                buttonContainer.appendChild(cancelButton);
                
                // Assemble modal
                content.appendChild(titleElem);
                content.appendChild(histogramCanvas);
                content.appendChild(curveCanvas);
                content.appendChild(instructionsContainer);
                content.appendChild(buttonContainer);
                modal.appendChild(content);
                document.body.appendChild(modal);
                
                // Draw histogram
                function drawHistogram() {
                    const ctx = histogramCanvas.getContext('2d');
                    ctx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);
                    
                    // Calculate histogram data
                    const histR = new Array(256).fill(0);
                    const histG = new Array(256).fill(0);
                    const histB = new Array(256).fill(0);
            
            for (let i = 0; i < currentLayer.data.data.length; i += 4) {
                const a = currentLayer.data.data[i + 3];
                if (a > 0) {
                            histR[currentLayer.data.data[i]]++;
                            histG[currentLayer.data.data[i + 1]]++;
                            histB[currentLayer.data.data[i + 2]]++;
                        }
                    }
                    
                    // Find max for normalization
                    const maxR = Math.max(...histR);
                    const maxG = Math.max(...histG);
                    const maxB = Math.max(...histB);
                    const maxVal = Math.max(maxR, maxG, maxB);
                    
                    if (maxVal === 0) return;
                    
                    const barWidth = histogramCanvas.width / 256;
                    const height = histogramCanvas.height;
                    
                    // Draw RGB histograms with transparency
                    ctx.globalCompositeOperation = 'lighter';
                    
                    // Red channel
                    ctx.fillStyle = 'rgba(255, 80, 80, 0.5)';
                    for (let i = 0; i < 256; i++) {
                        const barHeight = (histR[i] / maxVal) * height;
                        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
                    }
                    
                    // Green channel
                    ctx.fillStyle = 'rgba(80, 255, 80, 0.5)';
                    for (let i = 0; i < 256; i++) {
                        const barHeight = (histG[i] / maxVal) * height;
                        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
                    }
                    
                    // Blue channel
                    ctx.fillStyle = 'rgba(80, 80, 255, 0.5)';
                    for (let i = 0; i < 256; i++) {
                        const barHeight = (histB[i] / maxVal) * height;
                        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
                    }
                    
                    ctx.globalCompositeOperation = 'source-over';
                }

                // Polynomial interpolation (Lagrange)
                function getPolynomialY(x, points) {
                    let result = 0;
                    for (let i = 0; i < points.length; i++) {
                        let term = points[i].y;
                        for (let j = 0; j < points.length; j++) {
                            if (i !== j) {
                                // Avoid division by zero if points are stacked
                                if (Math.abs(points[i].x - points[j].x) > 0.001) {
                                    term = term * (x - points[j].x) / (points[i].x - points[j].x);
                                }
                            }
                        }
                        result += term;
                    }
                    return Math.max(0, Math.min(1, result));
                }

                // Interactive curve state
                let curvePoints = [
                    {x: 0, y: 0},
                    {x: 0.5, y: 0.5},
                    {x: 1, y: 1}
                ];
                let draggedPointIndex = -1;

                // Draw curve visualization
                function drawCurve() {
                    const ctx = curveCanvas.getContext('2d');
                    ctx.clearRect(0, 0, curveCanvas.width, curveCanvas.height);
                    
                    const width = curveCanvas.width;
                    const height = curveCanvas.height;
                    const padding = 20;
                    const graphWidth = width - padding * 2;
                    const graphHeight = height - padding * 2;
                    
                    // Draw grid
                    ctx.strokeStyle = '#444';
                    ctx.lineWidth = 1;
                    
                    for (let i = 0; i <= 4; i++) {
                        const x = padding + (graphWidth / 4) * i;
                        ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, height - padding); ctx.stroke();
                    }
                    for (let i = 0; i <= 4; i++) {
                        const y = padding + (graphHeight / 4) * i;
                        ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
                    }
                    
                    // Draw diagonal reference line (no adjustment)
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(padding, height - padding);
                    ctx.lineTo(width - padding, padding);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    
                    // Draw adjustment curve (Polynomial)
                    ctx.strokeStyle = '#9c27b0';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    
                    for (let i = 0; i <= 255; i++) {
                        const value = i / 255;
                        const adjusted = getPolynomialY(value, curvePoints);
                        
                        const x = padding + (value * graphWidth);
                        const y = height - padding - (adjusted * graphHeight);
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.stroke();

                    // Draw interactive points
                    curvePoints.forEach((pt, index) => {
                        const px = padding + pt.x * graphWidth;
                        const py = height - padding - pt.y * graphHeight;
                        ctx.beginPath();
                        ctx.arc(px, py, 6, 0, 2 * Math.PI);
                        ctx.fillStyle = index === draggedPointIndex ? '#fff' : '#00bcd4';
                        ctx.fill();
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    });
                    
                    // Draw labels
                    ctx.fillStyle = '#888';
                    ctx.font = '12px monospace';
                    ctx.fillText('0', padding - 10, height - padding + 15);
                    ctx.fillText('255', width - padding - 15, height - padding + 15);
                    ctx.fillText('Input', width / 2 - 20, height - 5);
                    
                    ctx.save();
                    ctx.translate(10, height / 2);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillText('Output', -30, 0);
                    ctx.restore();
                }
                
                // Apply curve adjustment to image
                function applyAdjustment(updateCanvas = true) {
                    // Precompute LUT for speed
                    const lut = new Uint8Array(256);
                    for (let i = 0; i <= 255; i++) {
                        lut[i] = Math.round(getPolynomialY(i / 255, curvePoints) * 255);
                    }

                    // Restore original data first
                    currentLayer.data.data.set(originalData);
                    
                    // Apply adjustment
                    for (let i = 0; i < currentLayer.data.data.length; i += 4) {
                        const a = currentLayer.data.data[i + 3];
                        if (a > 0) {
                            for (let c = 0; c < 3; c++) {
                                currentLayer.data.data[i + c] = lut[currentLayer.data.data[i + c]];
                            }
                        }
                    }
            
                    if (updateCanvas) {
                        compositeLayersToCanvas();
                    }
                    
                    drawCurve();
                }

                // Interactive Events
                curveCanvas.addEventListener('mousedown', (e) => {
                    const rect = curveCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const padding = 20;
                    const graphWidth = curveCanvas.width - padding * 2;
                    const graphHeight = curveCanvas.height - padding * 2;
                    
                    // Find if clicked on point
                    draggedPointIndex = curvePoints.findIndex(pt => {
                        const px = padding + pt.x * graphWidth;
                        const py = curveCanvas.height - padding - pt.y * graphHeight;
                        return Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2)) < 10;
                    });
                    
                    if (draggedPointIndex === -1) {
                        // Create new point
                        const valX = Math.max(0, Math.min(1, (x - padding) / graphWidth));
                        const valY = Math.max(0, Math.min(1, (curveCanvas.height - padding - y) / graphHeight));
                        curvePoints.push({x: valX, y: valY});
                        curvePoints.sort((a, b) => a.x - b.x); // Keep sorted by x
                        draggedPointIndex = curvePoints.findIndex(pt => pt.x === valX && pt.y === valY);
                        applyAdjustment();
                    }
                });
                
                curveCanvas.addEventListener('mousemove', (e) => {
                    if (draggedPointIndex !== -1) {
                        const rect = curveCanvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        const padding = 20;
                        const graphWidth = curveCanvas.width - padding * 2;
                        const graphHeight = curveCanvas.height - padding * 2;
                        
                        let valX = (x - padding) / graphWidth;
                        let valY = (curveCanvas.height - padding - y) / graphHeight;
                        
                        // Constrain movement
                        if (draggedPointIndex === 0) valX = 0; // First point stays at 0
                        else if (draggedPointIndex === curvePoints.length - 1) valX = 1; // Last point stays at 1
                        else {
                            const prevX = curvePoints[draggedPointIndex - 1].x;
                            const nextX = curvePoints[draggedPointIndex + 1].x;
                            valX = Math.max(prevX + 0.01, Math.min(nextX - 0.01, valX));
                        }
                        
                        valY = Math.max(0, Math.min(1, valY));
                        
                        curvePoints[draggedPointIndex].x = valX;
                        curvePoints[draggedPointIndex].y = valY;
                        
                        applyAdjustment();
                    }
                });
                
                window.addEventListener('mouseup', () => {
                    if (draggedPointIndex !== -1) {
                        draggedPointIndex = -1;
                        applyAdjustment();
                    }
                });
                
                curveCanvas.addEventListener('dblclick', (e) => {
                    if (curvePoints.length > 2) {
                        const rect = curveCanvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        const padding = 20;
                        const graphWidth = curveCanvas.width - padding * 2;
                        const graphHeight = curveCanvas.height - padding * 2;
                        
                        const pointIndex = curvePoints.findIndex(pt => {
                            const px = padding + pt.x * graphWidth;
                            const py = curveCanvas.height - padding - pt.y * graphHeight;
                            return Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2)) < 10;
                        });
                        
                        if (pointIndex > 0 && pointIndex < curvePoints.length - 1) {
                            curvePoints.splice(pointIndex, 1);
                            draggedPointIndex = -1;
                            applyAdjustment();
                        }
                    }
                });
                
                // Cleanup function
                const cleanup = (apply) => {
                    if (apply) {
                        // Keep the current adjustment
                        saveState();
            updateThumbnail(currentFrameIndex);
            updatePalette();
                    } else {
                        // Restore original data
                        currentLayer.data.data.set(originalData);
                        compositeLayersToCanvas();
                    }
                    
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                    resolve();
                };
                
                // Apply button
                applyButton.onclick = () => {
                    cleanup(true);
                };
                
                // Cancel button
                cancelButton.onclick = () => {
                    cleanup(false);
                };
                
                // ESC key = cancel
                const escHandler = (e) => {
                    if (e.key === 'Escape') {
                        cleanup(false);
                        document.removeEventListener('keydown', escHandler);
                    }
                };
                document.addEventListener('keydown', escHandler);
                
                // Close on overlay click
                modal.onclick = (e) => {
                    if (e.target === modal) {
                        cleanup(false);
                    }
                };
                
                // Initial draw
                drawHistogram();
                drawCurve();
                applyAdjustment();
            });
        }
        
        // --- CHANNEL OPERATIONS ---
        
        function extractChannel(channel) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            saveState();
            
            for (let i = 0; i < currentLayer.data.data.length; i += 4) {
                const r = currentLayer.data.data[i];
                const g = currentLayer.data.data[i + 1];
                const b = currentLayer.data.data[i + 2];
                const a = currentLayer.data.data[i + 3];
                
                if (a > 0) {
                    let value = 0;
                    switch(channel) {
                        case 'red': value = r; break;
                        case 'green': value = g; break;
                        case 'blue': value = b; break;
                    }
                    
                    currentLayer.data.data[i] = value;
                    currentLayer.data.data[i + 1] = value;
                    currentLayer.data.data[i + 2] = value;
                }
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updatePalette();
        }
        
        function invertColors() {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            saveState();
            
            for (let i = 0; i < currentLayer.data.data.length; i += 4) {
                const a = currentLayer.data.data[i + 3];
                if (a > 0) {
                    currentLayer.data.data[i] = 255 - currentLayer.data.data[i];
                    currentLayer.data.data[i + 1] = 255 - currentLayer.data.data[i + 1];
                    currentLayer.data.data[i + 2] = 255 - currentLayer.data.data[i + 2];
                }
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updatePalette();
        }
        
        // --- DARK MODE ---
        
        function toggleDarkMode() {
            const enabled = document.getElementById('dark-mode-enabled').checked;
            if (enabled) {
                // Main backgrounds
                document.body.style.backgroundColor = '#1a1a1a';
                document.body.style.color = '#e0e0e0';
                
                // Panels
                document.querySelectorAll('#controls-panel, #frames-panel').forEach(el => {
                    el.style.backgroundColor = '#2d2d2d';
                    el.style.color = '#e0e0e0';
                });
                
                // Control groups
                document.querySelectorAll('.control-group').forEach(el => {
                    el.style.backgroundColor = '#2d2d2d';
                    el.style.color = '#e0e0e0';
                    el.style.borderColor = '#444';
                });
                
                // Current tool display (top of controls panel)
                const toolDisplay = document.getElementById('current-tool-display');
                if (toolDisplay) {
                    toolDisplay.style.backgroundColor = '#1e3a5f';
                    toolDisplay.style.borderColor = '#4a90e2';
                    toolDisplay.style.color = '#e0e0e0';
                }
                
                // Tool status display
                const toolStatus = document.getElementById('tool-status');
                if (toolStatus) {
                    toolStatus.style.backgroundColor = '#1e3a5f';
                    toolStatus.style.borderColor = '#4a90e2';
                    toolStatus.style.color = '#e0e0e0';
                }
                
                // Layer list
                const layerList = document.getElementById('layer-list');
                if (layerList) {
                    layerList.style.backgroundColor = '#1a1a1a';
                    layerList.style.borderColor = '#444';
                    layerList.style.color = '#e0e0e0';
                }
                
                // Layer items
                document.querySelectorAll('.layer-item').forEach(el => {
                    el.style.backgroundColor = '#2d2d2d';
                    el.style.borderColor = '#444';
                    el.style.color = '#e0e0e0';
                });
                
                // Active layer
                document.querySelectorAll('.layer-item.active').forEach(el => {
                    el.style.backgroundColor = '#1e3a5f';
                    el.style.borderColor = '#4a90e2';
                });
                
                // Canvas area white boxes
                document.querySelectorAll('#canvas-area > div[style*="background-color: #fff"], #canvas-area > div[style*="background-color:#fff"]').forEach(el => {
                    el.style.backgroundColor = '#2d2d2d';
                    el.style.color = '#e0e0e0';
                });
                
                // All sections with white backgrounds or light backgrounds
                const lightBgSelectors = [
                    '#onion-skin-controls',
                    '#guides-controls',
                    '#tilemap-controls',
                    '#shape-fill-controls',
                    '#selection-info-display',
                    '#timeline-container',
                    '#recent-colors-preview',
                    '#palette-preview',
                    '.category-tools'
                ];
                
                lightBgSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                        // Store original background for reference
                        const bgColor = window.getComputedStyle(el).backgroundColor;
                        if (bgColor.includes('rgb(255, 255, 255)') || bgColor.includes('rgb(227, 242, 253)') || 
                            bgColor.includes('rgb(240, 247, 255)') || bgColor.includes('rgb(236, 239, 241)') ||
                            bgColor.includes('rgb(255, 243, 205)') || bgColor.includes('rgb(224, 247, 250)')) {
                            el.style.backgroundColor = '#1a1a1a';
                        }
                        el.style.color = '#e0e0e0';
                        el.style.borderColor = '#444';
                    });
                });
                
                // Labels
                document.querySelectorAll('.control-label, label').forEach(el => {
                    el.style.color = '#e0e0e0';
                });
                
                // Headings
                document.querySelectorAll('h1, h2, h3').forEach(el => {
                    el.style.color = '#e0e0e0';
                });
                
                // Canvas controls area
                const canvasControls = document.getElementById('canvas-controls');
                if (canvasControls) {
                    canvasControls.style.backgroundColor = '#2d2d2d';
                    canvasControls.style.color = '#e0e0e0';
                    
                    // Style select elements and inputs within canvas controls
                    canvasControls.querySelectorAll('select, input[type="number"], input[type="text"]').forEach(el => {
                        el.style.backgroundColor = '#1a1a1a';
                        el.style.color = '#e0e0e0';
                        el.style.borderColor = '#555';
                    });
                }
                
                // Style all other select elements and text inputs
                document.querySelectorAll('select, input[type="number"], input[type="text"]').forEach(el => {
                    // Skip color pickers and other special inputs
                    if (!el.id.includes('color') && !el.id.includes('hex')) {
                        el.style.backgroundColor = '#1a1a1a';
                        el.style.color = '#e0e0e0';
                        el.style.borderColor = '#555';
                    }
                });
                
                // Histogram canvas and stats
                const histogramCanvas = document.getElementById('histogram-canvas');
                if (histogramCanvas) {
                    histogramCanvas.style.backgroundColor = '#1a1a1a';
                    histogramCanvas.style.borderColor = '#555';
                }
                
                const histogramStats = document.getElementById('histogram-stats');
                if (histogramStats) {
                    histogramStats.style.color = '#aaa';
                }
                
                // Animation preview canvas
                const animPreview = document.getElementById('animation-preview');
                if (animPreview) {
                    animPreview.style.borderColor = '#555';
                }
                
                // Re-render layer list to apply dark mode colors
                if (typeof renderLayerList === 'function') {
                    renderLayerList();
                }
                
            } else {
                // Reset to light mode
                document.body.style.backgroundColor = '#f0f0f0';
                document.body.style.color = '#000';
                
                document.querySelectorAll('#controls-panel, #frames-panel').forEach(el => {
                    el.style.backgroundColor = '#fff';
                    el.style.color = '#000';
                });
                
                document.querySelectorAll('.control-group').forEach(el => {
                    el.style.backgroundColor = '';
                    el.style.color = '';
                    el.style.borderColor = '';
                });
                
                // Current tool display (reset to original light style)
                const toolDisplay = document.getElementById('current-tool-display');
                if (toolDisplay) {
                    toolDisplay.style.backgroundColor = '#e3f2fd';
                    toolDisplay.style.borderColor = '#2196f3';
                    toolDisplay.style.color = '';
                }
                
                // Tool status
                const toolStatus = document.getElementById('tool-status');
                if (toolStatus) {
                    toolStatus.style.backgroundColor = '#e3f2fd';
                    toolStatus.style.borderColor = '#2196f3';
                    toolStatus.style.color = '';
                }
                
                // Layer list
                const layerList = document.getElementById('layer-list');
                if (layerList) {
                    layerList.style.backgroundColor = '';
                    layerList.style.borderColor = '';
                    layerList.style.color = '';
                }
                
                // Layer items
                document.querySelectorAll('.layer-item').forEach(el => {
                    el.style.backgroundColor = '';
                    el.style.borderColor = '';
                    el.style.color = '';
                });
                
                // Canvas area and other sections - reset all inline styles we added
                const resetSelectors = [
                    '#onion-skin-controls',
                    '#guides-controls',
                    '#tilemap-controls',
                    '#shape-fill-controls',
                    '#selection-info-display',
                    '#timeline-container',
                    '#recent-colors-preview',
                    '#palette-preview',
                    '.category-tools',
                    '#canvas-controls'
                ];
                
                resetSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                        el.style.backgroundColor = '';
                        el.style.color = '';
                        el.style.borderColor = '';
                    });
                });
                
                // Labels
                document.querySelectorAll('.control-label, label').forEach(el => {
                    el.style.color = '';
                });
                
                // Headings
                document.querySelectorAll('h1, h2, h3').forEach(el => {
                    el.style.color = '';
                });
                
                // Reset select elements and text inputs
                document.querySelectorAll('select, input[type="number"], input[type="text"]').forEach(el => {
                    if (!el.id.includes('color') && !el.id.includes('hex')) {
                        el.style.backgroundColor = '';
                        el.style.color = '';
                        el.style.borderColor = '';
                    }
                });
                
                // Reset histogram canvas and stats
                const histogramCanvas = document.getElementById('histogram-canvas');
                if (histogramCanvas) {
                    histogramCanvas.style.backgroundColor = '';
                    histogramCanvas.style.borderColor = '';
                }
                
                const histogramStats = document.getElementById('histogram-stats');
                if (histogramStats) {
                    histogramStats.style.color = '';
                }
                
                // Reset animation preview canvas
                const animPreview = document.getElementById('animation-preview');
                if (animPreview) {
                    animPreview.style.borderColor = '';
                }
                
                // Re-render layer list to apply light mode colors
                if (typeof renderLayerList === 'function') {
                    renderLayerList();
                }
            }
        }
        
        // --- COLOR PICKER FROM IMAGE ---
        
        function pickColorFromImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Create clickable preview
                    const previewDiv = document.createElement('div');
                    previewDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: crosshair;';
                    
                    const previewCanvas = document.createElement('canvas');
                    const maxSize = 600;
                    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                    previewCanvas.width = img.width * scale;
                    previewCanvas.height = img.height * scale;
                    previewCanvas.style.border = '3px solid white';
                    
                    const ctx = previewCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
                    
                    const instruction = document.createElement('div');
                    instruction.textContent = 'Click on image to pick color (ESC to cancel)';
                    instruction.style.cssText = 'position: absolute; top: 20px; background: white; padding: 10px; border-radius: 5px; font-weight: bold;';
                    
                    previewDiv.appendChild(instruction);
                    previewDiv.appendChild(previewCanvas);
                    document.body.appendChild(previewDiv);
                    
                    // Click to pick color
                    previewCanvas.onclick = (e) => {
                        const rect = previewCanvas.getBoundingClientRect();
                        const x = Math.floor((e.clientX - rect.left) / scale);
                        const y = Math.floor((e.clientY - rect.top) / scale);
                        
                        const pixelData = ctx.getImageData(Math.floor((e.clientX - rect.left)), Math.floor((e.clientY - rect.top)), 1, 1).data;
                        const hex = '#' + [pixelData[0], pixelData[1], pixelData[2]].map(c => c.toString(16).padStart(2, '0')).join('');
                        
                        currentColor = hex.toUpperCase();
                        colorPicker.value = currentColor;
                        document.getElementById('current-color-display').value = currentColor;
                        addToRecentColors(currentColor);
                        
                        document.body.removeChild(previewDiv);
                        alert(`Color picked: ${currentColor}`);
                    };
                    
                    // ESC to cancel
                    const keyHandler = (e) => {
                        if (e.key === 'Escape') {
                            document.body.removeChild(previewDiv);
                            document.removeEventListener('keydown', keyHandler);
                        }
                    };
                    document.addEventListener('keydown', keyHandler);
                    
                    // Click outside to cancel
                    previewDiv.onclick = (e) => {
                        if (e.target === previewDiv) {
                            document.body.removeChild(previewDiv);
                            document.removeEventListener('keydown', keyHandler);
                        }
                    };
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            // Reset file input
            event.target.value = '';
        }
        
        // --- WORKSPACE LAYOUTS ---
        
        function saveWorkspace() {
            const workspace = {
                version: '2.0',
                gridWidth: GRID_WIDTH,
                gridHeight: GRID_HEIGHT,
                brushSize: BRUSH_SIZE,
                brushShape: BRUSH_SHAPE,
                currentColor: currentColor,
                secondaryColor: colorSecondary,
                zoomLevel: ZOOM_LEVEL,
                panX: panX,
                panY: panY,
                gridVisibility: document.getElementById('grid-visibility').value,
                canvasBgPreset: document.getElementById('canvas-bg-preset').value,
                onionSkinEnabled: onionSkinEnabled,
                onionPrevOpacity: onionPrevOpacity,
                onionNextOpacity: onionNextOpacity,
                onionFrameCount: onionFrameCount,
                tilemapEnabled: tilemapEnabled,
                tileSize: tileSize,
                autoSaveEnabled: autoSaveEnabled,
                symmetryMode: SYMMETRY_MODE,
                currentPattern: CURRENT_PATTERN,
                guides: {
                    enabled: guidesEnabled,
                    vertical: verticalGuides,
                    horizontal: horizontalGuides
                }
            };
            
            try {
                localStorage.setItem('spooksie_workspace', JSON.stringify(workspace));
                alert('Workspace layout saved!\n\nIncludes: Grid, colors, zoom, tools, guides, and more!');
            } catch (e) {
                alert('Failed to save workspace:\n' + e.message);
            }
        }
        
        function loadWorkspace() {
            try {
                const saved = localStorage.getItem('spooksie_workspace');
                if (!saved) {
                    alert('No saved workspace found!');
                    return;
                }
                
                const workspace = JSON.parse(saved);
                
                // Restore settings
                if (workspace.brushSize) {
                    BRUSH_SIZE = workspace.brushSize;
                    brushSizeSlider.value = workspace.brushSize;
                    updateBrushSize();
                }
                if (workspace.brushShape) BRUSH_SHAPE = workspace.brushShape;
                if (workspace.currentColor) {
                    currentColor = workspace.currentColor;
                    colorPicker.value = workspace.currentColor;
                    document.getElementById('current-color-display').value = workspace.currentColor;
                }
                if (workspace.secondaryColor) {
                    colorSecondary = workspace.secondaryColor;
                    colorPickerSecondary.value = workspace.secondaryColor;
                    document.getElementById('secondary-color-display').value = workspace.secondaryColor;
                }
                if (workspace.zoomLevel) {
                    ZOOM_LEVEL = workspace.zoomLevel;
                    updateCanvasDimensions();
                    document.getElementById('zoom-level').textContent = `${ZOOM_LEVEL}x`;
                }
                if (workspace.panX !== undefined) panX = workspace.panX;
                if (workspace.panY !== undefined) panY = workspace.panY;
                if (workspace.gridVisibility) document.getElementById('grid-visibility').value = workspace.gridVisibility;
                if (workspace.canvasBgPreset) document.getElementById('canvas-bg-preset').value = workspace.canvasBgPreset;
                
                // Restore onion skin settings
                if (workspace.onionSkinEnabled !== undefined) {
                    onionSkinEnabled = workspace.onionSkinEnabled;
                    document.getElementById('onion-skin-enabled').checked = workspace.onionSkinEnabled;
                    toggleOnionSkin();
                }
                if (workspace.onionPrevOpacity !== undefined) {
                    onionPrevOpacity = workspace.onionPrevOpacity;
                    document.getElementById('onion-prev-opacity').value = Math.round(workspace.onionPrevOpacity * 100);
                }
                if (workspace.onionNextOpacity !== undefined) {
                    onionNextOpacity = workspace.onionNextOpacity;
                    document.getElementById('onion-next-opacity').value = Math.round(workspace.onionNextOpacity * 100);
                }
                if (workspace.onionFrameCount !== undefined) {
                    onionFrameCount = workspace.onionFrameCount;
                    document.getElementById('onion-frame-count').value = workspace.onionFrameCount;
                }
                
                // Restore guides
                if (workspace.guides) {
                    guidesEnabled = workspace.guides.enabled || false;
                    verticalGuides = workspace.guides.vertical || [];
                    horizontalGuides = workspace.guides.horizontal || [];
                    if (document.getElementById('guides-enabled')) {
                        document.getElementById('guides-enabled').checked = guidesEnabled;
                        toggleGuides();
                    }
                }
                
                updateCanvasPosition();
                updateGridVisibility();
                updateCanvasBackground();
                drawGrid();
                
                alert('Workspace layout loaded!\n\nYour preferences have been restored.');
            } catch (e) {
                alert('Failed to load workspace:\n' + e.message);
            }
        }
        
        // --- TILEMAP MODE ---
        
        function toggleTilemapMode() {
            tilemapEnabled = document.getElementById('tilemap-mode-enabled').checked;
            const controls = document.getElementById('tilemap-controls');
            if (controls) controls.style.display = tilemapEnabled ? 'block' : 'none';
            
            // Force brush size to match tile size in tilemap mode
            if (tilemapEnabled) {
                BRUSH_SIZE = tileSize;
                brushSizeSlider.value = tileSize;
                brushSizeSlider.disabled = true;
                updateBrushSize();
            } else {
                brushSizeSlider.disabled = false;
            }
            
            drawGrid(); // Redraw to show tile grid
        }
        
        function updateTileSize() {
            tileSize = parseInt(document.getElementById('tile-size-slider').value);
            document.getElementById('tile-size-display').textContent = `${tileSize}x${tileSize}`;
            
            // Update brush size to match
            if (tilemapEnabled) {
                BRUSH_SIZE = tileSize;
                brushSizeSlider.value = tileSize;
                updateBrushSize();
            }
            
            drawGrid(); // Redraw to show new tile size
        }
        
        // --- AUTO-SAVE WITH RECOVERY ---
        
        function toggleAutoSave() {
            const checkbox = document.getElementById('auto-save-enabled');
            if (checkbox.checked) {
                enableAutoSave();
            } else {
                disableAutoSave();
            }
        }
        
        function enableAutoSave() {
            autoSaveEnabled = true;
            if (autoSaveInterval) clearInterval(autoSaveInterval);
            
            autoSaveInterval = setInterval(() => {
                if (autoSaveEnabled) {
                    autoSaveProject();
                }
            }, AUTO_SAVE_DELAY);
            
            // Check for recovery data on load
            checkForRecovery();
        }
        
        function disableAutoSave() {
            autoSaveEnabled = false;
            if (autoSaveInterval) {
                clearInterval(autoSaveInterval);
                autoSaveInterval = null;
            }
        }
        
        function autoSaveProject() {
            try {
                const projectData = {
                    version: '2.0',
                    gridWidth: GRID_WIDTH,
                    gridHeight: GRID_HEIGHT,
                    gridSize: GRID_SIZE,
                    currentFrameIndex: currentFrameIndex,
                    currentLayerIndex: currentLayerIndex,
                    timestamp: Date.now(),
                    frameTags: frameTags,
                    frameDurations: frameDurations,
                    frames: frameLayers.map(frameLayers => 
                        frameLayers.map(layer => ({
                            name: layer.name,
                            visible: layer.visible,
                            opacity: layer.opacity,
                            blendMode: layer.blendMode || 'normal',
                            data: imageDataToBase64(layer.data)
                        }))
                    )
                };
                
                localStorage.setItem('spooksie_autosave', JSON.stringify(projectData));
                console.log('Auto-saved at ' + new Date().toLocaleTimeString());
            } catch (e) {
                console.error('Auto-save failed:', e);
                // If quota exceeded, disable auto-save
                if (e.name === 'QuotaExceededError') {
                    disableAutoSave();
                    alert('Auto-save disabled: LocalStorage quota exceeded.\n\nTip: Save your project manually and clear browser data.');
                }
            }
        }
        
        function checkForRecovery() {
            try {
                const saved = localStorage.getItem('spooksie_autosave');
                if (saved) {
                    const data = JSON.parse(saved);
                    const timestamp = new Date(data.timestamp);
                    const frameCount = data.frames ? data.frames.length : 0;
                    
                    if (confirm(`Recovery data found!\n\nSaved: ${timestamp.toLocaleString()}\nFrames: ${frameCount}\nDimensions: ${data.gridWidth}x${data.gridHeight}\n\nRecover this project?`)) {
                        loadRecoveryData(data);
                    } else {
                        // Clear recovery data
                        localStorage.removeItem('spooksie_autosave');
                    }
                }
            } catch (e) {
                console.error('Recovery check failed:', e);
            }
        }
        
        async function loadRecoveryData(projectData) {
            try {
                // Restore project data
                GRID_WIDTH = projectData.gridWidth;
                GRID_HEIGHT = projectData.gridHeight;
                GRID_SIZE = projectData.gridSize;
                gridWidthInput.value = GRID_WIDTH;
                gridHeightInput.value = GRID_HEIGHT;
                
                // Restore frames and layers
                frameLayers = [];
                for (const frameData of projectData.frames) {
                    const newFrameLayers = [];
                    for (const layerData of frameData) {
                        const imageData = await base64ToImageData(layerData.data);
                        newFrameLayers.push({
                            name: layerData.name,
                            visible: layerData.visible,
                            opacity: layerData.opacity,
                            blendMode: layerData.blendMode || 'normal',
                            data: imageData
                        });
                    }
                    frameLayers.push(newFrameLayers);
                }
                
                frames = new Array(frameLayers.length).fill(null).map(() => new ImageData(GRID_WIDTH, GRID_HEIGHT));
                currentFrameIndex = Math.min(projectData.currentFrameIndex || 0, frames.length - 1);
                currentLayerIndex = Math.min(projectData.currentLayerIndex || 0, getCurrentLayers().length - 1);
                
                // Restore frame tags and durations
                frameTags = projectData.frameTags || new Array(frames.length).fill('');
                frameDurations = projectData.frameDurations || new Array(frames.length).fill(undefined);
                
                // Refresh everything
                updatePixelScale();
                renderLayerList();
                compositeLayersToCanvas();
                renderFrameThumbnails();
                loadFrame(currentFrameIndex);
                drawGrid();
                updateAnimationPreview();
                document.getElementById('preview-frame-count').textContent = frames.length;
                updatePalette();
                
                alert(`Project recovered successfully!\n${frames.length} frames restored`);
                
                // Clear recovery data after successful recovery
                localStorage.removeItem('spooksie_autosave');
            } catch (err) {
                alert(`Error recovering project:\n${err.message}`);
            }
        }
        
        // --- COLOR REMAP TOOL ---
        
        function toggleColorRemap() {
            const remapDiv = document.getElementById('remap-info');
            const remapBtn = document.getElementById('remap-btn');
            
            // If already open, close it
            if (remapDiv.innerHTML !== '') {
                cancelColorRemap();
                remapBtn.classList.remove('tool-active');
                return;
            }
            
            // Otherwise, open it
            startColorRemap();
        }
        
        function startColorRemap() {
            // Get palette and create remap UI
            updatePalette();
            const sortedColors = Array.from(paletteColors).sort();
            
            if (sortedColors.length === 0) {
                alert("No colors found!\nDraw something first.");
                return;
            }
            
            // Highlight the button as active
            const remapBtn = document.getElementById('remap-btn');
            remapBtn.classList.add('tool-active');
            
            // Show status message
            updateToolStatus('🎨 Color Remap (Multi) is active - Select target colors below and click "Apply Remap to All Frames"');
            
            const remapDiv = document.getElementById('remap-info');
            let remapHTML = `<div style="margin-top: 8px; border: 1px solid #e91e63; border-radius: 4px; background-color: #fff;">
                <div style="font-size: 0.8em; font-weight: bold; padding: 8px; color: #e91e63; background: #fff; border-bottom: 1px solid #e91e63;">Color Remap (${sortedColors.length} colors)</div>
                <div style="max-height: 200px; overflow-y: auto; padding: 8px;">`;
            
            sortedColors.forEach((colorKey, idx) => {
                const [r, g, b, a] = colorKey.split(',').map(Number);
                const hexColor = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
                remapHTML += `
                    <div style="display: flex; gap: 5px; align-items: center; margin: 3px 0;">
                        <div style="width: 20px; height: 20px; background-color: ${hexColor}; border: 1px solid #333;"></div>
                        <span style="font-size: 0.7em; flex: 1;">→</span>
                        <input type="color" id="remap-target-${idx}" value="${hexColor}" style="width: 30px; height: 20px; padding: 0; border: 1px solid #ccc;">
                        <input type="text" id="remap-hex-${idx}" value="${hexColor.toUpperCase()}" maxlength="7" style="width: 60px; font-size: 0.7em; text-transform: uppercase; font-family: monospace;">
                    </div>`;
            });
            
            remapHTML += `</div>
                <div style="padding: 8px; border-top: 1px solid #e91e63; background: #fff;">
                    <button onclick="applyColorRemap()" style="width: 100%; margin-bottom: 5px; background-color: #e91e63; border-color: #e91e63;">Apply Remap to All Frames</button>
                    <button onclick="cancelColorRemap()" style="width: 100%; background-color: #6c757d; border-color: #6c757d;">Cancel</button>
                </div>
            </div>`;
            
            remapDiv.innerHTML = remapHTML;
            
            // Add hex input syncing
            sortedColors.forEach((colorKey, idx) => {
                const colorInput = document.getElementById(`remap-target-${idx}`);
                const hexInput = document.getElementById(`remap-hex-${idx}`);
                
                colorInput.addEventListener('input', () => {
                    hexInput.value = colorInput.value.toUpperCase();
                });
                
                hexInput.addEventListener('change', () => {
                    const hex = normalizeHexColor(hexInput.value);
                    if (hex) {
                        colorInput.value = hex;
                        hexInput.value = hex;
                    } else {
                        hexInput.value = colorInput.value.toUpperCase();
                    }
                });
            });
        }
        
        function applyColorRemap() {
            const sortedColors = Array.from(paletteColors).sort();
            const remapMap = {};
            
            // Build remap dictionary
            sortedColors.forEach((colorKey, idx) => {
                const hexInput = document.getElementById(`remap-hex-${idx}`);
                if (hexInput) {
                    const [r, g, b, a] = colorKey.split(',').map(Number);
                    const targetHex = hexInput.value.trim();
                    const targetRGBA = hexToRgb(targetHex);
                    targetRGBA[3] = a; // Preserve original alpha
                    remapMap[colorKey] = targetRGBA;
                }
            });
            
            saveState(); // Save before remapping
            
            // Apply remap to all layers of all frames
            let pixelsChanged = 0;
            frameLayers.forEach((frameLayers, frameIndex) => {
                frameLayers.forEach((layer, layerIndex) => {
                    for (let i = 0; i < layer.data.data.length; i += 4) {
                        const pixelKey = `${layer.data.data[i]},${layer.data.data[i+1]},${layer.data.data[i+2]},${layer.data.data[i+3]}`;
                        const newColor = remapMap[pixelKey];
                        if (newColor) {
                            layer.data.data[i] = newColor[0];
                            layer.data.data[i + 1] = newColor[1];
                            layer.data.data[i + 2] = newColor[2];
                            layer.data.data[i + 3] = newColor[3];
                            pixelsChanged++;
                        }
                    }
                });
                updateThumbnail(frameIndex);
            });
            
            compositeLayersToCanvas();
            updatePalette();
            cancelColorRemap();
            alert(`Color remap complete!\n${pixelsChanged} pixels remapped across all frames and layers!`);
        }
        
        function cancelColorRemap() {
            document.getElementById('remap-info').innerHTML = '';
            const remapBtn = document.getElementById('remap-btn');
            if (remapBtn) {
                remapBtn.classList.remove('tool-active');
            }
            updateToolStatus(''); // Clear the status message
        }
        
        // --- PROJECT SAVE/LOAD ---
        
        function saveProject() {
            // Create project data object
            const projectData = {
                version: '2.0',
                gridWidth: GRID_WIDTH,
                gridHeight: GRID_HEIGHT,
                gridSize: GRID_SIZE,
                currentFrameIndex: currentFrameIndex,
                currentLayerIndex: currentLayerIndex,
                frameTags: frameTags,
                frameDurations: frameDurations,
                customBrush: customBrushPattern ? {
                    size: customBrushSize,
                    pattern: customBrushPattern
                } : null,
                frames: frameLayers.map(frameLayers => 
                    frameLayers.map(layer => ({
                        name: layer.name,
                        visible: layer.visible,
                        opacity: layer.opacity,
                        blendMode: layer.blendMode || 'normal',
                        // Convert ImageData to base64
                        data: imageDataToBase64(layer.data)
                    }))
                )
            };
            
            const jsonString = JSON.stringify(projectData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spooksie_project_${GRID_WIDTH}x${GRID_HEIGHT}_${frameLayers.length}frames.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(`Project saved!\n${frameLayers.length} frames, ${frameLayers.reduce((acc, f) => acc + f.length, 0)} total layers`);
        }
        
        async function loadProject(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const projectData = JSON.parse(e.target.result);
                    
                    // Validate project data
                    if (!projectData.version || !projectData.frames) {
                        alert('Invalid project file!');
                        return;
                    }
                    
                    const confirmed = confirm(`Load project?\n\nDimensions: ${projectData.gridWidth}x${projectData.gridHeight}\nFrames: ${projectData.frames.length}\n\nThis will replace your current work!`);
                    if (!confirmed) return;
                    
                    saveState(); // Save current state before loading (allows undo)
                    
                    // Restore project data
                    GRID_WIDTH = projectData.gridWidth;
                    GRID_HEIGHT = projectData.gridHeight;
                    GRID_SIZE = projectData.gridSize;
                    gridWidthInput.value = GRID_WIDTH;
                    gridHeightInput.value = GRID_HEIGHT;
                    
                    // Restore frames and layers (async because of image loading)
                    frameLayers = [];
                    for (const frameData of projectData.frames) {
                        const newFrameLayers = [];
                        for (const layerData of frameData) {
                            const imageData = await base64ToImageData(layerData.data);
                            newFrameLayers.push({
                                name: layerData.name,
                                visible: layerData.visible,
                                opacity: layerData.opacity,
                                blendMode: layerData.blendMode || 'normal',
                                data: imageData
                            });
                        }
                        frameLayers.push(newFrameLayers);
                    }
                    
                    frames = new Array(frameLayers.length).fill(null).map(() => new ImageData(GRID_WIDTH, GRID_HEIGHT));
                    currentFrameIndex = Math.min(projectData.currentFrameIndex || 0, frames.length - 1);
                    currentLayerIndex = Math.min(projectData.currentLayerIndex || 0, getCurrentLayers().length - 1);
                    
                    // Restore custom brush if available
                    if (projectData.customBrush) {
                        customBrushSize = projectData.customBrush.size;
                        customBrushPattern = projectData.customBrush.pattern;
                    }
                    
                    // Refresh everything
                    updatePixelScale();
                    renderLayerList();
                    compositeLayersToCanvas();
                    renderFrameThumbnails();
                    loadFrame(currentFrameIndex);
                    drawGrid();
                    updateAnimationPreview();
                    document.getElementById('preview-frame-count').textContent = frames.length;
                    updatePalette();
                    
                    alert(`Project loaded successfully!\n${frames.length} frames restored`);
                } catch (err) {
                    alert(`Error loading project:\n${err.message}`);
                }
            };
            reader.readAsText(file);
            
            // Reset file input
            event.target.value = '';
        }
        
        function imageDataToBase64(imageData) {
            const { canvas, ctx } = createTempCanvas(imageData.width, imageData.height);
            ctx.putImageData(imageData, 0, 0);
            return canvas.toDataURL('image/png');
        }
        
        function base64ToImageData(base64) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = function() {
                    const { canvas, ctx } = createTempCanvas(img.width, img.height);
                    ctx.drawImage(img, 0, 0);
                    resolve(ctx.getImageData(0, 0, img.width, img.height));
                };
                img.onerror = reject;
                img.src = base64;
            });
        }
        
        // --- BULK IMPORT IMAGES ---
        
        function bulkImportImages(event) {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;
            
            if (!confirm(`Import ${files.length} images as frames?\n\nThis will replace your current project!`)) return;
            
            saveState();
            
            // Clear existing and prepare
            frames = [];
            frameLayers = [];
            frameTags = [];
            frameDurations = [];
            
            let loadedCount = 0;
            
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        // Use image dimensions or current grid size
                        const frameWidth = GRID_WIDTH;
                        const frameHeight = GRID_HEIGHT;
                        
                        const { canvas: frameCanvas, ctx: frameCtx } = createTempCanvas(frameWidth, frameHeight);
                        frameCtx.drawImage(img, 0, 0, frameWidth, frameHeight);
                        const frameData = frameCtx.getImageData(0, 0, frameWidth, frameHeight);
                        
                        const newLayer = {
                            name: 'Layer 1',
                            data: frameData,
                            visible: true,
                            opacity: 1.0,
                            blendMode: 'normal',
                            mask: null,
                            maskEnabled: false,
                            effects: {dropShadow: false, glow: false, stroke: false}
                        };
                        
                        frameLayers[index] = [newLayer];
                        frames[index] = new ImageData(frameWidth, frameHeight);
                        frameTags[index] = '';
                        frameDurations[index] = undefined;
                        
                        loadedCount++;
                        if (loadedCount === files.length) {
                            currentFrameIndex = 0;
                            currentLayerIndex = 0;
                            renderLayerList();
                            compositeLayersToCanvas();
                            renderFrameThumbnails();
                            loadFrame(0);
                            updateAnimationPreview();
                            document.getElementById('preview-frame-count').textContent = frames.length;
                            updatePalette();
                            alert(`Imported ${files.length} images as frames!`);
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
            
            event.target.value = '';
        }
        
        
        // --- IMPORT REFERENCE IMAGE ---
        
        function importReferenceImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    showCropModal(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            event.target.value = ''; // Reset input
        }

        function showCropModal(img) {
            const modal = document.createElement('div');
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:10000; flex-direction:column;';
            
            const content = document.createElement('div');
            content.style.cssText = 'background:#2c2c2c; padding:20px; border-radius:8px; display:flex; flex-direction:column; align-items:center;';
            
            const title = document.createElement('h2');
            title.textContent = 'Crop Reference Image';
            title.style.color = '#fff';
            
            const instructions = document.createElement('p');
            instructions.textContent = 'Drag to select region. Aspect ratio is locked to sprite size.';
            instructions.style.color = '#ccc';
            instructions.style.fontSize = '12px';
            
            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.marginTop = '10px';
            
            // Scale image to fit max 600x600
            const maxDim = 600;
            let scale = 1;
            if (img.width > maxDim || img.height > maxDim) {
                scale = Math.min(maxDim / img.width, maxDim / img.height);
            }
            const drawW = img.width * scale;
            const drawH = img.height * scale;
            
            const canvas = document.createElement('canvas');
            canvas.width = drawW;
            canvas.height = drawH;
            canvas.style.backgroundColor = '#111';
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, drawW, drawH);
            
            const overlay = document.createElement('canvas');
            overlay.width = drawW;
            overlay.height = drawH;
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.cursor = 'crosshair';
            
            container.appendChild(canvas);
            container.appendChild(overlay);
            
            const aspect = GRID_WIDTH / GRID_HEIGHT;
            let cropBox = {x: 0, y: 0, w: Math.min(drawW, drawH * aspect), h: Math.min(drawH, drawW / aspect)};
            
            let isDragging = false;
            let dragStart = {x:0, y:0};
            
            function drawOverlay() {
                const oCtx = overlay.getContext('2d');
                oCtx.clearRect(0, 0, drawW, drawH);
                oCtx.fillStyle = 'rgba(0,0,0,0.5)';
                oCtx.fillRect(0, 0, drawW, drawH);
                oCtx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
                oCtx.strokeStyle = '#2196f3';
                oCtx.lineWidth = 2;
                oCtx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
            }
            
            const handleMouseMove = (e) => {
                if (!isDragging) return;
                const rect = overlay.getBoundingClientRect();
                let mx = e.clientX - rect.left;
                let my = e.clientY - rect.top;
                
                mx = Math.max(0, Math.min(drawW, mx));
                my = Math.max(0, Math.min(drawH, my));
                
                let nw = mx - dragStart.x;
                let nh = my - dragStart.y;
                
                // Force aspect ratio
                if (Math.abs(nw) / Math.abs(nh) > aspect) {
                    nh = Math.sign(nh) * Math.abs(nw) / aspect;
                } else {
                    nw = Math.sign(nw) * Math.abs(nh) * aspect;
                }
                
                // Ensure it doesn't go out of bounds
                if (dragStart.x + nw > drawW) { nw = drawW - dragStart.x; nh = Math.sign(nh) * Math.abs(nw) / aspect; }
                if (dragStart.x + nw < 0) { nw = -dragStart.x; nh = Math.sign(nh) * Math.abs(nw) / aspect; }
                if (dragStart.y + nh > drawH) { nh = drawH - dragStart.y; nw = Math.sign(nw) * Math.abs(nh) * aspect; }
                if (dragStart.y + nh < 0) { nh = -dragStart.y; nw = Math.sign(nw) * Math.abs(nh) * aspect; }
                
                cropBox.x = nw < 0 ? dragStart.x + nw : dragStart.x;
                cropBox.y = nh < 0 ? dragStart.y + nh : dragStart.y;
                cropBox.w = Math.abs(nw);
                cropBox.h = Math.abs(nh);
                
                drawOverlay();
            };

            const handleMouseUp = () => {
                isDragging = false;
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                // Fix zero size
                if (cropBox.w < 10) {
                    cropBox = {x: 0, y: 0, w: Math.min(drawW, drawH * aspect), h: Math.min(drawH, drawW / aspect)};
                    drawOverlay();
                }
            };

            overlay.addEventListener('mousedown', (e) => {
                isDragging = true;
                const rect = overlay.getBoundingClientRect();
                dragStart.x = e.clientX - rect.left;
                dragStart.y = e.clientY - rect.top;
                cropBox.x = dragStart.x;
                cropBox.y = dragStart.y;
                cropBox.w = 0;
                cropBox.h = 0;
                drawOverlay();
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
            });
            
            drawOverlay();
            
            const btns = document.createElement('div');
            btns.style.marginTop = '15px';
            btns.style.display = 'flex';
            btns.style.gap = '10px';
            
            const applyBtn = document.createElement('button');
            applyBtn.textContent = 'Import as New Layer';
            applyBtn.style.cssText = 'background:#4CAF50; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;';
            applyBtn.onclick = () => {
                // Calculate original image coordinates
                const sx = cropBox.x / scale;
                const sy = cropBox.y / scale;
                const sw = cropBox.w / scale;
                const sh = cropBox.h / scale;
                
                // Draw to offscreen canvas
                const tempC = document.createElement('canvas');
                tempC.width = GRID_WIDTH;
                tempC.height = GRID_HEIGHT;
                const tempCtx = tempC.getContext('2d');
                tempCtx.imageSmoothingEnabled = true;
                tempCtx.drawImage(img, sx, sy, sw, sh, 0, 0, GRID_WIDTH, GRID_HEIGHT);
                
                const imgData = tempCtx.getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT);
                
                saveState();
                const newLayer = {
                    name: `Ref Image`,
                    data: imgData,
                    visible: true,
                    opacity: 0.5,
                    blendMode: 'normal',
                    mask: null,
                    maskEnabled: false,
                    effects: { dropShadow: false, glow: false, stroke: false, shadowColor: '#000000', glowColor: '#FFFFFF', strokeColor: '#000000' }
                };
                const layers = getCurrentLayers();
                layers.splice(currentLayerIndex + 1, 0, newLayer);
                currentLayerIndex++;
                
                renderLayerList();
                compositeLayersToCanvas();
                updateThumbnail(currentFrameIndex);
                updateAnimationPreview();
                
                document.body.removeChild(modal);
            };
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.cssText = 'background:#f44336; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; font-weight:bold;';
            cancelBtn.onclick = () => document.body.removeChild(modal);
            
            btns.appendChild(applyBtn);
            btns.appendChild(cancelBtn);
            
            content.appendChild(title);
            content.appendChild(instructions);
            content.appendChild(container);
            content.appendChild(btns);
            modal.appendChild(content);
            document.body.appendChild(modal);
        }
        
        // --- IMPORT SPRITE SHEET ---
        
        function importSpriteSheet(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = async function() {
                    // Ask user for frame configuration
                    const frameWidthResult = await styledPrompt(`Sprite sheet loaded: ${img.width}x${img.height}\n\nEnter frame width (pixels):`, GRID_WIDTH.toString(), '📥 Import Sprite Sheet');
                    const frameWidth = parseInt(frameWidthResult);
                    if (!frameWidth || frameWidth <= 0) return;
                    
                    const frameHeightResult = await styledPrompt(`Enter frame height (pixels):`, GRID_HEIGHT.toString(), '📥 Frame Height');
                    const frameHeight = parseInt(frameHeightResult);
                    if (!frameHeight || frameHeight <= 0) return;
                    
                    const framesPerRow = Math.floor(img.width / frameWidth);
                    const framesPerColumn = Math.floor(img.height / frameHeight);
                    const totalFrames = framesPerRow * framesPerColumn;
                    
                    if (totalFrames === 0) {
                        alert("Invalid frame dimensions!");
                        return;
                    }
                    
                    const confirmed = confirm(`This will import ${totalFrames} frames (${framesPerRow} columns x ${framesPerColumn} rows)\nFrame size: ${frameWidth}x${frameHeight}\n\nContinue?`);
                    if (!confirmed) return;
                    
                    saveState(); // Save before importing
                    
                    // Resize sprite to match frame dimensions
                    GRID_WIDTH = frameWidth;
                    GRID_HEIGHT = frameHeight;
                    GRID_SIZE = Math.max(frameWidth, frameHeight);
                    gridWidthInput.value = frameWidth;
                    gridHeightInput.value = frameHeight;
                    
                    // Clear existing frames and create new ones
                    frames = [];
                    frameLayers = [];
                    
                    // Extract frames from sprite sheet
                    for (let row = 0; row < framesPerColumn; row++) {
                        for (let col = 0; col < framesPerRow; col++) {
                            const { canvas: frameCanvas, ctx: frameCtx } = createTempCanvas(frameWidth, frameHeight);
                            frameCtx.drawImage(img, 
                                col * frameWidth, row * frameHeight, frameWidth, frameHeight,
                                0, 0, frameWidth, frameHeight
                            );
                            
                            const frameData = frameCtx.getImageData(0, 0, frameWidth, frameHeight);
                            
                            // Create layer with frame data
                            const newLayer = {
                                name: 'Layer 1',
                                data: frameData,
                                visible: true,
                                opacity: 1.0,
                                blendMode: 'normal'
                            };
                            
                            frameLayers.push([newLayer]);
                            frames.push(new ImageData(frameWidth, frameHeight));
                        }
                    }
                    
                    currentFrameIndex = 0;
                    currentLayerIndex = 0;
                    
                    updatePixelScale();
                    renderLayerList();
                    compositeLayersToCanvas();
                    renderFrameThumbnails();
                    updateThumbnail(currentFrameIndex);
                    loadFrame(currentFrameIndex);
                    drawGrid();
                    updateAnimationPreview();
                    document.getElementById('preview-frame-count').textContent = frames.length;
                    
                    alert(`Imported ${totalFrames} frames successfully!`);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            // Reset file input
            event.target.value = '';
        }
        
        // --- ROTATION AND FLIP TOOLS ---
        
        function rotateCurrentLayer(degrees) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            saveState('transform'); // Save before rotating
            
            // Create temp canvas with current layer data
            const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            tempCtx.putImageData(currentLayer.data, 0, 0);
            
            // Create new canvas for rotated result (swap dimensions for 90° rotations)
            const isQuarterTurn = Math.abs(degrees) === 90 || Math.abs(degrees) === 270;
            const newWidth = isQuarterTurn ? GRID_HEIGHT : GRID_WIDTH;
            const newHeight = isQuarterTurn ? GRID_WIDTH : GRID_HEIGHT;
            const { canvas: rotatedCanvas, ctx: rotatedCtx } = createTempCanvas(newWidth, newHeight);
            
            // Rotate
            rotatedCtx.translate(newWidth / 2, newHeight / 2);
            rotatedCtx.rotate((degrees * Math.PI) / 180);
            rotatedCtx.drawImage(tempCanvas, -GRID_WIDTH / 2, -GRID_HEIGHT / 2);
            
            // Update layer data
            currentLayer.data = rotatedCtx.getImageData(0, 0, newWidth, newHeight);
            
            // If dimensions changed, update grid size
            if (isQuarterTurn && GRID_WIDTH !== GRID_HEIGHT) {
                alert("Note: Rotation requires square canvas for non-square sprites.\nConsider resizing to square dimensions first.");
                // For now, we'll just rotate in place and it might clip
            }
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        function flipCurrentLayer(direction) {
            const layers = getCurrentLayers();
            const currentLayer = layers[currentLayerIndex];
            if (!currentLayer) return;
            
            saveState('transform'); // Save before flipping
            
            const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            tempCtx.putImageData(currentLayer.data, 0, 0);
            
            const { canvas: flippedCanvas, ctx: flippedCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
            
            if (direction === 'horizontal') {
                flippedCtx.scale(-1, 1);
                flippedCtx.drawImage(tempCanvas, -GRID_WIDTH, 0);
            } else { // vertical
                flippedCtx.scale(1, -1);
                flippedCtx.drawImage(tempCanvas, 0, -GRID_HEIGHT);
            }
            
            currentLayer.data = flippedCtx.getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT);
            
            compositeLayersToCanvas();
            updateThumbnail(currentFrameIndex);
            updateAnimationPreview();
        }
        
        // --- ONION SKINNING ---
        
        function toggleOnionSkin() {
            const checkbox = document.getElementById('onion-skin-enabled');
            onionSkinEnabled = checkbox ? checkbox.checked : false;
            const controls = document.getElementById('onion-skin-controls');
            if (controls) controls.style.display = onionSkinEnabled ? 'block' : 'none';
            
            // Initialize values if just enabled
            if (onionSkinEnabled) {
                updateOnionOpacity();
            } else {
                compositeLayersToCanvas();
            }
        }
        
        function updateOnionOpacity() {
            const prevSlider = document.getElementById('onion-prev-opacity');
            const nextSlider = document.getElementById('onion-next-opacity');
            const countSlider = document.getElementById('onion-frame-count');
            
            if (prevSlider) onionPrevOpacity = parseInt(prevSlider.value) / 100;
            if (nextSlider) onionNextOpacity = parseInt(nextSlider.value) / 100;
            if (countSlider) onionFrameCount = parseInt(countSlider.value);
            
            const prevDisplay = document.getElementById('onion-prev-opacity-display');
            const nextDisplay = document.getElementById('onion-next-opacity-display');
            const countDisplay = document.getElementById('onion-frame-count-display');
            
            if (prevDisplay) prevDisplay.textContent = Math.round(onionPrevOpacity * 100) + '%';
            if (nextDisplay) nextDisplay.textContent = Math.round(onionNextOpacity * 100) + '%';
            if (countDisplay) countDisplay.textContent = onionFrameCount;
            
            compositeLayersToCanvas();
        }
        
        function drawOnionSkin() {
            if (!onionSkinEnabled || frames.length <= 1) return;
            
            mainCtx.imageSmoothingEnabled = false;
            const displayWidth = GRID_WIDTH * PIXEL_SCALE;
            const displayHeight = GRID_HEIGHT * PIXEL_SCALE;
            
            // Draw previous frames (red tint)
            for (let i = 1; i <= onionFrameCount; i++) {
                const prevIndex = currentFrameIndex - i;
                if (prevIndex >= 0 && prevIndex < frames.length) {
                    const compositeData = compositeSingleFrameLayers(prevIndex);
                    const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                    tempCtx.putImageData(compositeData, 0, 0);
                    
                    // Create a tinted version
                    const tintCanvas = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                    tintCanvas.ctx.drawImage(tempCanvas, 0, 0);
                    
                    // Apply red tint
                    const imgData = tintCanvas.ctx.getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT);
                    const data = imgData.data;
                    for (let j = 0; j < data.length; j += 4) {
                        if (data[j + 3] > 0) { // If pixel has alpha
                            data[j] = Math.min(255, data[j] + 100);     // Increase red
                            data[j + 1] = Math.max(0, data[j + 1] - 50); // Decrease green
                            data[j + 2] = Math.max(0, data[j + 2] - 50); // Decrease blue
                        }
                    }
                    tintCanvas.ctx.putImageData(imgData, 0, 0);
                    
                    const opacity = onionPrevOpacity / i;
                    mainCtx.save();
                    mainCtx.globalAlpha = opacity;
                    mainCtx.drawImage(tintCanvas.canvas, 0, 0, GRID_WIDTH, GRID_HEIGHT, 0, 0, displayWidth, displayHeight);
                    mainCtx.restore();
                }
            }
            
            // Draw next frames (blue tint)
            for (let i = 1; i <= onionFrameCount; i++) {
                const nextIndex = currentFrameIndex + i;
                if (nextIndex < frames.length) {
                    const compositeData = compositeSingleFrameLayers(nextIndex);
                    const { canvas: tempCanvas, ctx: tempCtx } = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                    tempCtx.putImageData(compositeData, 0, 0);
                    
                    // Create a tinted version
                    const tintCanvas = createTempCanvas(GRID_WIDTH, GRID_HEIGHT);
                    tintCanvas.ctx.drawImage(tempCanvas, 0, 0);
                    
                    // Apply blue tint
                    const imgData = tintCanvas.ctx.getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT);
                    const data = imgData.data;
                    for (let j = 0; j < data.length; j += 4) {
                        if (data[j + 3] > 0) { // If pixel has alpha
                            data[j] = Math.max(0, data[j] - 50);         // Decrease red
                            data[j + 1] = Math.max(0, data[j + 1] - 50); // Decrease green
                            data[j + 2] = Math.min(255, data[j + 2] + 100); // Increase blue
                        }
                    }
                    tintCanvas.ctx.putImageData(imgData, 0, 0);
                    
                    const opacity = onionNextOpacity / i;
                    mainCtx.save();
                    mainCtx.globalAlpha = opacity;
                    mainCtx.drawImage(tintCanvas.canvas, 0, 0, GRID_WIDTH, GRID_HEIGHT, 0, 0, displayWidth, displayHeight);
                    mainCtx.restore();
                }
            }
            
            mainCtx.globalAlpha = 1.0;
            mainCtx.globalCompositeOperation = 'source-over';
        }
        
        // --- COLLAPSIBLE CATEGORY CLICK-TO-LOCK ---
        
        function saveCategoryState() {
            try {
                const categories = document.querySelectorAll('.tool-category');
                const lockedStates = {};
                categories.forEach((category, index) => {
                    lockedStates[index] = category.classList.contains('locked');
                });
                localStorage.setItem('spooksie_locked_categories', JSON.stringify(lockedStates));
            } catch (e) {
                // LocalStorage not available or quota exceeded
            }
        }
        
        function loadCategoryState() {
            try {
                const saved = localStorage.getItem('spooksie_locked_categories');
                if (saved) {
                    const lockedStates = JSON.parse(saved);
                    const categories = document.querySelectorAll('.tool-category');
                    categories.forEach((category, index) => {
                        if (lockedStates[index]) {
                            category.classList.add('locked');
                        }
                    });
                }
            } catch (e) {
                // LocalStorage not available or invalid data
            }
        }
        
        // --- START THE APPLICATION ---
        window.onload = () => {
            initEditor();
            initializeToolCategories();
            enableAutoSave(); // Start auto-save system
        };
