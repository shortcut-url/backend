const fs = require('fs');

function createOrReturnDirectory(dir) {
  let isDirectoryExists = fs.existsSync(dir);

  if (isDirectoryExists) return dir;

  fs.mkdirSync(dir, { recursive: true });

  return dir;
}

module.exports = { createOrReturnDirectory };
