#!/usr/bin/env bash
action=$1
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export DEBUG="pcw pcw-io"

if [ -z "${PCW_IO_HOME}" ]; then
    export PCW_IO_HOME="${SCRIPT_DIR}/.."
fi

if [ ! -d "${PCW_IO_HOME}" ]; then
    echo -e "PCW_IO_HOME (${PCW_IO_HOME} is invalid, aborting..."
    exit 1
fi

cd "${PCW_IO_HOME}"

start() {
    nohup /usr/bin/node bin/pcw-io > pcw-io.log 2>&1&
    echo $! > pcw-io.pid
    sleep 1
}

stop() {
    if [ -e "pcw-io.pid" ]; then
        pid=$(cat "pcw-io.pid")
        rm -f "pcw-io.pid"
        kill ${pid}
    fi
}

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
    *)
        echo -e "Usage: pcw-io {start|stop|restart}"
        ;;
esac
