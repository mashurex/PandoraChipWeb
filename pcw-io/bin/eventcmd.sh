#!/usr/bin/env bash

title="Unknown"
artist="Unknown"
stationName="Unknown"
album=""
coverArt=""
stations=""

if [ -z "${PCW_HOME}" ]; then
    echo -e "ERROR: PCW_HOME is NOT set, aborting..."
    exit 1
fi

input=""
while read L; do
    k="`echo "$L" | cut -d '=' -f 1`"
    v="`echo "$L" | cut -d '=' -f 2`"
    export "$k=$v"
    # Build up stations list of station1,station2,etc...
    if echo "$k" | grep -q '^station[0-9]\{1,\}$'; then
        stations="${stations};${k}|${v}"
    else
        input=$(printf "${input}|${k}=${v}")
    fi
done < <(grep -e '^\(title\|artist\|album\|stationName\|songStationName\|pRet\|pRetStr\|wRet\|wRetStr\|songDuration\|songPlayed\|rating\|coverArt\|stationCount\|station[0-9]*\)=' /dev/stdin) # don't overwrite $1...

req="{\"station\":\"${stationName}\",\"title\":\"${title}\",\"artist\":\"${artist}\",\"album\":\"${album}\",\"coverArt\":\"${coverArt}\",\"rating\":\"${rating}\",\"songDuration\":\"${songDuration}\",\"songPlayed\":\"${songPlayed}\"}"

case "$1" in
    songstart)
        cat > "${PCW_HOME}/current.txt" << EOL
station=${stationName}
songStationName=${songStationName}
title=${title}
artist=${artist}
album=${album}
coverArt=${coverArt}
songDuration=${songDuration}
songPlayed=${songPlayed}
rating=${rating}
EOL
        curl -s -X POST  -H 'Content-Type: application/json' -d "${req}" http://localhost:3000/songstart 2>/dev/null
        ;;
    songfinish)
        cat > "${PCW_HOME}/current.txt" << EOL
station=${stationName}
songStationName=${songStationName}
title=${title}
artist=${artist}
album=${album}
coverArt=${coverArt}
songDuration=${songDuration}
songPlayed=${songPlayed}
rating=${rating}
EOL
        curl -s -X POST  -H 'Content-Type: application/json' -d "${req}" http://localhost:3000/songfinish 2>/dev/null
        ;;
    userlogin)
        curl -s -X POST  -H 'Content-Type: application/json' -d "{\"input\":\"${input}\"}" http://localhost:3000/userlogin 2>/dev/null
        ;;
    usergetstations)
        echo -e "$stations" > "${PCW_HOME}/stations.txt"
        curl -s -X POST  -H 'Content-Type: application/json' -d "{\"stations\":\"${stations}\"}" http://localhost:3000/usergetstations 2>/dev/null
        ;;
    *)
        TIMESTAMP=`date "+%Y%m%d-%H%M%S"`
        printf "[${1}|${TIMESTAMP}] ${input}\n==\n${stations}\n=========\n\n" >> $PCW_HOME/input.txt
        curl -s -X POST  -H 'Content-Type: application/json' -d "{\"command\": \"${1}\", \"input\": \"${input}\", \"stations\":\"${stations}\"}" http://localhost:3000/pbevent 2>/dev/null
        ;;
esac

if [ "$pRet" != "1" ]; then
    curl -s -X POST -H 'Content-Type: application/json' -d "{\"pRet\": \"${pRet}\", \"message\": \"${pRetStr}\"}" http://localhost:3000/pberr 2>/dev/null
elif [ "$wRet" != "1" ]; then
    if [ "${wRetStr}" != "No error" ]; then
        curl -s -X POST -H 'Content-Type: application/json' -d "{\"wRet\": \"${wRet}\", \"message\": \"${wRetStr}\"}" http://localhost:3000/pberr 2>/dev/null
    fi
fi
