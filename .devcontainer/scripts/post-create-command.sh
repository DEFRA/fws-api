#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
set -e

sudo .devcontainer/scripts/install-packages.sh
.devcontainer/scripts/setup-aws-cli-command-completion.sh
.devcontainer/scripts/install-maven.sh
.devcontainer/scripts/apply-liquibase-changesets.sh
docker exec -it fws-api_devcontainer-fwsdb-1 psql -d $(cat /run/secrets/fws_db_name) -f /tmp/populate-api-keys.sql
.devcontainer/scripts/init-npm.sh
.devcontainer/scripts/register-lambda-functions.sh
.devcontainer/scripts/set-environment-variables-for-lambda-functions.sh
.devcontainer/scripts/register-api-gateway.sh
docker image prune -f
