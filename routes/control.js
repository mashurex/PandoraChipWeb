var express = require('express');
var router = express.Router();

const act_like = '+';
const act_next = 'n';
const act_ban = '-';
const act_bookmark = 'b';
const act_songinfo = 'i';
const act_pause = 'p';
const act_stationchange = 's';
const act_voldown = '(';
const act_volup = ')';

function writeCommand(req, command, callback) {
  var fifo = req.app.get('fifo');
  fifo.write(command + "\n", true, function(err, res){
    if(err) {
      console.error('Error: ' + err);
    }
    return callback(err, res);
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/like', function(req, res, next) {
  writeCommand(req, act_like, function(err) {
    if(err) {
      res.send('Error: ' + err);
    } else {
      res.send('ok');
    }
  });
});

router.get('/next', function(req, res, next) {
  writeCommand(req, act_next, function(err) {
    if(err) {
      res.send('Error: ' + err);
    } else {
      res.send('ok');
    }
  });
});

router.get('/pause-toggle', function(req, res, next) {
  writeCommand(req, act_pause, function(err) {
    if(err) {
      res.send('Error: ' + err);
    } else {
      res.send('ok');
    }
  });
});

module.exports = router;
