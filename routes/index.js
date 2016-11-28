var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var cwd = path.join(__dirname, '..');
const CURRENT_TXT = path.join(cwd, 'current.txt');

/* GET home page. */
router.get('/', function(req, res, next) {
  var contents = 'nothing';
  try {
        contents = fs.readFileSync(CURRENT_TXT, 'utf8');
        console.log(contents);
  }
  catch(ex) {
    contents = 'No current song';
  }

  res.render('index', {title: 'Now Playing', song: contents});
});

module.exports = router;
