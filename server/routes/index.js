const express = require('express');
const nodemailer = require("nodemailer");
const router = express.Router();

var dbquery = require('../libs/dbquery.js');

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: 'gmailusername',
    pass: 'gmailpass'
  }
});
var adminMail = 'admin@mail.ru';

router.get('/homeGoods', async (req, res) => {
  let result = {};
  let sql = `SELECT id, name, price, wscount, wsprice, saleprice, salewsprice, avail FROM good
         ORDER BY id DESC LIMIT 0, 10`;
  result.goods = await dbquery(sql);
  sql = `SELECT id, id_good, img, cover, position_px, position_pc FROM good_images`;
  result.images = await dbquery(sql);
  res.send(result);
});

router.get('/categories', async (req, res) => {
  let sql = `SELECT id, name FROM categories`;
  let result = await dbquery(sql);
  res.send(result);
});

router.get('/goods', async (req, res) => {
  let sale = req.query.sale;
  let wholesale = req.query.wholesale;
  let category = req.query.category;
  let search = req.query.search ? req.query.search.toLowerCase() : null;
  let from = +req.query.from;
  let to = +req.query.to;
  let filters = req.query.filters;

  let page = req.query.page;
  let limit = page * 12 - 12;

  let result = {};
  let sql = `SELECT good.id, name, price, wscount, wsprice, saleprice, salewsprice, avail FROM good `;
  let sqlCount = `SELECT COUNT(*) as count FROM good `;
  if (category) {
    sql += `LEFT JOIN good_categories ON good.id = good_categories.id_good `;
    sqlCount += `LEFT JOIN good_categories ON good.id = good_categories.id_good `;
  }
  if (filters) {
    sql += `LEFT JOIN good_chars ON good_chars.id_good = good.id LEFT JOIN char_values ON char_values.id = good_chars.id_char_values `;
    sqlCount += `LEFT JOIN good_chars ON good_chars.id_good = good.id LEFT JOIN char_values ON char_values.id = good_chars.id_char_values `;
  }
  if (sale || wholesale || category || search || from || to || filters) {
    sql += ` WHERE `;
    sqlCount += ` WHERE `;
  }
  if (sale) {
    sql += `saleprice != '' AND `;
    sqlCount += `saleprice != '' AND `;
  }
  if (wholesale) {
    sql += `wsprice != '' AND `;
    sqlCount += `wsprice != '' AND `;
  }
  if (category) {
    sql += `good_categories.id_categories = ${category} AND `;
    sqlCount += `good_categories.id_categories = ${category} AND `;
  }
  if (search) {
    sql += `LOWER(good.name) LIKE '%${search}%' AND `;
    sqlCount += `LOWER(good.name) LIKE '%${search}%' AND `;
  }
  if (from) {
    sql += `((price >= ${from} AND saleprice = '') OR saleprice >= ${from}) AND `;
    sqlCount += `((price >= ${from} AND saleprice = '') OR saleprice >= ${from}) AND `;
  }
  if (to) {
    sql += `(price <= ${to} OR (saleprice <= ${to} AND saleprice > 0)) AND `;
    sqlCount += `(price <= ${to} OR (saleprice <= ${to} AND saleprice > 0)) AND `;
  }

  if (sale || wholesale || category || search || from || to) {
    sql = sql.slice(0, -4);
    sqlCount = sqlCount.slice(0, -4);
  }
  let count = await dbquery(sqlCount);
  count = count[0]['count'];
  result.goodsElse = count > limit + 12;
  sql += ` ORDER BY good.avail DESC, good.id DESC LIMIT ${limit}, 12`;
  result.goods = await dbquery(sql);
  sql = `SELECT id, id_good, img, cover, position_px, position_pc FROM good_images`;
  result.images = await dbquery(sql);
  res.send(result);
});

router.get('/popularGoods', async (req, res) => {
  let sql = `SELECT good.id, name, price, saleprice, good_images.id AS imgId, img, position_pc FROM good
         LEFT JOIN good_images ON good_images.id_good = good.id
         WHERE avail != 0 AND cover = 1 ORDER BY rate DESC LIMIT 0, 3`;
  let result = await dbquery(sql);
  res.send(result);
});

router.get('/homeCategories', async (req, res) => {
  let result = {};
  let sql = `SELECT id, name, img, position_pc FROM categories`;
  result = await dbquery(sql);
  result.forEach(async (elem, idx, array) => {
    sql = `SELECT COUNT(*) as count FROM good LEFT JOIN good_categories ON good_categories.id_good = good.id WHERE good_categories.id_categories = ${elem.id}`;
    elem.count = await dbquery(sql);
    elem.count = elem.count[0].count;
    if (idx == array.length - 1) {
      res.send(result);
    }
  });
});

router.get('/filters', async (req, res) => {
  let result = {};
  let sql = `SELECT id, name FROM characteristics WHERE filter = 1`;
  result.filters = await dbquery(sql);
  sql = `SELECT char_values.id, id_characteristics, value FROM char_values 
       LEFT JOIN characteristics ON characteristics.id = char_values.id_characteristics WHERE characteristics.filter = 1`;
  result.values = await dbquery(sql);
  res.send(result);
});

router.get('/good', async (req, res) => {
  let id = req.query.id;
  let result = {};
  let where = '';
  let sql = `SELECT name, price, wscount, wsprice, saleprice, salewsprice, avail, descr FROM good WHERE id = ${id}`;
  result = await dbquery(sql);
  result = result[0];
  result.id = id;
  sql = `SELECT categories.id, categories.name FROM categories LEFT JOIN good_categories ON good_categories.id_categories = categories.id 
       WHERE good_categories.id_good = ${id}`;
  result.categories = await dbquery(sql);
  sql = `SELECT id, name FROM characteristics`;
  result.chars = await dbquery(sql);
  sql = `SELECT id_characteristics, value FROM char_values LEFT JOIN good_chars ON good_chars.id_char_values = char_values.id WHERE id_good = ${id}`;
  result.values = await dbquery(sql);
  result.chars.forEach(char => {
    result.values.forEach(value => {
      char.values = char.values || [];
      if (char.id == value.id_characteristics) {
        char.values.push({name: value.value});
      }
    });
    if (char.values[0]) char.values[char.values.length - 1].last = true;
  });
  delete result.values;
  sql = `SELECT name, value FROM spec_chars WHERE id_good = ${id}`;
  result.specChars = await dbquery(sql);
  sql = `SELECT id, img, cover, position_px, position_pc FROM good_images WHERE id_good = ${id}`;
  result.images = await dbquery(sql);
  for (var i = 0; i < result.images.length; i++) {
    if (result.images[i].cover) {
      result.cover = result.images[i];
      result.images.splice(i, 1);
      i--;
    }
  }
  sql = `SELECT id_second_good FROM related_goods WHERE id_first_good = ${id}`;
  result.relatedIds = await dbquery(sql);
  if (result.relatedIds[0]) {
    where = '';
    result.relatedIds.forEach((elem, idx, array) => {
      elem.id = elem.id_second_good;
      delete elem.id_second_good;
      if (idx == 0) {
        where += `WHERE id = ${elem.id} `;
      } else {
        where += `OR id = ${elem.id} `;
      }
    });
    sql = `SELECT id, name, price, saleprice, avail FROM good ${where}`;
    result.related = await dbquery(sql);
    where = '';
    result.relatedIds.forEach((elem, idx, array) => {
      if (idx == 0) {
        where += `WHERE id_good = ${elem.id} `;
      } else {
        where += `OR id_good = ${elem.id} `;
      }
    });
    sql = `SELECT id, id_good, img, cover, position_pc FROM good_images ${where}`;
    result.relatedImages = await dbquery(sql);
    result.related.forEach(good => {
      good.images = good.images || [];
      result.relatedImages.forEach(img => {
        if (good.id == img.id_good) {
          good.images.push(img);
          delete img.id_good;
        }
      });
    });
    delete result.relatedImages;
    result.related.forEach(good => {
      for (var i = 0; i < good.images.length; i++) {
        if (good.images[i].cover) {
          good.cover = good.images[i];
          good.images.splice(i, 1);
          i--;
        }
      }
    });
  }
  delete result.relatedIds;
  sql = `UPDATE good SET rate = rate + 1 WHERE id = ${id}`;
  await dbquery(sql);
  res.send(result);
});

router.get('/cartGoods', async (req, res) => {
  let id = req.query.id;
  let sql = `SELECT good.id AS id, good.name, good.price, good.wscount, good.wsprice, good.saleprice, good.salewsprice, good.avail,
         good_images.id AS imgId, good_images.img, good_images.position_pc FROM good
         LEFT JOIN good_images ON good_images.id_good = good.id
         WHERE `;
  id.forEach((elem, idx, array) => {
    if (idx != array.length - 1) {
      sql += `good_images.cover = 1 AND good.id = ${elem} OR `;
    } else {
      sql += `good_images.cover = 1 AND good.id = ${elem}`;
    }
  });
  let result = await dbquery(sql);
  res.send(result);
});

router.get('/reviewsList', async (req, res) => {
  let limit = +req.query.limit;
  let result = {};
  let sql = `SELECT COUNT(*) as count FROM review`;
  let count = await dbquery(sql);
  count = count[0].count;
  result.reviewsElse = count > limit + 4;
  sql = `SELECT id, name, img, position_pc, link, text FROM review ORDER BY id DESC LIMIT ${limit}, 4`;
  result.reviews = await dbquery(sql);
  res.send(result);
});

router.post('/callme', async (req, res) => {
  let phone = req.body.phone;
  let text = `Позвоните мне: ${phone}`;

  let data = {
    to: email,
    subject: 'Позвоните мне',
    html: text
  };

  transporter.sendMail(data);
  res.end();
});

router.post('/checkout', async (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let type = req.body.type;
  let table = req.body.html;
  
  let text = `Заказ:<br><br>`;
  text += `Имя: ${name}<br>`;
  text += `Email: ${email}<br>`;
  text += `Телефон: ${phone}<br>`;
  text += `Тип доставки: ${type}<br><br>`;
  text += table;

  let data = {
    to: adminMail,
    subject: 'Заказ',
    html: text
  };

  transporter.sendMail(data);

  text = '';
  text += 'Спасибо за оформление заказа на нашем сайте!<br>';
  text += 'Мы свяжемся с Вами в течение рабочего дня!<br><br>';
  text += 'Ваш заказ:<br><br>';
  text += table;

  let dataClient = {
    to: email,
    subject: 'Заказ',
    html: text
  };
  transporter.sendMail(dataClient);

  res.end();
});

router.get('/visitors', async (req, res) => {
  let sql = `SELECT DATE_FORMAT(visit_date, "%d.%m.%y") AS visitDate, visitors_count, unique_visitors FROM visitors ORDER BY visit_date DESC LIMIT 0, 7`;
  let result = await dbquery(sql);
  res.send(result);
});

function consoleErr(err) {
  if (err) {
    console.log(err);
  }
}

module.exports = router;