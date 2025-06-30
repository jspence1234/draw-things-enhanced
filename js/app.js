// app.js
class DrawThingsApp {
    constructor() {
        this.currentTask = null;
        this.isGenerating = false;
        this.inputImage = null;
        
        this.init();
    }

    async init() {
        // Check connection
        await this.checkConnection();
        
        // Load available models, samplers, etc.
        await this.loadOptions();
        
        // Setup backend selector
        document.getElementById('backendSelector').addEventListener('change', (e) => {
            this.switchBackend(e.target.value);
        });
        
        // Auto-save/load last configuration
        this.loadLastConfig();
        
        // Set up auto-save
        setInterval(() => this.saveConfig(), 5000);
        
        // Initialize keyboard shortcuts
        new KeyboardShortcuts();
        
        // Initialize drag & drop
        new DragDropHandler();
    }

    async checkConnection() {
        const indicator = document.getElementById('connectionStatus');
        const connected = await api.checkConnection();
        
        indicator.classList.toggle('connected', connected);
        
        if (!connected) {
            console.warn('Failed to connect to Draw Things API');
        }
        
        return connected;
    }

    async loadOptions() {
        try {
            // Load models
            const models = await api.getModels();
            const modelSelect = document.getElementById('modelSelect');
            modelSelect.innerHTML = models.map(model => 
                `<option value="${model.id}">${model.name}</option>`
            ).join('');
            
            // Load samplers
            const samplers = await api.getSamplers();
            const samplerSelect = document.getElementById('samplerSelect');
            samplerSelect.innerHTML = samplers.map(sampler => 
                `<option value="${sampler.id}">${sampler.name}</option>`
            ).join('');
            
            // Load LoRAs
            const loras = await api.getLoRAs();
            const loraSelect = document.getElementById('loraSelect');
            loraSelect.innerHTML = '<option value="">None</option>' + 
                loras.map(lora => 
                    `<option value="${lora.id}">${lora.name}</option>`
                ).join('');
            
            // Load upscalers
            const upscalers = await api.getUpscalers();
            const upscalerSelect = document.getElementById('upscalerSelect');
            upscalerSelect.innerHTML = '<option value="none">None</option>' +
                upscalers.map(upscaler => 
                    `<option value="${upscaler.id}">${upscaler.name}</option>`
                ).join('');
                
        } catch (error) {
            console.error('Failed to load options:', error);
        }
    }

    async switchBackend(backend) {
        if (backend === 'cloud') {
            const url = prompt('Enter cloud endpoint URL:');
            const apiKey = prompt('Enter API key (optional):');
            
            if (url) {
                api.setBackend('cloud', { url, apiKey });
                
                // Store securely (in production, use more secure method)
                localStorage.setItem('drawthings_cloud_config', JSON.stringify({ url, apiKey }));
            }
        } else {
            api.setBackend('local');
        }
        
        await this.checkConnection();
        await this.loadOptions();
    }

    saveConfig() {
        const config = {
            params: paramManager.getParams(),
            backend: api.currentBackend
        };
        
        localStorage.setItem('drawthings_last_config', JSON.stringify(config));
    }

    loadLastConfig() {
        const saved = localStorage.getItem('drawthings_last_config');
        if (saved) {
            const config = JSON.parse(saved);
            paramManager.loadPreset(config.params);
            
            // Restore backend
            if (config.backend === 'cloud') {
                const cloudConfig = localStorage.getItem('drawthings_cloud_config');
                if (cloudConfig) {
                    const { url, apiKey } = JSON.parse(cloudConfig);
                    api.setBackend('cloud', { url, apiKey });
                    document.getElementById('backendSelector').value = 'cloud';
                }
            }
        }
    }

    updateProgress(progress, status) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = status;
    }

    async generate() {
        if (this.isGenerating) return;
        
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        this.isGenerating = true;
        
        // Show progress
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('progressIndicator').style.display = 'block';
        
        try {
            const params = paramManager.getParams();
            
            // Validate params
            if (!params.prompt) {
                throw new Error('Please enter a prompt');
            }
            
            // Add input image if available
            if (this.inputImage && params.strength < 1) {
                params.inputImage = this.inputImage;
            }
            
            // Start generation
            const task = await api.generate(params);
            this.currentTask = task.id;
            
            // Poll for progress
            await this.pollProgress(task.id);
            
        } catch (error) {
            alert(`Generation failed: ${error.message}`);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate';
            this.isGenerating = false;
        }
    }

    async pollProgress(taskId) {
        const pollInterval = setInterval(async () => {
            try {
                const progress = await api.getProgress(taskId);
                
                this.updateProgress(progress.percentage, progress.status);
                
                if (progress.completed) {
                    clearInterval(pollInterval);
                    
                    // Get result
                    const imageBlob = await api.getResult(taskId);
                    const imageUrl = URL.createObjectURL(imageBlob);
                    
                    // Display result
                    const previewImg = document.getElementById('previewImage');
                    previewImg.src = imageUrl;
                    previewImg.style.display = 'block';
                    document.getElementById('progressIndicator').style.display = 'none';
                    
                    // Add to gallery
                    galleryManager.addImage({
                        url: imageUrl,
                        params: paramManager.getParams()
                    });
                }
                
                if (progress.error) {
                    clearInterval(pollInterval);
                    throw new Error(progress.error);
                }
                
            } catch (error) {
                clearInterval(pollInterval);
                console.error('Progress polling failed:', error);
                this.updateProgress(0, 'Error');
            }
        }, 1000);
    }
}

// Keyboard Shortcuts
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = {
            'Cmd+Enter': () => generate(),
            'Cmd+S': () => saveImage(),
            'Cmd+D': () => deleteImage(),
            'Cmd+F': () => document.getElementById('gallerySearch').focus(),
            'Escape': () => this.cancelGeneration()
        };
        
        this.setupListeners();
    }
    
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            
            if (this.shortcuts[key]) {
                e.preventDefault();
                this.shortcuts[key]();
            }
        });
    }
    
    getKeyCombo(e) {
        const parts = [];
        if (e.metaKey || e.ctrlKey) parts.push('Cmd');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        
        if (e.key === 'Enter') parts.push('Enter');
        else if (e.key === 'Escape') parts.push('Escape');
        else if (e.key.length === 1) parts.push(e.key.toUpperCase());
        
        return parts.join('+');
    }
    
    cancelGeneration() {
        if (app.isGenerating && app.currentTask) {
            // Implement cancellation
            app.isGenerating = false;
        }
    }
}

// Drag & Drop Handler
class DragDropHandler {
    constructor() {
        this.setupDropZone();
    }
    
    setupDropZone() {
        const previewPanel = document.querySelector('.preview-panel');
        
        previewPanel.addEventListener('dragover', (e) => {
            e.preventDefault();
            previewPanel.classList.add('drag-over');
        });
        
        previewPanel.addEventListener('dragleave', () => {
            previewPanel.classList.remove('drag-over');
        });
        
        previewPanel.addEventListener('drop', async (e) => {
            e.preventDefault();
            previewPanel.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                await this.handleImageDrop(file);
            }
        });
    }
    
    async handleImageDrop(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Display image
            const previewImg = document.getElementById('previewImage');
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            
            // Set to image-to-image mode
            document.getElementById('strength').value = 0.75;
            document.getElementById('strengthText').value = 0.75;
            paramManager.updateParam('strength', 0.75);
            
            // Store for generation
            app.inputImage = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
}

// Global functions
async function generate() {
    await app.generate();
}

async function generateWithParams(params) {
    paramManager.loadPreset(params);
    return await app.generate();
}

function saveImage() {
    const img = document.getElementById('previewImage');
    if (img.src) {
        const link = document.createElement('a');
        link.download = `drawthings_${Date.now()}.png`;
        link.href = img.src;
        link.click();
    }
}

function favoriteImage() {
    if (galleryManager.selectedImage) {
        galleryManager.toggleFavorite(galleryManager.selectedImage);
    }
}

function deleteImage() {
    if (galleryManager.selectedImage) {
        if (confirm('Delete this image?')) {
            galleryManager.deleteImage(galleryManager.selectedImage);
            document.getElementById('previewImage').style.display = 'none';
        }
    }
}

// Initialize app
const app = new DrawThingsApp();