#!/bin/sh
set -e

docker volume rm -f pgadmin pgdata vscode
docker volume rm $(docker volume ls --format json | jq -r .Name)