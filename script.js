const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const resultContainer = document.getElementById('resultContainer');
const resultText = document.getElementById('resultText');

uploadForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const file = imageInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('image', file);

    // Send the image to the server
    fetch('/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        // Display the result
        resultText.textContent = `Detected Emotion: ${data.emotion} (${(data.probability * 100).toFixed(2)}%)`;
        resultContainer.style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
});
