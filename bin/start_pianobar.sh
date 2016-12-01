#!/usr/bin/env bash

is_running(){
    ps -u $(id -u) -o comm | grep -q "^pianobar$"
}

launch(){
    if ! is_running
    then
        nohup pianobar > /dev/null 2>&1 & echo $! > "${PCW_HOME}/pianobar.pid"
        sleep 1
    fi
}

launch
