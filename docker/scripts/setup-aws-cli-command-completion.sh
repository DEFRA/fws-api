#!/bin/sh
set -e

echo "" >> ~/.bashrc
echo complete -C '/usr/local/bin/aws_completer' aws  >> ~/.bashrc
echo complete -C '/usr/local/bin/aws_completer' awslocal >> ~/.bashrc
