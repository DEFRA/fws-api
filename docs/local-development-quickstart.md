# Local Development Quickstart

The quickest way to get started is with a [containerised development environment](https://code.visualstudio.com/docs/remote/containers).

A containerised development environment automates a number of setup activities required for a functioning local development environment such as:

* Configuration of additional operating system package repositories
* Installation of additional operating system packages
* Addition of Visual Studio Code extensions.
* FWS database creation and reference data population using a containerised Postgres instance.
* Use of a [containerised Postgres Graphical User Interface](https://www.pgadmin.org/download/pgadmin-4-container/)
  for performing database options.
* [LocalStack](https://www.localstack.cloud/) AWS API Gateway and AWS Lambda
  provisioning to facilitate local running and debugging of FWS API calls without round tripping
  to AWS infrastructure.
  * The [LocalStack AWS Command Line interface](https://docs.localstack.cloud/user-guide/integrations/aws-cli/) is
    used during provisioning and can also be used at runtime.
* Runtime environment variable configuration.

Development containers are based on [Docker outside Of Docker Compose](https://github.com/devcontainers/templates/tree/main/src/docker-outside-of-docker-compose) with [LocalStack integration](https://docs.localstack.cloud/user-guide/integrations/devcontainers/#docker-outside-of-docker).

Development containers run as an unprivileged **vscode** user with passwordless sudo access.

The development environment as code approach ensures that all developers utilise a common development environment without having to follow detailed setup instructions that could be erroneous, incomplete or followed incorrectly.

## Prerequisites

* [Rootful or rootless Docker](https://docs.docker.com/engine/security/rootless/)
  including [Docker Compose V2](https://docs.docker.com/compose/releases/migrate/)
  * Rootless docker is recommended to reduce security risks but requires additional tasks to be performed manually
     **before** development container creation.
* Visual Studio Code [remote containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
* If an existing local development environment has been configured manually **it is recommended that a backup of it is created before proceeding**.

### Mandatory Environment Variables

The following environment variables **must** be set regardless of whether rootful or rootless docker is used:

| name | description |
|------|-------------|
| LOCAL_FWS_API_DIR | The **absolute** path to the root of a local fws-api repository |
| FWS_API_HOST_USERNAME | Username for the **host** account used when creating a dev container. For rootful docker, this **must** be the account that owns the local fws-api repository. For rootless docker, this account **must also** be running rootless Docker and have entries in /etc/subuid and /etc/subgid accordingly. |

### Configure Host Workspace Folder

**These instructions are for use with a 'NIX based Docker installation (including WSL2)**.

[link-workspace-folder-on-host-to-local-repository.sh](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh) **must** be run as **root** before attempting to create a dev container. This script validates the mandatory environment variables and exits if configuration
issues are detected. If no configuration issues are detected, the following actions are performed to allow a dev container to be created from either a local fws-api repository or by cloning the remote fws-api repository into a container volume:

* Ensure the **/workspaces** directory exists on the host
* Ensure a symbolic link from **/workspaces/fws-api** to the local fws-api repository root exists.

**IMPORTANT** - If [link-workspace-folder-on-host-to-local-repository.sh](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh) is run using the sudo command, the user session from which the sudo command is run **must** ensure that the environment variables are available to the script. This is because user session environment variables are not available to a sudo command by default. For example, if the environment variables are available to the user session running the sudo command, they can be preserved for availability to [link-workspace-folder-on-host-to-local-repository.sh](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh) using the following sudo command:

```sh
sudo --preserve-env=LOCAL_FWS_API_DIR,FWS_API_HOST_USERNAME "$LOCAL_FWS_API_DIR"/.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh
```

### Rootless Docker Configuration

**These instructions are for use with a Docker installation on native Linux currently**.

#### Configure Visual Studio Code To Use Rootless Docker With Dev Containers

Ensure the Visual Studio Code user settings JSON file  contains an **dev.containers.dockerSocketPath** entry referencing the absolute path
to the rootless Docker socket. For example: **"dev.containers.dockerSocketPath": "/run/user/1000/docker.sock"**.

#### Additional Configuration

[setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) **must** be run as **root** before attempting to create a dev container from either a local fws-api repository or by cloning the remote fws-api repository into a container volume. This script validates the mandatory environment variables and exits if configuration issues are detected. If no configuration issues are detected, the following actions are performed regardless of how dev containers are created:

* Rootful Docker socket backup.
* Replacement of rootful Docker socket with a symbolic link to the rootless Docker socket.
  * This is required because the Docker socket used by [Docker outside Of Docker Compose](https://github.com/devcontainers/templates/tree/main/src/docker-outside-of-docker-compose) dev containers does not appear to be configurable at the time of writing.
* Grant of rootless Docker socket read write access to the host SUBGID for the dev container **vscode** user.

To facilitate dev container creation from the local fws-api repository, ownership of the local fws-api repository is **transferred** to the host SUBUID and SUBGID for the dev container **vscode** user.

* This action forces work to be performed within the dev container rather than using the local fws-api repository directly.
  * This prevents a risk of git reporting dubious file ownership that can occur when repository access is permitted from within and outside of a dev
    container created from a local repository.
    * If direct work on the host is required, the creation of a distinct local fws-api repository for this purpose is recommended.

When creating a dev container by cloning the remote fws-api repository into a container volume, the dev container user has ownership
of items in the volume without risk of git reporting dubious ownership.

**IMPORTANT** - If [setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) is run using the sudo command, the user session from which the sudo command is run **must** ensure that the environment variables are available to the script. This is because user session environment variables are not available to a sudo command by default. For example, if the environment variables are available to the user session running the sudo command, they can be preserved for availability to [setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) using the following sudo command:

```sh
sudo --preserve-env=LOCAL_FWS_API_DIR,FWS_API_HOST_USERNAME "$LOCAL_FWS_API_DIR"/.devcontainer/scripts/setup-for-rootless-docker.sh
```

#### Housekeeping Considerations

**IMPORTANT** - The rootful Docker socket (/var/run/docker.sock) appears to be recreated in scenarios such as a system
reboot. As such [setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) **must** be run following such scenarios to ensure that /var/run/docker.sock refers to the rootless Docker socket.

### Setup GitHub Credential Sharing

Visual Studio Code development containers provide inbuilt support for [accessing git credentials without copying them to the container](https://code.visualstudio.com/docs/remote/containers#_sharing-git-credentials-with-your-container). Ensure that your local environment is set up to allow git credential sharing.

## Create Docker Secrets

The Docker containers used require some environment variable based configuration. Configuration **must** be provided in the form of [Docker secrets](https://docs.docker.com/compose/how-tos/use-secrets/).

 **File** based Docker secrets **must** be used to facilitate Docker secret based configuration when cloning
the remote fws-api repository into a container volume (see [initialize-command.sh](../.devcontainer/scripts/initialize-command.sh) for further details).

Docker secret files **must** be created in the directory $HOME/.fws-api/.devcontainer/.docker-secrets. This directory can be
created using the following command from a session for the user account that creates fws-api dev containers.

```sh
  mkdir -p $HOME/.fws-api/.devcontainer/.docker-secrets
```

The following Docker secret files are required.

| name | required file content |
|------|-----------------------|
| fws_db_name | FWS database name (fws is suggested) |
| fws_db_password | FWS database password for the **u_fws** user |
| fws_db_url | FWS database JDBC URL - jdbc:postgresql://fwsdb:5432/&lt;&lt;replace with FWS database name&gt;&gt; |
| fws_db_username | Runtime FWS database username (This **must** be **u_fws**) |
| pgadmin_default_password | Runtime password for accessing Pgadmin4 as **ubuntu.localhost.localdomain** |
| postgres_password | FWS database password for the **postgres** user |
| u_fws_password | FWS database password for the **u_fws** user |

IMPORTANT

* Docker secret files **must** be used even when creating a dev container from a local fws-api repository.
* All Docker secret files **must** contain **no** additional content.
* fws_db_password and u_fws_password **must** contain the same content.

## Create A Dev Container

* A dev container **must** be created using a new Visual Studio Code window.
* A dev container can be created from either a local fws-api repository on the development machine or a remote repository URL.
  * A local fws-api repository provides easier access to the code outside the container using a bind mount.
  * When using a remote repository URL:
    * the code used by the container is located in a Docker volume.
    * use [git SSH URLs](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories) when cloning to ensure compatibility with credential sharing.

Please consult the [Microsoft documentation](https://code.visualstudio.com/docs/remote/containers) for further details.

After a local directory has been selected or a repository URL has been entered it will take several minutes for the containerised development environment to be be created. Internet connection speed is a factor in how long the process takes.

## Check That Expected Docker Containers Are Running And Unit Tests Pass

* Open an Integrated Terminal (**File -> New Terminal** menu option) in the development container Visual Studio Code window.
  * This should open a terminal in the directory **/workpaces/fws-api** within the dev container.
* Issue the command **docker ps**
  * Four containers associated with the FWS API should be running on the **Docker host** (due to use of Docker outside of Docker Compose):
    * Development container
    * LocalStack container
    * Postgres container
    * PgAdmin4 container

* Issue the command **npm test** in the dev container Visual Studio Code Integrated terminal.
  * Unit tests should pass as they would in a local development environment configured correctly manually.

## Running And Debugging AWS Lambda Functions In The Development Container

### Default Configuration

[The development container environment variable file](../.devcontainer/.env) is configured to debug a
LocalStack hosted AWS Lambda function by default through the following environment variable:

```sh
LAMBDA_DOCKER_FLAGS=-e NODE_OPTIONS=--inspect-brk=0.0.0.0:9229 -p 9229:9229
```

This environment variable allows the Visual Studio Code debugger to attach to the standard Node.js debug port (9229)
in a LocalStack Docker container used to run an AWS Lambda function.

### Disabling Debug Functionality

AWS Lambda function debugging can be disabled by:

* Commenting out the **LAMBDA_DOCKER_FLAGS** environment variable in [the development container environment variable file](../.devcontainer/.env)
* Replacing ([Teardown](#teardown) and recreate )the existing containerised development environment with a new containerised development environment using
  the revised configuration
  * **IMPORTANT** - If cloning the remote repository into a container volume, the configuration change must be pushed to a pull
    request branch from which the new containerised development environment **must** be created.
  * **IMPORTANT** - If a new containerised dev environment is not created, running multiple Lambda functions without
    remote debug limitations will not be possible.

### Re-enabling Debug Functionality

Uncomment the **LAMBDA_DOCKER_FLAGS** environment variable in [the development container environment variable file](../.devcontainer/.env) and replace the containerised development environment as described above.

### Preparing To Debug An AWS Lambda Function

Run the Visual Studio Code **Attach to Remote Node.js (fws-api)** debug configuration **before** AWS Lambda function
invocation. This waits for the standard Node.js debug port to be made available by a Docker container running an
AWS Lambda Function before attempting to attach the debugger. Please consult the [LocalStack Lambda debugging documentation](https://hashnode.localstack.cloud/debugging-nodejs-lambda-functions-locally-using-localstack) for further details.

### Invoking An AWS Lambda Function

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

#### Making A HTTP POST To The /message Endpoint

AWS API Gateway request templates are used to ensure XML message content is embedded within AWS Lambda JSON event objects.
Real AWS API Gateway software is capable of embedding raw XML within AWS Lambda JSON event objects without further configuration.
At the time of writing, LocalStack API Gateway software appears to require raw XML message content to be embedded as a string
within a JSON document and slightly different request templates to be able to provide the AWS Lambda function with an event object
reflecting that received from real AWS API Gateway software. For example, real AWS API Gateway software is capable of handling raw XML
such as the following:

```sh
<xml>
  <element>content</element>
</xml>
```

LocalStack API Gateway software appears to require a JSON structure for Lambda functions to receive an event object
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

### Making Code Changes

Code changes can be made without having to redeploy Lambda functions to LocalStack. Please consult [LocalStack Lambda debugging documentation](https://hashnode.localstack.cloud/debugging-nodejs-lambda-functions-locally-using-localstack) for more details.

### Debug Limitations

LocalStack uses a different Docker container for each available AWS Lambda function (i.e. while the same container can
process multiple requests invoking the same AWS Lambda Function, a new container will be created to invoke a different
AWS Lambda function).

At a particular point in time, the standard Node.js debug port can only be used by one LocalStack Docker container
used to run an AWS Lambda function. This restriction means that a particular AWS Lambda function cannot be debugged
if a container exists for debugging a different AWS Lambda function. As such, while Docker containers used to run
Lambda functions are ephemeral, manual container removal or timeout (causing automatic removal) is needed when invoking different AWS Lambda functions in quick succession. The timeout for a Lambda function is specified by the LAMBDA_TIMEOUT
environment variable within [the dev container environment variable file](../.devcontainer/.env).

### Troubleshooting

#### LocalStack Container Fails To Start

* This could be caused by an existing application using the subnet configured for LocalStack to act as a DNS server (192.168.0.0/24).
  * The configured subnet avoids conflict with Oracle VirtualBox networking.
* If the configured subnet conflicts with another application that cannot be stopped, try changing the networking configuration in the [dev container Docker Compose file](../.devcontainer/devcontainer.yml) to use a different subnet
(such as 10.0.2.0/24 as used in [LocalStack network connectivity documentation](https://blog.localstack.cloud/2024-03-04-making-connecting-to-localstack-easier/)), [teardown](#teardown) existing dev container based resources and create a new dev container.

**IMPORTANT** - If cloning the remote repository into a container volume, the configuration change must be pushed to a pull request branch from which the new containerised development environment **must** be created.

#### Rootless Docker Connectivity Issues

* The most probable cause is a lack of permissions on the rootless Docker socket.
  * Consult the rootless Docker prerequisites accordingly.

#### Lambda Function Cannot Bind To Standard Node.js Debug Port

* Remove any existing Lambda function container or other process using the port.

#### Lambda Function Timeout

* Run the Visual Studio Code **Attach to Remote Node.js (fws-api)** debug configuration **before** Lambda function
invocation.

#### Visual Studio Code Debugger Does Not Attach To Lambda Function Container

* Check that the IP address of the Lambda function container matches that configured in the DEBUG_CONTAINER_ADDRESS
  environment variable within [the dev container environment variable file](../.devcontainer/.env).
  * This check could be difficult to perform if Lambda function containers only exist for a short amount of time.
  * In a standard debugging scenario, a Lambda function container should have the IP address **192.168.0.5** based
    on these four containers running before the Lambda function container is created:
    * Dev container
    * LocalStack container
    * Postgres container
    * PgAdmin4 container

#### Network Errors When Using Docker Compose Commands Manually

The LocalStack container is configured to act as a DNS server within a custom Docker network. Running Docker Compose
commands manually can result in network conflicts. A [teardown](#teardown) and rebuild of the containerised development environment should resolve these issues.

#### Unsuccessful Resolution Of Problems

If problems persist, prerequisites and associated configuration should be reviewed followed by a [teardown](#teardown) and rebuild of the containerised development environment.

## Development Container Considerations

### Using Terminals Outside Visual Studio Code

If you prefer not to use Visual Studio Code integrated terminals, the docker exec command offers an alternative way to provide a terminal. For example, issue the following command in a Linux environment on a machine running a dev container (substituting the container ID or container name):

```sh
docker exec -it <<container ID or container name>> bash
```

### Ongoing Maintenance

Application changes requiring local development environment updates should be applied to the dev container automation wherever possible.

### Backup Considerations

Pushing to GitHub or backing up regularly is recommended.

* If a development container uses a bind mount and the source of the bind mount is deleted, any local updates made in the dev container **will be lost**.
* If a repository URL is cloned into a Docker volume and the volume is deleted, any local updates made in the dev container **will be lost**.

### Network Connectivity Loss

If network connectivity from Docker containers is lost try restarting the docker daemon (or equivalent) on the machine running the Visual Studio Code dev container.

For example, in a Linux environment using systemd:

* Issue the following command for rootful Docker:

  ```sh
  sudo systemctl restart docker
  ```

* Issue the following command as a rootless Docker socket owner:

  ```sh
  systemctl --user restart docker
  ```

### Volume Permissions

If container volume permissions change unexpectedly, a potential reason could be unorderly container shutdown. Restoration of required volume permissions can be achieved using standard operating system commands. For example, in a Linux environment, issue the following command (substituting the required user ID, group ID and volume path):

```sh
sudo chown -R <<user ID>>:<<group ID>> <<path/to/volume>>
```

### Teardown

Teardown can be performed by closing the remote connection to the dev container in Visual Studio Code
(File -> Close Remote Connection) and running [teardown.sh](../.devcontainer/scripts/teardown.sh). This script:

* stops and removes **ALL** Docker containers (using [stop-and-remove-containers.sh](../.devcontainer/scripts/stop-and-remove-containers.sh))
* removes the custom network **ls** used by fws-api associated Docker containers (using [remove-networks.sh](../.devcontainer/scripts/remove-networks.sh))
* removes the following fws-api associated volumes (using [remove-volumes.sh](../.devcontainer/scripts/remove-volumes.sh)):
  * pgadmin
  * pgdata
  * vscode
  * Development container volume

 The custom network and/or volumes can be retained by running the individual removal scripts mentioned above.
