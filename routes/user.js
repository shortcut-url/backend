const express = require('express');
const { validationResult } = require('express-validator');

const { validation } = require('../middlewares/validation');
const { errorHandler } = require('../common/error-handler');
const {
  createNewAccountWithEmail,
  changeParameterFutureURLs
} = require('../models/user');

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

/*
 * Get settings for future urls
 */
router.get('/settings/future-urls', (req, res, next) => {
  let userSession = req.session.user;

  if (!userSession) throw errorHandler('session_not-found', 404, res, next);

  res.json({
    trackingNumberTransitions: userSession.trackingNumberTransitions
  });
});

/*
 * Change user settings for future urls
 */
router.post('/settings/future-urls', async (req, res, next) => {
  let userSession = req.session.user;

  if (!userSession) throw errorHandler('session_not-found', 404, res, next);

  let parameter = req.body;

  switch (parameter.name) {
    case 'trackingNumberTransitions':
      userSession.trackingNumberTransitions = parameter.value;

      await changeParameterFutureURLs({
        name: 'tracking_number_transitions',
        value: Boolean(parameter.value),
        userId: userSession.id
      });
      break;

    default:
      break;
  }

  res.sendStatus(200);
});

module.exports = router;
