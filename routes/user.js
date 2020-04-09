const express = require('express');
const { validationResult } = require('express-validator');

const { validation } = require('../middlewares/validation');
const { authCheck } = require('../middlewares/auth');
const { errorHandler } = require('../common/error-handler');
const {
  createNewAccountWithEmail,
  changeParameterFutureURLs,
  getCreatedURLs,
  deleteAccount,
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
 * Delete account
 */
router.delete('/', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let deleteAccountQuery = await deleteAccount(currentUser.id);

  if (!deleteAccountQuery.rowCount) {
    return errorHandler('delete-account_account-not-found', 404, res, next);
  }

  req.session.destroy();

  res.sendStatus(200);
});

/*
 * Get settings for future urls
 */
router.get('/settings/future-urls', authCheck, (req, res, next) => {
  let currentUser = req.session.user;

  res.json({
    trackingNumberTransitions: currentUser.trackingNumberTransitions,
  });
});

/*
 * Change user settings for future urls
 */
router.post('/settings/future-urls', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let parameter = req.body;

  switch (parameter.name) {
    case 'trackingNumberTransitions':
      currentUser.trackingNumberTransitions = parameter.value;

      await changeParameterFutureURLs({
        name: parameter.name,
        value: Boolean(parameter.value),
        userId: currentUser.id,
      });
      break;

    default:
      break;
  }

  res.sendStatus(200);
});

/*
 * Get created URLs
 */

router.get('/created-urls', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let { startIndex, stopIndex } = req.query;

  let createdURLs = await getCreatedURLs({
    startIndex,
    stopIndex,
    userId: currentUser.id,
  });

  res.json(createdURLs.rows);
});

module.exports = router;
