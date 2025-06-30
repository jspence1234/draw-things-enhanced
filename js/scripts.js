// scripts.js
class ScriptRunner {
    constructor() {
        this.scripts = this.loadSavedScripts();
        this.currentScript = '';
    }

    loadSavedScripts() {
        const saved = localStorage.getItem('drawthings_scripts');
        return saved ? JSON.parse(saved) : {};
    }

    saveScripts() {
        localStorage.setItem('drawthings_scripts', JSON.stringify(this.scripts));
    }

    createAPI() {
        return {
            params: paramManager.getParams(),
            
            generate: async (params) => {
                return await generateWithParams(params);
            },
            
            utils: {
                randomSeed: () => Math.floor(Math.random() * 2147483647),
                interpolate: (a, b, t) => a + (b - a) * t,
                pickRandom: (array) => array[Math.floor(Math.random() * array.length)],
                wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
            },
            
            files: {
                savePreset: (name, params) => {
                    const presets = JSON.parse(localStorage.getItem('drawthings_presets') || '{}');
                    presets[name] = params;
                    localStorage.setItem('drawthings_presets', JSON.stringify(presets));
                },
                
                loadPreset: (name) => {
                    const presets = JSON.parse(localStorage.getItem('drawthings_presets') || '{}');
                    return presets[name] || null;
                }
            }
        };
    }

    async run(script) {
        const api = this.createAPI();
        
        try {
            // Create sandboxed function
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const fn = new AsyncFunction('api', script);
            
            // Run script
            await fn(api);
            
            return { success: true };
        } catch (error) {
            console.error('Script error:', error);
            return { success: false, error: error.message };
        }
    }
}

const scriptRunner = new ScriptRunner();

function toggleScriptRunner() {
    const content = document.getElementById('scriptContent');
    const icon = document.querySelector('.toggle-icon');
    
    content.classList.toggle('active');
    icon.textContent = content.classList.contains('active') ? '▲' : '▼';
}

function loadScript() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            document.getElementById('scriptEditor').value = e.target.result;
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function saveScript() {
    const script = document.getElementById('scriptEditor').value;
    const name = prompt('Script name:');
    
    if (name) {
        scriptRunner.scripts[name] = script;
        scriptRunner.saveScripts();
        alert('Script saved!');
    }
}

async function runScript() {
    const script = document.getElementById('scriptEditor').value;
    const button = document.querySelector('.script-controls button:last-child');
    
    button.disabled = true;
    button.textContent = 'Running...';
    
    try {
        const result = await scriptRunner.run(script);
        
        if (!result.success) {
            alert(`Script error: ${result.error}`);
        }
    } finally {
        button.disabled = false;
        button.textContent = 'Run Script';
    }
}