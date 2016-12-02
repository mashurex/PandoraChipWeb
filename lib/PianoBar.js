const fs = require('fs');
const path = require('path');
const FIFO = require('fifo-js');
const ps = require('ps-node');

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
        this.stopped = true;
        this.paused = true;
        this.stations = [];
        this.currentStation = '';
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
            control: process.env.PCW_CTL_FILE || opts.control_file || '/home/chip/.config/pianobar/ctl',
            pid: process.env.PCW_PID_FILE || opts.pid_file || path.join(__dirname, '..','pcw.pid'),
            pb_pid: process.env.PCW_PB_PID_FILE || opts.pb_pid_file || path.join(__dirname, '..', 'pianobar.pid')
        };

        return opts;
    }

    _psRunCheck(callback) {
        try {
            // TODO: Read PID from file
            let pid = null;
            let args = { psargs: '-ef' };

            if(pid) {
                args.pid = pid;
            } else {
                args.command = 'pianobar';
            }

            ps.lookup(args, function(err, results){
                if (err) {
                    console.error(err);
                    return callback(err, false);
                }

                if(!results || results.length === 0) {
                    return callback(null, false);
                }

                for(let i = 0; i < results.length; i++) {
                    var p = results[i];
                    if(p && p.pid) {
                        return callback(null, true);
                    }
                }

                return callback(null, false);
            });
        } catch(ex) {
            console.error(ex);
            return callback(new Error(ex.message), false);
        }
    }

    running() {
        var self = this;
        this._psRunCheck(function(err, isRunning){
            self.stopped = !isRunning;
            return isRunning;
        });
    }

    playing() {
        return !this.stopped && !this.paused;
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
        var self = this;
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

        self.stations = stations;
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
            coverArt: '',
            paused: this.paused,
            stopped: this.stopped
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
        var self = this;
        this.writeCommand(act_pause, function(err){
            if(err) {
                // TODO:
            }
            else {
                self.paused = !self.paused;
            }
            if(callback){ return callback(err); }
        });
    }

    changeStation(station, callback) {
        var self = this;
        if(typeof station === 'string') {
            if (station.startsWith('station')) {
                station = station.substring(7).trim();
            } else {
                station = station.trim();
            }
        } else if (typeof station === 'number') {
            let obj = self.stations[station];
            if(obj && obj.name) {
                station = obj.name.substring(7).trim();
            } else {
                return callback(new Error('Could not find station with index ' + station));
            }
        }

        self.currentStation = 'station' + station;

        this.writeCommand(act_stationchange + station, function(err){
            if(!err) {
                self.currentStation = station;
            }
            if(callback){ return callback(err); }
        });
    }

    nextStation(callback) {
        var self = this;
        var station = self.currentStation || 'station0';

        if(typeof station === 'string') {
            if (station.startsWith('station')) {
                station = station.substring(7).trim();
            } else {
                station = station.trim();
            }
        }

        var idx = parseInt(station);
        if(isNaN(idx)) {
            console.error('Could not handle ' + station);
            idx = -1;
        }

        idx++;
        if(idx >= self.stations.length){ idx = 0; }

        station = self.stations[idx];
        console.log('Next Station Index: ' + idx);
        console.log('Station: ', station);

        self.changeStation(station.name, callback);
    }
}

exports = module.exports = PianoBar;