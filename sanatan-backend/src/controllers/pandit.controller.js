// src/controllers/pandit.controller.js
const Pandit = require('../models/pandit.model');
const fs = require('fs');
const path = require('path');

// Create a new pandit profile
exports.createPandit = async (req, res) => {
    try {
        const {
            name,
            phoneNumber,
            email,
            address,
            city,
            specializations,
            experience,
            servicesOffered,
            isAvailableOnline,
            isAvailableForTravel
        } = req.body;

        // Format specializations as array if it's a string
        let formattedSpecializations = specializations;
        if (typeof specializations === 'string') {
            formattedSpecializations = specializations.split(',').map(s => s.trim());
        }

        // Format services as array if it's a string
        let formattedServices = servicesOffered || [];
        if (typeof servicesOffered === 'string') {
            try {
                formattedServices = JSON.parse(servicesOffered);
            } catch (e) {
                formattedServices = [];
            }
        }

        // Create the new pandit
        const pandit = new Pandit({
            name,
            phoneNumber,
            email,
            address,
            city,
            specializations: formattedSpecializations,
            experience: Number(experience),
            servicesOffered: formattedServices,
            isAvailableOnline: isAvailableOnline === "true" || isAvailableOnline === true,
            isAvailableForTravel: isAvailableForTravel === "true" || isAvailableForTravel === true,
            createdBy: req.user ? req.user.id : null
        });

        // If location coordinates are provided
        if (req.body.latitude && req.body.longitude) {
            pandit.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
            };
        }

        // Handle profile image if uploaded
        if (req.file) {
            pandit.profileImage = `/uploads/profiles/${req.file.filename}`;
        }

        await pandit.save();

        res.status(201).json({
            success: true,
            message: 'Pandit profile created successfully!',
            data: pandit
        });
    } catch (error) {
        console.error('Error creating pandit profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating pandit profile',
            error: error.message
        });
    }
};

// Get all pandits with optional filtering
exports.getPandits = async (req, res) => {
    try {
        const {
            specialization,
            city,
            rating,
            distance,
            latitude,
            longitude,
            limit = 20,
            page = 1
        } = req.query;

        const query = {};
        
        // Filter by specialization
        if (specialization) {
            query.specializations = { $regex: specialization, $options: 'i' };
        }
        
        // Filter by city
        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }
        
        // Filter by minimum rating
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);
        
        let pandits;
        
        // If location coordinates and distance are provided, use geospatial query
        if (latitude && longitude && distance) {
            pandits = await Pandit.find({
                ...query,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(longitude), parseFloat(latitude)]
                        },
                        $maxDistance: parseFloat(distance) * 1000 // Convert km to meters
                    }
                }
            })
            .skip(skip)
            .limit(limitNum);
        } else {
            // Regular query without geospatial filtering
            pandits = await Pandit.find(query)
                .skip(skip)
                .limit(limitNum);
        }
        
        // Count total documents for pagination
        const total = await Pandit.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: pandits.length,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: parseInt(page),
            data: pandits
        });
    } catch (error) {
        console.error('Error fetching pandits:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pandits',
            error: error.message
        });
    }
};

// Get a single pandit by ID
exports.getPanditById = async (req, res) => {
    try {
        const pandit = await Pandit.findById(req.params.id);
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: pandit
        });
    } catch (error) {
        console.error('Error fetching pandit:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pandit',
            error: error.message
        });
    }
};

// Update a pandit profile
exports.updatePandit = async (req, res) => {
    try {
        const pandit = await Pandit.findById(req.params.id);
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }
        
        // Check if user is authorized to update
        // Only allow if user created the profile or is an admin
        if (req.user && (req.user.role !== 'admin' && pandit.createdBy && pandit.createdBy.toString() !== req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }
        
        // Format specializations as array if it's a string
        if (req.body.specializations) {
            if (typeof req.body.specializations === 'string') {
                req.body.specializations = req.body.specializations.split(',').map(s => s.trim());
            }
        }
        
        // Format services as array if it's a string
        if (req.body.servicesOffered) {
            if (typeof req.body.servicesOffered === 'string') {
                try {
                    req.body.servicesOffered = JSON.parse(req.body.servicesOffered);
                } catch (e) {
                    req.body.servicesOffered = [];
                }
            }
        }
        
        // Update location if coordinates are provided
        if (req.body.latitude && req.body.longitude) {
            req.body.location = {
                type: 'Point',
                coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
            };
        }
        
        // Handle boolean fields
        if (req.body.isAvailableOnline !== undefined) {
            req.body.isAvailableOnline = req.body.isAvailableOnline === "true" || req.body.isAvailableOnline === true;
        }
        
        if (req.body.isAvailableForTravel !== undefined) {
            req.body.isAvailableForTravel = req.body.isAvailableForTravel === "true" || req.body.isAvailableForTravel === true;
        }
        
        // Handle file upload
        if (req.file) {
            // Delete old profile image if it exists
            if (pandit.profileImage) {
                const oldImagePath = path.join(__dirname, '../../', pandit.profileImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            req.body.profileImage = `/uploads/profiles/${req.file.filename}`;
        }
        
        // Update the pandit profile
        const updatedPandit = await Pandit.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Pandit profile updated successfully!',
            data: updatedPandit
        });
    } catch (error) {
        console.error('Error updating pandit profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating pandit profile',
            error: error.message
        });
    }
};

// Delete a pandit profile
exports.deletePandit = async (req, res) => {
    try {
        const pandit = await Pandit.findById(req.params.id);
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }
        
        // Check if user is authorized to delete
        // Only allow if user created the profile or is an admin
        if (req.user && (req.user.role !== 'admin' && pandit.createdBy && pandit.createdBy.toString() !== req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this profile'
            });
        }
        
        // Delete profile image if it exists
        if (pandit.profileImage) {
            const imagePath = path.join(__dirname, '../../', pandit.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await Pandit.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Pandit profile deleted successfully!'
        });
    } catch (error) {
        console.error('Error deleting pandit profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting pandit profile',
            error: error.message
        });
    }
};

// Rate a pandit
exports.ratePandit = async (req, res) => {
    try {
        const { rating } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid rating between 1 and 5'
            });
        }
        
        const pandit = await Pandit.findById(req.params.id);
        
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }
        
        // Calculate new average rating
        const newRatingCount = pandit.ratingCount + 1;
        const newRating = ((pandit.rating * pandit.ratingCount) + parseFloat(rating)) / newRatingCount;
        
        // Update pandit with new rating
        const updatedPandit = await Pandit.findByIdAndUpdate(
            req.params.id,
            { 
                rating: newRating.toFixed(1), 
                ratingCount: newRatingCount 
            },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully!',
            data: {
                rating: updatedPandit.rating,
                ratingCount: updatedPandit.ratingCount
            }
        });
    } catch (error) {
        console.error('Error rating pandit:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting rating',
            error: error.message
        });
    }
};

// Get nearby pandits (alternative to query params approach)
exports.getNearbyPandits = async (req, res) => {
    try {
        const { latitude, longitude, distance = 10, limit = 20 } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Please provide latitude and longitude coordinates'
            });
        }
        
        const pandits = await Pandit.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseFloat(distance) * 1000 // Convert km to meters
                }
            }
        }).limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: pandits.length,
            data: pandits
        });
    } catch (error) {
        console.error('Error fetching nearby pandits:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nearby pandits',
            error: error.message
        });
    }
};