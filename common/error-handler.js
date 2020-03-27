function errorHandler(errorModel, statusCode, res, next) {
  res.status(statusCode);

  /*
   * express-validator
   */
  if (typeof errorModel === 'object') {
    let errors = {};

    errorModel.forEach(error => {
      errors[error.param] = res.__(error.msg);
    });

    return res.send({ errors });
  }

  if (typeof errorModel === 'string') {
    return res.send(res.__(errorModel));
  }
}

module.exports = { errorHandler };
