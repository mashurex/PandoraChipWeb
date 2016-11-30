#!/usr/bin/env bash

title="Unknown"
artist="Unknown"
stationName="Unknown"
album=""
coverArt=""
stations=""

while read L; do
	k="`echo "$L" | cut -d '=' -f 1`"
	v="`echo "$L" | cut -d '=' -f 2`"
	export "$k=$v"
	if echo "$k" | grep -q '^station[0-9]\{1,\}$'; then
	    stations="${stations};${k}|${v}"
	fi
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
        echo -e "$stations" > "$PCW_HOME/stations.txt"
        curl -X POST http://localhost:3000/songstart
        ;;
    *)
        echo -e "$1" >> "$PCW_HOME/log.txt"
        ;;
esac