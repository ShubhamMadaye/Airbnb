
// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
    homeName:      { type: String, required: true },
    location:      { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    photo:      { type: String, default: '' },
    // ObjectId ref — links to User model (used for host ownership)
    ownerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ownerName:     { type: String, default: 'Admin' },
    // enum restricts status to only these values
    status:        { type: String, enum: ['approved', 'pending', 'rejected', 'available', 'booked'], default: 'pending' }
});

// Virtual alias — EJS templates use home.housename; homeName is the actual stored field
homeSchema.virtual('housename').get(function () { return this.homeName; });

// mongoose.model() compiles the schema — Mongoose uses collection 'homes'
module.exports = mongoose.model('Home', homeSchema);
