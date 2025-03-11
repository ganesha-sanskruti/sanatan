// test-upload-from-url.js
require('dotenv').config();
const AWS = require('aws-sdk');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Hardcode AWS credentials for the test
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAUMYCIJX2DNR3FRN7',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
  region: process.env.AWS_REGION || 'ap-south-1'
};

// Configure AWS
AWS.config.update(awsConfig);
const s3 = new AWS.S3();

// Define the remote image URL and bucket info
const imageUrl = 'https://img.freepik.com/free-vector/lord-ganesha-traditional-hindu-festival-ganesh-chaturthi_1302-18517.jpg';
const bucketName = process.env.S3_BUCKET_NAME || 'sanatan-app-media';
const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN || 'https://d1kuoh6u9b5lqc.cloudfront.net';

// Function to download and upload the image
async function downloadAndUploadImage() {
  console.log('Starting test...');
  console.log('Image URL:', imageUrl);
  console.log('AWS Config:', {
    region: awsConfig.region,
    bucket: bucketName,
    accessKeyId: awsConfig.accessKeyId.substring(0, 5) + '...',
    secretKeySet: awsConfig.secretAccessKey ? 'Yes' : 'No'
  });
  
  // Create a temporary file path
  const tmpFilePath = path.join(__dirname, 'temp-image.jpg');
  const fileStream = fs.createWriteStream(tmpFilePath);
  
  return new Promise((resolve, reject) => {
    console.log('Downloading image...');
    
    // Determine if we need http or https
    const client = imageUrl.startsWith('https') ? https : http;
    
    // Download the image
    client.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      response.pipe(fileStream);
      
      fileStream.on('finish', async () => {
        fileStream.close();
        console.log('Image downloaded successfully to:', tmpFilePath);
        
        try {
          // Read the downloaded image
          const fileContent = fs.readFileSync(tmpFilePath);
          console.log('File read, size:', fileContent.length, 'bytes');
          
          // Set up upload parameters
          const key = `test-uploads/test-image-${Date.now()}.jpg`;
          const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
            ContentType: 'image/jpeg'
          };
          
          console.log('Uploading to S3...');
          console.log('Bucket:', params.Bucket);
          console.log('Key:', params.Key);
          
          // Upload to S3
          const uploadResult = await s3.putObject(params).promise();
          console.log('Upload successful:', uploadResult);
          
          // Generate the CloudFront URL
          const cloudfrontUrl = `${cloudFrontDomain}/${key}`;
          console.log('CloudFront URL:', cloudfrontUrl);
          
          // Clean up the temporary file
          fs.unlinkSync(tmpFilePath);
          console.log('Temporary file deleted');
          
          resolve({
            success: true,
            s3Key: key,
            cloudfrontUrl: cloudfrontUrl
          });
        } catch (error) {
          console.error('Error uploading to S3:', error);
          reject(error);
        }
      });
    }).on('error', (err) => {
      fs.unlink(tmpFilePath, () => {}); // Delete the file if download fails
      console.error('Error downloading image:', err);
      reject(err);
    });
  });
}

// Run the test
downloadAndUploadImage()
  .then(result => {
    console.log('Test completed successfully!');
    console.log('Result:', result);
    
    // Optionally test if the image is accessible
    console.log(`You can verify the image is accessible at: ${result.cloudfrontUrl}`);
  })
  .catch(error => {
    console.error('Test failed:', error);
  });