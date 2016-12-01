#!/usr/bin/env bash
VERBOSE=0
user=$(whoami)
user_home="${HOME}"
dir_set=0

is_running() {
    if [ ! -e "${PCW_HOME}/pcw.pid" ]; then
        return 1
    else
        ps -p $(cat "${PCW_HOME}/pcw.pid") > /dev/null;
        return $!
    fi
}

start() {
    if is_running; then
        echo -e "ERROR: Already running" 1>&2
        exit 1
    fi

    cd "${PCW_HOME}"
    nohup /usr/bin/node bin/ws > pcw.log 2>&1 & echo $! > "${PCW_HOME}/pcw.pid"
    sleep 2

    if ! ps -p `cat "${PCW_HOME}/pcw.pid"` > /dev/null; then
        echo -e "ERROR: Could not start server process" 1>&2
        rm -f "${PCW_HOME}/pcw.pid"
        exit 1
    fi
}

stop() {
    if [ -e "${PCW_HOME}/pcw.pid" ]; then
        pid=$(cat "${PCW_HOME}/pcw.pid")
        rm -f "${PCW_HOME}/pcw.pid"
        kill ${pid}
    else
        if ps aux | grep -q '[/usr]/bin/node bin/ws'; then
            kill $(ps aux | grep '[/usr]/bin/node bin/ws' | awk '{print $2}')
        fi
    fi

    sleep 1
    # Also kill any left over pianobar instances
    if ps aux | grep -q '[p]ianobar'; then
        kill -9 $(ps aux | grep '[p]ianobar' | awk '{print $2}')
    fi
    rm -f "${PCW_HOME}/pianobar.pid"
}

status() {
    if is_running; then
        echo -e "Service is running with PID `cat ${PCW_HOME}/pcw.pid`"
    else
        echo -e "Service is NOT running"
    fi
}

usage() {
    echo -e "Usage: pcw {start|stop|restart|status}"
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

if [ -z "$DEBUG" ]; then
    export DEBUG="pcw pcw-io"
fi

if [ -z "$PCW_CTL_FILE" ]; then
    export PCW_CTL_FILE="${user_home}/.config/pianobar/ctl"
    dir_set=1
fi

if [ -z "${user_home}" ] && [ ${dir_set} -eq 1 ]; then
    echo -e "ERROR: Could not determine home directory for user '${user}' and missing PCW_HOME or PCW_CTL_FILE environment values." 1>&2
    echo -e "Either explicitly set the environment variables or user's \$HOME directory."
    exit 1
fi

if [ ${dir_set} -eq 1 ] && [ ${VERBOSE} -eq 1 ]; then
    echo -e "USER=${user}"
    echo -e "HOME=${user_home}"
    echo -e "PCW_HOME=${PCW_HOME}"
    echo -e "PCW_CTL_FILE=${PCW_CTL_FILE}"
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
    *)
        echo -e "Unknown: ${action}" 1>&2
        usage
        exit 1
        ;;
esac
