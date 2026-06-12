// ── SQL VERSION (commented out) ───────────────────────────────────────────────
// const db = require('../utils/database');
//
// module.exports = {
//     create: async (bookingData, callback) => {
//         try {
//             const id = Date.now();
//             const { homeId, userId, userName, userEmail, homeName, homeLocation, checkIn, checkOut, nights, totalCost } = bookingData;
//             await db.execute(
//                 `INSERT INTO bookings
//                  (id, homeId, userId, userName, userEmail, homeName, homeLocation, checkIn, checkOut, nights, totalCost, status, createdAt)
//                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
//                 [id, homeId, userId, userName, userEmail, homeName, homeLocation, checkIn, checkOut, nights, totalCost]
//             );
//             const newBooking = { id, ...bookingData, status: 'active', createdAt: new Date().toISOString() };
//             callback(null, newBooking);
//         } catch (err) {
//             callback(err, null);
//         }
//     },
//
//     find: async (callback) => {
//         try {
//             const [rows] = await db.execute('SELECT * FROM bookings ORDER BY createdAt DESC');
//             callback(rows);
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     fetchByUser: async (userId, callback) => {
//         try {
//             const [rows] = await db.execute(
//                 'SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC',
//                 [userId]
//             );
//             callback(rows);
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     findById: async (id, callback) => {
//         try {
//             const [rows] = await db.execute('SELECT * FROM bookings WHERE id = ?', [id]);
//             callback(rows.length > 0 ? rows[0] : null);
//         } catch (err) {
//             callback(null);
//         }
//     },
//
//     cancel: async (id, callback) => {
//         try {
//             const [result] = await db.execute(
//                 "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
//                 [id]
//             );
//             if (result.affectedRows === 0) return callback(new Error('Booking not found'));
//             callback(null);
//         } catch (err) {
//             callback(err);
//         }
//     }
// };

// ── MONGODB NATIVE DRIVER VERSION (commented out) ─────────────────────────────
// const { getdb } = require('../utils/database');
// const { ObjectId } = require('mongodb');
//
// // Helper — adds .id string so controllers can use booking.id
// const withId = (doc) => doc ? { ...doc, id: doc._id.toString() } : null;
//
// module.exports = {
//
//     create: async (bookingData, callback) => {
//         try {
//             const db = getdb();
//             const doc = { ...bookingData, status: 'active', createdAt: new Date() };
//             const result = await db.collection('bookings').insertOne(doc);
//             callback(null, withId({ ...doc, _id: result.insertedId }));
//         } catch (err) {
//             callback(err, null);
//         }
//     },
//
//     find: async (callback) => {
//         try {
//             const db = getdb();
//             const bookings = await db.collection('bookings').find().sort({ createdAt: -1 }).toArray();
//             callback(bookings.map(withId));
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     fetchByUser: async (userId, callback) => {
//         try {
//             const db = getdb();
//             const bookings = await db.collection('bookings').find({ userId }).sort({ createdAt: -1 }).toArray();
//             callback(bookings.map(withId));
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     findById: async (id, callback) => {
//         try {
//             const db = getdb();
//             if (!ObjectId.isValid(id)) return callback(null);
//             const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });
//             callback(booking ? withId(booking) : null);
//         } catch (err) {
//             callback(null);
//         }
//     },
//
//     cancel: async (id, callback) => {
//         try {
//             const db = getdb();
//             if (!ObjectId.isValid(id)) return callback(new Error('Invalid booking ID'));
//             const result = await db.collection('bookings').updateOne(
//                 { _id: new ObjectId(id) },
//                 { $set: { status: 'cancelled' } }
//             );
//             if (result.matchedCount === 0) return callback(new Error('Booking not found'));
//             callback(null);
//         } catch (err) {
//             callback(err);
//         }
//     }
// };

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
