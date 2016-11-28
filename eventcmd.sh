#!/usr/bin/env bash

title="Unknown"
artist="Unknown"
stationName="Unknown"

while read L; do
	k="`echo "$L" | cut -d '=' -f 1`"
	v="`echo "$L" | cut -d '=' -f 2`"
	export "$k=$v"
done < <(grep -e '^\(title\|artist\|album\|stationName\|songStationName\|pRet\|pRetStr\|wRet\|wRetStr\|songDuration\|songPlayed\|rating\|coverArt\|stationCount\|station[0-9]*\)=' /dev/stdin) # don't overwrite $1...

case "$1" in
    songstart)
        echo "$stationName: $title by $artist" > ./current.txt
        ;;
    *)
        echo -e "$1" >> ./log.txt
        ;;
esac