const { pool } = require('./pool');

function dbQuery(queryText, params) {
  return new Promise((resolve, reject) => {
    pool
      .query(queryText, params)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = { dbQuery };
