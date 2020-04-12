const express = require('express');
const { validationResult } = require('express-validator');

const { authCheck } = require('../middlewares/auth');
const { errorHandler } = require('../common/error-handler');
const { GetUserUsingEmail, isValidPassword } = require('../models/user');

const router = express.Router();

/*
 * Get a session
 */
router.get('/', authCheck, async (req, res, next) => {
  let { name, srcAvatar } = req.session.user;

  res.json({ name, srcAvatar: `/api/user/avatar/${srcAvatar}` });
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
    let {
      rows: [userData],
    } = await GetUserUsingEmail({ email, password });

    if (!userData) throw 'create-session_user-not-found';

    if (!isValidPassword(password, userData.password)) {
      throw 'create-session_incorrect-password';
    }

    req.session.user = userData;

    res.sendStatus(200);
  } catch (error) {
    errorHandler(error, 404, res, next);
  }
});

/*
 * Destroy session
 */
router.delete('/', authCheck, async (req, res, next) => {
  await req.session.destroy();

  res.sendStatus(200);
});

module.exports = router;
