require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Add this near the top of your main app file after dotenv.config()
console.log('=== ENV VAR CHECK ===');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set (starts with ' + process.env.AWS_ACCESS_KEY_ID.substring(0, 5) + ')' : 'NOT SET');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set (length ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : 'NOT SET');
console.log('AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME || 'NOT SET');
console.log('CLOUDFRONT_DOMAIN:', process.env.CLOUDFRONT_DOMAIN || 'NOT SET');
console.log('=== ENV VAR CHECK END ===');


// Import the connectDB function
const connectDB = require('./config/db');

// Wrap the entire initialization in a try-catch to catch any errors
try {
  // Import routes
  const authRoutes = require('./routes/auth.routes');
  const postRoutes = require('./routes/post.routes');
  const groupRoutes = require('./routes/group.routes');
  const groupPostRoutes = require('./routes/groupPost.routes');
  const userRoutes = require('./routes/user.routes');
  //const bookingRoutes = require('./routes/booking.routes'); AT temporary fix need to uncomment 1-Mar-2025
  const templeRoutes = require('./routes/temple.routes');
  
  // Check if pandit routes file exists before importing
  let panditRoutes;
  try {
    panditRoutes = require('./routes/pandit.routes');
    console.log('Successfully imported pandit routes');
  } catch (error) {
    console.error('Error importing pandit routes:', error.message);
    // Continue without pandit routes if there's an error
  }

  const app = express();

  // Middleware
  // Enable CORS for all origins during development
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  app.use(morgan('dev'));

  const postsUploadsDir = path.join(__dirname, '../uploads/posts');
  if (!fs.existsSync(postsUploadsDir)) {
    fs.mkdirSync(postsUploadsDir, { recursive: true });
  }

  // Create all necessary upload directories
  const createUploadDirectories = () => {
    // Main uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Subdirectories
    const profilesDir = path.join(uploadsDir, 'profiles');
    const templesDir = path.join(uploadsDir, 'temples');
    
    // Create directories if they don't exist
    const directories = [uploadsDir, profilesDir, templesDir];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`Created directory: ${dir}`);
        } catch (error) {
          console.error(`Error creating directory ${dir}:`, error);
        }
      }
    });
  };

  // Call the function to create all upload directories
  createUploadDirectories();

  // Static file serving
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api', groupPostRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/temples', templeRoutes);
  
  // app.use('/api/bookings', bookingRoutes); AT temporary fix need to uncomment 1-Mar-2025
  
  // Only add pandit routes if they were successfully imported
  if (panditRoutes) {
    app.use('/api/pandits', panditRoutes);
    console.log('Pandit routes added to the application');
  }

  app.get('/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
      if(middleware.route){
        routes.push({
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods)
        });
      }
    });
    res.json(routes);
  });

  // Test route
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Sanatan API' });
  });

  // Connect to MongoDB using the function from db.js
  connectDB()
    .then(() => {
      // Start server after successful DB connection
      const PORT = process.env.PORT || 5001;
      // app.listen(PORT, '0.0.0.0', () => {
        app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to database. Server not started:', err);
      process.exit(1);
    });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error caught by middleware:', err.stack);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  });

} catch (error) {
  console.error('Critical error during application startup:', error);
}