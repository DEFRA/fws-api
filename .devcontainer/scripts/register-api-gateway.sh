#!/bin/sh
# This script MUST be called from the container workspace folder.
set -e

main() {
  # Reference - https://docs.localstack.cloud/user-guide/aws/apigateway/
  echo "Creating API Gateway"

  fws_rest_api_id=$(awslocal apigateway create-rest-api --name "FWS API Gateway" | jq -r '.id')
  fws_rest_api_root_resource_id=$(awslocal apigateway get-resources --rest-api-id $fws_rest_api_id | jq -r '.items[0].id')
  lambda_functions_dir="lib/functions"

  for lambda_function in "$lambda_functions_dir"/*; do
    lambda_function_name=$(basename "$lambda_function" .js)
    http_method=$(get_http_method $lambda_function_name)

    if [ $lambda_function_name = "authorizer" ]; then
      echo Skipping $lambda_function
      continue
    fi

    $(echo register_api_gateway_support_for_$lambda_function_name | sed "s/-/_/g")
    echo "API Gateway support added for $lambda_function_name"

  done

  awslocal apigateway create-deployment \
    --rest-api-id $fws_rest_api_id \
    --stage-name local

  echo "Created API Gateway deployment"
}

get_http_method() {
  if [ $1 = "process-message" ]; then
    echo POST
  else
    echo GET
  fi
}

register_api_gateway_support_for_get_all_messages() {
  set -- "fwis.json" "fwis-plus.json" "fwis.xml"
  for message_type in $@; do
    all_messages_resource_id=$(create_resource $fws_rest_api_root_resource_id $message_type)
    put_method_and_integration $all_messages_resource_id
  done
}

register_api_gateway_support_for_get_all_historical_messages() {
  all_historical_messages_resource_id=$(create_resource $fws_rest_api_root_resource_id  "historical-messages")
  all_target_area_historical_messages_resource_id=$(create_resource $all_historical_messages_resource_id  "{code}")
  put_method_and_integration $all_target_area_historical_messages_resource_id
}

register_api_gateway_support_for_get_all_target_areas() {
  all_target_areas_resource_id=$(create_resource $fws_rest_api_root_resource_id  "target-areas.json")
  put_method_and_integration $all_target_areas_resource_id
}

register_api_gateway_support_for_process_message() {
  process_message_resource_id=$(create_resource $fws_rest_api_root_resource_id  "message")
  put_method_and_integration $process_message_resource_id
}

create_resource() {
  echo $(awslocal apigateway create-resource \
    --rest-api-id $fws_rest_api_id \
    --parent-id $1 \
    --path-part $2 | jq -r '.id')
}

put_method_and_integration() {
  awslocal apigateway put-method \
      --rest-api-id $fws_rest_api_id \
      --resource-id $1 \
      --http-method $http_method \
      --authorization-type "NONE" \
      $(get_request_parameters $lambda_function_name)

  # The process-message lambda function requires a request template which is not required for other lambda functions.
  # Unnfortunately, attempts to call a function of the form $(get_request_templates $lambda_function_name) to reduce
  # duplication have been unsuccesful due to unresolved shell expansion issues.
  # As such, a conditional block is used to hardcode the request-templates parameter for the process-message
  # lambda function.
  if [ $lambda_function_name = "process-message" ]; then
  # IMPORTANT
  # Due to apparent processing differences between the real AWS API Gateway and the associated localstack emulator,
  # the request template for localstack AWS API gateway emulation uses $input.json("$.message") rather than
  # $input.json("$").
  # This is to allow the application code to receive the same data as it would from the real AWS API Gateway.
  # This requires XML data submitted to the AWS API gateway localstack emulator to be wrapped in a JSON object
  # of the form {"message": "<xml data with double quote escaping>"}.
    awslocal apigateway put-integration \
      --rest-api-id $fws_rest_api_id \
      --resource-id $1 \
      --http-method $http_method \
      --type AWS \
      --integration-http-method POST \
      --uri arn:aws:apigateway:eu-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-2:000000000000:function:$lambda_function_name/invocations \
      --passthrough-behavior WHEN_NO_TEMPLATES \
      --request-templates '{"text/html": "{\"bodyXml\": $input.json(\"$.message\")}"}'
  else
    awslocal apigateway put-integration \
      --rest-api-id $fws_rest_api_id \
      --resource-id $1 \
      --http-method $http_method \
      --type AWS \
      --integration-http-method POST \
      --uri arn:aws:apigateway:eu-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-2:000000000000:function:$lambda_function_name/invocations \
      --passthrough-behavior WHEN_NO_TEMPLATES
  fi
}

get_request_parameters() {
  if [ $lambda_function_name = "get-all-historical-messages" ]; then
    echo --request-parameters "method.request.path.code=true"
  fi
  return
}

main "$@"