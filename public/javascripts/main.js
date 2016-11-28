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
    if(!buttons || buttons.length == 0){ console.log('No buttons'); return; }

    for(var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.onclick = function() {
            var href = this.getAttribute('data-href');
            getAjax(href, function(){
                console.log('Success');
            });
        }
    }
}

(function() {
    assignAjaxButtons();
})();