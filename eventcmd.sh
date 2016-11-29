#!/usr/bin/env bash

title="Unknown"
artist="Unknown"
stationName="Unknown"
album=""
coverArt=""
station=""

while read L; do
	k="`echo "$L" | cut -d '=' -f 1`"
	v="`echo "$L" | cut -d '=' -f 2`"
	export "$k=$v"
done < <(grep -e '^\(title\|artist\|album\|stationName\|songStationName\|pRet\|pRetStr\|wRet\|wRetStr\|songDuration\|songPlayed\|rating\|coverArt\|stationCount\|station[0-9]*\)=' /dev/stdin) # don't overwrite $1...

case "$1" in
    songstart)
        cat > "$PCW_HOME/current.txt" << EOL
station=${stationName}
title=${title}
artist=${artist}
album=${album}
coverArt=${coverArt}
EOL
        curl -X POST http://localhost:3000/control/songstart
        ;;
    *)
        echo -e "$1" >> "$PCW_HOME/log.txt"
        ;;
esac

# curl --data "event=${1}&station=${station}&title=${title}&artist=${artist}&album=${album}&coverArt=${coverArt}" http://localhost:3000/control/update