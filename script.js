const uploadInput = document.getElementById("upload");
const text = document.getElementById("expr");
const imageContainer = document.getElementById("image-container");
const debugON = false;

let url = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(url + 'tiny_face_detector_model-weights_manifest.json'),
  faceapi.nets.faceLandmark68Net.loadFromUri(url + 'face_landmark_68_model-weights_manifest.json'),
  faceapi.nets.faceRecognitionNet.loadFromUri(url + 'face_recognition_model-weights_manifest.json'),
  faceapi.nets.faceExpressionNet.loadFromUri(url + 'face_expression_model-weights_manifest.json')
]).then(startDetection);

function objToString(obj) {
  let mostPredict = "neutral";
  let maxVal = 0;

  if (!obj) return mostPredict;

  obj = obj.expressions;
  for (let p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (obj[p] > maxVal) {
        maxVal = obj[p];
        mostPredict = p;
      }
    }
  }

  if (debugON === true) console.log(mostPredict, maxVal);

  return mostPredict;
}

function startDetection() {
  uploadInput.addEventListener("change", handleImageUpload);
}

async function handleImageUpload(event) {
  const file = event.target.files[0];

  if (file) {
    const img = await faceapi.bufferToImage(file);
    imageContainer.innerHTML = ""; // Clear previous image

    const imgElement = document.createElement("img");
    imgElement.src = URL.createObjectURL(file);
    imgElement.style.maxWidth = "90vw";
    imageContainer.appendChild(imgElement);

    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (detections.length > 0) {
      const emotionResult = objToString(detections[0]);
      text.innerHTML = emotionResult;
    } else {
      text.innerHTML = "No faces detected";
    }
  }
}
