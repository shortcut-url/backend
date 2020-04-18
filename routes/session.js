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

  res.json({
    name,
    srcAvatar: srcAvatar ? `/api/user/avatar/${srcAvatar}` : null,
  });
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

  let {
    rows: [user],
  } = await GetUserUsingEmail({ email, password });

  if (!user) {
    res.status(404).send(res.__('create-session_user-not-found'));
  }

  if (!isValidPassword(password, user.password)) {
    res.status(403).send(res.__('create-session_incorrect-password'));
  }

  req.session.user = user;

  res.sendStatus(200);
});

/*
 * Destroy session
 */
router.delete('/', authCheck, async (req, res, next) => {
  await req.session.destroy();

  res.sendStatus(200);
});

module.exports = router;
