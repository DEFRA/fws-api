# Bootstrapping

* If using Visual Studio Code for debugging, the environment variable DEBUG_HOST_ADDRESS **must** be set to 127.0.0.1
  **before** launching Visual Studio Code. For example, the following command can be used on native Linux:
  ```sh
  export DEBUG_HOST_ADDRESS=127.0.0.1 && code
  ```
* Run the bootstrap-debug npm script from the repository root.

   ```sh
   npm run bootstrap-debug
   ```
  * The npm script runs [non-dev-container-bootstrap.sh](../../../docker/scripts/non-dev-container-bootstrap.sh)
    which performs the following activities:
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
