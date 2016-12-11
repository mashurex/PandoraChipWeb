const events = require('events');
const eventEmitter = new events.EventEmitter();
const debug = require('debug')('pcw');

const fs = require('fs');
const path = require('path');

const BATTERY_STATS_FILE = '/usr/local/battery_stats';
const IDX_BATT = 0;
const IDX_CHARGE = 1;
const IDX_VOLT = 2;
const IDX_CURRENT = 3;
const IDX_BATT_PCT = 4;

class BatteryStats {
    constructor(options) {
        let self = this;
        this._options = this._initBatteryStats(options);
        this._has_been_checked = false;
        this.file_exists = false;

        fs.exists(this._options.stats_file, function(exists){
            self.file_exists = exists == true;
            self._has_been_checked = true;
            if(!exists) {
                console.error(self._options.stats_file + " does not exist!");
            }
        });

        eventEmitter.on('battery-stats', this._options.stats_cb);
    }

    _initBatteryStats(opts) {
        if(!opts){ opts = {}; }
        opts.stats_file = opts.stats_file || BATTERY_STATS_FILE;
        opts.stats_cb = opts.stats_cb || function(stats) { debug('Stats: ', stats); };
        return opts;
    }

    _parseContents(contents) {
        let stats = {
            has_battery: false,
            is_charging: false,
            voltage: 0.0,
            current: 0.0,
            percentage: 0
        };

        if(!contents || contents.length === 0){ return stats; }
        if(contents.substr(0,1) === '0'){ return stats; }

        contents = contents.trim();
        let parts = contents.split('|');
        for(let i = 0; i < parts.length; i++) {
            let value = parts[i].trim();
            switch(i) {
                case IDX_BATT:
                    stats.has_battery = (value == 1);
                    break;
                case IDX_CHARGE:
                    stats.is_charging = (value == 1);
                    break;
                case IDX_VOLT:
                    stats.voltage = Number(value);
                    break;
                case IDX_CURRENT:
                    stats.current = Number(value);
                    break;
                case IDX_BATT_PCT:
                    stats.percentage = Number(value);
                    break;
                default:
                    console.log('Unknown battery stats index: ' + i + ' with value', value);
                    break;
            }
        }

        this._currentStats = stats;
        eventEmitter.emit('battery-stats', stats);
        return stats;
    }

    getCurrentStats() {
        if(!this._currentStats) {
            this._currentStats = {
                has_battery: false,
                is_charging: false,
                voltage: 0.0,
                current: 0.0,
                percentage: 0
            }
        }

        return this._currentStats;
    }

    getBatteryStats(callback){
        let self = this;
        if(!self._has_been_checked){ return callback(new Error('Waiting on I/O existence check')); }
        else if(!self.file_exists){ return callback(new Error('Stats file does not exist')); }

        try {
            fs.readFile(BATTERY_STATS_FILE, 'utf8', function(err, contents){
                if(err){
                    return callback(err);
                }

                return callback(null, self._parseContents(contents));
            });
        }
        catch(ex) {
            console.error(ex.message, ex);
            return callback(new Error(ex.message));
        }
    }
}

exports = module.exports = BatteryStats;