
// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// Define the Favourite schema
// Each document just stores a homeId string (the string form of a home's _id)
const favouriteSchema = new mongoose.Schema({
    homeId: { type: String, required: true, unique: true }
    // unique: true — ensures a home can't be favourited twice
});

// Mongoose will use a collection called 'favourites'
module.exports = mongoose.model('Favourite', favouriteSchema);
