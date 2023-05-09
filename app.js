const express = require('express');
const multer = require('multer');
const path = require('path');
const { createCanvas, Image } = require('canvas');
const tf = require('@tensorflow/tfjs');
const faceLandmarksDetection = require('@tensorflow-models/face-landmarks-detection');

const app = express();

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Load the pre-trained emotion detection model
let model;
faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh).then(m => {
  model = m;
});

// Helper function to resize image
function resizeImage(image, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

// Handle image upload
app.post('/upload', upload.single('image'), async (req, res) => {
  // Access the uploaded file using req.file
  const imagePath = req.file.path;

  // Load the image using canvas and resize
  const image = new Image();
  image.src = imagePath;
  const resizedImage = resizeImage(image, 224, 224);

  // Preprocess the image
  const tensor = tf.browser.fromPixels(resizedImage).expandDims().toFloat().div(255);
  const batchedTensor = tensor.expandDims();

  // Perform emotion detection using the model
  const predictions = await model.estimateFaces({ input: batchedTensor });
  const emotions = predictions.map(prediction => prediction.emotions);

  // Get the dominant emotion
  const dominantEmotion = emotions.reduce((prev, curr) => (curr.probability > prev.probability) ? curr : prev);

  // Send back the result
  const result = {
    emotion: dominantEmotion.emotion,
    probability: dominantEmotion.probability
  };
  res.json(result);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
