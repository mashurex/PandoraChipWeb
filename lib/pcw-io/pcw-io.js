#!/usr/bin/env node

const five = require('johnny-five');
const chipio = require('chip-io');
const WebSocket = require('ws');

const BTN_PINS = ['XIO-P1','XIO-P3','XIO-P5'];
const BTN_PIN_PLAY_PAUSE = BTN_PINS[0];
const BTN_PIN_SKIP_LIKE = BTN_PINS[1];
const BTN_PIN_STATION = BTN_PINS[2];
const WS_URL = 'ws://localhost:3000';

const ws = new WebSocket(WS_URL);

ws.on('open', function open(){
    console.log('WebSocket opened to ' + WS_URL);
});

ws.on('message', function(data, flags) {
    console.log('Message received: ', data);
});

var board = new five.Board({
    io: new chipio()
});

board.on('ready', function() {
    console.log('Board Ready');
    var btnPlayPause = makePlayPauseButton();
    var btnSkipLike = makeSkipLikeButton();
    var btnStation = makeStationButton();

    this.on('exit', function() {
        console.log('bye bye.');
        // button.off();
    });
});

function makeButton(pin) {
    return new five.Button(pin);
}

function makePlayPauseButton() {
    let btn = makeButton(BTN_PIN_PLAY_PAUSE);

    btn.held = false;
    btn.on('down', function playPauseDown(){
        console.log('Play/Pause down');
    });

    btn.on('hold', function playPauseHold(){
        this.held = true;
        console.log('Play/Pause hold');
    });

    btn.on('up', function playPauseUp(){
        if(this.held) {
            this.held = false;
            console.log('Start/Stop Toggle...');
            ws.send(JSON.stringify({ event: 'start-stop' }));
        } else {
            console.log('Pause Toggle...');
            ws.send(JSON.stringify({ event: 'pause-toggle', }));
        }
    });
}

function makeSkipLikeButton() {
    let btn = makeButton(BTN_PIN_SKIP_LIKE);

    btn.held = false;
    btn.on('down', function skipLikeDown(){
        console.log('Skip/Like down');
    });

    btn.on('hold', function skipLikeHold(){
        this.held = true;
        console.log('Skip/Like hold');
    });

    btn.on('up', function skipLikeUp(){
        if(this.held) {
            this.held = false;
            console.log('Liking...');
            ws.send(JSON.stringify({ event: 'like' }));
        } else {
            console.log('Skipping...');
            ws.send(JSON.stringify({ event: 'skip', }));
        }
    });
}

function makeStationButton() {
    let btn = makeButton(BTN_PIN_STATION);

    btn.held = false;
    btn.on('down', function stationDown(){
        console.log('Station down');
    });

    btn.on('hold', function stationHold(){
        this.held = true;
        console.log('Station hold');
    });

    btn.on('up', function stationUp(){
        if(this.held) {
            this.held = false;
            console.log('Banning...');
            ws.send(JSON.stringify({ event: 'ban' }));
        } else {
            console.log('Next Station...');
            ws.send(JSON.stringify({ event: 'station-next' }));
        }
    });
}