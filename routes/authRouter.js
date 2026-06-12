const express = require('express');
const authRouter = express.Router();
const { getLogin, postLogin, getRegister, postRegister, logout } = require('../controller/auth');

authRouter.get('/login', getLogin);
authRouter.post('/login', postLogin);
authRouter.get('/register', getRegister);
authRouter.post('/register', postRegister);
authRouter.post('/logout', logout);

module.exports = authRouter;
