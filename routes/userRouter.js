const express = require('express');

const userRouter = express.Router();
const { gethomes, gethomeDetails, toggleFavourite, rateHome, getFavourites,
        getBookForm, postBook, getMyBookings,
        getListHome, postListHome, getMyListings,
        getReportForm, postReport } = require('../controller/store');
const { isLoggedIn, isHost } = require('../utils/authMiddleware');

// GET / → show all listed homes
userRouter.get('/', gethomes);

// GET /listings/:id → detail page for a specific home
userRouter.get('/listings/:id', gethomeDetails);

// POST /listings/:id/favourite → toggle favourite (add/remove) - requires login
userRouter.post('/listings/:id/favourite', isLoggedIn, toggleFavourite);

// POST /listings/:id/rate → submit star rating - requires login
userRouter.post('/listings/:id/rate', isLoggedIn, rateHome);

// GET /favourites → show all favourited homes - requires login
userRouter.get('/favourites', isLoggedIn, getFavourites);

// GET /book/:id → show booking form - requires login
userRouter.get('/book/:id', isLoggedIn, getBookForm);

// POST /book/:id → submit booking - requires login
userRouter.post('/book/:id', isLoggedIn, postBook);

// GET /bookings → show the logged-in user's booking history - requires login
userRouter.get('/bookings', isLoggedIn, getMyBookings);

// GET /list-home → listing form — requires HOST privileges
userRouter.get('/list-home', isHost, getListHome);

// POST /list-home → submit a new listing — requires HOST privileges
userRouter.post('/list-home', isHost, postListHome);

// GET /my-listings → show homes the logged-in user has listed — requires HOST privileges
userRouter.get('/my-listings', isHost, getMyListings);

// GET /report/:homeId → show report form - requires login
userRouter.get('/report/:homeId', isLoggedIn, getReportForm);

// POST /report/:homeId → process report submission - requires login
userRouter.post('/report/:homeId', isLoggedIn, postReport);

module.exports = userRouter;
