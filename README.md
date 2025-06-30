# Draw Things Enhanced

Enhanced web UI for Draw Things with streamlined controls, cloud compute support, and gallery management.

## Features

- 🎨 **Streamlined Interface** - All essential controls accessible without scrolling
- ☁️ **Cloud Compute Support** - Switch between local and cloud backends
- 🖼️ **Gallery Management** - Built-in image organization and metadata preservation
- 🔧 **Parameter Controls** - Intuitive sliders with manual input options
- 📜 **Script Runner** - Automate complex generation workflows
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with keyboard commands
- 🎯 **Drag & Drop** - Easy image-to-image setup

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/jspence1234/draw-things-enhanced.git
   cd draw-things-enhanced
   ```

2. Open `index.html` in a modern web browser

3. Configure your backend:
   - **Local**: Ensure Draw Things API is running on `http://localhost:7860`
   - **Cloud**: Select cloud option and enter your endpoint URL

## Configuration

### Backend Setup

The application supports both local and cloud backends:

- **Local Backend**: Default configuration expects Draw Things API at `http://localhost:7860`
- **Cloud Backend**: Configure custom endpoints with optional API key authentication

### Available Parameters

#### Model Selection
- Model (dropdown)
- LoRA (dropdown with weight slider 0.0-2.0)
- Upscaler (dropdown)
- Sampler (dropdown)
- Refiner Model (dropdown with start % slider)

#### Generation Parameters
- Strength (0.0-1.0) - Determines T2I vs I2I mode
- Image Width/Height (64-2048px)
- Steps (1-150)
- Text Guidance (1.0-30.0)
- Clip Skip (1-12)
- Batch Size (1-4)

## Script Runner

The built-in script runner allows you to automate generation workflows:

```javascript
// Example: Seed sweep
for (let i = 0; i < 5; i++) {
    api.params.seed = api.utils.randomSeed();
    await api.generate(api.params);
}
```

### Script API

- `api.params` - Access all generation parameters
- `api.generate()` - Trigger generation
- `api.utils` - Utility functions (randomSeed, interpolate, etc.)
- `api.files` - Save/load presets

## Keyboard Shortcuts

- `Cmd/Ctrl + Enter` - Generate
- `Cmd/Ctrl + S` - Save current image
- `Cmd/Ctrl + D` - Delete current image
- `Cmd/Ctrl + F` - Focus gallery search
- `Escape` - Cancel generation

## Gallery Features

- Automatic image organization
- Metadata preservation in localStorage
- Search by prompt or model
- Sort by date, model, or favorites
- One-click parameter loading from any image

## Development

### Project Structure

```
draw-things-enhanced/
├── index.html          # Main application HTML
├── css/
│   └── styles.css      # Application styles
├── js/
│   ├── app.js          # Main application logic
│   ├── api.js          # API communication layer
│   ├── components.js   # UI component handlers
│   ├── gallery.js      # Gallery management
│   └── scripts.js      # Script runner implementation
└── config.json         # Default configuration
```

### API Integration

The application expects a Draw Things compatible API with the following endpoints:

- `GET /api/models` - List available models
- `GET /api/samplers` - List available samplers
- `GET /api/loras` - List available LoRAs
- `GET /api/upscalers` - List available upscalers
- `POST /api/generate` - Submit generation request
- `GET /api/progress/{id}` - Get generation progress
- `GET /api/result/{id}` - Retrieve generated image

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built for use with [Draw Things](https://drawthings.ai/)
- Inspired by the need for a more streamlined generation workflow