const User = require('../models/user');
const bcrypt = require('bcryptjs');

// GET /auth/login
exports.getLogin = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', {
        pageTitle: 'Login',
        currentPage: '',
        error: req.session.loginError || null
    });
    delete req.session.loginError;
};

// POST /auth/login
exports.postLogin = async (req, res) => {
    try {
        const { email, password, isHost } = req.body;
        const hostFlag = isHost === 'true';

        // User.findOne() — find a user by their email address
        const user = await User.findOne({ email });
        if (!user) {
            req.session.loginError = 'Invalid email or password';
            return res.redirect('/auth/login');
        }

        // bcrypt.compare() — checks the plain password against the stored hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.session.loginError = 'Invalid email or password';
            return res.redirect('/auth/login');
        }

        if (user.isBanned) {
            req.session.loginError = 'Your account has been banned. Please contact administration.';
            return res.redirect('/auth/login');
        }

        // Upgrade database record to isHost: true if user logged in as host and isn't already a host
        if (hostFlag && !user.isHost) {
            user.isHost = true;
            await user.save();
        }

        // toObject({ virtuals: true }) — converts Mongoose doc to a plain JS object including virtuals (.id)
        // Destructure to strip the password field before saving to session
        const { password: _, ...safeUser } = user.toObject({ virtuals: true });
        
        // Override session isHost based on login-time selection
        safeUser.isHost = hostFlag;
        req.session.user = safeUser;

        // Redirect admin to manage page, hosts to list-home, guests to homepage
        if (user.role === 'admin') return res.redirect('/host/edit-homes');
        if (hostFlag) return res.redirect('/list-home');
        res.redirect('/');
    } catch (err) {
        req.session.loginError = 'Login failed. Please try again.';
        res.redirect('/auth/login');
    }
};

// GET /auth/register
exports.getRegister = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', {
        pageTitle: 'Register',
        currentPage: '',
        error: req.session.registerError || null
    });
    delete req.session.registerError;
};

// POST /auth/register — always creates 'user' role (admins are seeded manually)
exports.postRegister = async (req, res) => {
    try {
        const { name, email, password, isHost } = req.body;

        // Check if email is already taken
        const existing = await User.findOne({ email });
        if (existing) {
            req.session.registerError = 'Email already registered';
            return res.redirect('/auth/register');
        }

        // bcrypt.hash() — hashes the password with 12 salt rounds before storing
        const hash = await bcrypt.hash(password, 12);

        // isHost comes as string 'true'/'false' from the radio button
        const hostFlag = isHost === 'true';

        // User.create() — creates and saves the new user document in one step
        const user = await User.create({ name, email, password: hash, role: 'user', isHost: hostFlag, isBanned: false });

        const { password: _, ...safeUser } = user.toObject({ virtuals: true });
        req.session.user = safeUser;

        // Redirect hosts straight to list-home, guests to homepage
        if (hostFlag) return res.redirect('/list-home');
        res.redirect('/');
    } catch (err) {
        req.session.registerError = 'Registration failed. Please try again.';
        res.redirect('/auth/register');
    }
};

// POST /auth/logout
exports.logout = (req, res) => {
    // req.session.destroy() — clears the session from memory/store
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};
