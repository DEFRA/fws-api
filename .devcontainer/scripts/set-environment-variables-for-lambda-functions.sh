#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
set -e

export FWS_DB_USERNAME=$(cat /run/secrets/fws_db_username)
export FWS_DB_PASSWORD=$(cat /run/secrets/fws_db_password)
export FWS_DB_URL=$(cat /run/secrets/fws_db_url)
