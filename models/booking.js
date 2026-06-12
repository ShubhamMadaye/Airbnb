
// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// Define the Booking schema
const bookingSchema = new mongoose.Schema({
    homeId:       { type: String, required: true },
    userId:       { type: String, required: true },
    userName:     { type: String, required: true },
    userEmail:    { type: String, required: true },
    homeName:     { type: String, required: true },
    homeLocation: { type: String, required: true },
    checkIn:      { type: String, required: true },
    checkOut:     { type: String, required: true },
    nights:       { type: Number, required: true },
    totalCost:    { type: Number, required: true },
    // enum restricts status to only these values
    status:       { type: String, enum: ['active', 'cancelled'], default: 'active' },
    createdAt:    { type: Date, default: Date.now }
});

// mongoose.model() creates the model — Mongoose uses collection 'bookings'
module.exports = mongoose.model('Booking', bookingSchema);
