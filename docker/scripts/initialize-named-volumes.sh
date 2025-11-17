#!/bin/sh

set -e

DARWIN="Darwin"

# The macOS version of realpath does not support the -m switch so the GNU version
# is needed.
if [ $(uname) = DARWIN ] && [ x$(command -v grealpath) = "x" ]; then
  echo "GNU coreutils need to be installed to use realpath with the -m switch"
  exit 1
fi

# If running on macOS use the GNU version of realpath.
if [ $(uname) = DARWIN ]; then
  alias realpath="grealpath"
fi

PGDATA_VOLUME=$(docker volume ls -q -f "name=fwspgdata")
PGADMIN_VOLUME=$(docker volume ls -q -f "name=fwspgadmin")
PGBOOTSTRAP_VOLUME=$(docker volume ls -q -f "name=fwspgbootstrap")
LIQUIBASE_VOLUME=$(docker volume ls -q -f "name=fwsliquibase")

if [ -z "$PGDATA_VOLUME" ]; then
  docker volume create fwspgdata
else
  echo Named volume fwspgdata exists
fi

if [ -z "$PGADMIN_VOLUME" ]; then
  docker volume create fwspgadmin
else
  echo Named volume fwspgadmin exists
fi

if [ -z "$PGBOOTSTRAP_VOLUME" ]; then
  docker volume create fwspgbootstrap
else
  echo Named volume fwspgbootstrap exists
fi

if [ -z "$LIQUIBASE_VOLUME" ]; then
  docker volume create fwsliquibase
else
  echo Named volume fwsliquibase exists
fi

# Default to configuration required when creating a development container by cloning the remote
# repository into a container volume.
FWS_API_HOST_DIR=/workspaces/fws-api/

if [ ! -d ${FWS_API_HOST_DIR} ] && ([ -d /opt${FWS_API_HOST_DIR} ] || [ -L /opt${FWS_API_HOST_DIR} ]); then
  # A development container is being created from a local repository.
  FWS_API_HOST_DIR=/opt${FWS_API_HOST_DIR}
elif [ x"$LOCAL_FWS_API_DIR"  != "x" ] && [ -d ${LOCAL_FWS_API_DIR} ]; then
  # A development container is not being created.
  FWS_API_HOST_DIR=${LOCAL_FWS_API_DIR}
fi

PG_TEMP_CONTAINER=$(docker ps -a -q -f "name=fwspgbootstraptemp")

if [ ! -z "$PG_TEMP_CONTAINER" ]; then
  docker rm fwspgbootstraptemp
  echo Removed fwspgbootstraptemp container
fi

# Create a temporary container to load the database bootstrapping script into a named volume
# used by the database container.
# https://stackoverflow.com/questions/37468788/what-is-the-right-way-to-add-data-to-an-existing-named-volume-in-docker
docker container create --name fwspgbootstraptemp -v fwspgbootstrap:/docker-entrypoint-initdb.d alpine
echo Created fwspgbootstraptemp container
docker cp ${FWS_API_HOST_DIR}/docker/fws-db/bootstrap-fws-db.sh fwspgbootstraptemp:/docker-entrypoint-initdb.d/bootstrap-fws-db.sh
docker rm fwspgbootstraptemp
echo Removed fwspgbootstraptemp container

LIQUIBASE_TEMP_CONTAINER=$(docker ps -a -q -f "name=fwsliquibasetemp")

if [ ! -z "$LIQUIBASE_TEMP_CONTAINER" ]; then
  docker rm fwsliquibasetemp
  echo Removed fwsliquibasetemp container
fi

# Create a temporary container to facilitate liquibase bootstrapping through a named volume
# used by the Liquibase container.
# https://stackoverflow.com/questions/37468788/what-is-the-right-way-to-add-data-to-an-existing-named-volume-in-docker
docker container create --name fwsliquibasetemp -v fwsliquibase:/fwsdb alpine
echo Created fwsliquibasetemp container
(cd $(realpath -m ${FWS_API_HOST_DIR})/../fws-db/u_fws && docker cp . fwsliquibasetemp:/fwsdb)
docker rm fwsliquibasetemp
echo Removed fwsliquibasetemp container