const fs = require('fs');
const path = require('path');

const filename = path.join(__dirname, '.env');
fs.readFile(filename, 'utf8', (err, data) => {
  if (err) {
    throw ".env file found";
  };
})
