#!/bin/sh
# This script MUST be called from the container workspace folder.
set -e

if [ -d ../fws-db ]; then
  echo Local fws-db repository exists
elif [ x${FWS_DB_BRANCH} = "x" ]; then
    echo Cloning master branch of fws-db repository
    (cd .. && git clone -b master git@github.com:DEFRA/fws-db.git)
else
  echo Cloning ${FWS_DB_BRANCH} branch of fws-db repository
  (cd .. && git clone -b ${FWS_DB_BRANCH} git@github.com:DEFRA/fws-db.git)
fi

