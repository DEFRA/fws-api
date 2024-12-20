#!/bin/sh
# This script MUST be run before attempting to create a dev container using rootless Docker.
set -e

if [ `whoami` != root ]; then
  echo This script must be run as root
  exit 1
fi

HOST_UID=$(id -u "$FWS_API_HOST_USERNAME")
HOST_GID=$(id -g "$FWS_API_HOST_USERNAME")
HOST_SUBGID=$(echo $(cat /etc/subgid | grep `echo $FWS_API_HOST_USERNAME` | cut -d ':' -f 2))

if [ x"$HOST_SUBGID" = "x" ]; then
  echo The host user $FWS_API_HOST_USERNAME does not have a subgid entry in /etc/subgid
  exit 1
fi

DEV_CONTAINER_GID_ON_HOST=`echo $((($HOST_SUBGID + $HOST_GID) - 1))`
DEV_CONTAINER_DOCKER_GID_ON_HOST=$((($HOST_SUBGID + `getent group docker | cut -d ':' -f 3`) - 1))
DOCKER_SOCKET=/var/run/docker.sock
ROOTLESS_DOCKER_SOCKET=/run/user/$HOST_UID/docker.sock
FWS_API_WORKSPACE_DIR=/workspaces/fws-api

if [ ! -d "$LOCAL_FWS_API_DIR"/.git ] && [ x`echo $"$LOCAL_FWS_API_DIR" | grep -E /fws-api/?$` = "x" ]; then
 echo LOCAL_FWS_API_DIR must be set to the absolute path of the root of a local fws-api repository
 exit 1
fi

# Check if /var/run/docker.sock is a symbolic link referencing the rootless Docker Socket
if [ $(realpath -m "$DOCKER_SOCKET") = /run/docker.sock ]; then
  # Backup rootful /var/run/docker.sock
  mv "$DOCKER_SOCKET" "$DOCKER_SOCKET".rootful
  echo Rootful docker socket backed up to "$DOCKER_SOCKET".rootful

   # Ensure the dev container docker user has access to the rootless Docker socket
  chgrp "$DEV_CONTAINER_DOCKER_GID_ON_HOST" "$ROOTLESS_DOCKER_SOCKET"
  echo Dev container host group "$DEV_CONTAINER_GID_ON_HOST" has been granted read write access to "$ROOTLESS_DOCKER_SOCKET"

  # Ensure /var/run/docker.sock references the rootless Docker socket
  ln -s "$ROOTLESS_DOCKER_SOCKET" "$DOCKER_SOCKET"
  echo Created symbolic link from "$DOCKER_SOCKET" to "$ROOTLESS_DOCKER_SOCKET"
fi

if [ $(realpath -m "$DOCKER_SOCKET") = "$ROOTLESS_DOCKER_SOCKET" ]; then
  echo "$DOCKER_SOCKET" references "$ROOTLESS_DOCKER_SOCKET"
fi

# If creating a dev container from a local fws-api repository:
#   - The host user needs to retain ownership of local repository items to prevent git from reporting dubious ownership.
#   - The dev container user needs read write access to /workspaces/fws-api on the host machine so that changes can be written
#     from within the dev container.
#
#  This is achieved by:
#  - creating /workspaces/fws-api as a symbolic link to the local fws-api repository root.
#  - changing the GID of local fws-api repository items to be the GID of the dev container user.
#
# This approach also allows the host user to make changes using the local fws-api repository on the host filesystem.
#
# If creating a dev container by cloning the fws-api repository into a container volume, the dev container user has ownership
# of items in the volume without causing git to report dubious ownership.
if [ ! -L "$FWS_API_WORKSPACE_DIR" ] && [ $(realpath -m "$FWS_API_WORKSPACE_DIR") != $(realpath -m "$LOCAL_FWS_API_DIR") ]; then
  mkdir -p /workspaces
  ln -s "$LOCAL_FWS_API_DIR" "$FWS_API_WORKSPACE_DIR"
  echo Created symbolic link from "$FWS_API_WORKSPACE_DIR" to "$LOCAL_FWS_API_DIR"
  chgrp -R "$DEV_CONTAINER_GID_ON_HOST" "$LOCAL_FWS_API_DIR"
  echo Dev container host group "$DEV_CONTAINER_GID_ON_HOST" has been granted recursive read write access to "$LOCAL_FWS_API_DIR"
fi

if [ $(realpath -m "$FWS_API_WORKSPACE_DIR") = $(realpath -m "$LOCAL_FWS_API_DIR") ]; then
  echo "$FWS_API_WORKSPACE_DIR" references "$LOCAL_FWS_API_DIR"
fi
