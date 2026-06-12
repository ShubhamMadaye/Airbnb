const mongoose = require('mongoose');
const db_Path = 'your-mongodb_path';

const homeSchema = new mongoose.Schema({}, { strict: false });
const HomeModel = mongoose.model('Home', homeSchema);

mongoose.connect(db_Path).then(async () => {
    const total = await HomeModel.countDocuments();
    console.log(`Total homes in DB: ${total}`);

    const homes = await HomeModel.find({}, { homeName: 1, status: 1, _id: 0 });
    console.log('All homes and their statuses:');
    homes.forEach(h => console.log(` - ${h.homeName || '(no name)'}: status = "${h.status}"`));
    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
