const { Storage } = require('@google-cloud/storage');
// Import Firebase Admin SDK
const admin = require('firebase-admin');
const path = require('path');

// Create a Google Cloud Storage client with your service account key
const firebasestorage = new Storage({
  // keyFilename: '/path/to/your-service-account-key.json',
  keyFilename: './serviceAccountKey.json',
});

// Reference your Firebase Storage bucket
const bucketName = 'parvfinance-84dfd.appspot.com';
const bucket = firebasestorage.bucket(bucketName);


async function uploadImageAndGetUrl(localImagePath, destinationFileName) {
  try {
    // Upload the image to Firebase Cloud Storage
    await bucket.upload(localImagePath, {
      destination: destinationFileName,
      // Set the uploaded image to be publicly accessible
      public: true,
    });
    // Generate the public URL of the uploaded image
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationFileName}`;

    // console.log(`Public URL: ${publicUrl}`);

    return publicUrl; // Return the public URL for further use
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

const serviceAccountPath = require('../serviceAccountKey.json');

// Initialize Firebase Admin with the service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  storageBucket: 'gs://parvfinance-84dfd.appspot.com' // Your Firebase Storage bucket name
});


// Function to delete a file from Firebase Storage
const deleteFilefromfirebase = async (filePath) => {
  try {
    // Get the file reference from the bucket
    const file = bucket.file(filePath);

    // Delete the file
    await file.delete();

    console.log(`File "${filePath}" deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete file "${filePath}":`, error);
  }
};



module.exports = { uploadImageAndGetUrl, deleteFilefromfirebase}
