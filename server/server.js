const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const routes = require('./routes');
const adminRoutes = require('./routes/admin');
var dbquery = require('./libs/dbquery.js');

const app = express();

app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 6000 * 60 * 24 }
}));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/admin'));
app.use('/assets', express.static(__dirname + '/public/assets'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.use('/admin', adminRoutes);



app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/admin/index.html'));
});

app.get('*', async (req, res) => {
  let date = new Date();
  let currentDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  let sql = `SELECT id FROM visitors WHERE visit_date = '${currentDate}'`;
  let result = await dbquery(sql);
  result = result[0] ? result[0].id : null;
  if (!result) {
    sql = `INSERT INTO visitors (visit_date, visitors_count, unique_visitors) VALUES ('${currentDate}', 0, 0)`;
    await dbquery(sql);
  }
  if (req.session.visit) {
    if (req.session.visit != currentDate) {
      req.session.visit = currentDate;
      sql = `UPDATE visitors SET visitors_count = visitors_count + 1 WHERE visit_date = '${currentDate}'`;
    }
  } else {
    req.session.visit = currentDate;
    sql = `UPDATE visitors SET visitors_count = visitors_count + 1, unique_visitors = unique_visitors + 1
         WHERE visit_date = '${currentDate}'`;
  }
  await dbquery(sql);
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(3000, () => {
  console.log('Сервер запущен');
});