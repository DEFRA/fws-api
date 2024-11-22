#!/bin/sh
set -e
echo current working directory:
pwd
if [ ! -d ../fws_tables ]; then
  mkdir /fws_tables
fi
if [ ! -d ../fws_indexes ]; then
  mkdir /fws_indexes
fi
psql -c "CREATE USER u_fws WITH PASSWORD '$(cat /run/secrets/u_fws_password)';"
psql -c "CREATE DATABASE fws";

