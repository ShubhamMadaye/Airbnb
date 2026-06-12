
// ── MONGOOSE VERSION ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('./models/user');
const Home = require('./models/home');

// Same connection string used in app.js
const db_Path = "your_mongodb_path";

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
mongoose.connect(db_Path)
    .then(() => {
        console.log('✅ Mongoose connected successfully.');
        seedMongoose();
    })
    .catch(err => {
        console.error('❌ Could not connect to MongoDB:', err);
        process.exit(1);
    });
