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

function assignAjaxButtons() {
    var buttons = document.getElementsByClassName('btn async');
    if(!buttons || buttons.length == 0){ return; }

    for(var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.onclick = function() {
            var href = this.getAttribute('data-href');
            getAjax(href, function(res){
                console.log(res);
            });
        }
    }
}

function assignSkipButtons() {
    var buttons = document.getElementsByClassName('btn-skip');
    if(!buttons || buttons.length == 0){ return; }

    for(var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.onclick = function() {
            var href = this.getAttribute('data-href');
            getAjax(href, function(){
                setTimeout(fetchCurrentSong, 500);
            });
        }
    }
}

function fetchCurrentSong() {
    getAjax('/control/current', function(res){
        var currentSong = document.getElementById('current-song');
        currentSong.innerText = res.song;
    });
}

(function() {
    assignAjaxButtons();
    assignSkipButtons();
})();