const Home = require('../models/home');
const Booking = require('../models/booking');
const User = require('../models/user');
const Report = require('../models/report');
const fs = require("fs")
// GET /host/add-home — show the admin add home form
exports.getaddHome = (req, res) => {
    res.render('host/addHome', { pageTitle: 'Add Home', currentPage: 'add-home' });
};

// POST /host/add-home — admin saves a new home (always 'approved')
exports.postaddHome = async (req, res) => {
    try {
        const { homeName, houseAddress, pricePerNight } = req.body;

        // Guard: if no file selected/uploaded, stop here
        if (!req.file) {
            return res.status(422).send("no image uploaded");  // ← return stops execution
        }

        // req.file is set by multer — prefix with /uploads/ so browser can resolve the URL
        const photo = '/uploads/' + req.file.filename;
        console.log('Uploaded file:', req.file);  // ← prints only when a file IS uploaded

        // Home.create() — creates and saves a new document in one step
        await Home.create({
            homeName,
            location: houseAddress,
            pricePerNight: Number(pricePerNight),
            photo,
            ownerId: null,
            ownerName: 'Admin',
            status: 'approved'
        });
        res.render('host/registerSucessfully', { pageTitle: 'Registration Successful', currentPage: 'register' });
    } catch (err) {
        res.status(500).send('Could not save home.');
    }
};

// GET /host/edit-homes — list ALL homes with booking stats
exports.getEditHomeList = async (req, res) => {
    try {
        // Promise.all() — runs both queries in parallel
        const [homes, bookings] = await Promise.all([
            Home.find(),
            Booking.find()
        ]);

        // Build a count map: { homeId: numberOfBookings }
        const bookingCounts = {};
        bookings.forEach(b => {
            bookingCounts[b.homeId] = (bookingCounts[b.homeId] || 0) + 1;
        });

        res.render('host/edit-home-list', {
            homes,
            bookingCounts,
            pageTitle: 'Manage Listings',
            currentPage: 'edit-homes'
        });
    } catch (err) {
        res.status(500).send('Error loading homes.');
    }
};

// GET /host/edit-home/:id — show pre-filled edit form for one home
exports.getEditHome = async (req, res) => {
    try {
        const id = req.params.id;
        // Home.findById() — shorthand for findOne({ _id: id })
        const home = await Home.findById(id);
        if (!home) return res.status(404).render('error404', { pageTitle: 'Home Not Found', currentPage: '' });
        res.render('host/edit-home', {
            home, id,
            pageTitle: 'Edit Home',
            currentPage: 'edit-homes'
        });
    } catch (err) {
        res.status(500).send('Error loading home.');
    }
};

// POST /host/edit-home/:id — save edits and redirect to manage list
exports.postEditHome = async (req, res) => {
    try {
        const id = req.params.id;
        const { homeName, houseAddress, pricePerNight } = req.body;

        // Build update object — always update text fields
        const updateData = {
            homeName,
            location: houseAddress,
            pricePerNight: Number(pricePerNight)
        };

        // Only update photo if a new file was uploaded
        if (req.file) {
            // Fetch the current home to get the OLD photo path before overwriting
            const existingHome = await Home.findById(id);

            // Delete the old photo file from disk (if it exists in /uploads/)
            if (existingHome && existingHome.photo && existingHome.photo.startsWith('/uploads/')) {
                const oldFilePath = '.' + existingHome.photo;  // → ./uploads/filename.jpg
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.log('Could not delete old photo:', err.message);
                    else console.log('Deleted old photo:', oldFilePath);
                });
            }

            updateData.photo = '/uploads/' + req.file.filename;  // prefix for browser URL
            console.log('New photo uploaded:', req.file.filename);
        }
        // If no new file → photo field is NOT included → existing photo stays in DB

        // findByIdAndUpdate(id, update) — finds by _id and applies the update atomically
        await Home.findByIdAndUpdate(id, updateData);
        res.redirect('/host/edit-homes');
    } catch (err) {
        console.error('postEditHome error:', err);  // ← log real error to terminal
        res.status(500).send('Could not update home.');
    }
};


// POST /host/delete-home/:id — delete home and redirect to manage list
exports.deleteHome = async (req, res) => {
    try {
        // findByIdAndDelete(id) — deletes the document and returns it
        await Home.findByIdAndDelete(req.params.id);
        res.redirect('/host/edit-homes');
    } catch (err) {
        res.status(500).send('Could not delete home.');
    }
};

// GET /host/bookings — show ALL bookings with home details (admin view)
exports.getBookings = async (req, res) => {
    try {
        // .sort({ createdAt: -1 }) — newest bookings first
        const [bookings, homes] = await Promise.all([
            Booking.find().sort({ createdAt: -1 }),
            Home.find()
        ]);

        // Build a lookup map: { homeId: homeDoc }
        const homeMap = {};
        homes.forEach(h => { homeMap[h.id] = h; });

        // Attach home details to each booking (spread toObject to get a plain object)
        const enrichedBookings = bookings.map(b => ({
            ...b.toObject({ virtuals: true }),
            home: homeMap[b.homeId] || null
        }));

        res.render('host/bookings', {
            bookings: enrichedBookings,
            pageTitle: 'All Bookings',
            currentPage: 'bookings'
        });
    } catch (err) {
        res.status(500).send('Error loading bookings.');
    }
};

// GET /host/users — list all registered users (no passwords)
exports.getUsers = async (req, res) => {
    try {
        // .select('-password') — exclude the password field from query results
        const users = await User.find().select('-password');
        res.render('host/users', {
            users,
            pageTitle: 'Manage Users',
            currentPage: 'users'
        });
    } catch (err) {
        res.status(500).send('Error loading users.');
    }
};

// POST /host/ban-user/:id
exports.postBanUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isBanned: true });
        res.redirect('/host/users');
    } catch (err) {
        res.status(500).send('Could not ban user.');
    }
};

// POST /host/unban-user/:id
exports.postUnbanUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isBanned: false });
        res.redirect('/host/users');
    } catch (err) {
        res.status(500).send('Could not unban user.');
    }
};

// GET /host/pending-listings — show all homes awaiting admin approval
exports.getPendingListings = async (req, res) => {
    try {
        // Query directly for pending homes instead of fetching all and filtering in JS
        const homes = await Home.find({ status: 'pending' });
        res.render('host/pending-listings', {
            homes,
            pageTitle: 'Pending Approvals',
            currentPage: 'pending-listings'
        });
    } catch (err) {
        res.status(500).send('Error loading pending listings.');
    }
};

// POST /host/approve-home/:id
exports.postApproveListing = async (req, res) => {
    try {
        await Home.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.redirect('/host/pending-listings');
    } catch (err) {
        res.status(500).send('Could not approve listing.');
    }
};

// POST /host/reject-home/:id — marks as rejected (does NOT delete from DB)
exports.postRejectListing = async (req, res) => {
    try {
        await Home.findByIdAndUpdate(req.params.id, { status: 'rejected' });
        res.redirect('/host/pending-listings');
    } catch (err) {
        res.status(500).send('Could not reject listing.');
    }
};

// POST /host/cancel-booking/:id
exports.postCancelBooking = async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        res.redirect('/host/bookings');
    } catch (err) {
        res.status(500).send('Could not cancel booking.');
    }
};

// GET /host/reports — show all submitted reports
exports.getReports = async (req, res) => {
    try {
        // .sort({ createdAt: -1 }) — newest reports first
        const reports = await Report.find().sort({ createdAt: -1 });
        res.render('host/reports', {
            reports,
            pageTitle: 'Manage Reports',
            currentPage: 'reports'
        });
    } catch (err) {
        res.status(500).send('Error loading reports.');
    }
};

// POST /host/resolve-report/:id
exports.postResolveReport = async (req, res) => {
    try {
        await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
        res.redirect('/host/reports');
    } catch (err) {
        res.status(500).send('Could not resolve report.');
    }
};
