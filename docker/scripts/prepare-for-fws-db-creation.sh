#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
set -e

# Prepare to clone the fws-db repository using a git
# HTTPS URL by default.
FWS_DB_REPOSITORY_URL=https://github.com/DEFRA/fws-db.git

# If the SSH_AUTH_SOCK environment variable is populated, prepare
# to clone the fws-db repository using a git SSH URL.
if [ ! -z "$SSH_AUTH_SOCK" ]; then
  FWS_DB_REPOSITORY_URL=git@github.com:DEFRA/fws-db.git
fi

if [ -d ../fws-db ]; then
  echo Local fws-db repository exists
elif [ x${FWS_DB_BRANCH} = "x" ]; then
    echo Cloning master branch of fws-db repository
    (cd .. && git clone -b master ${FWS_DB_REPOSITORY_URL})
else
  echo Cloning ${FWS_DB_BRANCH} branch of fws-db repository
  (cd .. && git clone -b ${FWS_DB_BRANCH}  ${FWS_DB_REPOSITORY_URL})
fi

