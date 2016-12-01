#!/usr/bin/env bash

is_running(){
    ps -u $(id -u) -o comm | grep -q "^pianobar$"
}

launch(){
    if ! is_running
    then
        nohup pianobar & 2>&1 &disown
        sleep 1
    fi
}

launch
