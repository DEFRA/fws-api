#!/bin/sh
set -e

docker volume rm -f pgadmin pgdata vscode
docker volume rm -f $(docker volume ls -f name=fws --format json | jq -r .Name)