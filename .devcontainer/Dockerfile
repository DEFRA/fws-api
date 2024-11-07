FROM mcr.microsoft.com/devcontainers/base:jammy

COPY --chown=vscode:vscode scripts/*.sh /home/vscode/fws-tmp/scripts/

RUN /home/vscode/fws-tmp/scripts/install-packages.sh
