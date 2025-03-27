#!/bin/sh
set -e

DOWNLOAD_DIR=~/Software/maven/
MAVEN_VERSION=3.9.9

# See https://maven.apache.org/download.cgi?.

# Import the Apache Maven public key from the Ubuntu key server.
echo Importing Apache Maven public key ${APACHE_MAVEN_PUBLIC_KEY}
gpg --keyid-format long --recv-keys ${APACHE_MAVEN_PUBLIC_KEY}
echo Imported Apache Maven public key ${APACHE_MAVEN_PUBLIC_KEY}
mkdir -p ${DOWNLOAD_DIR}
curl "https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" -o ${DOWNLOAD_DIR}apache-maven-${MAVEN_VERSION}-bin.tar.gz
curl "https://downloads.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz.asc" -o ${DOWNLOAD_DIR}apache-maven-${MAVEN_VERSION}-bin.tar.gz.asc
gpg --verify ${DOWNLOAD_DIR}apache-maven-${MAVEN_VERSION}-bin.tar.gz.asc ${DOWNLOAD_DIR}apache-maven-${MAVEN_VERSION}-bin.tar.gz
# See https://maven.apache.org/install.html
(
  cd ${DOWNLOAD_DIR} && \
  tar xzvf apache-maven-${MAVEN_VERSION}-bin.tar.gz && \
  echo PATH=${DOWNLOAD_DIR}apache-maven-${MAVEN_VERSION}/bin:$PATH >> ~/.profile
)
