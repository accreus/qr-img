import QRCode from 'qrcode';

// ---- Client-side routing ----
const path = window.location.pathname.replace(/\/+$/, ''); // remove trailing slash

if (path === '/ramesh') {
    // Show ramesh view
    document.getElementById('ramesh-view').classList.remove('hidden');
    document.querySelector('.container:not(.ramesh-container)')?.classList.add('hidden');

    // Generate QR code for the ramesh text
    const rameshText = 'Bazinga by Ramesh the lab technician';
    const rameshCanvas = document.getElementById('ramesh-qr-canvas');

    QRCode.toCanvas(rameshCanvas, rameshText, {
        width: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
    });
}

// DOM Elements
const urlInput = document.getElementById('url-input');
const clearBtn = document.getElementById('clear-btn');
const generateBtn = document.getElementById('generate-btn');
const qrContainer = document.getElementById('qr-container');
const qrCanvas = document.getElementById('qr-canvas');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const errorMessage = document.getElementById('error-message');

// State
let currentQRDataUrl = null;

// URL Validation
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Auto-add https:// if missing
function normalizeUrl(input) {
    const trimmed = input.trim();
    if (!trimmed) return '';
    
    // Already has protocol
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    
    // Add https://
    return 'https://' + trimmed;
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    qrContainer.classList.add('hidden');
}

// Hide error
function hideError() {
    errorMessage.classList.add('hidden');
}

// Generate QR Code
async function generateQR() {
    const input = urlInput.value.trim();
    hideError();
    
    if (!input) {
        showError('Please enter a URL');
        return;
    }
    
    const url = normalizeUrl(input);
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }
    
    // Update input with normalized URL
    urlInput.value = url;
    
    // Disable button during generation
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="31.42" stroke-dashoffset="10"></circle>
        </svg>
        Generating...
    `;
    
    try {
        await QRCode.toCanvas(qrCanvas, url, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
        });
        
        // Store the data URL for download
        currentQRDataUrl = qrCanvas.toDataURL('image/png');
        
        // Show QR container
        qrContainer.classList.remove('hidden');
    } catch (err) {
        showError(err.message || 'Failed to generate QR code');
    } finally {
        resetButton();
    }
}

// Reset button state
function resetButton() {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
        </svg>
        Generate QR Code
    `;
}

// Download QR Code as PNG
function downloadQR() {
    if (!currentQRDataUrl) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = currentQRDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Visual feedback
    downloadBtn.classList.add('success');
    downloadBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Downloaded!
    `;
    
    setTimeout(() => {
        downloadBtn.classList.remove('success');
        downloadBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download PNG
        `;
    }, 2000);
}

// Copy QR Code to clipboard
async function copyQR() {
    if (!currentQRDataUrl) return;
    
    try {
        // Convert data URL to blob
        const response = await fetch(currentQRDataUrl);
        const blob = await response.blob();
        
        // Copy to clipboard
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        
        // Visual feedback
        copyBtn.classList.add('success');
        copyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
        
        setTimeout(() => {
            copyBtn.classList.remove('success');
            copyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy to Clipboard
            `;
        }, 2000);
    } catch (err) {
        showError('Failed to copy to clipboard');
    }
}

// Clear input
function clearInput() {
    urlInput.value = '';
    urlInput.focus();
    clearBtn.classList.remove('visible');
    qrContainer.classList.add('hidden');
    hideError();
    currentQRDataUrl = null;
}

// Update clear button visibility
function updateClearButton() {
    if (urlInput.value.length > 0) {
        clearBtn.classList.add('visible');
    } else {
        clearBtn.classList.remove('visible');
    }
}

// Event Listeners
generateBtn.addEventListener('click', generateQR);
downloadBtn.addEventListener('click', downloadQR);
copyBtn.addEventListener('click', copyQR);
clearBtn.addEventListener('click', clearInput);

urlInput.addEventListener('input', updateClearButton);
urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        generateQR();
    }
});

// Focus input on load
urlInput.focus();
