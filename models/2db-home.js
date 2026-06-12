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
//     // Insert this home into the database
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
//     // Fetch all homes
//     static async fetchAll(callback) {
//         try {
//             const [rows] = await db.execute('SELECT * FROM homes');
//             callback(rows);
//         } catch (err) {
//             callback([]);
//         }
//     }
//
//     // fetchAllById — lookup by primary key id
//     static async fetchAllById(id, callback) {
//         try {
//             const [rows] = await db.execute('SELECT * FROM homes WHERE id = ?', [id]);
//             callback(rows.length > 0 ? rows[0] : null);
//         } catch (err) {
//             callback(null);
//         }
//     }
//
//     // fetchByOwner — return only homes listed by a specific user
//     static async fetchByOwner(ownerId, callback) {
//         try {
//             const [rows] = await db.execute('SELECT * FROM homes WHERE ownerId = ?', [ownerId]);
//             // Match existing shape: [{ home, index }] → keep it flat (controllers use listing.id)
//             callback(rows);
//         } catch (err) {
//             callback([]);
//         }
//     }
//
//     // updateById — overwrite home fields by id
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
//     // deleteById — remove a home by id
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

// ── MONGODB VERSION ───────────────────────────────────────────────────────────


// const { getdb } = require('../utils/database');
// const { ObjectId } = require('mongodb');

// Helper — adds .id string so controllers can use home.id
const withId = (doc) => doc ? { ...doc, id: doc._id.toString() } : null;

module.exports = class Home {
    constructor(name, location, pricePerNight, photo, ownerId, ownerName, status) {
        this.housename = name;
        this.location = location;
        this.pricePerNight = pricePerNight;
        this.photo = photo || '';
        this.ownerId = ownerId || null;
        this.ownerName = ownerName || 'Admin';
        this.status = status || (this.ownerId ? 'pending' : 'approved');
    }

    // Insert this home into the database
    async save(callback) {
        try {
            const db = getdb();
            const result = await db.collection('homes').insertOne({ ...this }); //creates a new plain object containing the same properties. 
            // This avoids accidentally passing of methods, prototype information, or references from the class instance.
            this._id = result.insertedId;
            this.id = this._id.toString();
            if (callback) callback(null, this);
        } catch (err) {
            if (callback) callback(err);
        }
    }

    // Fetch all homes
    static async fetchAll(callback) {
        try {
            const db = getdb();
            const homes = await db.collection('homes').fetchAll().toArray();
            callback(homes.map(withId));
        } catch (err) {
            callback([]);
        }
    }

    // fetchAllById — lookup by string id
    static async fetchAllById(id, callback) {
        try {
            const db = getdb();
            if (!ObjectId.isValid(id)) return callback(null);
            const home = await db.collection('homes').fetchAllOne({ _id: new ObjectId(id) });
            callback(home ? withId(home) : null);
        } catch (err) {
            callback(null);
        }
    }

    // fetchByOwner — return only homes listed by a specific user
    static async fetchByOwner(ownerId, callback) {
        try {
            const db = getdb();
            const homes = await db.collection('homes').fetchAll({ ownerId }).toArray();
            callback(homes.map(withId));
        } catch (err) {
            callback([]);
        }
    }

    // updateById — overwrite home fields by id
    static async updateById(id, updatedData, callback) {
        try {
            const db = getdb();
            if (!ObjectId.isValid(id)) return callback && callback(new Error('Invalid ID'));//isVslid check the _id meanin mongodb genrated id is valid or not
            // valid keliye: ObjectId.isValid("6890ab12cd34ef5678901234") => true && invalid keliye: ObjectId.isValid("abc") => false
            const { housename, location, pricePerNight, photo } = updatedData;
            await db.collection('homes').updateOne(
                { _id: new ObjectId(id) },
                { $set: { housename, location, pricePerNight, photo: photo || '' } }
            );
            if (callback) callback(null);
        } catch (err) {
            if (callback) callback(err);
        }
    }

    // deleteById — remove a home by id
    static async deleteById(id, callback) { // yeh id jo pass horha hai vo mongodb ki id hai (6890ab12cd34ef5678901234) 
        try {
            const db = getdb();
            if (!ObjectId.isValid(id)) return callback && callback(new Error('Invalid ID'));
            await db.collection('homes').deleteOne({ _id: new ObjectId(id) });
            if (callback) callback(null);
        } catch (err) {
            if (callback) callback(err);
        }
    }

    // setStatus — approve / reject / pending
    static async setStatus(id, status, callback) {
        try {
            const db = getdb();
            if (!ObjectId.isValid(id)) return callback(new Error('Invalid ID'));
            const result = await db.collection('homes').updateOne(
                { _id: new ObjectId(id) },
                { $set: { status } }
            );
            if (result.matchedCount === 0) return callback(new Error('Home not found'));
            callback(null);
        } catch (err) {
            callback(err);
        }
    }
};



