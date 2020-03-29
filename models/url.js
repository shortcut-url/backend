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
        original_url, user_id, url, tracking_number_transitions
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
