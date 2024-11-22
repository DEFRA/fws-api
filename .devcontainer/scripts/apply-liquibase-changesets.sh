#!/bin/sh
set -e

cp docker/fws-db/pom.xml ../fws-db/u_fws/pom.xml

export FWS_DB_USERNAME=$(cat /run/secrets/fws_db_username)
export FWS_DB_PASSWORD=$(cat /run/secrets/fws_db_password)
export FWS_DB_URL=$(cat /run/secrets/fws_db_url)

# Ensure mvn is on the PATH.
. ~/.profile
(cd ../fws-db/u_fws && mvn liquibase:update)
