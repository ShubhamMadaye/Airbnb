const mongoose = require('mongoose');
const db_Path = 'mongodb+srv://shubhammadaye02:shubham022006@airbnb.pbvovjo.mongodb.net/airbnb?appName=airbnb';

const homeSchema = new mongoose.Schema({ status: String }, { strict: false });
const HomeModel = mongoose.model('Home', homeSchema);

mongoose.connect(db_Path).then(async () => {
    // Update all homes with status 'available' → 'approved' so they show on the homepage
    const result = await HomeModel.updateMany(
        { status: 'available' },
        { $set: { status: 'approved' } }
    );
    console.log(`✅ Updated ${result.modifiedCount} homes: available → approved`);
    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
