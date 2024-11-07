#!/bin/sh
set -e
# Install Nodesource package signing key and the Node.js repository.
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --yes --dearmor -o /usr/share/keyrings/nodesource.gpg
#install -o root -g root -m 644 nodesource.gpg /etc/apt/trusted.gpg.d/ && rm nodesource.gpg
echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODEJS_VERSION:-18}.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list > /dev/null
# Install packages
apt update -y && apt install -y netcat nodejs && apt clean all -y

