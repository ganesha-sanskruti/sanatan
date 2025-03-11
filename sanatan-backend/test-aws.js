// test-aws.js
require('dotenv').config();
const AWS = require('aws-sdk');

console.log('Testing AWS credentials with the following config:');
console.log('Region:', process.env.AWS_REGION);
console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 5) + '...' : 'Not set');
console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set (hidden)' : 'Not set');
console.log('S3 Bucket:', process.env.S3_BUCKET_NAME);
console.log('CloudFront Domain:', process.env.CLOUDFRONT_DOMAIN);

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const s3 = new AWS.S3();

async function testS3() {
  try {
    console.log('Listing buckets...');
    const buckets = await s3.listBuckets().promise();
    console.log('Success! Buckets found:', buckets.Buckets.map(b => b.Name).join(', '));
    
    const targetBucket = process.env.S3_BUCKET_NAME;
    if (buckets.Buckets.some(b => b.Name === targetBucket)) {
      console.log(`✓ Target bucket "${targetBucket}" found in your account`);
      
      // Try to list objects in the bucket
      console.log(`Listing objects in "${targetBucket}"...`);
      const objects = await s3.listObjectsV2({ Bucket: targetBucket, MaxKeys: 5 }).promise();
      console.log(`✓ Successfully listed objects. Found ${objects.Contents.length} objects`);
      
      // Try to put a test object
      const testKey = `test/test-${Date.now()}.txt`;
      console.log(`Uploading test object to "${testKey}"...`);
      await s3.putObject({
        Bucket: targetBucket,
        Key: testKey,
        Body: 'This is a test file',
        ContentType: 'text/plain'
      }).promise();
      console.log('✓ Successfully uploaded test object');
      
      // Try to get the test object
      console.log(`Downloading test object...`);
      const getResult = await s3.getObject({
        Bucket: targetBucket,
        Key: testKey
      }).promise();
      console.log('✓ Successfully downloaded test object:', getResult.ContentLength, 'bytes');
      
      // Clean up by deleting the test object
      console.log(`Deleting test object...`);
      await s3.deleteObject({
        Bucket: targetBucket,
        Key: testKey
      }).promise();
      console.log('✓ Successfully deleted test object');
      
      console.log('✓ All S3 operations completed successfully!');
    } else {
      console.error(`✗ Target bucket "${targetBucket}" not found in your account`);
    }
  } catch (error) {
    console.error('Error testing S3:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('Full error:', error);
  }
}

testS3();