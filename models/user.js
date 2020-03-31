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

function isValidPassword(firstPassword, secondPassword) {
  return bcrypt.compareSync(firstPassword, secondPassword);
}

async function GetUserUsingEmail({ email }) {
  return dbQuery(
    `
      SELECT id, email, password, name, tracking_number_transitions
      FROM users
      WHERE email = $1
    `,
    [email]
  );
}

module.exports = {
  createNewAccountWithEmail,
  GetUserUsingEmail,
  isValidPassword
};
