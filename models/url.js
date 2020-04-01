const { nanoid } = require('nanoid');

const { dbQuery } = require('../db');

function createShortURL({
  originalURL,
  userId = null,
  shortURL = null,
  trackingNumberTransitions = false
}) {
  if (!shortURL) {
    shortURL = nanoid(6);
  }

  return dbQuery(
    `
      INSERT INTO urls(
        "originalURL", "userId", "url", "trackingNumberTransitions"
      ) 
      VALUES 
        ($1, $2, $3, $4) RETURNING url
    `,
    [originalURL, userId, shortURL, trackingNumberTransitions]
  );
}

function getURLData({ URL, userId }) {
  return dbQuery(
    `
      SELECT 
        "url", 
        "originalURL", 
        "userId", 
        "trackingNumberTransitions", 
        "numberTransitions", 
        "disabled", 
        "createdAt", 
        "updatedAt" 
      FROM 
        urls 
      WHERE 
        "url" = $1 
        AND "userId" = $2  
    `,
    [URL, userId]
  );
}

function changeParameterURL({ URL, name, value, userId }) {
  return dbQuery(
    `
      UPDATE 
        urls 
      SET 
        "${name}" = ${value} 
      WHERE 
        "url" = '${URL}' 
        AND "userId" = '${userId}' RETURNING *
    `
  );
}

function deleteURL({ URL, userId }) {
  return dbQuery(
    `
      DELETE FROM 
        urls 
      WHERE 
        "url" = $1 
        AND "userId" = $2
    `,
    [URL, userId]
  );
}

module.exports = {
  createShortURL,
  getURLData,
  changeParameterURL,
  deleteURL
};
