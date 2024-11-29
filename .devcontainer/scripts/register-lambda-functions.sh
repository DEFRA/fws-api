#!/bin/sh
# This script MUST be called from the container workspace folder.
set -e

lambda_functions_dir="lib/functions"

# Prepare a comma separated list of custom environment variables required by
# each Lambda function.
fws_db_username=$(echo FWS_DB_USERNAME=$(cat /run/secrets/fws_db_username))
fws_db_password=$(echo FWS_DB_PASSWORD=$(cat /run/secrets/fws_db_password))
fws_db_url=$(echo FWS_DB_URL=$(cat /run/secrets/fws_db_url))
fws_db_name=$(echo FWS_DB_NAME=$(cat /run/secrets/fws_db_name))
fws_db_host=$(echo FWS_DB_HOST=$FWS_DB_HOST)
set -- $fws_db_username $fws_db_password $fws_db_url $fws_db_name $fws_db_host
custom_environment_variables=$(printf '%s,' "$@" | sed 's/,*$//g')

# Iterate over each file in lambda_functions_dir
for lambda_function in "$lambda_functions_dir"/*; do
  if [ -f "$lambda_function" ]; then
      function_name=$(basename "$lambda_function" .js)
      echo Registering $function_name with LocalStack
      
      awslocal lambda create-function \
        --function-name "$function_name" \
        --code S3Bucket="hot-reload",S3Key="$(pwd)/" \
        --runtime nodejs18.x \
        --timeout $LAMBDA_TIMEOUT \
        --role arn:aws:iam::000000000000:role/lambda-role \
        --handler lib/functions/$function_name.handler \
        --environment "Variables={$custom_environment_variables}" \
        --no-cli-pager
      sleep 1

      # Register a URL for the function so that it can be invoked without use of the LocalStack AWS CLI.
      echo Registering URL for $function_name
      awslocal lambda create-function-url-config \
        --function-name $function_name \
        --auth-type NONE
  fi
done

echo "All Lambda functions have been registered with LocalStack."
