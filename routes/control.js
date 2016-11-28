var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');

const act_like = '+';
const act_next = 'n';
const act_ban = '-';
const act_bookmark = 'b';
const act_songinfo = 'i';
const act_pause = 'p';
const act_stationchange = 's';
const act_voldown = '(';
const act_volup = ')';

const cwd = path.join(__dirname, '..');
const CURRENT_TXT = path.join(cwd, 'current.txt');

function writeCommand(req, command, callback) {
  var fifo = req.app.get('fifo');

  try {
    fifo.write(command, true, function(err){
      if(err) {
        console.error('Error sending command (' + command + '): ' + err);
        return callback(err);
      }

      return callback();
    });
  }
  catch(ex) {
    console.error('Exception caught while trying to write command to fifo: ' + ex.message);
    return callback(new Error(ex.message));
  }
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
  console.log('Sending next...');
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

router.get('/current', function(req, res, next) {
  var contents = 'nothing';
  try {
    contents = fs.readFileSync(CURRENT_TXT, 'utf8');
  }
  catch(ex) {
    contents = 'No current song';
  }

  // TODO:
  res.json({ channel: '', artist: '', song: contents.trim() });
});

module.exports = router;
