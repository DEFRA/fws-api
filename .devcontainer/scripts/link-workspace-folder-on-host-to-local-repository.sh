#!/bin/sh
# This script MUST be run on the host before attempting to create a dev container.
set -e

if [ `whoami` != root ]; then
  echo This script must be run as root
  exit 1
fi

if [ ! -d "$LOCAL_FWS_API_DIR"/.git ] && [ x`echo $"$LOCAL_FWS_API_DIR" | grep -E /fws-api/?$` = "x" ]; then
 echo LOCAL_FWS_API_DIR must be set to the absolute path of the root of a local fws-api repository
 exit 1
fi

FWS_API_WORKSPACE_DIR=/opt/workspaces/fws-api

# A Docker Compose based dev container requires a workspace folder (see https://containers.dev/implementors/json_reference/).
# If creating a dev container from a local fws-api repository, the dev container user needs read write access to the workspace
# folder from within the dev container.
#
# Create a symbolic link from the local repository on the host to the workspace folder.
if [ ! -L "$FWS_API_WORKSPACE_DIR" ] && [ $(realpath -m "$FWS_API_WORKSPACE_DIR") != $(realpath -m "$LOCAL_FWS_API_DIR") ]; then
  mkdir -p /opt/workspaces
  ln -s "$LOCAL_FWS_API_DIR" "$FWS_API_WORKSPACE_DIR"
  echo Created symbolic link from "$FWS_API_WORKSPACE_DIR" to "$LOCAL_FWS_API_DIR"
fi

if [ $(realpath -m "$FWS_API_WORKSPACE_DIR") = $(realpath -m "$LOCAL_FWS_API_DIR") ]; then
  echo "$FWS_API_WORKSPACE_DIR" references "$LOCAL_FWS_API_DIR"
fi
