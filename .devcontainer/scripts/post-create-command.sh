#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
set -e

sudo .devcontainer/scripts/install-packages.sh
.devcontainer/scripts/setup-aws-cli-command-completion.sh
.devcontainer/scripts/install-maven.sh
.devcontainer/scripts/apply-liquibase-changesets.sh
docker exec -it fws-api_devcontainer-fwsdb-1 bash -c "(cd /tmp && psql -d ${FWS_DB_NAME} -f ./populate-api-keys.sql -f ./target_area_load.sql)"
.devcontainer/scripts/init-npm.sh
.devcontainer/scripts/register-lambda-functions.sh
.devcontainer/scripts/register-api-gateway.sh
docker image prune -f
