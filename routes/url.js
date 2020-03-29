const express = require('express');
const { validationResult } = require('express-validator');

const { validation } = require('../middlewares/validation');
const { errorHandler } = require('../common/error-handler');
const { createShortURL } = require('../models/url');

const router = express.Router();

/*
 * Create short url
 */
router.post('/', validation('url_create-short-url'), async (req, res, next) => {
  let validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    errorHandler(validationErrors.errors, 400, res, next);
  }

  let currentUser = req.session.user;

  let { originalURL } = req.body;

  let createdShortURL = await createShortURL({
    originalURL,
    userId: currentUser ? currentUser.id : null,
    trackingNumberTransitions: currentUser
      ? currentUser.trackingNumberTransitions
      : false
  });

  res.send(createdShortURL.rows[0].url);
});

module.exports = router;
