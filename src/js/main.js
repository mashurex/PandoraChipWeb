const $ = jQuery = require('jquery');
const tether = require('tether');
const bootstrap = require('bootstrap');

(function($) {
    let currentStatus = {
        album: '',
        title: '',
        artist: '',
        coverArt: '',
        station: '',
        paused: false,
        stopped: true
    };

    let stations = [];
    let clientId = 'NOTSET';
    let isRunning = false;
    let songHistory = [];

    const host = window.document.location.host.replace(/:.*/, '');
    const ws = new WebSocket('ws://' + host + ':3000');

    ws.onmessage = function onMessageEvent(event) {
        let data = JSON.parse(event.data);
        if(!data.event){ data.event = 'songstart'; }

        if(data.event === 'songstart' || data.event === 'current-stats'){ updateStats(data); }
        else if(data.event === 'connected') {
            clientId = data.id;
            updateStations(data.stations);
            requestCurrentStatus();
        }
        else if(data.event === 'battery-stats') { updateBattery(data); }
        else {
            console.log('Received message, nothing to do?');
            console.log(data);
        }
    };

    ws.onopen = function onOpenEvent() {
        // requestCurrentStatus();
        // console.log('Connected');
    };

    function sendMessage(event, data) {
        if(ws.readyState == 3){ console.error('Connection closed!'); return; }

        let cnt = 0;
        while(ws.readyState !== 1 && cnt++ < 5) {
            setTimeout(function(){ console.log('Connection wait try...'); }, 250 * cnt);
        }

        if(ws.readyState !== 1) {
            console.error('Could not connect WebSocket!');
            throw new Error('Could not connect WebSocket');
        }

        if (!data) {
            data = {};
        }

        data.id = clientId;
        data.ts = Date.now().toString();

        ws.send(JSON.stringify({event: event, data: data}));
    }

    function updateStations(updated) {
        stations = updated.stations;

        let stationsElm = document.getElementById('stations-list-container');
        if(!stationsElm){ return; }

        while(stationsElm.firstChild) {
            stationsElm.removeChild(stationsElm.firstChild);
        }

        if(!stations || stations.length === 0){ console.log('No stations'); return; }

        let listElm = document.createElement('ul');
        listElm.setAttribute('class', 'station-list');
        stationsElm.appendChild(listElm);

        for(let i = 0; i < stations.length; i++) {
            let station = stations[i];
            let li = document.createElement('li');
            li.setAttribute('class', 'station');
            listElm.appendChild(li);

            let a = document.createElement('a');
            a.innerText = station.title;
            a.setAttribute('href', 'javascript:void(0);');
            a.setAttribute('data-station', station.name);
            a.addEventListener('click', function(e){
                let self = e.target;
                let stationName = self.getAttribute('data-station');
                sendChangeStation(stationName);
            });

            li.appendChild(a);
        }
    }

    function sendChangeStation(name) {
        sendMessage('change-station', { stationName: name });
    }

    function requestCurrentStatus() {
        sendMessage('current-status');
    }

    function getStationId(title) {
        for(let i = 0; i < stations.length; i++) {
            if(stations[i].title === title){ return stations[i].name; }
        }

        return null;
    }

    function updateBattery(data) {
        let battery = data.stats;
        let batteryElm = $('#battery-stats');
        let chargingStatusElm = $('#charging-status');
        let pctStatusElm = $('#battery-percentage');

        if(!battery.has_battery) {
            $(batteryElm).hide();
            return;
        }

        if(battery.is_charging) {
            $(chargingStatusElm).removeClass('hidden');
            $(chargingStatusElm).show();
        } else {
            $(chargingStatusElm).hide();
        }

        $(pctStatusElm).removeClass('fa-battery-0');
        $(pctStatusElm).removeClass('fa-battery-1');
        $(pctStatusElm).removeClass('fa-battery-2');
        $(pctStatusElm).removeClass('fa-battery-3');
        $(pctStatusElm).removeClass('fa-battery-4');

        if(battery.percentage < 25){
            $(pctStatusElm).addClass('fa-battery-0');
        } else if(battery.percentage < 50){
            $(pctStatusElm).addClass('fa-battery-1');
        } else if(battery.percentage < 75){
            $(pctStatusElm).addClass('fa-battery-2');
        } else if(battery.percentage < 90) {
            $(pctStatusElm).addClass('fa-battery-3');
        } else {
            $(pctStatusElm).addClass('fa-battery-4');
        }

        $(batteryElm).removeClass('hidden');
        $(batteryElm).show();
    }

    function pushSongHistory(song) {
        if((!(song && song.title))){ return; }

        songHistory.push(song);

        let li = document.createElement('li');
        li.setAttribute('class', 'song-history');
        li.setAttribute('data-cover', song.coverArt);
        li.innerText = song.title + ' by ' + song.artist;

        let songHistoryElm = document.getElementById('song-history');
        songHistoryElm.appendChild(li);
    }

    function updateStats(data) {
        let newStatus = data.stats;
        currentStatus.paused = newStatus.paused;
        currentStatus.stopped = newStatus.stopped;

        if (currentStatus.title !== newStatus.title) {
            let lastSong = {
                album: currentStatus.album,
                artist: currentStatus.artist,
                coverArt: currentStatus.coverArt,
                station: currentStatus.station,
                title: currentStatus.title
            };

            pushSongHistory(lastSong);
            currentStatus = newStatus;

            $("[data-value='artist']").each(function () {
                $(this).text(currentStatus.artist);
            });

            $("[data-value='album']").each(function () {
                $(this).text(currentStatus.album);
            });

            $("[data-value='title']").each(function () {
                $(this).text(currentStatus.title);
            });

            $("img.cover-art").each(function () {
                if (currentStatus.coverArt) {
                    $(this).attr('src', currentStatus.coverArt);
                }
                else {
                    $(this).attr('src', '/img/placeholder.png')
                }
            });

            if(lastSong.station !== currentStatus.station) {
                $("[data-value='station']").each(function () {
                    $(this).text(currentStatus.station);
                });

                let stationId = getStationId(currentStatus.station);
                $(".station-list li.station").removeClass('active');
                $(".station-list li.station a[data-station='" + stationId + "'").each(function () {
                    $(this).parent().addClass('active');
                });
            }
        }

        if(data.running != isRunning) {
            isRunning = (data.running == true);
            if(isRunning) {
                $('#btn-start').addClass('disabled');
                $('#btn-stop').removeClass('disabled');
            } else {
                $('#btn-start').removeClass('disabled');
                $('#btn-stop').addClass('disabled');
            }

            if(!isRunning) {
                $('.controls .btn-control').addClass('disabled');
            }
            else {
                $('.controls .btn-control').removeClass('disabled');
            }
        }

        if(isRunning) {
            updatePlayPause(!currentStatus.paused);
        }
    }

    function updatePlayPause(isPlaying) {
        let title = (!isPlaying ? 'Play' : 'Pause');

        let elm = $('a#btn-pause i.fa').first();

        $(elm).removeClass('fa-play');
        $(elm).removeClass('fa-pause');
        $(elm).addClass('fa-' + (!isPlaying ? 'play' : 'pause'));
        $(elm).attr('title', title);
    }

    function assignControlButtons() {
        let buttons = document.getElementsByClassName('btn-control');
        if(!buttons || buttons.length == 0){ return; }

        for(let i = 0; i < buttons.length; i++) {
            let button = buttons[i];
            button.onclick = function(event) {
                event.preventDefault();
                event.stopPropagation();

                let self = this;
                if($(self).hasClass('disabled')) {
                    return;
                }

                let action = self.getAttribute('data-action');
                // console.log('Sending action: ' + action);
                sendMessage(action);
            }
        }
    }

    assignControlButtons();

    $('#btn-pause').click(function(e){
        updatePlayPause(currentStatus.paused);
        // sendMessage('pause-toggle');
    });
})($ || jQuery || window.jQuery);