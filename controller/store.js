const Home = require('../models/home');
const Favourite = require('../models/favourite');
const Rating = require('../models/rating');
const Booking = require('../models/booking');
const User = require('../models/user');
const Report = require('../models/report');

// Helper — build ratings lookup: { "homeId": stars }
const buildRatings = (docs) => {
    const map = {};
    docs.forEach(r => { map[r.homeId] = r.stars; });
    return map;
};

// Helper — build favs array of home id strings: ["id1", "id2", ...]
const buildFavs = (docs) => docs.map(f => f.homeId);

// GET / — home listing, passes ratings + favourites to each card
exports.gethomes = async (req, res) => {
    try {
        // Promise.all() — runs all 3 queries in parallel (faster than sequential nesting)
        const [homes, ratingDocs, favDocs] = await Promise.all([
            Home.find({ status: 'approved' }),  // only show approved listings
            Rating.find(),
            Favourite.find()
        ]);
        res.render('store/home-list', {
            homes,
            ratings: buildRatings(ratingDocs),  // { homeId: stars }
            favs: buildFavs(favDocs),         // [homeId, homeId, ...]
            pageTitle: 'AirBnB',
            currentPage: 'home'
        });
    } catch (err) {
        res.status(500).send('Error loading homes.');
    }
};

// GET /listings/:id — details page for one home
exports.gethomeDetails = async (req, res) => {
    try {
        const id = req.params.id;

        // Home.findById() — shorthand for findOne({ _id: id })
        const home = await Home.findById(id);
        if (!home) return res.status(404).render('error404', { pageTitle: 'Home Not Found', currentPage: '' });

        // Run isFav + rating queries in parallel
        const [favDoc, ratingDoc] = await Promise.all([
            Favourite.findOne({ homeId: id }),
            Rating.findOne({ homeId: id })
        ]);

        res.render('store/home-details', {
            home, id,
            isFav: !!favDoc,                       // convert null → false, document → true
            rating: ratingDoc ? ratingDoc.stars : 0, // 0 means not rated yet
            pageTitle: home.housename,
            currentPage: 'home',
            reported: req.query.reported === '1'
        });
    } catch (err) {
        res.status(500).send('Error loading home details.');
    }
};

// POST /listings/:id/favourite — toggle favourite, redirect back
exports.toggleFavourite = async (req, res) => {
    try {
        const id = req.params.id;
        // findOne() — check if this home is already in favourites
        const existing = await Favourite.findOne({ homeId: id });
        if (existing) {
            // deleteOne() — remove the favourite document
            await Favourite.deleteOne({ homeId: id });
        } else {
            // create() — add a new favourite document
            await Favourite.create({ homeId: id });
        }
        res.redirect('/listings/' + id);
    } catch (err) {
        res.redirect('/listings/' + req.params.id);
    }
};

// POST /listings/:id/rate — save star rating, redirect back
exports.rateHome = async (req, res) => {
    try {
        const id = req.params.id;
        const stars = Number(req.body.stars);
        // findOneAndUpdate with upsert:true — inserts if not found, updates if found
        await Rating.findOneAndUpdate(
            { homeId: id },
            { homeId: id, stars },
            { upsert: true, new: true }
        );
        res.redirect('/listings/' + id);
    } catch (err) {
        res.redirect('/listings/' + req.params.id);
    }
};

// GET /favourites — show all favourited homes
exports.getFavourites = async (req, res) => {
    try {
        const [favDocs, allHomes, ratingDocs] = await Promise.all([
            Favourite.find(),
            Home.find(),
            Rating.find()
        ]);

        const favIds = buildFavs(favDocs);

        // Build a lookup map: { homeId: homeObj }
        const homeMap = {};
        allHomes.forEach(h => { homeMap[h.id] = h; });

        // Build array of { home, id } for only favourited homes
        const favourites = favIds.map(id => ({
            home: homeMap[id],
            id
        })).filter(item => item.home); // skip if home was deleted

        res.render('store/favourate-list', {
            favourites,
            ratings: buildRatings(ratingDocs),
            pageTitle: 'My Favourites',
            currentPage: 'favourites'
        });
    } catch (err) {
        res.status(500).send('Error loading favourites.');
    }
};

// GET /book/:id — show the booking form for a specific home
exports.getBookForm = async (req, res) => {
    try {
        const id = req.params.id;
        const home = await Home.findById(id);
        if (!home) return res.status(404).render('error404', { pageTitle: 'Home Not Found', currentPage: '' });

        res.render('store/booking', {
            home, id,
            pageTitle: 'Book ' + home.housename,
            currentPage: 'home',
            error: req.session.bookingError || null
        });
        delete req.session.bookingError;
    } catch (err) {
        res.status(500).send('Error loading booking form.');
    }
};

// POST /book/:id — save the booking
exports.postBook = async (req, res) => {
    try {
        const homeId = req.params.id;
        const { checkIn, checkOut } = req.body;
        const user = req.session.user;

        // Basic date validation
        if (!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)) {
            req.session.bookingError = 'Check-out must be after check-in.';
            return res.redirect('/book/' + homeId);
        }

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).render('error404', { pageTitle: 'Home Not Found', currentPage: '' });

        // Guard: prevent owners from booking their own listing
        if (home.ownerId && String(home.ownerId) === String(user.id)) {
            req.session.bookingError = 'You cannot book your own listing.';
            return res.redirect('/book/' + homeId);
        }

        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        const totalCost = nights * Number(home.pricePerNight);

        // Booking.create() — saves a new booking document in one step
        await Booking.create({
            homeId,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            homeName: home.housename,
            homeLocation: home.location,
            checkIn,
            checkOut,
            nights,
            totalCost,
            status: 'active',
            createdAt: new Date()
        });
        res.redirect('/bookings');
    } catch (err) {
        res.status(500).send('Could not save booking.');
    }
};

// GET /bookings — show logged-in user's bookings
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.session.user.id;
        // .sort({ createdAt: -1 }) — newest bookings first
        const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
        res.render('store/my-bookings', {
            bookings,
            pageTitle: 'My Bookings',
            currentPage: 'bookings'
        });
    } catch (err) {
        res.status(500).send('Error loading bookings.');
    }
};

// GET /list-home — show the form for a user to list their home
exports.getListHome = (req, res) => {
    res.render('store/list-home', {
        pageTitle: 'List Your Home',
        currentPage: 'list-home',
        error: req.session.listingError || null
    });
    delete req.session.listingError;
};

// POST /list-home — save the new user-submitted listing
exports.postListHome = async (req, res) => {
    try {
        const { homeName, houseAddress, pricePerNight } = req.body;
        // req.file is set by multer — prefix with /uploads/ so browser can resolve the URL
        const photo = req.file ? '/uploads/' + req.file.filename : '';
        const user = req.session.user;

        if (!homeName || !houseAddress || !pricePerNight) {
            req.session.listingError = 'Please fill in all required fields.';
            return res.redirect('/list-home');
        }

        // Home.create() — saves the listing; user-submitted homes start as 'pending'
        await Home.create({
            homeName,
            location: houseAddress,
            pricePerNight: Number(pricePerNight),
            photo,
            ownerId: user.id,
            ownerName: user.name,
            status: 'pending'  // needs admin approval before appearing on homepage
        });
        res.redirect('/my-listings?success=1');
    } catch (err) {
        req.session.listingError = 'Could not save listing. Please try again.';
        res.redirect('/list-home');
    }
};

// GET /my-listings — show all homes listed by the logged-in user
exports.getMyListings = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Run both queries in parallel
        const [ownedHomes, allBookings] = await Promise.all([
            Home.find({ ownerId: userId }),
            Booking.find()
        ]);

        // Count bookings per homeId
        const bookingCounts = {};
        allBookings.forEach(b => {
            bookingCounts[b.homeId] = (bookingCounts[b.homeId] || 0) + 1;
        });

        // EJS template expects [{ home, index }]
        const listings = ownedHomes.map(home => ({ home, index: home.id }));

        res.render('store/my-listings', {
            listings,
            bookingCounts,
            pageTitle: 'My Listings',
            currentPage: 'my-listings',
            success: req.query.success === '1'
        });
    } catch (err) {
        res.status(500).send('Error loading listings.');
    }
};



// GET /report/:homeId — show the report form
exports.getReportForm = async (req, res) => {
    try {
        const homeId = req.params.homeId;
        const home = await Home.findById(homeId);
        if (!home) return res.status(404).render('error404', { pageTitle: 'Home Not Found', currentPage: '' });
        res.render('store/report-home', {
            home, homeId,
            pageTitle: 'Report ' + home.housename,
            currentPage: 'home'
        });
    } catch (err) {
        res.status(500).send('Error loading report form.');
    }
};

// POST /report/:homeId — submit report
exports.postReport = async (req, res) => {
    try {
        const homeId = req.params.homeId;
        const { reason, details } = req.body;
        const user = req.session.user;

        const home = await Home.findById(homeId);
        if (!home) return res.status(404).render('error404', { pageTitle: 'Home Not Found', currentPage: '' });

        // Report.create() — saves the report document in one step
        await Report.create({
            userId: user.id,
            userName: user.name,
            homeId,
            homeName: home.housename,
            reason,
            details,
            status: 'open',
            createdAt: new Date()
        });
        res.redirect('/listings/' + homeId + '?reported=1');
    } catch (err) {
        res.status(500).send('Could not submit report.');
    }
};
