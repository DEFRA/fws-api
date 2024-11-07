FROM mcr.microsoft.com/devcontainers/base:jammy

COPY --chown=vscode:vscode scripts/*.sh /home/vscode/fws-tmp/scripts/

# Remove /etc/apt/sources.list.d/backports.list to resolve apt duplication warnings
RUN rm /etc/apt/sources.list.d/backports.list && echo **DEBUG_CONTAINER_ADDRESS** **$NODEJS_VERSION**
# RUN /home/vscode/fws-tmp/scripts/install-packages.sh
