# Prerequisites

## Development Platform

Development container creation has been tested using the following platforms:

* Ubuntu 24.04 with native [rootful or rootless Docker](https://docs.docker.com/engine/security/rootless/)
  including [Docker Compose V2](https://docs.docker.com/compose/releases/migrate/)
  * Other Linux distributions should be suitable for dev container creation.
  * Regardless of whether rootful or rootless Docker is used, some configuration is required **before** dev container creation.
  * Rootless Docker is recommended to reduce security risks and requires additional configuration **before** dev container creation.
* MacOS **TBD** with [Docker Desktop](https://www.docker.com/products/docker-desktop/).
* Windows 11 with [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/) Ubuntu and [Docker Desktop](https://www.docker.com/products/docker-desktop/).

## Additional Software

* [Visual Studio Code](https://code.visualstudio.com/)
   with [remote containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
  * **Install on Windows host machine when using Windows.**
* [jq utility](https://jqlang.github.io/jq/download/)
  * **Install on the WSL 2 Linux distribution when using Windows.**
* Ensure [GPG-AGENT is running as a daemon](https://www.gnupg.org/documentation/manuals/gnupg-2.0/Invoking-GPG_002dAGENT.html)
  * **Run on the WSL 2 Linux distribution when using Windows.**

## Setup GitHub Credential Sharing

Visual Studio Code dev containers provide inbuilt support for [accessing git credentials without copying them to the container](https://code.visualstudio.com/docs/remote/containers#_sharing-git-credentials-with-your-container).

* **GitHub Credential Sharing must be setup on the WSL 2 Linux distribution when using Windows**.
