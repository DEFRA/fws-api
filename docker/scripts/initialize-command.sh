#!/bin/sh

set -e

# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
#
# NOTE - When running a dev container from a repository cloned into a container
# volume this script runs in a container used for bootstrapping rather than on
# the host machine - see https://github.com/microsoft/vscode-remote-release/issues/6891
#
# The bootstrap container does not have access to custom environment variables on
# the host machine and the dev container .env file MUST be used to configure
# non-sensitive environment variables and well known secrets accordingly.
#
# Cloning a repository into a container volume is recommended to improve performance
# - see https://code.visualstudio.com/remote/advancedcontainers/improve-performance

# IMPORTANT
# Regardless of whether a dev container uses a container volume or a bind mount to a
# local repository, named volumes are created on the host machine. Named volumes
# ensure portability across the host plaforms used to create and run dev containers.

docker/scripts/prepare-for-fws-db-creation.sh
docker/scripts/initialize-named-volumes.sh

