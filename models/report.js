
// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// Define the Report schema
const reportSchema = new mongoose.Schema({
    userId:    { type: String, required: true },
    userName:  { type: String, required: true },
    homeId:    { type: String, required: true },
    homeName:  { type: String, required: true },
    reason:    { type: String, required: true },
    details:   { type: String, default: '' },
    // enum restricts status to only 'open' or 'resolved'
    status:    { type: String, enum: ['open', 'resolved'], default: 'open' },
    createdAt: { type: Date, default: Date.now }
});

// Mongoose will use a collection called 'reports'
module.exports = mongoose.model('Report', reportSchema);
