#!/bin/sh
# This script MUST be called from the container workspace folder.
set -e

sudo .devcontainer/scripts/install-packages.sh
.devcontainer/scripts/setup-aws-cli-command-completion.sh
.devcontainer/scripts/install-maven.sh
.devcontainer/scripts/apply-liquibase-changesets.sh
.devcontainer/scripts/init-npm.sh
docker image prune -f
