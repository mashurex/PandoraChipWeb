#!/usr/bin/env bash
VERBOSE=0
user=$(whoami)
user_home="${HOME}"
dir_set=0
PID_FILE=${PCW_HOME}/pianobar.pid

is_running() {

    if [ ! -e "${PID_FILE}" ]; then
        return 1
    else
        ps -p $(cat "${PID_FILE}") > /dev/null;
        return $!
    fi
}

start() {
    if is_running; then
        echo -e "ERROR: Already running" 1>&2
        exit 10
    fi

    cd "${PCW_HOME}"
    nohup pianobar > /dev/null 2>&1 & echo $! > "${PID_FILE}"
    sleep 2

    if ! ps -p `cat "${PID_FILE}"` > /dev/null; then
        echo -e "ERROR: Could not start pianobar" 1>&2
        rm -f "${PID_FILE}"
        exit 1
    fi
}

stop() {
    if [ -e "${PID_FILE}" ]; then
        pid=$(cat "${PID_FILE}")
        echo -e "Stopping process ${pid}..."
        kill ${pid}
        sleep 2
    fi

    rm -f "${PID_FILE}"
    # Also forcibly kill any left over pianobar instances
    if ps aux | grep -q '[p]ianobar$'; then
        kill -9 $(ps aux | grep '[p]ianobar$' | awk '{print $2}')
    fi
}

status() {
    if is_running; then
        echo -e "pianobar is running with PID `cat ${PID_FILE}`"
        exit 0
    else
        echo -e "pianobar is NOT running"
        exit 0
    fi
}

statval() {
    if is_running; then
        exit 0
    else
        exit 1
    fi
}

usage() {
    echo -e "Usage: pbctl {start|stop|restart|status|statval}"
}

action=$1

if [ -z "${action}" ]; then
   usage
   exit 1
fi

if [ -z "$PCW_HOME" ]; then
    export PCW_HOME="${user_home}/pandorachipweb"
    dir_set=1
fi

if [ -z "${user_home}" ] && [ ${dir_set} -eq 1 ]; then
    echo -e "ERROR: Could not determine home directory for user '${user}' and missing PCW_HOME." 1>&2
    echo -e "Either explicitly set the environment variables or user's \$HOME directory."
    exit 1
fi

case "${action}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    status)
        status
        ;;
    statval)
        statval
        ;;
    *)
        echo -e "Unknown: ${action}" 1>&2
        usage
        exit 1
        ;;
esac