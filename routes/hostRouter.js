const express = require('express');

const hostRouter = express.Router();
const { 
    getaddHome, 
    postaddHome, 
    getBookings, 
    getEditHomeList, 
    getEditHome, 
    postEditHome, 
    deleteHome,
    getUsers,
    postBanUser,
    postUnbanUser,
    getPendingListings,
    postApproveListing,
    postRejectListing,
    postCancelBooking,
    getReports,
    postResolveReport
} = require('../controller/host');
const { isAdmin } = require('../utils/authMiddleware');

// GET  /host/add-home  → show the add-home form
hostRouter.get('/add-home', isAdmin, getaddHome);

// POST /host/add-home → process the submitted form data
hostRouter.post('/add-home', isAdmin, postaddHome);

// GET  /host/edit-homes → show all listings with edit/delete buttons
hostRouter.get('/edit-homes', isAdmin, getEditHomeList);

// GET  /host/edit-home/:id → show pre-filled edit form
hostRouter.get('/edit-home/:id', isAdmin, getEditHome);

// POST /host/edit-home/:id → save edits
hostRouter.post('/edit-home/:id', isAdmin, postEditHome);

// POST /host/delete-home/:id → delete a listing
hostRouter.post('/delete-home/:id', isAdmin, deleteHome);

// GET /host/bookings → show all bookings (admin view)
hostRouter.get('/bookings', isAdmin, getBookings);

// GET /host/users → show all users
hostRouter.get('/users', isAdmin, getUsers);

// POST /host/ban-user/:id → ban user
hostRouter.post('/ban-user/:id', isAdmin, postBanUser);

// POST /host/unban-user/:id → unban user
hostRouter.post('/unban-user/:id', isAdmin, postUnbanUser);

// GET /host/pending-listings → show pending approvals
hostRouter.get('/pending-listings', isAdmin, getPendingListings);

// POST /host/approve-home/:id → approve home listing
hostRouter.post('/approve-home/:id', isAdmin, postApproveListing);

// POST /host/reject-home/:id → reject home listing
hostRouter.post('/reject-home/:id', isAdmin, postRejectListing);

// POST /host/cancel-booking/:id → cancel a booking
hostRouter.post('/cancel-booking/:id', isAdmin, postCancelBooking);

// GET /host/reports → view all user reports
hostRouter.get('/reports', isAdmin, getReports);

// POST /host/resolve-report/:id → resolve report
hostRouter.post('/resolve-report/:id', isAdmin, postResolveReport);

module.exports = { hostRouter };