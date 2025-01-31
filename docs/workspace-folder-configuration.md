# Workspace Configuration

*Workpace configuration is not applicable when using Windows with WSL 2 currently*.

As described in [local repository creation](./local-repository-creation.md), support is provided for:

* A local fws-api repository to be placed in a location other than **/opt/workspaces/** when using macOS and native Linux.
* Running/debugging code in a dev container created by cloning the remote fws-api repository into a container volume when using native Linux.

 In these scenarios an,
[environment variable configured shell script](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh) is provided to create a symbolic link from **/opt/workspaces/fws-api/** to the local repository root.

Local fws-api repository placement somewhere other than **/opt/workspaces/** results in the following path being used for code location when running debugging:

* /opt/workspaces/fws-api (symbolic link) -> /path/to/local/fws-api/repository.

Remote repository cloning into a container volume results in one of the following paths being used for code location when running/debugging (depending on the local fws-api repository location):

* /workspaces/fws-api (symbolic link) -> /opt/workspaces/fws-api (local repository)
* /workspaces/fws-api (symbolic link) -> /opt/workspaces/fws-api (symbolic link) -> /path/to/local/fws-api/repository.

## Apply Workspace Configuration

### Mandatory Environment Variables

| name | description |
|------|-------------|
| LOCAL_FWS_API_DIR | The **absolute** path to the root of a local fws-api repository. |

### Run Workspace Configuration Shell Script

[link-workspace-folder-on-host-to-local-repository.sh](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh) **must** be run as **root** before attempting to create a dev container. This script validates the mandatory environment variables and exits if configuration
issues are detected. If no configuration issues are detected, the following actions are performed to allow a dev container to be created from either a local fws-api repository or by cloning the remote fws-api repository into a container volume:

* Ensure the directory **/workspaces** exists on the host.
  * This is required to locate code for running/debugging  when cloning the remote fws-api repository into a container volume.
* Ensure a symbolic link from **/workspaces/fws-api/** to **/opt/workspaces/fws-api/** exists.
  * This is required to locate code for running/debugging when cloning the remote fws-api repository into a container volume.
* Ensure a symbolic link from **/opt/workspaces/fws-api** to **LOCAL_FWS_API_DIR** exists if the two locations differ.
  * This is required to locate code for running/debugging regardless of how a dev container is created:

**IMPORTANT** - If [link-workspace-folder-on-host-to-local-repository.sh](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh) is run using the sudo command, the user session from which the sudo command is run **must** ensure that the mandatory environment variable is available to the script. This is because user session environment variables are not available to a sudo command by default. For example, if the environment variable is available to the user session running the sudo command, it can be preserved for availability to [link-workspace-folder-on-host-to-local-repository.sh](../.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh) using the following sudo command:

```sh
sudo --preserve-env=LOCAL_FWS_API_DIR "$LOCAL_FWS_API_DIR"/.devcontainer/scripts/link-workspace-folder-on-host-to-local-repository.sh
```
