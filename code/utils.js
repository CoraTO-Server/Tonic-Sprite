// Spooksie's Sprite Tool - Utility Functions
// Helper functions used throughout the application

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

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
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
        r = g = b = l;
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

function colorMatch(color1, color2, tolerance = 0) {
    return Math.abs(color1[0] - color2[0]) <= tolerance &&
           Math.abs(color1[1] - color2[1]) <= tolerance &&
           Math.abs(color1[2] - color2[2]) <= tolerance &&
           Math.abs(color1[3] - color2[3]) <= tolerance;
}

function setPixelInLayer(layer, x, y, r, g, b, a) {
    // Get dimensions from layer data if GRID_WIDTH/GRID_HEIGHT not available
    const width = (typeof GRID_WIDTH !== 'undefined') ? GRID_WIDTH : layer.data.width;
    const height = (typeof GRID_HEIGHT !== 'undefined') ? GRID_HEIGHT : layer.data.height;
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const index = (y * width + x) * 4;
    layer.data.data[index] = r;
    layer.data.data[index + 1] = g;
    layer.data.data[index + 2] = b;
    layer.data.data[index + 3] = a;
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

// Styled prompt modal - replaces browser's prompt() with a custom styled dialog
function styledPrompt(message, defaultValue = '', title = '💬 Input') {
    return new Promise((resolve) => {
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
            min-width: 400px;
            max-width: 600px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        
        // Create elements safely
        const titleElem = document.createElement('h2');
        titleElem.textContent = title;
        titleElem.style.cssText = 'margin: 0 0 15px 0; text-align: center; color: #4CAF50;';
        
        const messageElem = document.createElement('p');
        messageElem.textContent = message;
        messageElem.style.cssText = 'margin: 0 0 20px 0; white-space: pre-wrap; line-height: 1.6; color: #ccc;';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultValue || '';
        input.id = 'styledPromptInput';
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            font-size: 16px;
            border: 2px solid #555;
            border-radius: 5px;
            background: #1a1a1a;
            color: #fff;
            box-sizing: border-box;
            margin-bottom: 20px;
        `;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';
        
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.id = 'styledPromptOK';
        okButton.style.cssText = `
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
        cancelButton.id = 'styledPromptCancel';
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
        
        buttonContainer.appendChild(okButton);
        buttonContainer.appendChild(cancelButton);
        
        content.appendChild(titleElem);
        content.appendChild(messageElem);
        content.appendChild(input);
        content.appendChild(buttonContainer);
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        input.focus();
        input.select();
        
        const cleanup = (value) => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            resolve(value);
        };
        
        // OK button
        document.getElementById('styledPromptOK').onclick = () => {
            cleanup(input.value);
        };
        
        // Cancel button
        document.getElementById('styledPromptCancel').onclick = () => {
            cleanup(null);
        };
        
        // Enter key submits
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                cleanup(input.value);
            } else if (e.key === 'Escape') {
                cleanup(null);
            }
        });
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                cleanup(null);
            }
        };
    });
}

// Styled confirm modal - replaces browser's confirm() with a custom styled dialog
function styledConfirm(message, title = '❓ Confirm') {
    return new Promise((resolve) => {
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
            min-width: 400px;
            max-width: 600px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        
        // Create elements safely
        const titleElem = document.createElement('h2');
        titleElem.textContent = title;
        titleElem.style.cssText = 'margin: 0 0 15px 0; text-align: center; color: #4CAF50;';
        
        const messageElem = document.createElement('p');
        messageElem.textContent = message;
        messageElem.style.cssText = 'margin: 0 0 25px 0; white-space: pre-wrap; line-height: 1.6; color: #ccc; font-size: 15px;';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';
        
        const yesButton = document.createElement('button');
        yesButton.textContent = 'Yes';
        yesButton.id = 'styledConfirmYes';
        yesButton.style.cssText = `
            padding: 12px 30px;
            font-size: 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        const noButton = document.createElement('button');
        noButton.textContent = 'No';
        noButton.id = 'styledConfirmNo';
        noButton.style.cssText = `
            padding: 12px 30px;
            font-size: 16px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        buttonContainer.appendChild(yesButton);
        buttonContainer.appendChild(noButton);
        
        content.appendChild(titleElem);
        content.appendChild(messageElem);
        content.appendChild(buttonContainer);
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        const cleanup = (value) => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            resolve(value);
        };
        
        // Yes button
        document.getElementById('styledConfirmYes').onclick = () => {
            cleanup(true);
        };
        
        // No button
        document.getElementById('styledConfirmNo').onclick = () => {
            cleanup(false);
        };
        
        // ESC key = No
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                cleanup(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Close on overlay click = No
        modal.onclick = (e) => {
            if (e.target === modal) {
                cleanup(false);
            }
        };
    });
}
