# Configure Rootless Docker

*These instructions are for use with native Docker on native Linux/systemd enabled WSL 2 **only** and assume that rootless Docker is installed.*

## Ensure A Local Repository Exists

The location **/opt/workspaces/**  (resulting in a local repository root of  **/opt/workspaces/fws-api)** is suggested as it matches the location required when using macOS / WSL 2. If the local repository is located elsewhere, [shell scripting ensures that the local repository will be utilised at runtime to enable code location for running/debugging purposes](../../../docker/scripts/link-workspace-folder-on-host-to-local-repository.sh).

## Mandatory Environment Variables

| name | description |
|------|-------------|
| LOCAL_FWS_API_DIR | The **absolute** path to the root of a local fws-api repository. |
| FWS_API_HOST_USERNAME | Username for the account running rootless Docker. |

## Run Configuration Shell Script

[setup-for-rootless-docker-without-dev-container.sh](../../../docker/scripts/setup-for-rootless-docker-without-dev-container.sh) **must** be run as **root** before [bootstrapping](./bootstrapping.md). This script validates the mandatory environment variables and exits if configuration issues are detected. If no configuration issues are detected, the following actions are performed:

* Rootful Docker socket backup.
* Replacement of rootful Docker socket with a symbolic link to the rootless Docker socket.
  * This is required because the Docker socket used by LocalStack does not appear to be configurable at the time of writing.

**IMPORTANT** - If [setup-for-rootless-docker-without-dev-container.sh](../../../docker/scripts/setup-for-rootless-docker-without-dev-container.sh) is run using the sudo command, the user session from which the sudo command is run **must** ensure that mandatory environment variables are available to the script. This is because user session environment variables are not available to a sudo command by default. For example, if the environment variables are available to the user session running the sudo command, they can be preserved for availability to [setup-for-rootless-docker-without-dev-container.sh](../../../docker/scripts/setup-for-rootless-docker-without-dev-container.sh) using the following sudo command:

```sh
sudo --preserve-env=LOCAL_FWS_API_DIR,FWS_API_HOST_USERNAME "$LOCAL_FWS_API_DIR"/docker/scripts/setup-for-rootless-docker-without-dev-container.sh
```

### Housekeeping Considerations

**IMPORTANT** - The rootful Docker socket (/var/run/docker.sock) appears to be recreated in scenarios such as a system
reboot. As such [setup-for-rootless-docker-without-dev-container.sh](../../../docker/scripts/setup-for-rootless-docker-without-dev-container.sh) **must** be run following such scenarios to ensure that /var/run/docker.sock refers to the rootless Docker socket.
