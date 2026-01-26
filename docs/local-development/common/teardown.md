# Teardown

 Teardown can be performed by running the teardown npm script from the repository root:

 ```sh
 npm run teardown
 ```

The teardown npm script runs [teardown.sh](../../../docker/scripts/teardown.sh). This script:

* stops and removes **ALL** Docker containers (using [stop-and-remove-containers.sh](../../../docker/scripts/stop-and-remove-containers.sh))
* removes the custom network **ls** used by fws-api associated Docker containers (using [remove-networks.sh](../../../docker/scripts/remove-networks.sh))
* removes the following fws-api associated volumes (using [remove-volumes.sh](../../../docker/scripts/remove-volumes.sh)):
  * fwspgadmin
  * fwspgdata
  * fwspgbootstrap
  * vscode
  * fwsliquibase
  * development container volume

 The custom network and/or volumes can be retained by running the individual removal scripts mentioned above.
