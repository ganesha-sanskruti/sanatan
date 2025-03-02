// src/controllers/booking.controller.js
const Booking = require('../models/booking.model');
const Pandit = require('../models/pandit.model');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const {
            panditId,
            name,
            phone,
            email,
            date,
            time,
            serviceType,
            additionalNotes
        } = req.body;

        // Check if pandit exists
        const pandit = await Pandit.findById(panditId);
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }

        // Create the booking
        const booking = new Booking({
            panditId,
            userId: req.user.id,
            name,
            phone,
            email,
            date: new Date(date),
            time,
            serviceType,
            additionalNotes
        });

        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking request submitted successfully!',
            data: booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

// Get bookings for a user
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('panditId', 'name profileImage specializations')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Get bookings for a pandit
exports.getPanditBookings = async (req, res) => {
    try {
        const { panditId } = req.params;

        // Check if the user is authorized to view these bookings
        // Only allow if user is the pandit owner or an admin
        const pandit = await Pandit.findById(panditId);
        if (!pandit) {
            return res.status(404).json({
                success: false,
                message: 'Pandit not found'
            });
        }

        if (pandit.createdBy && pandit.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these bookings'
            });
        }

        const bookings = await Booking.find({ panditId })
            .populate('userId', 'name')
            .sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching pandit bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled'
            });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization - only pandit owner, booking user, or admin can update
        const pandit = await Pandit.findById(booking.panditId);
        if (
            booking.userId.toString() !== req.user.id && 
            (pandit && pandit.createdBy && pandit.createdBy.toString() !== req.user.id) && 
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully!',
            data: booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization - only the booking user can cancel their own booking
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully!',
            data: booking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
};