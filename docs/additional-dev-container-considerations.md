# Additional Dev Container Considerations

## Using Terminals Outside Visual Studio Code

If you prefer not to use Visual Studio Code integrated terminals, the **docker exec** command offers an alternative way to provide a terminal. For example, issue the following command in a Linux environment on a machine running a dev container (substituting the container ID or container name):

```sh
docker exec -it <<container ID or container name>> bash
```

## Ongoing Maintenance

Application changes requiring local development environment updates should be applied to the dev container automation wherever possible.

## Backup Considerations

Pushing to GitHub or backing up regularly is recommended.

* If a dev container uses a bind mount and the source of the bind mount is deleted, any local updates made in the dev container **will be lost**.
* If a repository is cloned into a container volume and the volume is deleted, any local updates made in the dev container **will be lost**.

## Network Connectivity Loss

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

## Volume Permissions

If container volume permissions change unexpectedly, a potential reason could be unorderly container shutdown. Restoration of required volume permissions can be achieved using standard operating system commands. For example, in a Linux environment, issue the following command (substituting the required user ID, group ID and volume path):

```sh
sudo chown -R <<user ID>>:<<group ID>> <<path/to/volume>>
```

## Teardown

Teardown can be performed by closing the remote connection to the dev container in Visual Studio Code
(File -> Close Remote Connection) and running [teardown.sh](../.devcontainer/scripts/teardown.sh). This script:

* stops and removes **ALL** Docker containers (using [stop-and-remove-containers.sh](../.devcontainer/scripts/stop-and-remove-containers.sh))
* removes the custom network **ls** used by fws-api associated Docker containers (using [remove-networks.sh](../.devcontainer/scripts/remove-networks.sh))
* removes the following fws-api associated volumes (using [remove-volumes.sh](../.devcontainer/scripts/remove-volumes.sh)):
  * pgadmin
  * pgdata
  * pgbootstrap
  * vscode
  * Development container volume

 The custom network and/or volumes can be retained by running the individual removal scripts mentioned above.
