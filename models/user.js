// ── SQL VERSION (commented out) ───────────────────────────────────────────────
// const db = require('../utils/database');
// const bcrypt = require('bcryptjs');
//
// module.exports = {
//     register: async (name, email, password, role, callback) => {
//         try {
//             const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
//             if (rows.length > 0) return callback(new Error('Email already registered'));
//             const hash = await bcrypt.hash(password, 12);
//             const id = Date.now();
//             const isHost = role === 'admin' ? 0 : 0;
//             await db.execute(
//                 'INSERT INTO users (id, name, email, password, role, isHost, isBanned) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                 [id, name, email, hash, role, isHost, 0]
//             );
//             const newUser = { id, name, email, role, isHost: false, isBanned: false };
//             callback(null, newUser);
//         } catch (err) {
//             callback(err);
//         }
//     },
//
//     login: async (email, password, callback) => {
//         try {
//             const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
//             if (rows.length === 0) return callback(new Error('Invalid email or password'));
//             const user = rows[0];
//             const match = await bcrypt.compare(password, user.password);
//             if (!match) return callback(new Error('Invalid email or password'));
//             const { password: _, ...safeUser } = user;
//             safeUser.isHost = safeUser.isHost === 1;
//             safeUser.isBanned = safeUser.isBanned === 1;
//             callback(null, safeUser);
//         } catch (err) {
//             callback(err);
//         }
//     },
//
//     findById: async (id, callback) => {
//         try {
//             const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
//             if (rows.length === 0) return callback(null);
//             const { password: _, ...safeUser } = rows[0];
//             safeUser.isHost = safeUser.isHost === 1;
//             safeUser.isBanned = safeUser.isBanned === 1;
//             callback(safeUser);
//         } catch (err) {
//             callback(null);
//         }
//     },
//
//     upgradeToHost: async (userId, callback) => {
//         try {
//             const [result] = await db.execute('UPDATE users SET isHost = 1 WHERE id = ?', [userId]);
//             if (result.affectedRows === 0) return callback(new Error('User not found'));
//             callback(null);
//         } catch (err) {
//             callback(err);
//         }
//     },
//
//     find: async (callback) => {
//         try {
//             const [rows] = await db.execute('SELECT id, name, email, role, isHost, isBanned FROM users');
//             const safeUsers = rows.map(u => ({
//                 ...u,
//                 isHost: u.isHost === 1,
//                 isBanned: u.isBanned === 1
//             }));
//             callback(safeUsers);
//         } catch (err) {
//             callback([]);
//         }
//     },
//
//     setBanned: async (userId, banned, callback) => {
//         try {
//             const [result] = await db.execute(
//                 'UPDATE users SET isBanned = ? WHERE id = ?',
//                 [banned ? 1 : 0, userId]
//             );
//             if (result.affectedRows === 0) return callback(new Error('User not found'));
//             callback(null);
//         } catch (err) {
//             callback(err);
//         }
//     }
// };

// ── MONGODB NATIVE DRIVER VERSION (commented out) ─────────────────────────────
//const { getdb } = require('../utils/database');
//const bcrypt = require('bcryptjs');
//const { ObjectId } = require('mongodb');
//
//// Helper — adds .id string so controllers can use user.id
//const withId = (doc) => doc ? { ...doc, id: doc._id.toString() } : null;
//
//module.exports = {
//
//    register: async (name, email, password, role, callback) => {
//        try {
//            const db = getdb();
//            const existing = await db.collection('users').findOne({ email });
//            if (existing) return callback(new Error('Email already registered'));
//            const hash = await bcrypt.hash(password, 12);
//            const doc = { name, email, password: hash, role, isHost: false, isBanned: false };
//            const result = await db.collection('users').insertOne(doc);
//            const { password: _, ...safeUser } = withId({ ...doc, _id: result.insertedId });
//            callback(null, safeUser);
//        } catch (err) {
//            callback(err);
//        }
//    },
//
//    login: async (email, password, callback) => {
//        try {
//            const db = getdb();
//            const user = await db.collection('users').findOne({ email });
//            if (!user) return callback(new Error('Invalid email or password'));
//            const match = await bcrypt.compare(password, user.password);
//            if (!match) return callback(new Error('Invalid email or password'));
//            const { password: _, ...safeUser } = withId(user);
//            callback(null, safeUser);
//        } catch (err) {
//            callback(err);
//        }
//    },
//
//    findById: async (id, callback) => {
//        try {
//            const db = getdb();
//            if (!ObjectId.isValid(id)) return callback(null);
//            const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
//            if (!user) return callback(null);
//            const { password: _, ...safeUser } = withId(user);
//            callback(safeUser);
//        } catch (err) {
//            callback(null);
//        }
//    },
//
//    upgradeToHost: async (userId, callback) => {
//        try {
//            const db = getdb();
//            if (!ObjectId.isValid(userId)) return callback(new Error('Invalid user ID'));
//            const result = await db.collection('users').updateOne(
//                { _id: new ObjectId(userId) },
//                { $set: { isHost: true } }
//            );
//            if (result.matchedCount === 0) return callback(new Error('User not found'));
//            callback(null);
//        } catch (err) {
//            callback(err);
//        }
//    },
//
//    find: async (callback) => {
//        try {
//            const db = getdb();
//            const users = await db.collection('users')
//                .find({}, { projection: { password: 0 } })
//                .toArray();
//            callback(users.map(withId));
//        } catch (err) {
//            callback([]);
//        }
//    },
//
//    setBanned: async (userId, banned, callback) => {
//        try {
//            const db = getdb();
//            if (!ObjectId.isValid(userId)) return callback(new Error('Invalid user ID'));
//            const result = await db.collection('users').updateOne(
//                { _id: new ObjectId(userId) },
//                { $set: { isBanned: banned } }
//            );
//            if (result.matchedCount === 0) return callback(new Error('User not found'));
//            callback(null);
//        } catch (err) {
//            callback(err);
//        }
//    }
//
//};

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
