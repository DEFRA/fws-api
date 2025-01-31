# Running And Debugging AWS Lambda Functions In The Development Container

## Default Configuration

[The dev container environment variable file](../.devcontainer/.env) is configured to debug a
LocalStack hosted AWS Lambda function by default through the following environment variable:

```sh
LAMBDA_DOCKER_FLAGS=-e NODE_OPTIONS=--inspect-brk=0.0.0.0:9229 -p 9229:9229
```

This environment variable allows the Visual Studio Code debugger to attach to the standard Node.js debug port (9229)
in a LocalStack Docker container used to run an AWS Lambda function.

## Disabling Debug Functionality

AWS Lambda function debugging can be disabled by:

* Commenting out the **LAMBDA_DOCKER_FLAGS** environment variable in [the dev container environment variable file](../.devcontainer/.env).
* Replacing ([Teardown](./additional-dev-container-considerations.md#teardown) and recreate) the existing containerised development environment with a new containerised development environment using
  the revised configuration
  * **IMPORTANT** - If cloning the remote repository into a container volume, the configuration change must be pushed to a branch from which the new containerised development environment **must** be created.
  * **IMPORTANT** - If a new containerised dev environment is not created, running multiple Lambda functions without
    remote debug limitations will **not** be possible.

## Re-enabling Debug Functionality

Uncomment the **LAMBDA_DOCKER_FLAGS** environment variable in [the dev container environment variable file](../.devcontainer/.env) and replace the containerised development environment as described above.

## Preparing To Debug An AWS Lambda Function

Run the Visual Studio Code **Attach to Remote Node.js (fws-api)** debug configuration **before** AWS Lambda function
invocation. This waits for the standard Node.js debug port to be made available by a Docker container running an
AWS Lambda function before attempting to attach the debugger. Please consult the [LocalStack Lambda debugging documentation](https://hashnode.localstack.cloud/debugging-nodejs-lambda-functions-locally-using-localstack) for further details.

## Invoking An AWS Lambda Function

From within the dev container, use the [LocalStack AWS Command Line interface](https://docs.localstack.cloud/user-guide/integrations/aws-cli/) to retrieve the identifier of the deployed REST API from the API Gateway. For example, the command below can be used when an initial attempt to create a containerised development environment succeeds (resulting in the creation of one
REST API instance)

```sh
awslocal apigateway get-rest-apis | jq -r '.items[0].id'
```

Use the REST API identifier to call an endpoint linked to an AWS Lambda function. For example, the following command can be used
as a guide to making a HTTP GET request to the **/fwis.json** endpoint using **curl**:

```sh
curl -H "Content-Type: text/html" "http://<<REST-API-ID>>.execute-api.localhost.localstack.cloud:4566/local/fwis.json"
```

IMPORTANT

* The **&lt;&lt;REST-API-ID&gt;&gt;** placeholder **must** be replaced.
* The HTTP request header containing an API key is **not** required when running/debugging AWS Lambda functions with LocalStack because custom authorizer function configuration requires use of LocalStack Pro.
* When the debugger attaches, it breaks before running the AWS Lambda function. As such, debugging **must** be resumed to reach
  configured breakpoints.

### Making A HTTP POST To The /message Endpoint

AWS API Gateway request templates are used to ensure XML message content is embedded within AWS Lambda JSON event objects.
Real AWS API Gateway software appears capable of embedding raw XML within AWS Lambda JSON event objects without further configuration.
At the time of writing, LocalStack API Gateway software appears to require raw XML message content to be embedded as a string
within a JSON document and slightly different request templates to be able to provide the AWS Lambda function with an event object reflecting that received from real AWS API Gateway software. For example, real AWS API Gateway software appears capable of handling raw XML
such as the following:

```sh
<xml>
  <element>content</element>
</xml>
```

LocalStack API Gateway software appears to require a JSON structure such as the following for Lambda functions to receive an event object
consistent with that received from real AWS API Gateway software.

```sh
{
  "message": "<xml><element>content</element></xml>"
}
```

The following command can be used as a guide to making a HTTP POST request to the **/message** endpoint using **curl**:

```sh
curl -H "Content-Type: text/html" -d "@<</path/to/message/file>>" "http://<<REST-API-ID>>.execute-api.localhost.localstack.cloud:4566/local/message"
```

IMPORTANT

* The **&lt;&lt;path/to/message/file&gt;&gt;** and **&lt;&lt;REST-API-ID&gt;&gt;** placeholders **must** be replaced.
* The **Content-Type: text/html** request header **must** be used to ensure correct processing by the LocalStack API Gateway request template.

Alternatively, messages can be submitted to the AWS API Gateway in the JSON format expected by the Lambda function:

```sh
{
  "bodyXml": "<xml><element>content</element></xml>"
}
```

In this case, the **application/json** content type **must** be used. Unlike the real AWS API Gateway
which supports a default content type of **application/json**, the LocalStack API Gateway appears to require
the Content-Type header to be specified.

The following command can be used as a guide to making a HTTP POST request to the **/message** endpoint using **curl**:

```sh
curl -H "Content-Type: application/json" -d "@<</path/to/bodyXml/file>>" "http://<<REST-API-ID>>.execute-api.localhost.localstack.cloud:4566/local/message"
```

IMPORTANT

* The **&lt;&lt;path/to/bodyXml/file&gt;&gt;** and **&lt;&lt;REST-API-ID&gt;&gt;** placeholders **must** be replaced.

While there is little difference between the JSON formats supported for local development and debugging, both formats
are supported to match real AWS API Gateway request template configuration as closely as possible. Raw XML submission
to real AWS API Gateway infrastructure provides the ability to modify and debug readable XML payloads in cloud environments.

## Making Code Changes

Code changes can be made without having to redeploy Lambda functions to LocalStack. Please consult [LocalStack Lambda debugging documentation](https://hashnode.localstack.cloud/debugging-nodejs-lambda-functions-locally-using-localstack) for more details.

## Debug Limitations

LocalStack uses a different Docker container for each available AWS Lambda function (i.e. while the same container can
process multiple requests invoking the same AWS Lambda function, a new container will be created to invoke a different
AWS Lambda function).

At a particular point in time, the standard Node.js debug port can only be used by one LocalStack Docker container
used to run an AWS Lambda function. This restriction means that a particular AWS Lambda function cannot be debugged
if a container for debugging a different AWS Lambda function is running. As such, while Docker containers used to run
Lambda functions are ephemeral, manual container removal or timeout (causing automatic removal) is needed when invoking different AWS Lambda functions in quick succession. The timeout for a Lambda function is specified by the LAMBDA_TIMEOUT
environment variable within [the dev container environment variable file](../.devcontainer/.env).
