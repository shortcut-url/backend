const express = require('express');

const { errorHandler } = require('../common/error-handler');

const router = express.Router();

/*
 * Get a session
 */
router.get('/', async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return errorHandler('session_not-found', 404, res, next);
  }

  let { name } = req.session.user;

  res.json({ name });
});

module.exports = router;
