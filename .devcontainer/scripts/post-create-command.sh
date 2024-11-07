#!/bin/sh
set -e

(
  cd /workspaces/fws-api
  sudo .devcontainer/scripts/install-packages.sh
  .devcontainer/scripts/init-npm.sh
)

