require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');


const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
};


console.log('Setting AWS config with region:', awsConfig.region);
AWS.config.update(awsConfig);

const s3 = new AWS.S3();

/**
 * Upload a file to S3 and return the CloudFront URL
 * Simplified version with direct upload
 */
const uploadToS3 = async (file, folder = 'misc') => {
  try {
    console.log('==== S3 UPLOAD ATTEMPT START ====');
    if (!file) {
      console.log('No file provided to uploadToS3');
      return null;
    }
    
    console.log('File details:', {
      originalname: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Verify AWS credentials are loaded
    console.log('Checking AWS credentials...');
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials missing from environment');
      throw new Error('AWS credentials not available');
    }
    console.log('AWS credentials verified');
    
    // Read file
    console.log('Reading file from disk:', file.path);
    const fileContent = fs.readFileSync(file.path);
    console.log('File read success, size:', fileContent.length);
    
    // Create a unique filename
    const filename = `${folder}/${Date.now()}-${path.basename(file.originalname || 'unknown').replace(/\s+/g, '-')}`;
    console.log('Generated S3 key:', filename);
    
    // Upload parameters - NO ACL
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: fileContent,
      ContentType: file.mimetype || 'application/octet-stream',
      CacheControl: 'max-age=31536000'
    };
    
    console.log('Starting S3 upload with params:', {
      Bucket: params.Bucket,
      Key: params.Key,
      ContentType: params.ContentType,
      ContentLength: fileContent.length
    });
    
    // Upload to S3
    console.log('Calling s3.upload...');
    const uploadResult = await s3.upload(params).promise();
    console.log('S3 upload result:', uploadResult);
    
    // Generate CloudFront URL
    const cloudfrontUrl = `${process.env.CLOUDFRONT_DOMAIN}/${filename}`;
    console.log('Generated CloudFront URL:', cloudfrontUrl);
    
    // Delete local temp file
    fs.unlinkSync(file.path);
    console.log('Deleted temp file:', file.path);
    
    console.log('==== S3 UPLOAD SUCCESS ====');
    return cloudfrontUrl;
  } catch (error) {
    console.error('==== S3 UPLOAD ERROR ====');
    console.error('Upload error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Fallback to local storage
    try {
      console.log('==== FALLBACK TO LOCAL STORAGE ====');
      // Ensure uploads directory exists
      const localFolder = `uploads/${folder}`;
      if (!fs.existsSync(localFolder)) {
        fs.mkdirSync(localFolder, { recursive: true });
        console.log('Created directory:', localFolder);
      }
      
      // Create a unique local filename
      const localFilename = `${localFolder}/post-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || '') || '.jpg'}`;
      
      // Copy the file to local storage
      fs.copyFileSync(file.path, localFilename);
      console.log('Saved file locally:', localFilename);
      
      console.log('==== LOCAL STORAGE FALLBACK SUCCESS ====');
      return localFilename;
    } catch (fallbackError) {
      console.error('Local storage fallback failed:', fallbackError);
      return null;
    }
  }
};

/**
 * Delete a file from S3
 */
const deleteFromS3 = async (url) => {
  try {
    // Handle local path
    if (!url.startsWith('http')) {
      if (fs.existsSync(url)) {
        fs.unlinkSync(url);
        console.log('Deleted local file:', url);
      }
      return true;
    }
    
    // Handle S3/CloudFront URL
    if (!url.includes(process.env.CLOUDFRONT_DOMAIN)) {
      return false;
    }
    
    const key = url.replace(`${process.env.CLOUDFRONT_DOMAIN}/`, '');
    console.log('Deleting from S3, key:', key);
    
    await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    }).promise();
    
    console.log('Successfully deleted from S3');
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

// Export without running tests
module.exports = {
  uploadToS3,
  deleteFromS3
};