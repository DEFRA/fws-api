#!/bin/sh
# This script MUST be run on the host before bootstrapping to run/debug Lambda functions using rootless Docker
# without a dev container.

set -e

if [ `whoami` != root ]; then
  echo This script must be run as root
  exit 1
fi

HOST_UID=$(id -u "$FWS_API_HOST_USERNAME")
DOCKER_SOCKET=/var/run/docker.sock
ROOTLESS_DOCKER_SOCKET=/run/user/$HOST_UID/docker.sock
FWS_API_WORKSPACE_DOCKER_DIR=/workspaces/fws-api/docker

if [ ! -d "$LOCAL_FWS_API_DIR"/.git ] && [ x`echo $"$LOCAL_FWS_API_DIR" | grep -E /fws-api/?$` = "x" ]; then
 echo LOCAL_FWS_API_DIR must be set to the absolute path of the root of a local fws-api repository
 exit 1
fi

# Check if /var/run/docker.sock is a symbolic link referencing the rootless Docker Socket
if [ $(realpath -m "$DOCKER_SOCKET") = /run/docker.sock ]; then
  # Backup rootful /var/run/docker.sock
  mv "$DOCKER_SOCKET" "$DOCKER_SOCKET".rootful
  echo Rootful docker socket backed up to "$DOCKER_SOCKET".rootful

  # Ensure /var/run/docker.sock references the rootless Docker socket
  ln -s "$ROOTLESS_DOCKER_SOCKET" "$DOCKER_SOCKET"
  echo Created symbolic link from "$DOCKER_SOCKET" to "$ROOTLESS_DOCKER_SOCKET"
fi

if [ $(realpath -m "$DOCKER_SOCKET") = "$ROOTLESS_DOCKER_SOCKET" ]; then
  echo "$DOCKER_SOCKET" references "$ROOTLESS_DOCKER_SOCKET"
fi
