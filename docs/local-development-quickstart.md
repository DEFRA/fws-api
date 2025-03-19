# Local Development Quickstart

The quickest way to get started is with a [containerised development environment](https://code.visualstudio.com/docs/remote/containers).

A containerised development environment automates a number of setup activities required for a functioning local development environment such as:

* Configuration of additional operating system package repositories.
* Installation of additional operating system packages.
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

If an existing local development environment has been configured manually **it is recommended that a backup of it is created before proceeding**.

## Contents

* [Prerequisites](./prerequisites.md)
* [Local Repository Creation](./local-repository-creation.md)
* [Workspace Folder Configuration](./workspace-folder-configuration.md)
  * **Not** applicable when using Winsows with WSL2 currently.
* [Rootless Docker Configuration](./rootless-docker-configuration.md)
  * **Only** applicable when using native Linux.
* [Dev Container Creation](./dev-container-creation.md)
* [Running And Debugging Lambda Functions](./running-and-debugging-lambda-functions.md)
* [Troubleshooting](./troubleshooting.md)
* [Additional Development Container Considerations](./additional-dev-container-considerations.md)
