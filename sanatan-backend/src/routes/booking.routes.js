// src/routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { auth } = require('../middleware/auth.middleware');

// Create a new booking
router.post('/', auth, bookingController.createBooking);

// Get user's bookings
router.get('/my-bookings', auth, bookingController.getUserBookings);

// Get bookings for a specific pandit
router.get('/pandit/:panditId', auth, bookingController.getPanditBookings);

// Update booking status
router.put('/:bookingId/status', auth, bookingController.updateBookingStatus);

// Cancel a booking
router.put('/:bookingId/cancel', auth, bookingController.cancelBooking);

module.exports = router;