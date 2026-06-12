const mongoose = require('mongoose');
const db_Path = 'your_mongodb_path';
const Home = require('./models/home');

mongoose.connect(db_Path).then(() => {
    Home.find((homes) => {
        console.log(`Found ${homes.length} homes`);
        if (homes.length > 0) {
            const h = homes[0];
            console.log('First home:');
            console.log('  homeName:', h.homeName);
            console.log('  housename (virtual):', h.housename);  // should equal homeName
            console.log('  status:', h.status);
            console.log('  id:', h.id);
        }
        process.exit(0);
    });
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
