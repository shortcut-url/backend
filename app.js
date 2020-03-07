require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(_, res, next) {
  res.header(
    'Access-Control-Allow-Origin',
    isDevelopment ? 'http://localhost:3000' : process.env.SITE_URL
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

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
