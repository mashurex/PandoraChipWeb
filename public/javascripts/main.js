(function() {
    var currentStatus = {
        album: '',
        title: '',
        artist: '',
        coverArt: '',
        station: ''
    };

    function getAjax(url, success) {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('GET', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
        return xhr;
    }

    function updateCurrentStatus() {
        getAjax('/control/current', function(res){
            res = JSON.parse(res);
            console.log(res);
            currentStatus = res;
            var nowPlayingElm = document.getElementById('now-playing');
            nowPlayingElm.innerText = res.station + ': ' + res.title + ' by ' + res.artist;
        });
    }

    function updateStats(stats) {
        currentStatus = stats;
        var nowPlayingElm = document.getElementById('now-playing');
        nowPlayingElm.innerText = stats.station + ': ' + stats.title + ' by ' + stats.artist;
    }

    function assignAjaxButtons() {
        var buttons = document.getElementsByClassName('btn async');
        if(!buttons || buttons.length == 0){ return; }

        for(var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            button.onclick = function() {
                var self = this;
                var href = self.getAttribute('data-href');
                getAjax(href, function(res){
                    if(self.classList.contains('btn-skip')) {
                        console.log('Skipping...');
                        // setTimeout(updateCurrentStatus, 1000);
                    }
                });
            }
        }
    }

    assignAjaxButtons();

    // setInterval(updateCurrentStatus, 5000);

    var host = window.document.location.host.replace(/:.*/, '');
    var ws = new WebSocket('ws://' + host + ':8080');
    ws.onmessage = function (event) {
        updateStats(JSON.parse(event.data));
    };
})();