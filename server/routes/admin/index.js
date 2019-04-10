const express = require('express');
const multer = require('multer');
const fs = require('fs');
const md5 = require('md5');

const router = express.Router();

var dbquery = require('../../libs/dbquery.js');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '../../../uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({storage:storage});

var pathToAssets = __dirname + '../../public';

router.get('/isadmin', async (req, res) => {
  let isAdmin = req.session.login == 'admin';
  res.send({isAdmin:isAdmin});
});

router.post('/login', async (req, res) => {
  let login = req.body.login.trim();
  let password = md5(md5(req.body.password.trim()));
  let sql = `SELECT password FROM user WHERE name = '${login}'`;
  let result = await dbquery(sql);
  result = result[0].password;
  if (password == result) {
    req.session.login = login;
    res.end();
  } else {
    res.send({text: 'error'})
  }
});

router.post('/changePass', async (req, res) => {
  let login = req.session.login.trim();
  let oldPass = md5(md5(req.body.oldPass.trim()));
  let newPass = md5(md5(req.body.newPass.trim()));
  let sql = `SELECT password FROM user WHERE name = '${login}'`;
  let result = await dbquery(sql);
  result = result[0].password;
  if (oldPass == result) {
    sql = `UPDATE user SET password = '${newPass}' WHERE name = '${login}'`;
    await dbquery(sql);
    res.end();
  } else {
    res.send({text:'wrong'});
  }
});

router.get('/logout', async (req, res) => {
  delete req.session.login;
  res.end();
});

router.get('/categories', async (req, res) => {
  let sql = `SELECT id, name, img, position_px, position_pc FROM categories`;
  let result = await dbquery(sql);
  res.send(result);
});

router.post('/addCategoryImg', upload.single('image'), (req, res) => {
  let file = req.file;
  let newFilePath = pathToAssets + '/assets/img/categories/pre/' + file.filename;
  fs.rename(file.path, newFilePath, consoleErr);
  res.send({img:file.filename,path:newFilePath});
});

router.post('/addCategory', async (req, res) => {
  let name = req.body.name.trim();
  let imageLeftPx = req.body.imageLeftPx;
  let imageLeftPc = req.body.imageLeftPc;
  let filePath = req.body.filePath;
  let ext = path.extname(filePath);

  let sql = `INSERT INTO categories (name, img, position_px, position_pc)
         VALUES ('${name}', '${ext}', '${imageLeftPx}', '${imageLeftPc}')`;
  let id = await dbquery(sql, true);
  
  let newFilePath = pathToAssets + '/assets/img/categories/' + id + ext;
  fs.rename(filePath, newFilePath, consoleErr);
  res.end();
});

router.post('/editCategoryImagePosition', async (req, res) => {
  let id = req.body.id;
  let posPx = req.body.position_px;
  let posPc = req.body.position_pc;
  let sql = `UPDATE categories SET position_px = '${posPx}', position_pc = '${posPc}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/editCategoryImg', upload.single('image'), async (req, res) => {
  let file = req.file;
  let newFilePath = pathToAssets + '/assets/img/categories/' + file.filename;
  fs.rename(file.path, newFilePath, consoleErr);
  res.end();
});

router.post('/addGoodImg', upload.array('images[]'), (req, res) => {
  let files = req.files;
  let paths = [];
  for (var key in files) {
    let newFilePath = pathToAssets + '/assets/img/goods/pre/' + files[key].filename;
    fs.rename(files[key].path, newFilePath, consoleErr);
    paths.push(files[key].filename);
  }
  res.send({paths:paths});
});

router.post('/removeGoodImg', (req, res) => {
  let filePath = pathToAssets + '/assets/img/goods/pre/' + req.body.img;
  fs.unlink(filePath, consoleErr);
  res.end();
});

router.post('/editCategoryName', async (req, res) => {
  let id = req.body.id;
  let name = req.body.name.trim();
  let sql = `UPDATE categories SET name = '${name}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/editCategoryImg', upload.single('image'), (req, res) => {
  let file = req.file;
  let fileName = file.filename;
  let newFilePath = pathToAssets + '/assets/img/categories/' + fileName;
  fs.rename(file.path, newFilePath, consoleErr);
  res.end();
});

router.post('/removeCategory', async (req, res) => {
  let id = req.body.id;
  let img = req.body.img;
  let filePath = pathToAssets + '/assets/img/categories/' + id + img;
  let sql = `DELETE FROM categories WHERE id = ${id}`;
  await dbquery(sql);
  fs.unlink(filePath, consoleErr);
  res.end();
});


router.get('/chars', async (req, res) => {
  let sql = 'SELECT id, name, type, filter FROM characteristics';
  let result = await dbquery(sql);
  res.send(result);
});

router.get('/chars/values', async (req, res) => {
  let sql = 'SELECT id, id_characteristics, value FROM char_values';
  let result = await dbquery(sql);
  res.send(result);
});


router.post('/addChar', async (req, res) => {
  let name = req.body.name.trim();
  let type = req.body.type;
  let filter = req.body.filter ? 1 : 0;
  let values = req.body.values;
  let stringValues = '';
  let sql = `INSERT INTO characteristics (name, type, filter) VALUES ('${name}', '${type}', ${filter})`;
  let id = await dbquery(sql, true);
  values.forEach((elem, idx, array) => {
    elem = elem.trim();
    if (idx != array.length - 1) {
      stringValues += `(${id}, '${elem}'), `;
    } else {
      stringValues += `(${id}, '${elem}')`;
    }
  });
  sql = `INSERT INTO char_values (id_characteristics, value) VALUES ${stringValues}`;
  await dbquery(sql);
  res.end();
});

router.post('/moveChar', async (req, res) => {
  let clickedChar = req.body.clickedChar;
  let replaceChar = req.body.replaceChar;
  let newClickedId = replaceChar.id;  
  let newReplaceId = clickedChar.id;
  sql = `UPDATE characteristics SET name = '${clickedChar.name}', type = '${clickedChar.type}', filter = ${clickedChar.filter} WHERE id = ${newClickedId}`;
  await dbquery(sql);
  sql = `UPDATE characteristics SET name = '${replaceChar.name}', type = '${replaceChar.type}', filter = ${replaceChar.filter} WHERE id = ${newReplaceId}`;
  await dbquery(sql);
  sql = `SELECT id FROM char_values WHERE id_characteristics = ${newReplaceId}`;
  let idForNew = await dbquery(sql);
  sql = `UPDATE char_values SET id_characteristics = ${newReplaceId} WHERE id_characteristics = ${newClickedId}`;
  await dbquery(sql);
  sql = `UPDATE char_values SET id_characteristics = ${newClickedId} WHERE `;
  idForNew.forEach((elem, idx, array) => {
    if (idx != array.length - 1) {
      sql += `id = ${elem.id} OR `;
    } else {
      sql +=  `id = ${elem.id}`;
    }
  });
  await dbquery(sql);
  res.end();
});


router.post('/submitGood', async (req, res) => {
  let good = req.body;
  good.name = good.name.trim();
  good.price = good.price.trim();
  good.wsprice = good.wsprice.trim();
  good.saleprice = good.saleprice.trim();
  good.salewsprice = good.salewsprice.trim();
  good.descr = good.descr.trim();
  let sql;
  if (!good.id) {
    sql = `INSERT INTO good (name, price, wscount, wsprice, saleprice, salewsprice, avail, descr)
         VALUES ('${good.name}', '${good.price}', ${good.wscount || null}, '${good.wsprice}', '${good.saleprice}', 
         '${good.salewsprice}', ${good.avail}, '${good.descr}')`;
    good.id = await dbquery(sql, true);
  } else {
    sql = `UPDATE good SET name = '${good.name}', price = '${good.price}', wscount = ${good.wscount || null}, wsprice = '${good.wsprice}',
         saleprice = '${good.saleprice}', salewsprice = '${good.salewsprice}', avail = ${good.avail}, descr = '${good.descr}'
         WHERE id = ${good.id}`;
    await dbquery(sql);
    sql = `DELETE FROM good_categories WHERE id_good = ${good.id}`;
    await dbquery(sql);
    sql = `DELETE FROM spec_chars WHERE id_good = ${good.id}`;
    await dbquery(sql);
    sql = `DELETE FROM good_chars WHERE id_good = ${good.id}`;
    await dbquery(sql);
    sql = `DELETE FROM related_goods WHERE id_first_good = ${good.id} OR id_second_good = ${good.id}`;
    await dbquery(sql);
    sql = `SELECT id, img FROM good_images WHERE id_good = ${good.id}`;
    let images = await dbquery(sql);
    images.forEach(img => {
      let filePath = pathToAssets + '/assets/img/goods/' + img.id + img.img;
      fs.unlink(filePath, consoleErr);
    });
    sql = `DELETE FROM good_images WHERE id_good = ${good.id}`;
    await dbquery(sql);
  }
  let stringValues = '';
  good.categories.forEach((elem, idx, array) => {
    if (idx != array.length - 1) {
      stringValues += `(${good.id}, '${elem}'), `;
    } else {
      stringValues +=  `(${good.id}, '${elem}')`;
    }
  });
  sql = `INSERT INTO good_categories (id_good, id_categories) VALUES ${stringValues}`;
  await dbquery(sql);
  if (good.chars[0]) {
    stringValues = '';
    good.chars.forEach((elem, idx, array) => {
      if (idx != array.length - 1) {
        stringValues += `(${good.id}, '${elem}'), `;
      } else {
        stringValues +=  `(${good.id}, '${elem}')`;
      }
    });
    sql = `INSERT INTO good_chars (id_good, id_char_values) VALUES ${stringValues}`;
    await dbquery(sql);
  }
  if (good.specChars[0] && good.specChars[0].name) {
    stringValues = '';
    good.specChars.forEach((elem, idx, array) => {
      elem.name = elem.name.trim();
      elem.value = elem.value.trim();
      if (idx != array.length - 1) {
        stringValues += `(${good.id}, '${elem.name}', '${elem.value}'), `;
      } else {
        stringValues += `(${good.id}, '${elem.name}', '${elem.value}')`;
      }
    });
    sql = `INSERT INTO spec_chars (id_good, name, value) VALUES ${stringValues}`;
    await dbquery(sql);
  }
  if (good.related[0]) {
    stringValues = '';
    good.related.forEach((elem, idx, array) => {
      if (idx != array.length - 1) {
        stringValues += `(${good.id}, ${elem}), `;
      } else {
        stringValues +=  `(${good.id}, ${elem})`;
      }
    });
    sql = `INSERT INTO related_goods (id_first_good, id_second_good) VALUES ${stringValues}`;
    await dbquery(sql);
    stringValues = '';
    good.related.forEach((elem, idx, array) => {
      if (idx != array.length - 1) {
        stringValues += `(${elem}, ${good.id}), `;
      } else {
        stringValues +=  `(${elem}, ${good.id})`;
      }
    });
    sql = `INSERT INTO related_goods (id_first_good, id_second_good) VALUES ${stringValues}`;
    await dbquery(sql);
  }
  stringValues = '';
  good.img.forEach((elem, idx, array) => {
    elem.left = elem.left || 0;
    elem.checked = elem.checked || 0;
    elem.ext = path.extname(elem.name);
    if (idx != array.length - 1) {
      stringValues += `(${good.id}, '${elem.ext}', ${elem.checked}, '${elem.leftPx}', '${elem.leftPc}'), `;
    } else {
      stringValues +=  `(${good.id}, '${elem.ext}', ${elem.checked}, '${elem.leftPx}', '${elem.leftPc}')`;
    }
  });
  sql = `INSERT INTO good_images (id_good, img, cover, position_px, position_pc) VALUES ${stringValues}`;
  let result = await dbquery(sql);
  good.img.forEach((elem, idx, array) => {
    let id = idx + result.insertId;
    let filePath = pathToAssets + '/assets/img/goods/pre/' + elem.name;
    let newFilePath = pathToAssets + '/assets/img/goods/' + id + elem.ext;
    fs.rename(filePath, newFilePath, consoleErr);
  });
  res.end();
});

router.post('/editCharName', async (req, res) => {
  let id = req.body.id;
  let name = req.body.name.trim();
  let sql = `UPDATE characteristics SET name = '${name}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/editCharValue', async (req, res) => {
  let id = req.body.id;
  let value = req.body.value.trim();
  let sql = `UPDATE char_values SET value = '${value}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/addCharValue', async (req, res) => {
  let id = req.body.id;
  let value = req.body.value.trim();
  let sql = `INSERT INTO char_values (id_characteristics, value) VALUES (${id}, '${value}')`;
  await dbquery(sql);
  res.end();
});

router.post('/removeCharValue', async (req, res) => {
  let id = req.body.id;
  let sql = `DELETE FROM char_values WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/removeChar', async (req, res) => {
  let id = req.body.id;
  let sql = `DELETE good_chars FROM good_chars
         LEFT JOIN char_values ON char_values.id = good_chars.id_char_values
         WHERE char_values.id_characteristics = ${id}`;
  await dbquery(sql);
  sql = `DELETE FROM char_values WHERE id_characteristics = ${id}`;
  await dbquery(sql);
  sql = `DELETE FROM characteristics WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/changeCharType', async (req, res) => {
  let id = req.body.id;
  let type = req.body.type;
  let sql = `UPDATE characteristics SET type = '${type}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/changeCharFilter', async (req, res) => {
  let id = req.body.id;
  let filter = req.body.filter;
  let sql = `UPDATE characteristics SET filter = ${filter} WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.get('/goods', async (req, res) => {
  let limit = req.query.limit;
  let result = {};
  let sql = `SELECT COUNT(*) as count FROM good`;
  result.count = await dbquery(sql);
  result.count = result.count[0].count;
  sql = `SELECT id, name, avail, rate FROM good ORDER BY id DESC LIMIT ${limit}, 15`;
  result.goods = await dbquery(sql);
  sql = `SELECT good_categories.id_good, categories.id, categories.name FROM good_categories 
       LEFT JOIN categories ON categories.id = good_categories.id_categories`;
  result.categories = await dbquery(sql);
  res.send(result);
});

router.post('/goods/changeAvail', async (req, res) => {
  let id = req.body.id;
  let value = req.body.value;
  let sql = `UPDATE good SET avail = ${value} WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/goods/changeRate', async (req, res) => {
  let id = req.body.id;
  let value = req.body.value;
  let sql = `UPDATE good SET rate = ${value} WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/goods/remove', async (req, res) => {
  let id = req.body.id;
  let sql = `DELETE FROM good_categories WHERE id_good = ${id}`;
  await dbquery(sql);
  sql = `DELETE FROM spec_chars WHERE id_good = ${id}`;
  await dbquery(sql);
  sql = `DELETE FROM good_chars WHERE id_good = ${id}`;
  await dbquery(sql);
  sql = `DELETE FROM related_goods WHERE id_first_good = ${id} OR id_second_good = ${id}`;
  await dbquery(sql);

  sql = `SELECT id, img FROM good_images WHERE id_good = ${id}`;
  let images = await dbquery(sql);
  images.forEach(img => {
    let filePath = pathToAssets + '/assets/img/goods/' + img.id + img.img;
    fs.unlink(filePath, consoleErr);
  });
  sql = `DELETE FROM good_images WHERE id_good = ${id}`;
  await dbquery(sql);
  sql = `DELETE FROM good WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.get('/goodValues', async (req, res) => {
  let id = req.query.id;
  let result = {};
  let sql = `SELECT id, name, price, wscount, wsprice, saleprice, salewsprice, avail, descr FROM good WHERE id = ${id}`;
  result.good = await dbquery(sql);
  sql = `SELECT categories.id, categories.name FROM good_categories LEFT JOIN
       categories ON categories.id = good_categories.id_categories WHERE good_categories.id_good = ${id}`;
  result.categories = await dbquery(sql);
  sql = `SELECT char_values.id, id_characteristics, value FROM char_values LEFT JOIN good_chars ON good_chars.id_char_values = char_values.id 
       WHERE good_chars.id_good = ${id}`;
  result.values = await dbquery(sql);
  sql = `SELECT name, value FROM spec_chars WHERE id_good = ${id}`;
  result.specChars = await dbquery(sql);
  sql = `SELECT id, img, cover, position_px, position_pc FROM good_images WHERE id_good = ${id}`;
  result.images = await dbquery(sql);
  result.images.forEach((img, idx) => {
    var from = pathToAssets + '/assets/img/goods/' + img.id + img.img;
    var to = pathToAssets + '/assets/img/goods/pre/' + img.id + img.img;
    fs.copyFile(from, to, consoleErr);
    img.img = img.id + img.img;
    img.num = idx;
  });
  res.send(result);
});


router.post('/related', async (req, res) => {
  let id = req.body.id || null;
  let search = req.body.search.toLowerCase().trim() || null;
  let selected = req.body.selected[0] ? req.body.selected : [];
  let emptySelected = req.body.emptySelected;
  let where = '';
  let limit = req.body.limit || 0;
  let sql = '';
  let count;
  let result = {};

  if (id && !emptySelected) {
    let sql = `SELECT good.id, good.name FROM related_goods LEFT JOIN good ON related_goods.id_second_good = good.id 
            WHERE related_goods.id_first_good = ${id}`;
    result.added = await dbquery(sql);
  }
  if (id && !selected[0]) {
    if (!emptySelected) {
      let sql = `SELECT good.id FROM related_goods LEFT JOIN good ON related_goods.id_second_good = good.id WHERE related_goods.id_first_good = ${id}`;
      let result = await dbquery(sql);
      result.forEach(elem => {
        selected.push(elem.id);
      });
    }
    selected.push(id);
  } else if (id) {
    selected.push(id);
  }
  if (selected[0] && !search) {
    where = '';
    selected.forEach((elem, idx, array) => {
      if (idx == 0 && array.length == 1) {
        where += `WHERE id != ${elem}`;
      } else if (idx == 0 && array.length != 1) {
        where += `WHERE id != ${elem} AND `;
      } else if (idx != array.length - 1) {
        where += `id != ${elem} AND `;
      } else {
        where += `id != ${elem}`;
      }
    });
  } else if (selected[0] && search) {
    where = '';
    selected.forEach((elem, idx, array) => {
      if (idx == 0 && array.length == 1) {
        where += `WHERE LOWER(name) LIKE '%${search}%' AND id != ${elem}`;
      } else if (idx == 0 && array.length != 1) {
        where += `WHERE LOWER(name) LIKE '%${search}%' AND id != ${elem} AND `;
      } else if (idx != array.length - 1) {
        where += `id != ${elem} AND `;
      } else {
        where += `id != ${elem}`;
      }
    });
  } else if (!selected[0] && search) {
    where = `WHERE LOWER(name) LIKE '%${search}%'`;
  }
  sql = `SELECT COUNT(*) as count FROM good ${where}`;
  count = await dbquery(sql);
  count = count[0].count;

  sql = `SELECT id, name FROM good ${where} ORDER BY id DESC LIMIT ${limit}, 10`;
  result.goods = await dbquery(sql);
  
  if (count > limit + 10) {
    result.else = true;
  } else {
    result.else = false;
  }
  res.send(result);
});

router.post('/addReviewImg', upload.single('image'), (req, res) => {
  let file = req.file;
  let newFilePath = pathToAssets + '/assets/img/reviews/pre/' + file.filename;
  fs.rename(file.path, newFilePath, consoleErr);
  res.send({img:file.filename,path:newFilePath});
});

router.post('/addReview', async (req, res) => {
  let name = req.body.name;
  let link = req.body.link;
  let imageLeftPx = req.body.imageLeftPx;
  let imageLeftPc = req.body.imageLeftPc;
  let text = req.body.text;
  let filePath = req.body.filePath;
  let ext = path.extname(filePath);

  let sql = `INSERT INTO review (name, img, position_px, position_pc, link, text)
         VALUES ('${name}', '${ext}', '${imageLeftPx}', '${imageLeftPc}', '${link}', '${text}')`;
  let id = await dbquery(sql, true);

  let newFilePath = pathToAssets + '/assets/img/reviews/' + id + ext;
  fs.rename(filePath, newFilePath, consoleErr);
  res.end();
});

router.get('/reviews', async (req, res) => {
  let sql = `SELECT id, name, img, position_px, position_pc, link, text FROM review`;
  let result = await dbquery(sql);
  res.send(result);
});

router.post('/editReviewName', async (req, res) => {
  let id = req.body.id;
  let name = req.body.name.trim();
  let sql = `UPDATE review SET name = '${name}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/editReviewLink', async (req, res) => {
  let id = req.body.id;
  let link = req.body.link.trim();
  let sql = `UPDATE review SET link = '${link}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/editReviewText', async (req, res) => {
  let id = req.body.id;
  let text = req.body.text.trim();
  let sql = `UPDATE review SET text = '${text}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/editReviewImagePosition', async (req, res) => {
  let id = req.body.id;
  let posPx = req.body.position_px;
  let posPc = req.body.position_pc;
  let sql = `UPDATE review SET position_px = '${posPx}', position_pc = '${posPc}' WHERE id = ${id}`;
  await dbquery(sql);
  res.end();
});

router.post('/editReviewImg', upload.single('image'), async (req, res) => {
  let file = req.file;
  let newFilePath = pathToAssets + '/assets/img/reviews/' + file.filename;
  fs.rename(file.path, newFilePath, consoleErr);
  res.end();
});

router.post('/removeReview', async (req, res) => {
  let id = req.body.id;
  let img = req.body.img;
  let sql = `DELETE FROM review WHERE id = ${id}`;
  await dbquery(sql);
  let filePath = pathToAssets + '/assets/img/reviews/' + id + img;
  fs.unlink(filePath, consoleErr);
  res.end();
});

function consoleErr(err) {
  if (err) {
    console.log(err);
  }
}

module.exports = router;