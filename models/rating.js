
// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// Define the Rating schema
// homeId is unique — each home can have only one rating document
const ratingSchema = new mongoose.Schema({
    homeId: { type: String, required: true, unique: true },
    // min/max — Mongoose validators, rejects values outside 1–5
    stars:  { type: Number, required: true, min: 1, max: 5 }
});

// Mongoose will use a collection called 'ratings'
module.exports = mongoose.model('Rating', ratingSchema);
