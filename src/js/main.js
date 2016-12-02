var $ = jQuery = require('jquery');
var tether = require('tether');
var bootstrap = require('bootstrap');

(function($) {
    var currentStatus = {
        album: '',
        title: '',
        artist: '',
        coverArt: '',
        station: '',
        paused: false,
        stopped: true
    };

    var stations = [];
    var clientId = 'NOTSET';
    var isRunning = false;

    const host = window.document.location.host.replace(/:.*/, '');
    const ws = new WebSocket('ws://' + host + ':3000');
    // const ws = new WebSocket('ws://pcw.vagrant.app:3000');
    ws.onmessage = function onMessageEvent(event) {
        var data = JSON.parse(event.data);
        if(!data.event){ data.event = 'songstart'; }

        if(data.event === 'songstart' || data.event === 'current-stats'){ updateStats(data); }
        else if(data.event === 'connected') {
            clientId = data.id;
            updateStations(data.stations);
            requestCurrentStatus();
        }
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

        var cnt = 0;
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

        var stationsElm = document.getElementById('stations-list-container');
        if(!stationsElm){ return; }

        while(stationsElm.firstChild) {
            stationsElm.removeChild(stationsElm.firstChild);
        }

        if(!stations || stations.length === 0){ console.log('No stations'); return; }

        var listElm = document.createElement('ul');
        listElm.setAttribute('class', 'station-list');
        stationsElm.appendChild(listElm);

        for(var i = 0; i < stations.length; i++) {
            var station = stations[i];
            var li = document.createElement('li');
            li.setAttribute('class', 'station');
            listElm.appendChild(li);

            var a = document.createElement('a');
            a.innerText = station.title;
            a.setAttribute('href', 'javascript:void(0);');
            a.setAttribute('data-station', station.name);
            a.addEventListener('click', function(e){
                var self = e.target;
                var stationName = self.getAttribute('data-station');
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
        for(var i = 0; i < stations.length; i++) {
            if(stations[i].title === title){ return stations[i].name; }
        }

        return null;
    }

    function updateStats(data) {
        currentStatus = data.stats;

        $("[data-value='artist']").each(function(){
            $(this).text(currentStatus.artist);
        });

        $("[data-value='album']").each(function(){
            $(this).text(currentStatus.album);
        });

        $("[data-value='title']").each(function(){
            $(this).text(currentStatus.title);
        });

        $("[data-value='station']").each(function(){
            $(this).text(currentStatus.station);
        });

        let stationId = getStationId(currentStatus.station);
        $(".station-list li.station").removeClass('active');
        $(".station-list li.station a[data-station='" + stationId + "'").each(function(){
            $(this).parent().addClass('active');
        });

        $("img.cover-art").each(function(){
            if(currentStatus.coverArt) {
                $(this).attr('src', currentStatus.coverArt);
            }
            else {
                $(this).attr('src', 'http://placekitten.com/g/500/500')
            }
        });

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
            if(currentStatus.paused) {
                $('#btn-pause').text('Play');
            } else {
                $('#btn-pause').text('Pause');
            }
        }
    }

    function assignControlButtons() {
        var buttons = document.getElementsByClassName('btn-control');
        if(!buttons || buttons.length == 0){ return; }

        for(var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            button.onclick = function(event) {
                event.preventDefault();
                event.stopPropagation();

                var self = this;
                if($(self).hasClass('disabled')) {
                    return;
                }

                var action = self.getAttribute('data-action');
                console.log('Sending action: ' + action);
                sendMessage(action);
            }
        }
    }

    assignControlButtons();
})(jQuery || window.jQuery);