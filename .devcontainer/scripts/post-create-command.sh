#!/bin/sh
set -e

(
  cd ${containerWorkspaceFolder}
  sudo .devcontainer/scripts/install-packages.sh
  .devcontainer/scripts/init-npm.sh
)
