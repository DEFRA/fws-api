#!/bin/sh
set -e

FWS_NETWORK=$(docker network ls -q -f "name=fws")

if [ ! -z "$FWS_NETWORK" ]; then
  docker network rm -f $(docker network ls -f name=fws --format json | jq -r .Name)
fi
