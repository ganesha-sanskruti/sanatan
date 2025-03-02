const Temple = require('../models/temple.model');
const mongoose = require('mongoose');

/**
 * Create a new temple
 */
exports.createTemple = async (req, res) => {
  try {
    const {
      name,
      address,
      description,
      type,
      latitude,
      longitude,
      timings,
      contact,
      website,
      facilities
    } = req.body;

    // Create a new temple instance
    const temple = new Temple({
      name,
      address,
      description,
      type,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      timings,
      contact,
      website,
      facilities: facilities ? facilities.split(',').map(item => item.trim()) : [],
      createdBy: req.user._id
    });

    // If images were uploaded
    if (req.files && req.files.length > 0) {
      temple.images = req.files.map(file => file.path);
    }

    // Save the temple
    await temple.save();

    res.status(201).json({
      success: true,
      message: 'Temple created successfully',
      data: temple
    });
  } catch (error) {
    console.error('Create temple error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create temple',
      error: error.message
    });
  }
};

/**
 * Get all temples
 */
exports.getAllTemples = async (req, res) => {
  try {
    const temples = await Temple.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: temples.length,
      data: temples
    });
  } catch (error) {
    console.error('Get temples error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temples',
      error: error.message
    });
  }
};

/**
 * Get a specific temple by ID
 */
exports.getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    
    if (!temple) {
      return res.status(404).json({
        success: false,
        message: 'Temple not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: temple
    });
  } catch (error) {
    console.error('Get temple error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch temple',
      error: error.message
    });
  }
};

/**
 * Update a temple
 */
exports.updateTemple = async (req, res) => {
  try {
    const {
      name,
      address,
      description,
      type,
      latitude,
      longitude,
      timings,
      contact,
      website,
      facilities
    } = req.body;

    // Find the temple
    const temple = await Temple.findById(req.params.id);
    
    if (!temple) {
      return res.status(404).json({
        success: false,
        message: 'Temple not found'
      });
    }
    
    // Update temple fields
    temple.name = name || temple.name;
    temple.address = address || temple.address;
    temple.description = description || temple.description;
    temple.type = type || temple.type;
    
    if (latitude && longitude) {
      temple.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }
    
    temple.timings = timings || temple.timings;
    temple.contact = contact || temple.contact;
    temple.website = website || temple.website;
    
    if (facilities) {
      temple.facilities = facilities.split(',').map(item => item.trim());
    }
    
    // If images were uploaded
    if (req.files && req.files.length > 0) {
      temple.images = req.files.map(file => file.path);
    }
    
    // Save updated temple
    await temple.save();
    
    res.status(200).json({
      success: true,
      message: 'Temple updated successfully',
      data: temple
    });
  } catch (error) {
    console.error('Update temple error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update temple',
      error: error.message
    });
  }
};

/**
 * Delete a temple
 */
exports.deleteTemple = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    
    if (!temple) {
      return res.status(404).json({
        success: false,
        message: 'Temple not found'
      });
    }
    
    await temple.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Temple deleted successfully'
    });
  } catch (error) {
    console.error('Delete temple error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete temple',
      error: error.message
    });
  }
};

/**
 * Get nearby temples based on user's location
 */
exports.getNearbyTemples = async (req, res) => {
  try {
    const { latitude, longitude, distance = 10, maxResults = 50 } = req.query;
    
    // Convert distance from kilometers to meters
    const radius = parseFloat(distance) * 1000;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Find temples near the provided coordinates
    const temples = await Temple.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius
        }
      }
    }).limit(parseInt(maxResults));
    
    // Calculate distance for each temple
    const templesWithDistance = temples.map(temple => {
      // Get temple coordinates
      const [tempLong, tempLat] = temple.location.coordinates;
      
      // Calculate distance using the Haversine formula
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        tempLat,
        tempLong
      );
      
      // Convert temple to a plain object and add distance
      const templeObj = temple.toObject();
      templeObj.distance = distance.toFixed(1) + ' km';
      
      return templeObj;
    });
    
    res.status(200).json({
      success: true,
      count: templesWithDistance.length,
      data: templesWithDistance
    });
  } catch (error) {
    console.error('Get nearby temples error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby temples',
      error: error.message
    });
  }
};

/**
 * Search for temples by name or location
 */
exports.searchTemples = async (req, res) => {
  try {
    const { query, latitude, longitude } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Create a text search query
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Find temples matching the query
    let temples = await Temple.find(searchQuery);
    
    // If user coordinates are provided, calculate distance and sort by distance
    if (latitude && longitude) {
      temples = temples.map(temple => {
        const [tempLong, tempLat] = temple.location.coordinates;
        
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          tempLat,
          tempLong
        );
        
        const templeObj = temple.toObject();
        templeObj.distance = distance.toFixed(1) + ' km';
        
        return templeObj;
      });
      
      // Sort by distance
      temples.sort((a, b) => 
        parseFloat(a.distance) - parseFloat(b.distance)
      );
    }
    
    res.status(200).json({
      success: true,
      count: temples.length,
      data: temples
    });
  } catch (error) {
    console.error('Search temples error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search temples',
      error: error.message
    });
  }
};

/**
 * Rate a temple
 */
exports.rateTemple = async (req, res) => {
  try {
    const { rating } = req.body;
    const templeId = req.params.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const temple = await Temple.findById(templeId);
    
    if (!temple) {
      return res.status(404).json({
        success: false,
        message: 'Temple not found'
      });
    }
    
    // Calculate new average rating
    const newAverage = 
      (temple.ratings.average * temple.ratings.count + parseFloat(rating)) / 
      (temple.ratings.count + 1);
      
    // Update the temple's ratings
    temple.ratings = {
      average: parseFloat(newAverage.toFixed(1)),
      count: temple.ratings.count + 1
    };
    
    await temple.save();
    
    res.status(200).json({
      success: true,
      message: 'Temple rated successfully',
      data: temple
    });
  } catch (error) {
    console.error('Rate temple error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate temple',
      error: error.message
    });
  }
};

/**
 * Helper function to calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}