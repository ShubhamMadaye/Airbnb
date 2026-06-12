// isLoggedIn — user must be authenticated (any role)
exports.isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) return next();
    res.redirect('/auth/login');
};

// isAdmin — user must have role === 'admin'
exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') return next();
    // If logged in but not admin, show 403
    if (req.session && req.session.user) {
        return res.status(403).render('error403', { pageTitle: 'Access Denied', currentPage: '' });
    }
    res.redirect('/auth/login');
};

// isHost — user must have isHost: true OR be an admin
// Normal users who aren't logged in as host are redirected to login page with a message
exports.isHost = (req, res, next) => {
    const user = req.session && req.session.user;
    if (!user) return res.redirect('/auth/login');
    if (user.isHost === true || user.role === 'admin') return next();
    // Logged in as Guest but trying to access host features → redirect to login to switch to Host role
    req.session.loginError = 'Please log in as a Host to access this page.';
    res.redirect('/auth/login');
};
