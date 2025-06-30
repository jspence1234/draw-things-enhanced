// gallery.js
class GalleryManager {
    constructor() {
        this.images = [];
        this.selectedImage = null;
        this.sortBy = 'date';
        this.searchTerm = '';
        
        this.setupEventListeners();
        this.loadImages();
    }

    setupEventListeners() {
        document.getElementById('gallerySearch').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.renderGallery();
        });

        document.getElementById('gallerySort').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderGallery();
        });
    }

    async loadImages() {
        // Load from localStorage for now
        const stored = localStorage.getItem('drawthings_gallery');
        if (stored) {
            this.images = JSON.parse(stored);
            this.renderGallery();
        }
    }

    addImage(imageData) {
        const image = {
            id: Date.now(),
            url: imageData.url,
            thumbnail: imageData.thumbnail || imageData.url,
            params: imageData.params,
            timestamp: new Date().toISOString(),
            favorite: false,
            tags: []
        };
        
        this.images.unshift(image);
        this.saveImages();
        this.renderGallery();
        
        return image;
    }

    deleteImage(id) {
        this.images = this.images.filter(img => img.id !== id);
        this.saveImages();
        this.renderGallery();
    }

    toggleFavorite(id) {
        const image = this.images.find(img => img.id === id);
        if (image) {
            image.favorite = !image.favorite;
            this.saveImages();
            this.renderGallery();
        }
    }

    saveImages() {
        localStorage.setItem('drawthings_gallery', JSON.stringify(this.images));
    }

    getFilteredImages() {
        let filtered = [...this.images];
        
        // Search filter
        if (this.searchTerm) {
            filtered = filtered.filter(img => 
                img.params.prompt.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                img.params.model.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
        
        // Sort
        switch (this.sortBy) {
            case 'date':
                filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'model':
                filtered.sort((a, b) => a.params.model.localeCompare(b.params.model));
                break;
            case 'favorites':
                filtered = filtered.filter(img => img.favorite);
                break;
        }
        
        return filtered;
    }

    renderGallery() {
        const grid = document.getElementById('galleryGrid');
        const images = this.getFilteredImages();
        
        grid.innerHTML = images.map(img => `
            <div class="gallery-item ${this.selectedImage === img.id ? 'selected' : ''}" 
                 data-id="${img.id}"
                 onclick="galleryManager.selectImage(${img.id})">
                <img src="${img.thumbnail}" alt="Generated image">
                ${img.favorite ? '<span class="favorite-icon">★</span>' : ''}
            </div>
        `).join('');
    }

    selectImage(id) {
        this.selectedImage = id;
        const image = this.images.find(img => img.id === id);
        
        if (image) {
            // Display in preview
            const previewImg = document.getElementById('previewImage');
            previewImg.src = image.url;
            previewImg.style.display = 'block';
            document.getElementById('progressIndicator').style.display = 'none';
            
            // Load params
            paramManager.loadPreset(image.params);
        }
        
        this.renderGallery();
    }
}

const galleryManager = new GalleryManager();