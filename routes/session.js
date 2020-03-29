const express = require('express');
const { validationResult } = require('express-validator');

const { errorHandler } = require('../common/error-handler');
const { GetUserUsingEmail, isValidPassword } = require('../models/user');

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

/*
 * Create a session
 */
router.post('/', async (req, res, next) => {
  let validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    errorHandler(validationErrors.errors, 400, res, next);
  }

  let { email, password } = req.body;

  try {
    let getUserQuery = await GetUserUsingEmail({ email, password });

    if (!getUserQuery.rows.length) throw 'create-session_user-not-found';

    let foundUser = getUserQuery.rows[0];

    if (!isValidPassword(password, foundUser.password)) {
      throw 'create-session_incorrect-password';
    }

    req.session.user = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name
    };

    res.sendStatus(200);
  } catch (error) {
    errorHandler(error, 404, res, next);
  }
});

module.exports = router;
