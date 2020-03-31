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

module.exports = {
  createShortURL
};
