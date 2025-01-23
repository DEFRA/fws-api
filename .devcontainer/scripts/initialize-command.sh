#!/bin/sh

set -e

# NOTE - When running a dev container from a repository cloned into a container
# volume this script runs in a container used for bootstrapping rather than on
# the host machine - see https://github.com/microsoft/vscode-remote-release/issues/6891
#
# The bootstrap container does not have access to custom environment variables on
# the host machine and the dev container .env file MUST be used to configure
# non-sensitive environment variables/well known secrets accordingly.
#
# Cloning a repository into a container volume is recommended to improve performance
# - see https://code.visualstudio.com/remote/advancedcontainers/improve-performance

# Regardless of whether a dev container uses a container volume or a bind mount to a
# local repository, named volumes are created on the host machine.

docker volume create pgdata
docker volume create pgadmin
docker volume create pgbootstrap
whoami
pwd
find / -name fws-db/bootstrap-fws-db.sh
docker container create --name temp -v pgbootstrap:/docker-entrypoint-initdb.d alpine
docker cp /opt/workspaces/fws-api/docker/fws-db/bootstrap-fws-db.sh temp:/docker-entrypoint-initdb.d/bootstrap-fws-db.sh
docker rm temp
