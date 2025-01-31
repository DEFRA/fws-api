# Local Repoistory Creation

## Plaform Specific Location

Regardless of how a dev container is created a local fws-api repository for use with it owned by the user account running the dev container **must** be created on the dev container host.

* When using WSL 2 on Windows the local repository **must** be placed in **/opt/workspaces/** (resulting in the creation of **/opt/workspaces/fws-api/**).
* When using macOS or native Linux the local repository can be placed in a different accessible location. In this scenario,
[configuration is required](./workspace-folder-configuration.md) to link the workspace folder to the local repository root.

Creation of the **/opt/workspaces/** directory requires root permissions. For example, users with sudo permissions on Ubuntu Linux can use the following command to create the directory.

```sh
sudo mkdir -p /opt/workspaces
```

## Rationale

A dev container can be created from either a local repository on the development machine or a remote repository URL.

* A local repository provides easier access to the code outside the container using a bind mount.
* When using a remote repository URL the code used by the container is located in a Docker volume.
  * While [Microsoft recommend this approach for performance reasons](https://code.visualstudio.com/remote/advancedcontainers/improve-performance), seemingly  
  incompatible constraints when using this approach with [Docker outside Of Docker Compose](https://github.com/devcontainers/templates/tree/main/src/docker-outside-of-docker-compose), [LocalStack integration](https://docs.localstack.cloud/user-guide/integrations/devcontainers/#docker-outside-of-docker) and either macOS or Windows has led to this option only seeming viable with native Linux at the time of writing.

Regardless of how a dev container is created, reposistory contents are held in a workspace folder within the dev container.

The dev container workspace folder location is configurable and defaults to **/workspaces/vscode/** when using [Docker outside Of Docker Compose](https://github.com/devcontainers/templates/tree/main/src/docker-outside-of-docker-compose).

When used with [Docker outside Of Docker Compose](https://github.com/devcontainers/templates/tree/main/src/docker-outside-of-docker-compose), repository contents **must** be available at the same location on the host and in the dev container to enable running/debugging dev container associated code.

To satisfy this requirement and provide a dev container solution compatible with common local development platorms, a custom workspace folder (**/opt/workspaces/**) is used. The rationale for this choice is based on /opt being a well known location for additional software on 'NIX platforms that adheres to the following constraints:

### macOS Constraints

The macOS root filesystem is read only by default. This prevents creation of the default workspace folder on the host.

If creating a dev container from a local repository, the local repository can be placed in a different location to the workspace folder (such as within the
home directory structure of the user running the dev container). In this scenario, configuration is required](./workspace-folder-configuration.md) to link
the workspace folder to the local repository root.

### Windows / WSL 2 Constraints

As for macOS, WSL 2 is capable of allowing a local repository to be placed in a different location to the workspace folder and accessed through a symbolic link within **/opt/workspaces/**. However, at the time of writing Windows does not seem to follow symbolic links created by WSL 2 resulting in no access to code at runtime. As such, a local repository **must** be located within the workspace folder when using WSL 2.

### Dev Container Volume Consraints

When creating a dev container by cloning a remote repository into a container volume, a bootstrap container is used. Within the
bootstrap container the repository contents are placed within **/workspaces/**. This location appears to be non-configurable and
seems incompatible with running/debugging code on macOS and WSL 2 accordingly for the reasons described above.

As such, running/debugging code on macOS and Windows WSL 2 with Docker Desktop only seems possible when creating a dev container from a local repository.

Symbolic links allow running/debugging code on native Linux regardless of how a dev container is created:

* As for macOS, symbolic links allow the local repository to be placed in a different location to the workspace folder.
* As the Linux root file system is not read only by default, symbolic links can also be used to access **/opt/workspaces/** from **/workspaces/** to facilitate running/debugging when a dev container is created by cloning a remote repository into a container volume.
