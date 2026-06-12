
// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // enum restricts role to only 'user' or 'admin'
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isHost:   { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false }
});

// mongoose.model() compiles the schema — Mongoose uses collection 'users'
module.exports = mongoose.model('User', userSchema);
