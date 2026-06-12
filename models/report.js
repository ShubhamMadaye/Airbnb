// ── SQL VERSION (commented out) ───────────────────────────────────────────────
// const db = require('../utils/database');
//
// module.exports = {
//     create: async (reportData, callback) => {
//         try {
//             const id = Date.now();
//             const { userId, userName, homeId, homeName, reason, details } = reportData;
//             await db.execute(
//                 `INSERT INTO reports (id, userId, userName, homeId, homeName, reason, details, status, createdAt)
//                  VALUES (?, ?, ?, ?, ?, ?, ?, 'open', NOW())`,
//                 [id, userId, userName, homeId, homeName, reason, details]
//             );
//             const newReport = { id, ...reportData, status: 'open', createdAt: new Date().toISOString() };
//             callback(null, newReport);
//         } catch (err) {
//             callback(err, null);
//         }
//     },
//
//     find: async (callback) => {
//         try {
//             const [rows] = await db.execute('SELECT * FROM reports ORDER BY createdAt DESC');
//             callback(rows);
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     resolve: async (id, callback) => {
//         try {
//             const [result] = await db.execute(
//                 "UPDATE reports SET status = 'resolved' WHERE id = ?",
//                 [id]
//             );
//             if (result.affectedRows === 0) return callback(new Error('Report not found'));
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
// // Helper — adds .id string so controllers can use report.id
// const withId = (doc) => doc ? { ...doc, id: doc._id.toString() } : null;
//
// module.exports = {
//
//     create: async (reportData, callback) => {
//         try {
//             const db = getdb();
//             const doc = { ...reportData, status: 'open', createdAt: new Date() };
//             const result = await db.collection('reports').insertOne(doc);
//             callback(null, withId({ ...doc, _id: result.insertedId }));
//         } catch (err) {
//             callback(err, null);
//         }
//     },
//
//     find: async (callback) => {
//         try {
//             const db = getdb();
//             const reports = await db.collection('reports')
//                 .find()
//                 .sort({ createdAt: -1 }) // newest to oldest
//                 // .sort({ createdAt: 1 }) // oldest to newest
//                 .toArray();
//             callback(reports.map(withId));
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     resolve: async (id, callback) => {
//         try {
//             const db = getdb();
//             if (!ObjectId.isValid(id)) return callback(new Error('Invalid report ID'));
//             const result = await db.collection('reports').updateOne(
//                 { _id: new ObjectId(id) },
//                 { $set: { status: 'resolved' } }
//             );
//             if (result.matchedCount === 0) return callback(new Error('Report not found'));
//             callback(null);
//         } catch (err) {
//             callback(err);
//         }
//     }
// };

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
