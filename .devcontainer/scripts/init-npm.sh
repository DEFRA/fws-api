#!/bin/sh
set -e

# Allow npm package installation without using sudo
( echo NPM_PACKAGES="${HOME}/.npm-packages"; echo PATH="${HOME}/.npm-packages/bin:${PATH}") >> ${HOME}/.bashrc

# Install npm packages
npm i

