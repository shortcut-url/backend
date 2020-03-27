const { Pool } = require('pg');

const databaseConfig = {
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD
};

const pool = new Pool(databaseConfig);

module.exports = {
  pool
};
