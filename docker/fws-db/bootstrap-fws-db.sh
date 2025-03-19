#!/bin/sh
set -e

if [ ! -d /fws_tables ]; then
  mkdir /fws_tables
fi
if [ ! -d /fws_indexes ]; then
  mkdir /fws_indexes
fi
psql -c "CREATE USER u_fws WITH PASSWORD '$U_FWS_PASSWORD';"
psql -c "CREATE DATABASE fws";
psql -d $FWS_DB_NAME -f "/tmp/fws-setup.sql";
psql -d $FWS_DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"";
