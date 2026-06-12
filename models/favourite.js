// ── SQL VERSION (commented out) ───────────────────────────────────────────────
// const db = require('../utils/database');
//
// module.exports = {
//     find: async (callback) => {
//         try {
//             const [rows] = await db.execute('SELECT homeId FROM favourites');
//             callback(rows.map(r => r.homeId));
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     toggle: async (id, callback) => {
//         const numId = Number(id);
//         try {
//             const [rows] = await db.execute('SELECT homeId FROM favourites WHERE homeId = ?', [numId]);
//             let added;
//             if (rows.length === 0) {
//                 await db.execute('INSERT INTO favourites (homeId) VALUES (?)', [numId]);
//                 added = true;
//             } else {
//                 await db.execute('DELETE FROM favourites WHERE homeId = ?', [numId]);
//                 added = false;
//             }
//             const [updatedRows] = await db.execute('SELECT homeId FROM favourites');
//             const favs = updatedRows.map(r => r.homeId);
//             callback({ added, favs });
//         } catch (err) {
//             callback({ added: false, favs: [] });
//         }
//     },
//
//     isFav: async (id, callback) => {
//         try {
//             const [rows] = await db.execute('SELECT homeId FROM favourites WHERE homeId = ?', [Number(id)]);
//             callback(rows.length > 0);
//         } catch (err) {
//             callback(false);
//         }
//     }
// };

// ── MONGODB NATIVE DRIVER VERSION (commented out) ─────────────────────────────
// Favourites are stored as { homeId: "string" } documents in 'favourites' collection
//const { getdb } = require('../utils/database');
//
//module.exports = {
//
//    find: async (callback) => {
//        try {
//            const db = getdb();
//            const docs = await db.collection('favourites').find().toArray();
//            callback(docs.map(d => d.homeId));
//        } catch (err) {
//            callback([]);
//        }
//    },
//
//    toggle: async (id, callback) => {
//        try {
//            const db = getdb();
//            const homeId = String(id);
//            const existing = await db.collection('favourites').findOne({ homeId });
//            let added;
//            if (!existing) {
//                await db.collection('favourites').insertOne({ homeId });
//                added = true;
//            } else {
//                await db.collection('favourites').deleteOne({ homeId });
//                added = false;
//            }
//            const docs = await db.collection('favourites').find().toArray();
//            const favs = docs.map(d => d.homeId);
//            callback({ added, favs });
//        } catch (err) {
//            callback({ added: false, favs: [] });
//        }
//    },
//
//    isFav: async (id, callback) => {
//        try {
//            const db = getdb();
//            const doc = await db.collection('favourites').findOne({ homeId: String(id) });
//            callback(!!doc);
//        } catch (err) {
//            callback(false);
//        }
//    }
//};

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
