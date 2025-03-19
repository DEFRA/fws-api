# Configure Rootless Docker

*These instructions are for use with native Docker on Linux **only** and assume that rootless Docker is installed.*

## Configure Visual Studio Code To Use Rootless Docker With Dev Containers

Ensure the Visual Studio Code user settings JSON file  contains a **dev.containers.dockerSocketPath** entry referencing the absolute path to the rootless Docker socket. For example: **"dev.containers.dockerSocketPath": "/run/user/1000/docker.sock"**.

## Ensure A Local Repository Exists For Use With A Dev Container

[Ensure that a local fws-api repository for use with a dev container exists on the host](./local-repository-creation.md)

The repository can be located anywhere on the Linux host accessible to the user account that runs a dev container. This account
**must** also be the account that runs the rootless Docker socket. In the simplest case where the local repository is used to create a dev container, the location **/opt/workspaces/**  (resulting in a local repository root of  **/opt/workspaces/fws-api)** is suggested as it matches the location required when using macOS / WSL 2. If the local repository is located elsewhere, [shell scripting ensures that the local repository will be utilised at runtime to enable code location for running/debugging purposes](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh).

## Mandatory Environment Variables

| name | description |
|------|-------------|
| LOCAL_FWS_API_DIR | The **absolute** path to the root of a local fws-api repository. |
| FWS_API_HOST_USERNAME | Username for the **host** account used when creating a dev container. This **must** be the account ruuning rootless Docker and have entries in /etc/subuid and /etc/subgid accordingly. |

## Run Configuration Shell Script

[setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) **must** be run as **root** before attempting to create a dev container from either a local fws-api repository or by cloning the remote fws-api repository into a container volume. This script validates the mandatory environment variables and exits if configuration issues are detected. If no configuration issues are detected, the following actions are performed regardless of how dev containers are created:

* Rootful Docker socket backup.
* Replacement of rootful Docker socket with a symbolic link to the rootless Docker socket.
  * This is required because the Docker socket used by [Docker outside Of Docker Compose](https://github.com/devcontainers/templates/tree/main/src/docker-outside-of-docker-compose) dev containers does not appear to be configurable at the time of writing.
* Grant of rootless Docker socket read write access to the host SUBGID for the dev container **vscode** user.

To facilitate dev container creation from the local fws-api repository, ownership of the local fws-api repository is **transferred** to the host SUBUID and SUBGID for the dev container **vscode** user.

* This action forces work to be performed within the dev container rather than using the local fws-api repository directly.
  * This prevents a risk of git reporting dubious file ownership that can occur when repository access is permitted from within and outside of a dev container created from a local repository.
    * If direct work on the host is required, the creation of a distinct local fws-api repository for this purpose is recommended.

When creating a dev container by cloning the remote fws-api repository into a container volume, the dev container user has ownership of items in the volume without risk of git reporting dubious ownership.

**IMPORTANT** - If [setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) is run using the sudo command, the user session from which the sudo command is run **must** ensure that mandatory environment variables are available to the script. This is because user session environment variables are not available to a sudo command by default. For example, if the environment variables are available to the user session running the sudo command, they can be preserved for availability to [setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) using the following sudo command:

```sh
sudo --preserve-env=LOCAL_FWS_API_DIR,FWS_API_HOST_USERNAME "$LOCAL_FWS_API_DIR"/.devcontainer/scripts/setup-for-rootless-docker.sh
```

### Housekeeping Considerations

**IMPORTANT** - The rootful Docker socket (/var/run/docker.sock) appears to be recreated in scenarios such as a system
reboot. As such [setup-for-rootless-docker.sh](../.devcontainer/scripts/setup-for-rootless-docker.sh) **must** be run following such scenarios to ensure that /var/run/docker.sock refers to the rootless Docker socket.
