#!/bin/sh
set -e

if [ ! -d /fws_tables ]; then
  mkdir /fws_tables
fi
if [ ! -d /fws_indexes ]; then
  mkdir /fws_indexes
fi
psql -c "CREATE USER u_fws WITH PASSWORD '$(cat /run/secrets/u_fws_password)';"
psql -c "CREATE DATABASE fws";
psql -d $(cat /run/secrets/fws_db_name) -f "/tmp/fws-setup.sql";
psql -d $(cat /run/secrets/fws_db_name) -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"";
