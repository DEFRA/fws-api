#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
set -e

#Use the docker/.env file to set environment variables. 
set -a
. docker/.env
set +a

# Remove the DEBUG_HOST_ADDRESS environment variable so that
# the debugger can attach to 127.0.0.1 by default (see ../../.vscode/launch.json)
docker/scripts/initialize-named-volumes.sh
docker compose -f docker/infrastructure.yml -f docker/networks.yml -f docker/dev-tools.yml up -d
docker/scripts/register-lambda-functions.sh
docker/scripts/register-api-gateway.sh
docker exec -it docker-fwsdb-1 bash -c "(cd /tmp && psql -d ${FWS_DB_NAME} -f ./populate-api-keys.sql -f ./target_area_load.sql)"
docker rm docker-liquibase-1
