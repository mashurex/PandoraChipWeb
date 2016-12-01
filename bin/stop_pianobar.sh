#!/usr/bin/env bash
if [ -f "${PCW_HOME}/pianobar.pid" ]; then
    kill `cat "${PCW_HOME}/pianobar.pid"`
    rm -f "${PCW_HOME}/pianobar.pid"
else
    echo -e "No pianobar.pid at ${PCW_HOME}/pianobar.pid"
fi