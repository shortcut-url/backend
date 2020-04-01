const express = require('express');
const { validationResult } = require('express-validator');

const { validation } = require('../middlewares/validation');
const { authCheck } = require('../middlewares/auth');
const { errorHandler } = require('../common/error-handler');
const {
  createShortURL,
  getURLData,
  changeParameterURL
} = require('../models/url');

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

/*
 * Get created URL data
 */

router.get('/:URL', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let { URL } = req.params;

  let {
    rows: [URLData]
  } = await getURLData({ URL, userId: currentUser.id });

  if (!URLData) errorHandler('get-created-url_url-not_found', 404, res, next);

  let {
    trackingNumberTransitions,
    numberTransitions,
    disabled,
    ...restDataURL
  } = URLData;

  res.json({
    settings: { trackingNumberTransitions, disabled },
    statistics: { numberTransitions },
    ...restDataURL
  });
});

/*
 * Change URL parameter
 */

router.post('/:URL/parameter', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let { URL } = req.params;

  let { name, value } = req.body;

  let query;

  switch (name) {
    case 'disabled':
    case 'trackingNumberTransitions':
      query = await changeParameterURL({
        URL,
        name,
        value: Boolean(value),
        userId: currentUser.id
      });
      break;

    default:
      break;
  }

  if (!query || !query.rows[0]) {
    return errorHandler(
      'change-user-url-parameter_url-not-found',
      404,
      res,
      next
    );
  }

  res.sendStatus(200);
});

module.exports = router;
