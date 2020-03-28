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

    default:
      break;
  }
}

module.exports = {
  validation
};
