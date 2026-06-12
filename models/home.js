
// ── SQL VERSION (commented out) ───────────────────────────────────────────────
// const db = require('../utils/sqlDatabase');
//
// module.exports = class Home {
//     constructor(name, location, pricePerNight, photo, ownerId, ownerName, status) {
//         this.housename = name;
//         this.location = location;
//         this.pricePerNight = pricePerNight;
//         this.photo = photo || '';
//         this.ownerId = ownerId || null;
//         this.ownerName = ownerName || 'Admin';
//         this.status = status || (this.ownerId ? 'pending' : 'approved');
//     }
//
//     async save(callback) {
//         try {
//             const [result] = await db.execute(
//                 'INSERT INTO homes (housename, location, pricePerNight, photo, ownerId, ownerName, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                 [this.housename, this.location, this.pricePerNight, this.photo, this.ownerId, this.ownerName, this.status]
//             );
//             this.id = result.insertId;
//             if (callback) callback(null, this);
//         } catch (err) {
//             if (callback) callback(err);
//         }
//     }
//
//     static async fetchAll(callback) {
//         try {
//             const [rows] = await db.execute('SELECT * FROM homes');
//             callback(rows);
//         } catch (err) {
//             callback([]);
//         }
//     }
//
//     static async fetchAllById(id, callback) {
//         try {
//             const [rows] = await db.execute('SELECT * FROM homes WHERE id = ?', [id]);
//             callback(rows.length > 0 ? rows[0] : null);
//         } catch (err) {
//             callback(null);
//         }
//     }
//
//     static async fetchByOwner(ownerId, callback) {
//         try {
//             const [rows] = await db.execute('SELECT * FROM homes WHERE ownerId = ?', [ownerId]);
//             callback(rows);
//         } catch (err) {
//             callback([]);
//         }
//     }
//
//     static async updateById(id, updatedData, callback) {
//         try {
//             const { housename, location, pricePerNight, photo } = updatedData;
//             await db.execute(
//                 'UPDATE homes SET housename = ?, location = ?, pricePerNight = ?, photo = ? WHERE id = ?',
//                 [housename, location, pricePerNight, photo || '', id]
//             );
//             if (callback) callback(null);
//         } catch (err) {
//             if (callback) callback(err);
//         }
//     }
//
//     static async deleteById(id, callback) {
//         try {
//             await db.execute('DELETE FROM homes WHERE id = ?', [id]);
//             if (callback) callback(null);
//         } catch (err) {
//             if (callback) callback(err);
//         }
//     }
//
//     static async setStatus(id, status, callback) {
//         try {
//             const [result] = await db.execute('UPDATE homes SET status = ? WHERE id = ?', [status, id]);
//             if (result.affectedRows === 0) return callback(new Error('Home not found'));
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
// const withId = (doc) => doc ? { ...doc, id: doc._id.toString() } : null;
//
// module.exports = class Home {
//     constructor(name, location, pricePerNight, photo, ownerId, ownerName, status) {
//         this.housename = name;
//         this.location = location;
//         this.pricePerNight = pricePerNight;
//         this.photo = photo || '';
//         this.ownerId = ownerId || null;
//         this.ownerName = ownerName || 'Admin';
//         this.status = status || (this.ownerId ? 'pending' : 'approved');
//     }
//
//     async save(callback) {
//         try {
//             const db = getdb();
//             const result = await db.collection('homes').insertOne({ ...this });
//             this._id = result.insertedId;
//             this.id = this._id.toString();
//             if (callback) callback(null, this);
//         } catch (err) {
//             if (callback) callback(err);
//         }
//     }
//
//     static async find(callback) {
//         try {
//             const db = getdb();
//             const homes = await db.collection('homes').find().toArray();
//             callback(homes.map(withId));
//         } catch (err) {
//             callback([]);
//         }
//     }
//
//     static async findById(id, callback) {
//         try {
//             const db = getdb();
//             if (!ObjectId.isValid(id)) return callback(null);
//             const home = await db.collection('homes').findOne({ _id: new ObjectId(id) });
//             callback(home ? withId(home) : null);
//         } catch (err) {
//             callback(null);
//         }
//     }
//
//     static async fetchByOwner(ownerId, callback) {
//         try {
//             const db = getdb();
//             const homes = await db.collection('homes').find({ ownerId }).toArray();
//             callback(homes.map(withId));
//         } catch (err) {
//             callback([]);
//         }
//     }
//
//     static async updateById(id, updatedData, callback) {
//         try {
//             const db = getdb();
//             if (!ObjectId.isValid(id)) return callback && callback(new Error('Invalid ID'));
//             const { homeName, location, pricePerNight, photo } = updatedData;
//             await db.collection('homes').updateOne(
//                 { _id: new ObjectId(id) },
//                 { $set: { homeName, location, pricePerNight, photo: photo || '' } }
//             );
//             if (callback) callback(null);
//         } catch (err) {
//             if (callback) callback(err);
//         }
//     }
//
//     static async deleteById(id, callback) {
//         try {
//             const db = getdb();
//             if (!ObjectId.isValid(id)) return callback && callback(new Error('Invalid ID'));
//             await db.collection('homes').deleteOne({ _id: new ObjectId(id) });
//             if (callback) callback(null);
//         } catch (err) {
//             if (callback) callback(err);
//         }
//     }
//
//     static async setStatus(id, status, callback) {
//         try {
//             const db = getdb();
//             if (!ObjectId.isValid(id)) return callback(new Error('Invalid ID'));
//             const result = await db.collection('homes').updateOne(
//                 { _id: new ObjectId(id) },
//                 { $set: { status } }
//             );
//             if (result.matchedCount === 0) return callback(new Error('Home not found'));
//             callback(null);
//         } catch (err) {
//             callback(err);
//         }
//     }
// };

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
