// ── SQL VERSION (commented out) ───────────────────────────────────────────────
// const db = require('../utils/database');
//
// module.exports = {
//     find: async (callback) => {
//         try {
//             const [rows] = await db.execute('SELECT homeId, stars FROM ratings');
//             const ratingsObj = {};
//             rows.forEach(r => { ratingsObj[String(r.homeId)] = r.stars; });
//             callback(ratingsObj);
//         } catch (err) {
//             callback({});
//         }
//     },
//
//     getFor: async (id, callback) => {
//         try {
//             const [rows] = await db.execute('SELECT stars FROM ratings WHERE homeId = ?', [Number(id)]);
//             callback(rows.length > 0 ? rows[0].stars : 0);
//         } catch (err) {
//             callback(0);
//         }
//     },
//
//     set: async (id, stars, callback) => {
//         try {
//             await db.execute(
//                 'INSERT INTO ratings (homeId, stars) VALUES (?, ?) ON DUPLICATE KEY UPDATE stars = VALUES(stars)',
//                 [Number(id), Number(stars)]
//             );
//             if (callback) callback(null);
//         } catch (err) {
//             if (callback) callback(err);
//         }
//     }
// };

// ── MONGODB NATIVE DRIVER VERSION (commented out) ─────────────────────────────
// Ratings stored as { homeId: "string", stars: Number } in 'ratings' collection
//const { getdb } = require('../utils/database');
//
//module.exports = {
//
//    find: async (callback) => {
//        try {
//            const db = getdb();
//            const docs = await db.collection('ratings').find().toArray();
//            const ratingsObj = {};
//            docs.forEach(r => { ratingsObj[String(r.homeId)] = r.stars; });
//            callback(ratingsObj);
//        } catch (err) {
//            callback({});
//        }
//    },
//
//    getFor: async (id, callback) => {
//        try {
//            const db = getdb();
//            const doc = await db.collection('ratings').findOne({ homeId: String(id) });
//            callback(doc ? doc.stars : 0);
//        } catch (err) {
//            callback(0);
//        }
//    },
//
//    set: async (id, stars, callback) => {
//        try {
//            const db = getdb();
//            await db.collection('ratings').replaceOne(
//                { homeId: String(id) },
//                { homeId: String(id), stars: Number(stars) },
//                { upsert: true }
//            );
//            if (callback) callback(null);
//        } catch (err) {
//            if (callback) callback(err);
//        }
//    }
//};

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
