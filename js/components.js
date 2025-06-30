// components.js
class ParameterManager {
    constructor() {
        this.params = {
            model: '',
            loras: [],
            upscaler: 'none',
            sampler: '',
            refiner: 'none',
            refinerStart: 80,
            strength: 0.75,
            width: 1024,
            height: 1024,
            steps: 20,
            guidance: 7.5,
            clipSkip: 1,
            batchSize: 1,
            prompt: '',
            negativePrompt: '',
            seed: -1
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Sync sliders with text inputs
        const syncPairs = [
            ['loraWeight', 'loraWeightText'],
            ['refinerStart', 'refinerStartText'],
            ['strength', 'strengthText'],
            ['width', 'widthText'],
            ['height', 'heightText'],
            ['steps', 'stepsText'],
            ['guidance', 'guidanceText'],
            ['clipSkip', 'clipSkipText'],
            ['batchSize', 'batchSizeText']
        ];

        syncPairs.forEach(([sliderId, textId]) => {
            const slider = document.getElementById(sliderId);
            const text = document.getElementById(textId);
            
            if (slider && text) {
                slider.addEventListener('input', () => {
                    text.value = slider.value;
                    this.updateParam(sliderId, parseFloat(slider.value));
                });
                
                text.addEventListener('change', () => {
                    slider.value = text.value;
                    this.updateParam(sliderId, parseFloat(text.value));
                });
            }
        });

        // Strength mode indicator
        const strengthSlider = document.getElementById('strength');
        const modeIndicator = document.getElementById('modeIndicator');
        
        strengthSlider.addEventListener('input', () => {
            modeIndicator.textContent = strengthSlider.value == 1 ? 'T2I' : 'I2I';
        });

        // Model dropdowns
        const dropdowns = ['modelSelect', 'loraSelect', 'upscalerSelect', 'samplerSelect', 'refinerSelect'];
        dropdowns.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateParam(id.replace('Select', ''), element.value);
                });
            }
        });

        // Prompt fields
        document.getElementById('prompt').addEventListener('input', (e) => {
            this.params.prompt = e.target.value;
        });

        document.getElementById('negativePrompt').addEventListener('input', (e) => {
            this.params.negativePrompt = e.target.value;
        });
    }

    updateParam(key, value) {
        if (key === 'loraWeight' && this.params.loras.length > 0) {
            this.params.loras[0].weight = value;
        } else if (key === 'refinerStart') {
            this.params.refinerStart = value;
        } else {
            this.params[key] = value;
        }
    }

    getParams() {
        return { ...this.params };
    }

    loadPreset(preset) {
        Object.assign(this.params, preset);
        this.updateUI();
    }

    updateUI() {
        // Update all UI elements with current params
        Object.keys(this.params).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = this.params[key];
            }
        });
    }
}

const paramManager = new ParameterManager();