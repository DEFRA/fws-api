#!/bin/sh

set -e

# The macOS version of realpath does not support the -m switch so the GNU version
# is needed.
if [ `uname` = "Darwin" ] && [ x`command -v grealpath` = "x" ]; then
  echo "GNU coreutils need to be installed to use realpath with the -m switch"
  exit 1
fi

# If running on macOS use the GNU version of realpath.
if [ `uname` = "Darwin" ]; then
  alias realpath="grealpath"
fi

PGDATA_VOLUME=$(docker volume ls -q -f "name=pgdata")
PGADMIN_VOLUME=$(docker volume ls -q -f "name=pgadmin")
PGBOOTSTRAP_VOLUME=$(docker volume ls -q -f "name=pgbootstrap")
LIQUIBASE_VOLUME=$(docker volume ls -q -f "name=liquibase")

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

if [ -z "$LIQUIBASE_VOLUME" ]; then
  docker volume create liquibase
else
  echo Named volume liquibase exists
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

PG_TEMP_CONTAINER=$(docker ps -a -q -f "name=pgbootstraptemp")

if [ ! -z "$PG_TEMP_CONTAINER" ]; then
  docker rm pgbootstraptemp
  echo Removed pgbootstraptemp container
fi

# Create a temporary container to load the database bootstrapping script into a named volume
# used by the database container.
# https://stackoverflow.com/questions/37468788/what-is-the-right-way-to-add-data-to-an-existing-named-volume-in-docker
docker container create --name pgbootstraptemp -v pgbootstrap:/docker-entrypoint-initdb.d alpine
echo Created pgbootstraptemp container
echo $FWS_API_HOST_DIR **
docker cp ${FWS_API_HOST_DIR}/docker/fws-db/bootstrap-fws-db.sh pgbootstraptemp:/docker-entrypoint-initdb.d/bootstrap-fws-db.sh
docker rm pgbootstraptemp
echo Removed pgbootstraptemp container

LIQUIBASE_TEMP_CONTAINER=$(docker ps -a -q -f "name=liquibasetemp")

if [ ! -z "$LIQUIBASE_TEMP_CONTAINER" ]; then
  docker rm liquibasetemp
  echo Removed liquibasetemp container
fi

# Create a temporary container to facilitate liquibase bootstrapping through a named volume
# used by the Liquibase container.
# https://stackoverflow.com/questions/37468788/what-is-the-right-way-to-add-data-to-an-existing-named-volume-in-docker
docker container create --name liquibasetemp -v liquibase:/fwsdb alpine
echo Created liquibasetemp container
(cd `realpath -m ${FWS_API_HOST_DIR}`/../fws-db/u_fws && docker cp . liquibasetemp:/fwsdb)
docker rm liquibasetemp
echo Removed liquibasetemp container