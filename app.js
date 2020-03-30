require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const i18n = require('i18n');
const session = require('express-session');
const pgSession = require('connect-pg-simple');

const { pool } = require('./db');

const app = express();

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/*
 * Internationalization
 */

app.use(i18n.init);

i18n.configure({
  locales: ['en', 'ru'],
  cookie: 'language',
  directory: __dirname + '/locales',
  defaultLocale: 'en'
});

/*
 * Session
 */

const sessionStore = pgSession(session);

app.use(
  session({
    secret: process.env.USER_SESSIONS_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: true,
      maxAge: 31104000000, // 1 year
      secure: false
    },
    store: new sessionStore({
      pool: pool,
      tableName: process.env.USER_SESSIONS_NAME
    })
  })
);

/*
 * Routers
 */

app.use(require('./routes'));

/*
 * Catch 404 and forward to error handler
 */

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.json({ errors: { message: err.message } });
});

module.exports = app;
