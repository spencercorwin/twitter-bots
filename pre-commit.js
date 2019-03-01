const fs = require('fs');
const path = require('path');

const filename = path.join(__dirname, '.gitignore');
fs.readFile(filename, 'utf8', (err, data) => {
  if (err) {
    throw err;
  };
  if (!/.env/.test(data)) {
    throw ".gitignore should include .env before committing";
  }
})
