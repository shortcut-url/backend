const { body } = require('express-validator');

function validation(method) {
  switch (method) {
    case 'user_create-account':
      return [
        body('email')
          .isEmail()
          .withMessage('create-account_not-email'),
        body('password')
          .isLength({ min: 6, max: 64 })
          .withMessage('create-account_incorrect-password-length'),
        body('name')
          .isLength({ min: 3, max: 64 })
          .withMessage('create-account_incorrect-name-length')
      ];
    case 'url_create-short-url':
      return [
        body('originalURL')
          .matches(/.\../)
          .withMessage('create-short-url_not-url')
      ];

    default:
      break;
  }
}

module.exports = {
  validation
};
