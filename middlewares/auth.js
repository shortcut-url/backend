const createError = require('http-errors');

function authCheck(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  return next(createError(401, res.__('session_not-found')));
}

module.exports = { authCheck };
