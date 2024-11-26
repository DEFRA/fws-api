#!/bin/sh
# This script MUST be called from the container workspace folder.
set -e

lambda_functions_dir="lib/functions"

# Iterate over each file in lambda_functions_dir
for lambda_function in "$lambda_functions_dir"/*; do
  if [ -f "$lambda_function" ]; then
      function_name=$(basename "$lambda_function" .js)
      echo Registering $function_name with LocalStack
      
      awslocal lambda create-function \
        --function-name "$function_name" \
        --code S3Bucket="hot-reload",S3Key="$(pwd)/" \
        --runtime nodejs18.x \
        --timeout 120 \
        --role arn:aws:iam::000000000000:role/lambda-role \
        --handler lib/${function_name}.handler \
        --no-cli-pager
      sleep 1 
  fi
done

echo "All Lambda functions have been registered with LocalStack."
