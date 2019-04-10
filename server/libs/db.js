const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'linens'
});

db.connect();

module.exports = db;