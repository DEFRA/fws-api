#!/bin/sh
# This script MUST be called from ${containerWorkspace Folder}.
# See https://containers.dev/implementors/json_reference/.
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
      echo Skipping $lambda_function because LocalStack community edition does not support custom authorizers
      continue
    fi

    $(echo register_api_gateway_support_for_$lambda_function_name | sed "s/-/_/g")
    echo "API Gateway support added for $lambda_function_name"

  done

  awslocal apigateway create-deployment \
    --rest-api-id $fws_rest_api_id \
    --stage-name local

  echo "Created API Gateway deployment"
  echo "API Gateway ID: $fws_rest_api_id"
  echo "Test endpoint URL: http://$fws_rest_api_id.execute-api.localhost.localstack.cloud:4566/local/fwis.xml"
  return 0
}

get_http_method() {
  lambda_function_name=$1
  if [ $lambda_function_name = "process-message" ]; then
    echo POST
  else
    echo GET
  fi
  return 0
}

register_api_gateway_support_for_get_all_messages() {
  set -- "fwis.json" "fwis-plus.json" "fwis.xml"
  for message_type in $@; do
    all_messages_resource_id=$(create_resource $fws_rest_api_root_resource_id $message_type)
    put_method_and_integration $all_messages_resource_id
  done
  return 0
}

register_api_gateway_support_for_get_all_historical_messages() {
  all_historical_messages_resource_id=$(create_resource $fws_rest_api_root_resource_id  "historical-messages")
  all_target_area_historical_messages_resource_id=$(create_resource $all_historical_messages_resource_id  "{code}")
  put_method_and_integration $all_target_area_historical_messages_resource_id
  return 0
}

register_api_gateway_support_for_get_all_target_areas() {
  all_target_areas_resource_id=$(create_resource $fws_rest_api_root_resource_id  "target-areas.json")
  put_method_and_integration $all_target_areas_resource_id
  return 0
}

register_api_gateway_support_for_process_message() {
  process_message_resource_id=$(create_resource $fws_rest_api_root_resource_id  "message")
  put_method_and_integration $process_message_resource_id
  return 0
}

create_resource() {
  fws_rest_api_root_resource_id=$1
  fws_rest_api_path_part=$2
  echo $(awslocal apigateway create-resource \
    --rest-api-id $fws_rest_api_id \
    --parent-id $fws_rest_api_root_resource_id \
    --path-part $fws_rest_api_path_part | jq -r '.id')
  return 0
}

put_method_and_integration() {
  resource_id=$1

  awslocal apigateway put-method \
      --rest-api-id $fws_rest_api_id \
      --resource-id $resource_id \
      --http-method $http_method \
      --authorization-type "NONE" \
      $(get_request_parameters $lambda_function_name)

  # The process-message lambda function requires a request template which is not required for other lambda functions.
  # Unnfortunately, attempts to call a function of the form $(get_request_templates $lambda_function_name) to reduce
  # duplication have been unsuccesful due to unresolved shell expansion issues.
  # As such, a conditional block is used to hardcode the request-templates parameter for the process-message
  # lambda function.
  if [ $lambda_function_name = "process-message" ]; then
    awslocal apigateway put-integration \
      --rest-api-id $fws_rest_api_id \
      --resource-id $resource_id \
      --http-method $http_method \
      --type AWS \
      --integration-http-method POST \
      --uri arn:aws:apigateway:eu-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-2:000000000000:function:$lambda_function_name/invocations \
      --passthrough-behavior WHEN_NO_TEMPLATES \
      --request-templates '{
            "text/html": "{\"bodyXml\": \"$util.escapeJavaScript($input.body)\"}",
            "application/json": "$input.body"
          }'

    # AWS integrations require integration responses to be set manually.
    # Note that response parameters are omitted due to https://github.com/localstack/localstack/issues/11303.
    # While alignment of local development and operational environment provisioning is desirable,
    # a workaround has not been attempted due to response parameters not being required for effective local development.
    set -- 200 400 401 403 404 422 500 502

    for status_code in $@; do
      awslocal apigateway put-integration-response \
        --rest-api-id $fws_rest_api_id \
        --resource-id $resource_id \
        --http-method $http_method \
        --status-code $status_code \
        $(get_selection_pattern $status_code)
    done

    # Due to unresolved shell expansion issues, get_selection_pattern is not used when setting an integration
    # response for the HTTP 504 status code.
    awslocal apigateway put-integration-response \
        --rest-api-id $fws_rest_api_id \
        --resource-id $resource_id \
        --http-method $http_method \
        --status-code 504 \
        --selection-pattern '([\s\S]*\[504\][\s\S]*)|(.*Task timed out after \d+\.\d+ seconds$)'
  else
    awslocal apigateway put-integration \
      --rest-api-id $fws_rest_api_id \
      --resource-id $resource_id \
      --http-method $http_method \
      --type AWS_PROXY \
      --integration-http-method POST \
      --uri arn:aws:apigateway:eu-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-2:000000000000:function:$lambda_function_name/invocations \
      --passthrough-behavior WHEN_NO_TEMPLATES
  fi
  return 0
}

get_request_parameters() {
  if [ $lambda_function_name = "get-all-historical-messages" ]; then
    echo --request-parameters "method.request.path.code=true"
  fi
  return 0
}

get_selection_pattern() {
  status_code=$1
  case $status_code in
    200)
      # Do not set a selection pattern for the default response.
    ;;
    400 | 401 | 403 |404 | 422 | 502)
      echo --selection-pattern [\\s\\S]*\\[$1\\][\\s\\S]*
      ;;
    500)
      echo --selection-pattern '[\s\S]*(Process\s?exited\s?before\s?completing\s?request|\[500\])[\s\S]*'
      ;;
    *)
      # Return an error code if an unsupported status code is received.
    return 1
    ;;
  esac

  return 0
}

main "$@"