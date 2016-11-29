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

router.post('/update', function(req, res, next){
  // TODO: Push updates
  console.log(req.body);
  console.log('Event: ' + req.body.event);
  var ws = req.app.get('ws');
  if(ws) {
    console.log('Broadcasting...');
    ws.broadcast(JSON.stringify(req.body));
  }
  res.send('ok');
});

router.post('/songstart', function(req, res, next){
  var currentStatus = readCurrentFile(req.app);
  var ws = req.app.get('ws');
  if(ws) {
    ws.broadcast(JSON.stringify(currentStatus));
  }
  res.send('ok');
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

function readCurrentFile(app) {
  var last = app.get('lastStatusTime') || 0;
  var now = (new Date).getTime();
  var diff = now - last;
  if(diff <= 5000){
    // console.log('Returning cached result');
    app.set('lastStatusTime', now);
    return app.get('lastStatus');
  } else {
    // console.log(diff + ' ' + last + ' : ' + now);
  }

  var currentStatus = {
    station: '',
    artist: '',
    title: '',
    album: '',
    coverArt: ''
  };

  try {
    var contents = fs.readFileSync(CURRENT_TXT, 'utf8');
    var lines = contents.split(/\r?\n/);

    for(var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var parts = line.split('=');
      currentStatus[parts[0].trim()] = parts[1].trim();
    }
  }
  catch(ex) {
    return currentStatus;
  }

  app.set('lastStatus', currentStatus);
  app.set('lastStatusTime', now);
  return currentStatus;
}

router.get('/current', function(req, res, next) {
  res.json(readCurrentFile(req.app));
});

module.exports = router;
