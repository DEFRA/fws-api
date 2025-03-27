#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
set -e

docker/scripts/stop-and-remove-containers.sh
docker/scripts/remove-networks.sh
docker/scripts/remove-volumes.sh
