const express = require('express');
const { validationResult } = require('express-validator');

const { validation } = require('../middlewares/validation');
const { errorHandler } = require('../common/error-handler');
const { createNewAccountWithEmail } = require('../models/user');

const router = express.Router();

/*
 * Create an account
 */
router.post('/', validation('user_create-account'), async (req, res, next) => {
  let validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    errorHandler(validationErrors.errors, 400, res, next);
  }

  let { email, password, name } = req.body;

  try {
    await createNewAccountWithEmail({ email, password, name });

    res.sendStatus(200);
  } catch ({ code, constraint }) {
    if (code !== '23505') return;

    if (constraint === 'users_email_key') {
      errorHandler('create-account_not-unique-email', 400, res, next);
    }
  }
});

module.exports = router;
