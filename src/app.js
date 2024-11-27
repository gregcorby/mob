class DreamSceneGenerator {
    constructor() {
        this.image1 = null;
        this.image2 = null;
        this.cloudinaryConfig = {
            cloudName: 'grog',
            apiKey: '254389129742864',
            apiSecret: 'WmxqmhtwaLFeqgnNWXuWVg4BbEI'
        };
        console.log('DreamSceneGenerator initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        try {
            console.log('Setting up event listeners');
            
            // File input change handlers
            ['image1', 'image2'].forEach(id => {
                const input = document.getElementById(id);
                const label = input.closest('label');

                input.addEventListener('change', (e) => {
                    console.log(`${id} change event triggered`);
                    const imageNumber = id.slice(-1);
                    this.handleImageUpload(e, parseInt(imageNumber));
                });

                // Drag and drop handlers
                label.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    label.classList.add('drag-over');
                });

                label.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    label.classList.remove('drag-over');
                });

                label.addEventListener('drop', (e) => {
                    console.log(`Drop event on ${id}`);
                    e.preventDefault();
                    e.stopPropagation();
                    label.classList.remove('drag-over');

                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        input.files = dataTransfer.files;
                        input.dispatchEvent(new Event('change'));
                    }
                });
            });

            // Generate button handler
            document.getElementById('generate-btn').addEventListener('click', () => {
                console.log('Generate button clicked');
                this.generateScene();
            });

            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    async handleImageUpload(event, imageNumber) {
        try {
            console.log(`Handling image ${imageNumber} upload`);
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                console.log(`File selected for image ${imageNumber}:`, file.name, file.type);
                const label = event.target.closest('label');
                
                let img = label.querySelector('img');
                if (!img) {
                    console.log('Creating new img element');
                    img = document.createElement('img');
                    label.appendChild(img);
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log(`Image ${imageNumber} loaded`);
                    img.src = e.target.result;
                    img.style.display = 'block';
                    label.classList.add('has-image');
                };
                reader.onerror = (error) => {
                    console.error(`Error reading image ${imageNumber}:`, error);
                };
                reader.readAsDataURL(file);

                this[`image${imageNumber}`] = file;
                this.updateGenerateButton();
            } else {
                console.error(`Invalid file type for image ${imageNumber}`);
                alert('Please select an image file (JPG, PNG, etc.)');
            }
        } catch (error) {
            console.error(`Error in handleImageUpload for image ${imageNumber}:`, error);
            alert('Error uploading image. Please try again.');
        }
    }

    updateGenerateButton() {
        try {
            const generateBtn = document.getElementById('generate-btn');
            const isEnabled = this.image1 && this.image2;
            generateBtn.disabled = !isEnabled;
            console.log('Generate button updated:', isEnabled ? 'enabled' : 'disabled');
        } catch (error) {
            console.error('Error updating generate button:', error);
        }
    }

    async generateScene() {
        try {
            console.log('Starting scene generation');
            const progressContainer = document.getElementById('progress');
            const progressFill = progressContainer.querySelector('.progress-fill');
            const progressText = progressContainer.querySelector('.progress-text');
            
            progressContainer.classList.remove('hidden');
            progressFill.style.width = '0%';

            // Step 1: Stitch images
            console.log('Stitching images');
            progressText.textContent = 'Stitching images...';
            progressFill.style.width = '20%';
            const stitchedImageBlob = await this.stitchImages();

            // Step 2: Upload stitched image to Cloudinary
            console.log('Uploading to Cloudinary');
            progressText.textContent = 'Uploading stitched image...';
            progressFill.style.width = '40%';
            const cloudinaryUrl = await this.uploadToCloudinary(stitchedImageBlob);
            console.log('Cloudinary upload complete:', cloudinaryUrl);

            // Step 3: Submit to Luma API
            console.log('Submitting to Luma API');
            progressText.textContent = 'Generating scene...';
            progressFill.style.width = '60%';
            const generationId = await this.submitToLuma(cloudinaryUrl);
            console.log('Luma submission complete:', generationId);

            // Step 4: Poll for completion
            progressText.textContent = 'Processing your scene...';
            await this.pollGenerationStatus(generationId, progressFill, progressText);

        } catch (error) {
            console.error('Error generating scene:', error);
            const progressContainer = document.getElementById('progress');
            const progressText = progressContainer.querySelector('.progress-text');
            progressText.textContent = `Error: ${error.message}`;
            setTimeout(() => {
                progressContainer.classList.add('hidden');
            }, 5000);
        }
    }

    async stitchImages() {
        try {
            console.log('Starting image stitching');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const [img1, img2] = await Promise.all([
                this.loadImage(this.image1),
                this.loadImage(this.image2)
            ]);
            console.log('Images loaded for stitching');

            const targetHeight = 512;
            const scaledWidth1 = (img1.width / img1.height) * targetHeight;
            const scaledWidth2 = (img2.width / img2.height) * targetHeight;

            canvas.width = scaledWidth1 + scaledWidth2;
            canvas.height = targetHeight;

            ctx.drawImage(img1, 0, 0, scaledWidth1, targetHeight);
            ctx.drawImage(img2, scaledWidth1, 0, scaledWidth2, targetHeight);
            console.log('Images stitched successfully');

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    console.log('Canvas converted to blob');
                    resolve(blob);
                }, 'image/jpeg', 0.9);
            });
        } catch (error) {
            console.error('Error in stitchImages:', error);
            throw error;
        }
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    async uploadToCloudinary(imageBlob) {
        try {
            console.log('Starting Cloudinary upload');
            const formData = new FormData();
            formData.append('file', imageBlob);
            formData.append('api_key', this.cloudinaryConfig.apiKey);
            
            const timestamp = Math.round((new Date()).getTime() / 1000);
            formData.append('timestamp', timestamp);
            
            const signature = await this.generateCloudinarySignature(timestamp);
            formData.append('signature', signature);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('Cloudinary upload successful');
            return data.secure_url;
        } catch (error) {
            console.error('Error in uploadToCloudinary:', error);
            throw error;
        }
    }

    async generateCloudinarySignature(timestamp) {
        try {
            const params = `timestamp=${timestamp}${this.cloudinaryConfig.apiSecret}`;
            const msgBuffer = new TextEncoder().encode(params);
            const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error('Error generating Cloudinary signature:', error);
            throw error;
        }
    }

    async submitToLuma(imageUrl) {
        try {
            console.log('Submitting to Luma API');
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: 'Bearer luma-42367a83-2549-4507-b1e8-9580bd3ccf9d-05fe0649-c12b-47e7-ae5b-3f3633af6d51'
                },
                body: JSON.stringify({
                    prompt: 'create a cinematic scene where the two characters start to kiss romantically',
                    aspect_ratio: '16:9',
                    loop: false,
                    keyframes: {
                        frame0: {
                            url: imageUrl,
                            type: 'image'
                        }
                    }
                })
            };

            const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', options);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Luma API error: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Luma API submission successful');
            return data.id;
        } catch (error) {
            console.error('Error in submitToLuma:', error);
            throw new Error(`Failed to submit to Luma API: ${error.message}`);
        }
    }

    async pollGenerationStatus(generationId, progressFill, progressText) {
        try {
            console.log('Starting generation status polling');
            let complete = false;
            let attempts = 0;
            const maxAttempts = 30; // 5 minutes maximum (30 attempts * 10 seconds)
            const pollInterval = 10000; // 10 seconds

            while (!complete && attempts < maxAttempts) {
                try {
                    console.log(`Polling attempt ${attempts + 1} of ${maxAttempts}`);
                    const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
                        headers: {
                            accept: 'application/json',
                            authorization: 'Bearer luma-42367a83-2549-4507-b1e8-9580bd3ccf9d-05fe0649-c12b-47e7-ae5b-3f3633af6d51'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('Poll response:', data);
                    
                    // Check both status and state properties
                    if (data.status === 'completed' || data.status === 'success' || data.state === 'completed') {
                        complete = true;
                        progressFill.style.width = '100%';
                        progressText.textContent = 'Generation complete!';
                        console.log('Generation completed successfully');
                        
                        // Wait a moment to ensure the video is ready
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        
                        // Redirect to result page
                        window.location.href = `/result/${generationId}`;
                        return true;
                    } else if (data.status === 'failed' || data.status === 'error' || data.state === 'failed') {
                        throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
                    } else {
                        // Handle undefined or processing status
                        const progress = data.progress || 0;
                        const progressPercent = 60 + (progress * 40);
                        progressFill.style.width = `${progressPercent}%`;
                        progressText.textContent = `Processing... (${Math.round(progress * 100)}%)`;
                        
                        console.log(`Waiting ${pollInterval/1000} seconds before next poll`);
                        await new Promise(resolve => setTimeout(resolve, pollInterval));
                        attempts++;
                    }
                } catch (error) {
                    console.error('Error in polling attempt:', error);
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`Retrying... Attempt ${attempts + 1} of ${maxAttempts}`);
                        await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
                    } else {
                        throw new Error('Failed to check generation status after maximum attempts');
                    }
                }
            }

            if (!complete) {
                throw new Error('Generation status check timed out. Please check the result page manually.');
            }

            return false;
        } catch (error) {
            console.error('Error in pollGenerationStatus:', error);
            progressText.textContent = `Error: ${error.message}`;
            throw error;
        }
    }
}

// Initialize the application
console.log('Initializing DreamSceneGenerator');
new DreamSceneGenerator();
