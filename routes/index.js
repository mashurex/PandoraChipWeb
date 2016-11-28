var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  var contents = 'nothing';
  try {
    fs.accessSync('./current.txt', fs.F_OK, function (err) {
      if (!err) {
        contents = fs.readFileSync("./current.txt");
      }
    });
  }
  catch(ex) {
    // File doesn't exist
  }

  res.render('index', {title: 'Now Playing', song: contents});
});

module.exports = router;
