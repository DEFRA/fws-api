# Troubleshooting

## LocalStack Container Fails To Start

* This could be caused by an existing application using the subnet configured for LocalStack to act as a DNS server (192.168.0.0/24).
  * The configured subnet avoids conflict with Oracle VirtualBox networking.
* If the configured subnet conflicts with another application that cannot be stopped, try changing the networking configuration in the [development container Docker Compose file](../.devcontainer/devcontainer.yml) to use a different subnet (such as 10.0.2.0/24 as used in [LocalStack network connectivity documentation](https://blog.localstack.cloud/2024-03-04-making-connecting-to-localstack-easier/)), [teardown](../dev-container/additional-dev-container-considerations.md#teardown) existing development container based resources and create a new development container.

**IMPORTANT** - If cloning the remote repository into a container volume, the configuration change must be pushed to a branch from which the new containerised development environment **must** be created.

### Rootless Docker Connectivity Issues

* The most probable cause is a lack of permissions on the rootless Docker socket.
  * Ensure that rootless Docker is configured correctly:
    * [Rootless Docker based configuration with development containers](../dev-container/rootless-docker-configuration.md)
    * [Rootless Docker based configuration without development containers](../manual-configuration/rootless-docker-configuration.md)

### Lambda Function Cannot Bind To Standard Node.js Debug Port

* Remove any existing Lambda function container or other process using the port.

### Lambda Function Timeout

* If using Visual Studio Code run the  **Attach to Remote Node.js (fws-api)** debug configuration **before** Lambda function
invocation.

### Visual Studio Code Debugger Does Not Attach To Lambda Function Container

#### Dev Container Based Local Development Environment

* Check that the IP address of the Lambda function container matches that configured in the DEBUG_HOST_ADDRESS
  environment variable within [the Docker environment variable file](../../../docker/.env).
  * This check could be difficult to perform if Lambda function containers only exist for a short amount of time.
  * In a standard debugging scenario, a Lambda function container should have the IP address **192.168.0.5** based
    on these four containers running before the Lambda function container is created:
    * Dev container
    * LocalStack container
    * Postgres container
    * PgAdmin4 container

#### Non-Dev Container Based Local Development Environment

* Ensure that the DEBUG_HOST_ADDRESS environment variable on the host running the Lambda function container is set to 127.0.0.1.
  * The [Visual Studio Code debug configuration](../../../.vscode/launch.json) defaults to using 127.0.0.1 if this environment
    variable is not set.

### Node.js Module Import Errors

Node.js module import failures occur when code to be run/debugged cannot be located. This results in stack traces such as the following:

```stacktrace
{"errorType":"Runtime.ImportModuleError","errorMessage":"Error: Cannot find module 'process-message'\nRequire stack:\n- /var/runtime/index.mjs","trace":["Runtime.ImportModuleError: Error: Cannot find module 'process-message'","Require stack:","- /var/runtime/index.mjs","    at _loadUserApp (file:///var/runtime/index.mjs:1087:17)","    at async UserFunction.js.module.exports.load (file:///var/runtime/index.mjs:1119:21)","    at async start (file:///var/runtime/index.mjs:1282:23)","    at async file:///var/runtime/index.mjs:1288:1"]}
```

#### Development Container Considerations

When used with [Docker outside Of Docker Compose](https://github.com/devcontainers/templates/tree/main/src/docker-outside-of-docker-compose), regardless of how a development container is created, repository contents **must** be available at the same location on the host and in the development container to enable running/debugging development container associated code.

Ensure that the [local fws-api repository location](../dev-container/local-repository-creation.md) and [workspace folder](../dev-container/workspace-folder-configuration.md) are configured for code to be run/debugged.

### Unsuccessful Resolution Of Problems

If problems persist, prerequisites and associated configuration should be reviewed followed by a [teardown](../dev-container/additional-dev-container-considerations.md#teardown) and rebuild of the containerised development environment.
