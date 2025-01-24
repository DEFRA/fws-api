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

if [ `uname` != "Linux" ] && [ `uname` != "Darwin" ]; then
  echo "Unsupported operating system `uname` detected - Linux and  macOS are supported"
  exit 1
fi

# Ensure that local/remote repository contents are available in a dev container directory compatible with Linux and macOS.
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

# To support dev container creation by cloning into a container volume, a bootstrap container is used that makes the
# remote repository contents available within /workspaces/fws-api
# (see https://github.com/microsoft/vscode-remote-release/issues/6891).
# This location appears to be non-configurable. For running and debugging to work, the source code MUST be available in the
# same directory structure on the host machine.
FWS_API_VOLUME_WORKSPACE_DIR=/workspaces/fws-api

# To support dev container creation by cloning into a container volume on a Linux host, provide the required directory
# structure by creating a symbolic link from /workspaces/fws-api to the macOS compatible local repository location
# /opt/fws-api. If a local repository has been cloned to somewhere other than /opt/fws-api, this results in two symbolic
# links leading to the local repository on the host. For example:
# /workspaces/fws-api -> /opt/workspaces/fws-api -> /path/to/local/fws-api
#
# As macOS does not support creating content under / by default
# (see https://apple.stackexchange.com/questions/388236/unable-to-create-folder-in-root-of-macintosh-hd),
# /workspaces/fws-api cannot be created. Container volume based running/debugging is NOT supported using default
# macOS configuration accordingly.
if [ `uname` = "Linux" ] && [ ! -L "$FWS_API_VOLUME_WORKSPACE_DIR" ] && [ $(realpath -m "$FWS_API_VOLUME_WORKSPACE_DIR") != $(realpath -m "$FWS_API_WORKSPACE_DIR") ]; then
  mkdir -p /workspaces
  ln -s "$FWS_API_WORKSPACE_DIR" "$FWS_API_VOLUME_WORKSPACE_DIR"
  echo Created symbolic link from "$FWS_API_VOLUME_WORKSPACE_DIR" to "$FWS_API_WORKSPACE_DIR"
elif [ `uname` = "Darwin" ]; then
  echo "macOS detected - WARNING - Running/debugging is only supported when creating a dev container from a local fws-api repository"
fi

if [ $(realpath -m "$FWS_API_VOLUME_WORKSPACE_DIR") = $(realpath -m "$FWS_API_WORKSPACE_DIR") ]; then
  echo "$FWS_API_VOLUME_WORKSPACE_DIR" references "$FWS_API_WORKSPACE_DIR"
fi
