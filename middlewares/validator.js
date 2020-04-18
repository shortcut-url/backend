const { body, query, param } = require('express-validator');

function validator(method) {
  switch (method) {
    case 'user_create-account':
      return [
        body('email').isEmail().withMessage('create-account_not-email'),
        body('password')
          .isLength({ min: 6, max: 64 })
          .withMessage('create-account_incorrect-password-length'),
        body('name')
          .isLength({ min: 3, max: 64 })
          .withMessage('create-account_incorrect-name-length'),
      ];

    case 'url_create-short-url':
      return [
        body('originalURL')
          .matches(/.\../)
          .withMessage('create-short-url_not-url'),
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

    default:
      break;
  }
}

module.exports = {
  validator,
};
