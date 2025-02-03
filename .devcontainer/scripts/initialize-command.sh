#!/bin/sh

set -e

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

PGDATA_VOLUME=$(docker volume ls -q -f "name=pgdata")
PGADMIN_VOLUME=$(docker volume ls -q -f "name=pgadmin")
PGBOOTSTRAP_VOLUME=$(docker volume ls -q -f "name=pgbootstrap")

if [ -z "$PGDATA_VOLUME" ]; then
  docker volume create pgdata
else
  echo Named volume pgdata exists
fi

if [ -z "$PGADMIN_VOLUME" ]; then
  docker volume create pgadmin
else
  echo Named volume pgadmin exists
fi

if [ -z "$PGBOOTSTRAP_VOLUME" ]; then
  docker volume create pgbootstrap
else
  echo Named volume pgbootstrap exists
fi

# Default to configuration required when creating a dev container by cloning the remote
# repository into a container volume.
HOST_DIR=/workspaces/fws-api/

if [ ! -d ${HOST_DIR} ] && ([ -d /opt${HOST_DIR} ] || [ -L /opt${HOST_DIR} ]); then
  # A dev container is being created from a local repository.
  HOST_DIR=/opt${HOST_DIR}
fi

TEMP_CONTAINER=$(docker ps -a -q -f "name=temp")

if [ ! -z "$TEMP_CONTAINER" ]; then
  docker rm temp
  echo Removed temp container
fi

# Create a temporay container to load the database bootstrapping script into a named volume
# used by the database container
# https://stackoverflow.com/questions/37468788/what-is-the-right-way-to-add-data-to-an-existing-named-volume-in-docker
docker container create --name temp -v pgbootstrap:/docker-entrypoint-initdb.d alpine
echo Created temp container
docker cp ${HOST_DIR}/docker/fws-db/bootstrap-fws-db.sh temp:/docker-entrypoint-initdb.d/bootstrap-fws-db.sh
docker rm temp
echo Removed temp container

