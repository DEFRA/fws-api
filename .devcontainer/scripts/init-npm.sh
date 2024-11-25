#!/bin/sh
set -e

NPM_PACKAGES_PATH="${HOME}/.npm-packages"

# Allow npm package installation without using sudo
( echo ""; echo NPM_PACKAGES="${NPM_PACKAGES_PATH}"; echo PATH="${NPM_PACKAGES_PATH}/bin:${PATH}") >> ${HOME}/.bashrc

# Install npm packages
npm i

