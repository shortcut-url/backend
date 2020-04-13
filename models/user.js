const bcrypt = require('bcryptjs');

const { dbQuery } = require('../db');

function createNewAccountWithEmail({ email, password, name }) {
  let hashPassword = bcrypt.hashSync(password, 10);

  return dbQuery(
    `
      INSERT INTO users("email", "password", "name") 
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
      SELECT 
        "id", 
        "email", 
        "password", 
        "name", 
        "trackingNumberTransitions",
        "srcAvatar"
      FROM 
        users 
      WHERE 
        email = $1 
        AND "deleted" = false
    `,
    [email]
  );
}

function changeParameterFutureURLs({ name, value, userId }) {
  return dbQuery(
    `
      UPDATE 
        users 
      SET 
        "${name}" = ${value} 
      WHERE 
        id = ${userId}
    `
  );
}

function getCreatedURLs({ userId, startIndex, stopIndex }) {
  let limit = +stopIndex - +startIndex;

  return dbQuery(
    `
      SELECT 
        "originalURL", 
        "url", 
        "trackingNumberTransitions", 
        "createdAt", 
        "updatedAt"
      FROM 
        urls 
      WHERE 
        "userId" = $1 
      ORDER BY 
        "createdAt" DESC 
      LIMIT 
        $2 OFFSET $3
    `,
    [userId, limit, +startIndex]
  );
}

function deleteAccount(userId) {
  return dbQuery(
    `
      UPDATE
        users
      SET
        "deleted" = true
      WHERE
        "id" = $1
        AND "deleted" = false
    `,
    [userId]
  );
}

function saveAvatar({ srcAvatar, userId }) {
  return dbQuery(
    `
      UPDATE
        users
      SET
        "srcAvatar" = $1
      WHERE
        "id" = $2
    `,
    [srcAvatar, userId]
  );
}

function deleteAvatar(userId) {
  return dbQuery(
    `
      UPDATE
        users
      SET
        "srcAvatar" = null
      WHERE
        "id" = $1
    `,
    [userId]
  );
}

module.exports = {
  createNewAccountWithEmail,
  GetUserUsingEmail,
  isValidPassword,
  changeParameterFutureURLs,
  getCreatedURLs,
  deleteAccount,
  saveAvatar,
  deleteAvatar,
};
