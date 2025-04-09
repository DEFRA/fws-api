#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
set -e

sudo docker/scripts/install-packages.sh
docker/scripts/setup-aws-cli-command-completion.sh
docker/scripts/init-npm.sh
docker/scripts/register-lambda-functions.sh
docker/scripts/register-api-gateway.sh
docker exec -it docker-fwsdb-1 bash -c "(cd /tmp && psql -d ${FWS_DB_NAME} -f ./populate-api-keys.sql -f ./target_area_load.sql)"

if [ -d /opt/workspaces/fws-api/docker ]  &&  [`stat -c "%U:%G" /opt/workspaces/fws-api/docker` != vscode:vscode ]; then
  # Ensure that docker directory contents can be modified from within the development container.
  sudo chown -R vscode:vscode /opt/workspaces/fws-api/docker
fi

docker rm docker-liquibase-1
docker image prune -f
