const fs = require('fs');
const path = require('path');
const walkSync = async (dir, callback) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    var filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath, stats);
    }
  });
};

module.exports = {
  walkSync
};
