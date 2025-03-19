#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
set -e

.devcontainer/scripts/stop-and-remove-containers.sh
.devcontainer/scripts/remove-networks.sh
.devcontainer/scripts/remove-volumes.sh
