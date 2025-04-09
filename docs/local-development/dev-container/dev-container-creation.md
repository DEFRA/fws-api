# Create A Dev Container

* A development container **must** be created using a new Visual Studio Code window.
* When using macOS or non-systemd enabled WSL 2 with Docker Desktop the development container **must** be created using a
 [local fws-api repository](./local-repository-creation.md) on the development machine.
  * When using WSL 2 the [\\wsl drive](https://learn.microsoft.com/en-us/windows/wsl/filesystems#interoperability-between-windows-and-linux-commands) can be used to access the local fws-api respository from Visual Studio Code on Windows.
* When using native Linux or systemd enabled WSL 2 with native Docker the development container can be created from either a local fws-api repository on the development machine or a remote repository URL.
  * When using WSL 2 the [\\wsl drive](https://learn.microsoft.com/en-us/windows/wsl/filesystems#interoperability-between-windows-and-linux-commands) can be used to access the local fws-api respository from Visual Studio Code on Windows.
  * When using SSH key based credential sharing, [git SSH URLs](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories) **must** be used when cloning a remote repository URL to ensure compatibility with credential sharing.
  * When **not** using SSH key based credential sharing, [git HTTPS URLs](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories) **must** be used when cloning a remote repository URL to ensure compatibility with credential sharing.

Please consult the [Microsoft documentation](https://code.visualstudio.com/docs/remote/containers) for further details.

After a local directory has been selected or a repository URL has been entered it will take several minutes for the containerised development environment to be be created. Internet connection speed is a factor in how long the process takes.

## Check That Expected Docker Containers Are Running And Unit Tests Pass

* Open an Integrated Terminal (**File -> New Terminal** menu option) in the development container Visual Studio Code window.
  * This should open a terminal in the directory **/workpaces/fws-api/** within the development container.
* Issue the command **docker ps**
  * Four containers associated with the FWS API should be running on the **Docker host** (due to use of Docker outside of Docker Compose):
    * Development container
    * LocalStack container
    * Postgres container
    * PgAdmin4 container

* Issue the command **npm test** in the development container Visual Studio Code Integrated terminal.
  * Unit tests should pass as they would in a local development environment configured correctly manually.
