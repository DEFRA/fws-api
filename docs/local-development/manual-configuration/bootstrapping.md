# Bootstrapping

* Run [non-dev-container-bootstrap.sh](../../../docker/scripts/non-dev-container-bootstrap.sh) from the repsitory root
  to perform the following activities:
  * Set required environment variables using the [Docker .env file](../../../docker/.env).
  * Docker named volume creation.
  * Docker custom network creation.
  * Container creation:
    * LocalStack.
    * Postgres database.
    * Pgadmin4.
    * Liquibase.
      * Changesets are run to create the containerised Postgres database structure.
  * AWS Lambda function registration with LocalStack.
  * AWS API Gateway registration with LocalStack.
  * Target area data insertion into the containerised Postgres database.
  * Liquibase container removal.
