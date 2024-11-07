#!/bin/sh
# This script MUST be called from the container workspace folder.
set -e

sudo .devcontainer/scripts/install-packages.sh
.devcontainer/scripts/init-npm.sh
