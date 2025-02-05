#!/bin/sh
set -e

docker volume rm -f pgadmin pgdata vscode pgbootstrap

FWS_VOLUME=$(docker volume ls -q -f "name=fws")

if [ ! -z "$FWS_VOLUME" ]; then
  docker volume rm -f $(docker volume ls -f name=fws --format json | jq -r .Name)
fi

