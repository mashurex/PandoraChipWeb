const fs = require('fs');
const path = require('path');
const FIFO = require('fifo-js');

const act_like = '+';
const act_next = 'n';
const act_ban = '-';
const act_bookmark = 'b';
const act_songinfo = 'i';
const act_pause = 'p';
const act_stationchange = 's';
const act_voldown = '(';
const act_volup = ')';

class PianoBar {

    constructor(options) {
        this._options = this._initPianoBar(options);
        this._fifo = new FIFO(this._options.files.control);
    }

    _initPianoBar(opts) {
        if(!opts) {
            opts = {};
        }

        if(!opts.cwd) {
            opts.cwd = path.join(__dirname, '..');
        }

        opts.files = {
            current: path.join(opts.cwd, 'current.txt'),
            log: path.join(opts.cwd, 'log.txt'),
            stations: path.join(opts.cwd, 'stations.txt'),
            control: process.env.PCW_CTL_FILE || opts.control_file || '/home/chip/.config/pianobar/ctl'
        };

        return opts;
    }

    readStats(callback) {
        // TODO: Not really async

        try {
            let stats = this.readStatsSync();
            return callback(null, stats);
        } catch (ex) {
            return callback(new Error(ex.message));
        }
    };

    readStations(callback) {
        // TODO: Not really async

        try {
            let stations = this.readStationsSync();
            return callback(null, stations);
        } catch (ex) {
            return callback(new Error(ex.message));
        }
    }

    readStationsSync() {
        let stations = [];
        try {
            let contents = fs.readFileSync(this._options.files.stations, 'utf8');
            let lines = contents.split(/;/);
            for(let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                let parts = line.split('|');
                if(parts.length === 2) {
                    stations.push({
                        name: parts[0].trim(),
                        title: parts[1].trim()
                  })
                }
            }
        } catch(ex) {

        }

        return {
            stationsCount: stations.length,
            stations: stations
        };
    }

    readStatsSync() {
        let stats = {
            station: '',
            artist: '',
            title: '',
            album: '',
            coverArt: ''
        };

        try {
            let contents = fs.readFileSync(this._options.files.current, 'utf8');
            let lines = contents.split(/\r?\n/);

            for(let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                let parts = line.split('=');
                if(parts.length == 2) {
                    stats[parts[0].trim()] = parts[1].trim();
                }
            }
        }
        catch(ex) {
            // TODO:
        }

        return stats;
    }

    writeCommand(command, callback) {
        let fifo = this._fifo;
        try {
            fifo.write(command.trim() + "\n", false, function(err){
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

    skip(callback) {
        this.writeCommand(act_next, function(err){
            if(err) {
                // TODO:
            }

            if(callback){ return callback(err); }
        });
    }

    like(callback) {
        this.writeCommand(act_like, function(err){
            if(err) {
                // TODO:
            }

            if(callback){ return callback(err); }
        });
    }

    pauseToggle(callback) {
        this.writeCommand(act_pause, function(err){
            if(err) {
                // TODO:
            }

            if(callback){ return callback(err); }
        });
    }

    changeStation(station, callback) {
        if(station.startsWith('station')) {
            station = station.substring(7).trim();
        } else { station = station.trim(); }

        this.writeCommand(act_stationchange + station, function(err){
            if(callback){ return callback(err); }
        });
    }
}

exports = module.exports = PianoBar;