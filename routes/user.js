const express = require('express');
const { validationResult } = require('express-validator');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid');
const sharp = require('sharp');

const { validation } = require('../middlewares/validation');
const { authCheck } = require('../middlewares/auth');
const { errorHandler } = require('../common/error-handler');
const { createOrReturnDirectory } = require('../common/fs');
const {
  createNewAccountWithEmail,
  changeParameterFutureURLs,
  getCreatedURLs,
  deleteAccount,
  saveAvatar,
  deleteAvatar,
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
  } catch ({ code, constraint }) {
    if (code !== '23505') return;

    if (constraint === 'users_email_key') {
      res.status(403).send(res.__('create-account_not-unique-email'));
    }
  }

  res.sendStatus(200);
});

/*
 * Delete account
 */
router.delete('/', authCheck, async (req, res, next) => {
  let currentUser = req.session.user;

  let deleteAccountQuery = await deleteAccount(currentUser.id);

  if (!deleteAccountQuery.rowCount) {
    res.status(404).send(res.__('delete-account_account-not-found'));
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

  let { rows: createdURLs } = await getCreatedURLs({
    startIndex,
    stopIndex,
    userId: currentUser.id,
  });

  res.json(createdURLs);
});

/*
 * Upload avatar
 */
let diskStoringUserAvatar = multer.diskStorage({
  destination: function (req, file, cb) {
    let sessionUserId = req.session.user.id;

    let dir = `uploads/users/${sessionUserId}`;

    return cb(null, createOrReturnDirectory(dir));
  },
  filename: function (req, file, cb) {
    cb(null, nanoid(5));
  },
});

let uploadUserAvatar = multer({
  storage: diskStoringUserAvatar,
});

router.post(
  '/avatar',
  authCheck,
  uploadUserAvatar.single('image'),
  async (req, res) => {
    let uploadedAvatarName = req.file.filename;

    if (!uploadedAvatarName) {
      return res.status(400).send(res.__('upload-avatar_not-created'));
    }

    let sessionUserId = req.session.user.id;

    await saveAvatar({
      srcAvatar: uploadedAvatarName,
      userId: sessionUserId,
    });

    req.session.user.srcAvatar = uploadedAvatarName;

    res.send(`/api/user/avatar/${uploadedAvatarName}`);
  }
);

/*
 * Get avatar
 */
router.get(
  '/avatar/:avatarId',
  authCheck,
  validation('user_get-avatar'),
  async (req, res, next) => {
    let validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      errorHandler(validationErrors.errors, 400, res, next);
    }

    let sessionUserId = req.session.user.id;

    let { avatarId } = req.params;
    let { format = 'jpg' } = req.query;

    let findAvatar = fs.readFileSync(
      `uploads/users/${sessionUserId}/${avatarId}`
    );

    let bufferAvatarFormatting = await sharp(findAvatar)
      .resize(100, 100)
      .toFormat(format)
      .toBuffer();

    res.end(bufferAvatarFormatting, 'binary');
  }
);

/*
 * Delete avatar
 */

router.delete('/avatar', authCheck, async (req, res, next) => {
  let sessionUserId = req.session.user.id;

  await deleteAvatar(sessionUserId);

  delete req.session.user.srcAvatar;

  res.sendStatus(200);
});

module.exports = router;
