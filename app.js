const express = require('express');
const path = require('path');
const multer = require("multer");
const userRouter = require('./routes/userRouter');
const { hostRouter } = require('./routes/hostRouter');
const authRouter = require('./routes/authRouter');
const { pageNotFound } = require('./controller/error');
const session = require('express-session');
const { default: mongoose } = require('mongoose');

const app = express();
const PORT = 3000;

// Tell Express to use EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Session setup
app.use(session({
    secret: 'super-secret-airbnb-key-replace-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Locals middleware — makes user available in all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Logger middleware
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});
const randomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, randomString(10) + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    console.log('File MIME type received:', file.mimetype);  // ← debug: see what's coming in
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg')
        cb(null, true);
    else
        cb(null, false);
}

const multerOptions = {
    storage, fileFilter
};
// Serve static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // ← serve uploaded images
app.use(multer(multerOptions).single("photo"));

// Mount routers at their prefixes
app.use('/', userRouter);
app.use('/auth', authRouter);
app.use('/host', hostRouter);

// Catch-all 404
app.use(pageNotFound);

// mongoose connection 

const db_Path = "your_Mongodb_Url";

//.then() n .catch() approach to promise chaining bhi bolte hai
//fetchAll fuction ko fetchAll se replace kiya hai mongoose keliye specially
mongoose.connect(db_Path).then(() => {
    console.log('✅ Mongoose connected successfully.');
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("errror while connnecting to mongoose : ", err);
});
