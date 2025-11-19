#!/bin/sh
set -e

FWS_NETWORK=$(docker network ls -q -f "name=docker_ls")

if [ ! -z "$FWS_NETWORK" ]; then
  docker network rm -f $(docker network ls -f name=docker_ls --format json | jq -r .Name)
fi
