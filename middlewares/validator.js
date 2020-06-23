const { body, query, param } = require('express-validator');

function validator(method) {
  switch (method) {
    case 'user_create-account':
      return [
        body('email')
          .normalizeEmail()
          .isEmail()
          .withMessage('create-account_not-email'),
        body('password')
          .isLength({ min: 6, max: 64 })
          .withMessage('create-account_incorrect-password-length'),
        body('name')
          .isLength({ min: 3, max: 64 })
          .withMessage('create-account_incorrect-name-length'),
      ];

    case 'user_get-avatar':
      return [
        param('avatarId')
          .isLength({ min: 3, max: 5 })
          .withMessage('get-avatar_incorrect-avatar-id-length'),
        query('format')
          .if((value) => !!value)
          .isIn(['jpg', 'webp'])
          .withMessage('get-avatar_incorrect-format'),
      ];

    case 'user-change-settings-future-urls':
      return [
        body('name')
          .isIn(['disabled', 'trackingNumberTransitions'])
          .withMessage('change-settings-future-urls_incorrect-name'),
      ];

    case 'user_get-created-urls':
      return [
        query('startIndex')
          .isNumeric()
          .withMessage('get-created-urls_incorrect-start-index'),
        query('stopIndex')
          .isNumeric()
          .withMessage('get-created-urls_incorrect-stop-index'),
      ];

    case 'url_create-short-url':
      return [
        body('originalURL')
          .matches(/.\../)
          .withMessage('create-short-url_not-url'),
      ];

    case 'url_change-url-parameter':
      return [
        body('name')
          .isIn(['disabled', 'trackingNumberTransitions'])
          .withMessage('change-url-parameter_incorrect-name'),
      ];

    case 'session_create-session':
      return [
        body('email')
          .normalizeEmail()
          .isEmail()
          .withMessage('create-session_not-email'),
        body('password')
          .isLength({ min: 6, max: 64 })
          .withMessage('create-session_incorrect-password-length'),
      ];

    default:
      break;
  }
}

module.exports = {
  validator,
};
