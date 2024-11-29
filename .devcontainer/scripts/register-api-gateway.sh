#!/bin/sh
# This script MUST be called from the container workspace folder.
set -e

# Reference - https://docs.localstack.cloud/user-guide/aws/apigateway/
echo "Creating API Gateway"

fws_rest_api_id=$(awslocal apigateway create-rest-api --name 'FWS API Gateway' | jq -r '.id')
fws_rest_api_root_resource_id=$(awslocal apigateway get-resources --rest-api-id $fws_rest_api_id | jq -r '.items[0].id')

# The set of Lambda functions referencing API Gateway specific event properties.
set -- 'get-all-messages' 'authorizer'

for lambda_function_name in $@; do
  fws_rest_api_resource_id=$(awslocal apigateway create-resource \
    --rest-api-id $fws_rest_api_id \
    --parent-id $fws_rest_api_root_resource_id \
    --path-part $lambda_function_name | jq -r '.id')

  awslocal apigateway put-method \
  --rest-api-id $fws_rest_api_id \
  --resource-id $fws_rest_api_resource_id \
  --http-method GET \
  --authorization-type "NONE"

  awslocal apigateway put-integration \
  --rest-api-id $fws_rest_api_id \
  --resource-id $fws_rest_api_resource_id \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:eu-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-2:000000000000:function:$lambda_function_name/invocations \
  --passthrough-behavior WHEN_NO_MATCH

  echo "API Gateway support added for $lambda_function_name"

done

awslocal apigateway create-deployment \
  --rest-api-id $fws_rest_api_id \
  --stage-name local

echo "Created API Gateway deployment"
