#!/bin/sh
set -e

# Remove /etc/apt/sources.list.d/backports.list to resolve apt duplication warnings
rm -f /etc/apt/sources.list.d/backports.list
# Install Nodesource package signing key and the Node.js repository.
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --yes --dearmor -o /usr/share/keyrings/nodesource.gpg
echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODEJS_VERSION}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list > /dev/null
# Install packages
apt update -y && \
apt install -y netcat nodejs && \
apt clean -y
