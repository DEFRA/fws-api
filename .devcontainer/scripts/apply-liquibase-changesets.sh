#!/bin/sh
set -e

cp docker/fws-db/pom.xml ../fws-db/u_fws/pom.xml

# Ensure mvn is on the PATH.
. ~/.profile
(cd ../fws-db/u_fws && mvn liquibase:update)
