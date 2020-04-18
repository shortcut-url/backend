const express = require('express');
const { validationResult } = require('express-validator');

const { validator } = require('../middlewares/validator');
const { authCheck } = require('../middlewares/auth');
const { errorHandler } = require('../common/error-handler');
const {
  createShortURL,
  getURLData,
  changeParameterURL,
  deleteURL,
} = require('../models/url');

const router = express.Router();

/*
 * Create short url
 */
router.post('/', validator('url_create-short-url'), async (req, res, next) => {
  let validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return errorHandler(validationErrors.errors, 400, res, next);
  }

  let currentUser = req.session.user;

  let { originalURL } = req.body;

  let {
    rows: [shortURL],
  } = await createShortURL({
    originalURL,
    userId: currentUser ? currentUser.id : null,
    trackingNumberTransitions: currentUser
      ? currentUser.trackingNumberTransitions
      : false,
  });

  res.send(shortURL.url);
});

/*
 * Get created URL
 */
router.get('/:URL', authCheck, async (req, res) => {
  let currentUser = req.session.user;

  let { URL } = req.params;

  let {
    rows: [createdURL],
  } = await getURLData({ URL, userId: currentUser.id });

  if (!createdURL) {
    return res.status(404).send(res.__('get-created-url_url-not_found'));
  }

  let {
    trackingNumberTransitions,
    numberTransitions,
    disabled,
    ...restDataURL
  } = createdURL;

  res.json({
    settings: { trackingNumberTransitions, disabled },
    statistics: { numberTransitions },
    ...restDataURL,
  });
});

/*
 * Change URL parameter
 */
router.post('/:URL/parameter', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let { URL } = req.params;

  let { name, value } = req.body;

  let changeParameterURLQuery;

  switch (name) {
    case 'disabled':
    case 'trackingNumberTransitions':
      changeParameterURLQuery = await changeParameterURL({
        URL,
        name,
        value: Boolean(value),
        userId: currentUser.id,
      });
      break;

    default:
      break;
  }

  if (!changeParameterURLQuery || !changeParameterURLQuery.rows[0]) {
    return res
      .status(404)
      .send(res.__('change-user-url-parameter_url-not-found'));
  }

  res.sendStatus(200);
});

/*
 * Delete URL
 */
router.delete('/:URL', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let { URL } = req.params;

  let deleteURLQuery = await deleteURL({ URL, userId: currentUser.id });

  if (!deleteURLQuery.rowCount) {
    return errorHandler('delete-url_url-not-found', 404, res, next);
  }

  res.sendStatus(200);
});

module.exports = router;
