/**
 * seed-admin.js
 * Run once: node seed-admin.js
 *
 * Seeds:
 *  1. Admin user (admin@airbnb.com / admin123)
 *  2. All homes from data/homes.json into the MongoDB `homes` collection
 *
 * NOTE: SQL code below is commented out — migrate to MongoDB before using.
 */

// ── SQL VERSION (commented out) ───────────────────────────────────────────────
// const db = require('./utils/database');
// const bcrypt = require('bcryptjs');
// const fs = require('fs');
// const path = require('path');
//
// async function seed() {
//     try {
//         // ── 1. Seed Admin User ──────────────────────────────────────────
//         const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', ['admin@airbnb.com']);
//
//         if (existing.length > 0) {
//             console.log('ℹ  Admin already exists — skipping user seed.');
//         } else {
//             const hash = await bcrypt.hash('admin123', 12);
//             const id = Date.now();
//             await db.execute(
//                 'INSERT INTO users (id, name, email, password, role, isHost, isBanned) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                 [id, 'Admin', 'admin@airbnb.com', hash, 'admin', 0, 0]
//             );
//             console.log('✅ Admin user created!');
//             console.log('   Email:    admin@airbnb.com');
//             console.log('   Password: admin123');
//         }
//
//         // ── 2. Seed Homes from data/homes.json ──────────────────────────
//         const homesPath = path.join(__dirname, 'data', 'homes.json');
//         if (!fs.existsSync(homesPath)) {
//             console.log('ℹ  No data/homes.json found — skipping homes seed.');
//             return process.exit(0);
//         }
//
//         const homes = JSON.parse(fs.readFileSync(homesPath, 'utf-8'));
//         const [existingHomes] = await db.execute('SELECT COUNT(*) AS cnt FROM homes');
//
//         if (existingHomes[0].cnt > 0) {
//             console.log(`ℹ  Homes table already has ${existingHomes[0].cnt} rows — skipping homes seed.`);
//         } else {
//             for (const home of homes) {
//                 await db.execute(
//                     'INSERT INTO homes (housename, location, pricePerNight, photo, ownerId, ownerName, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                     [
//                         home.housename,
//                         home.location,
//                         home.pricePerNight,
//                         home.photo || '',
//                         home.ownerId || null,
//                         home.ownerName || 'Admin',
//                         home.status || 'approved'
//                     ]
//                 );
//             }
//             console.log(`✅ Seeded ${homes.length} homes into MySQL.`);
//         }
//
//         console.log('\n🎉 Seeding complete!');
//         process.exit(0);
//     } catch (err) {
//         console.error('❌ Seeding failed:', err.message);
//         process.exit(1);
//     }
// }
//
// seed();

// ── MONGODB NATIVE DRIVER VERSION (commented out) ─────────────────────────────
// This used mongoConnect from utils/MongoDatabase.js + raw MongoDB driver.
// Replaced by the Mongoose version below (which matches how app.js connects).
//
// const { mongoConnect, getdb } = require('./utils/MongoDatabase');
// const bcrypt = require('bcryptjs');
// const fs = require('fs');
// const path = require('path');
//
// async function seedMongo() {
//     try {
//         const db = getdb();
//
//         // ── 1. Seed Admin User ──────────────────────────────────────────────
//         const existing = await db.collection('users').findOne({ email: 'admin@airbnb.com' });
//
//         if (existing) {
//             console.log('ℹ  Admin already exists — skipping user seed.');
//         } else {
//             const hash = await bcrypt.hash('admin123', 12);
//             await db.collection('users').insertOne({
//                 name: 'Admin',
//                 email: 'admin@airbnb.com',
//                 password: hash,
//                 role: 'admin',
//                 isHost: false,
//                 isBanned: false
//             });
//             console.log('✅ Admin user created!');
//             console.log('   Email:    admin@airbnb.com');
//             console.log('   Password: admin123');
//         }
//
//         // ── 2. Seed Homes from data/homes.json ──────────────────────────────
//         const homesPath = path.join(__dirname, 'data', 'homes.json');
//         if (!fs.existsSync(homesPath)) {
//             console.log('ℹ  No data/homes.json found — skipping homes seed.');
//             return process.exit(0);
//         }
//
//         const homes = JSON.parse(fs.readFileSync(homesPath, 'utf-8'));
//         const count = await db.collection('homes').countDocuments();
//
//         if (count > 0) {
//             console.log(`ℹ  Homes collection already has ${count} documents — skipping homes seed.`);
//         } else {
//             const homeDocs = homes.map(home => ({
//                 housename: home.housename,
//                 location: home.location,
//                 pricePerNight: home.pricePerNight,
//                 photo: home.photo || '',
//                 ownerId: home.ownerId || null,
//                 ownerName: home.ownerName || 'Admin',
//                 status: home.status || 'approved'
//             }));
//             await db.collection('homes').insertMany(homeDocs);
//             console.log(`✅ Seeded ${homeDocs.length} homes into MongoDB.`);
//         }
//
//         console.log('\n🎉 Seeding complete!');
//         process.exit(0);
//     } catch (err) {
//         console.error('❌ Seeding failed:', err.message);
//         process.exit(1);
//     }
// }
//
// // Connect to MongoDB then run the seed
// mongoConnect(() => {
//     seedMongo();
// });

// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
// Uses mongoose.connect() — same connection as app.js
// Imports the Mongoose models (User, Home) defined in models/
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
// const dns = require('dns');
// dns.setServers(['8.8.8.8', '8.8.4.4']); // ⚠️ DO NOT REMOVE — router DNS blocks MongoDB SRV lookups
// // Import Mongoose models — these define the schema and talk to MongoDB
// Import Mongoose models directly (clean exports after rewrite)
const User = require('./models/user');
const Home = require('./models/home');

// Same connection string used in app.js
const db_Path = "mongodb+srv://shubhammadaye02:shubham022006@airbnb.pbvovjo.mongodb.net/airbnb?appName=airbnb";

async function seedMongoose() {
    try {
        // ── 1. Seed Admin User ──────────────────────────────────────────────
        // User.findOne() — Mongoose query, checks if admin already exists
        const existing = await User.findOne({ email: 'admin@airbnb.com' });

        if (existing) {
            console.log('ℹ  Admin already exists — skipping user seed.');
        } else {
            const hash = await bcrypt.hash('admin123', 12);

            // User.create() — creates and saves a new document in one step
            await User.create({
                name: 'Admin',
                email: 'admin@airbnb.com',
                password: hash,
                role: 'admin',
                isHost: false,
                isBanned: false
            });
            console.log('✅ Admin user created!');
            console.log('   Email:    admin@airbnb.com');
            console.log('   Password: admin123');
        }

        // ── 2. Seed Homes from data/homes.json ──────────────────────────────
        const homesPath = path.join(__dirname, 'data', 'homes.json');
        if (!fs.existsSync(homesPath)) {
            console.log('ℹ  No data/homes.json found — skipping homes seed.');
            return process.exit(0);
        }

        const homes = JSON.parse(fs.readFileSync(homesPath, 'utf-8'));

        // Home.countDocuments() — counts documents in the 'homes' collection
        const count = await Home.countDocuments();

        if (count > 0) {
            console.log(`ℹ  Homes collection already has ${count} documents — skipping homes seed.`);
        } else {
            const homeDocs = homes.map(home => ({
                homeName:     home.housename || home.homeName,
                location:     home.location,
                pricePerNight: home.pricePerNight,
                photo:     home.photo || '',
                // mongoose.Types.ObjectId converts a string id to a proper ObjectId for the ref field
                ownerId:
                home.ownerId && mongoose.Types.ObjectId.isValid(home.ownerId)
                    ? new mongoose.Types.ObjectId(home.ownerId) : null,
                status:       home.status || 'approved'  // admin-seeded homes are pre-approved
            }));

            // Home.insertMany() — inserts multiple documents in one database call (faster than looping)
            await Home.insertMany(homeDocs);
            console.log(`✅ Seeded ${homeDocs.length} homes into MongoDB via Mongoose.`);
        }

        console.log('\n🎉 Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

// mongoose.connect() — establishes the connection, then runs the seed function
// .then() / .catch() — Promise chaining (same pattern as app.js)
mongoose.connect(db_Path)
    .then(() => {
        console.log('✅ Mongoose connected successfully.');
        seedMongoose();
    })
    .catch(err => {
        console.error('❌ Could not connect to MongoDB:', err);
        process.exit(1);
    });
