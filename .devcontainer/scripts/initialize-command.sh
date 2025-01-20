#!/bin/sh

set -e

# NOTE - When running a dev container from a repository cloned into a container
# volume this script runs in a container used for bootstrapping rather than
# the host machine - see https://github.com/microsoft/vscode-remote-release/issues/6891
#
# The bootstrap container does not have access to custom environment variables on
# the host machine and this appears to prevent sourcing docker secrets from
# custom host machine environment variables accordingly.
#
# As a workaround, docker secrets are sourced from files on the host machine and use of limited
# environment variables that are available to the bootstrap container (such as HOME).
# This results in an ability to source docker secrets from the host machine without
# reliance on creating a dev container from a local repository on the filesystem
# of the host machine.
#
# While there are no such problems when creating a dev contaner from a local repository,
# cloning a repository into a container volume is recommended to improve performance
# - see https://code.visualstudio.com/remote/advancedcontainers/improve-performance

# Regardless of whether a dev container uses a container volume or a bind mount to a
# local repository, named volumes are created on the host machne.
docker volume create pgdata
docker volume create pgadmin

