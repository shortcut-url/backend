const bcrypt = require('bcryptjs');

const { dbQuery } = require('../db');

function createNewAccountWithEmail({ email, password, name }) {
  let hashPassword = bcrypt.hashSync(password, 10);

  return dbQuery(
    `
      INSERT INTO users(email, password, name) 
      VALUES 
        ($1, $2, $3)
          
    `,
    [email, hashPassword, name]
  );
}

module.exports = {
  createNewAccountWithEmail
};
