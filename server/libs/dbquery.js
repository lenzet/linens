const db = require('./db.js');

dbquery('SET SESSION wait_timeout = 604800');

function dbquery(sql, id) {
  return new Promise((resolve) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
      } else if (id) {
        resolve(result.insertId);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = dbquery;