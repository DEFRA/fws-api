#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
set -e

.devcontainer/scripts/prepare-for-fws-db-creation.sh
