# Dream Machine Scene Generator

A web application that generates cinematic scenes using the Luma Dream Machine API. Upload two images and the app will generate a romantic cinematic scene transition between them.

## Features

- Drag and drop image upload
- Integration with Cloudinary for image hosting
- Integration with Luma Dream Machine API for scene generation
- Real-time progress tracking
- Video download and social sharing options

## Prerequisites

Before running the application, you'll need:

1. Node.js installed on your system
2. A Cloudinary account
3. The Luma Dream Machine API key (provided in the code)

## Setup

1. Clone the repository and install dependencies:
```bash
cd dream-machine-app
npm install
```

2. Configure your Cloudinary credentials:
   - Open `src/app.js`
   - Update the Cloudinary upload URL with your cloud name
   - Set up an unsigned upload preset in your Cloudinary console
   - Add your upload preset name to the `uploadToCloudinary` function

The Luma Dream Machine API key is already configured in the application.

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Upload two images either by:
   - Clicking the upload areas and selecting files
   - Dragging and dropping images onto the upload areas

2. Once both images are uploaded, click "Generate Scene"

3. Wait for the processing to complete:
   - Images will be uploaded to Cloudinary
   - Scene will be generated using Luma Dream Machine API
   - Progress will be shown in real-time

4. When complete, you'll be redirected to the result page where you can:
   - Watch the generated video
   - Download the video
   - Share on Twitter

## API Integration Details

### Luma Dream Machine API

The application uses the following Luma Dream Machine API endpoints:

1. Generation Creation:
```
POST https://api.lumalabs.ai/dream-machine/v1/generations
```

2. Generation Status Check:
```
GET https://api.lumalabs.ai/dream-machine/v1/generations/{id}
```

The API is configured to create a cinematic scene with:
- 16:9 aspect ratio
- Non-looping video
- Romantic kissing scene transition

### Cloudinary Integration

Images are uploaded to Cloudinary before being processed by the Luma API. This ensures:
- Reliable image hosting
- Proper image format handling
- CDN benefits for faster loading

## Technical Details

- Frontend: Vanilla JavaScript with modern ES6+ features
- Backend: Node.js with Express
- Cloud Storage: Cloudinary
- Video Generation: Luma Dream Machine API

## Error Handling

The application includes comprehensive error handling for:
- Invalid file types
- Upload failures
- API errors
- Generation failures

Error messages are displayed to users in a friendly format while detailed errors are logged to the console for debugging.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
