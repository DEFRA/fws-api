![Build status](https://github.com/DEFRA/fws-api/actions/workflows/ci.yml/badge.svg)[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fws-api&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_fws-api)[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fws-api&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_fws-api)

# FWS-API

This repository contains the serverless backend services for the **FWIS replacement API** and the **FWIS management tool (FWS-app)**.

## Prerequisites

- **Node.js 24** or higher
- Appropriate API keys and environment variables (see below)

## Getting Started

 Install dependencies:

```bash
npm install
```

### Local Development

#### Local Development Prerequisites

- Docker 28.02 or above
- Docker Compose 2.34 or above

Containerisation is used to provide developers with the ability to develop, run and debug AWS Lambda functions without reliance on deployment to AWS infrastructure. This replaces [Serverless local function invocation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local) following Serverless V.3 reaching end of support and a decision not to [upgrade to Serverless V.4](https://wb.serverless.com/framework/docs-guides-upgrading-v4).

#### Local Development Options

- [Local Development Quickstart Using Visual Studio Code Development Containers](docs/local-development/dev-container/setup-and-teardown.md)
- [Configuring And Running A Local Development Environment Manually](docs/local-development/manual-configuration/setup-and-teardown.md)

### Cloud Resource Connectivity

1. API keys can be found in **fws-db**. Connection details are available in the config files (see `./lib/config.js` for more information).

2. Ensure you have the required environment variables (see below).

#### Environment Variables

Environment variables are critical for the correct functioning of the API. These variables can be found in a `.profile` file stored in GitLab: [GitLab: FWS-config](https://gitlab-dev.aws-int.defra.cloud/flood/fws-config).

You can check the required environment variables in `./lib/config.js`, which contains validation logic for them.

##### Example environment variables

```bash
export FWS_ENV_NAME="env-name"
export FWS_LAMBDA_ROLE="lambda-connection-role"
```

Ensure all required environment variables are configured correctly before connecting to cloud resources.

## Running Tests

To run tests, use the following commands:

- **Run both linter and unit tests:**

   ```bash
   npm run test
   ```

- **Run only unit tests:**

   ```bash
   npm run unit-test
   ```

Auto tests for this project can be found at: [GitHub: DEFRA/fws-tests](https://github.com/DEFRA/fws-tests).

## Debugging Unit Tests

Run the Visual Studio Code **debug unit tests** debug configuration.

## API Status Codes

The following status codes are returned by the API:

- **200 Created**: The request was successful, and a new resource was created.
- **401 Unauthorized**: The API key is invalid or missing.
- **403 Forbidden**: The request is valid but the API key is not authorized to access this resource with an explicit deny.
- **500 Internal Server Error**: An error occurred on the server.

## Contributing

We welcome contributions to this project. Please follow these steps:

1. Before submitting a pull request, read the [Contribution Guidelines](/CONTRIBUTING.md).
2. Ensure your code adheres to the coding standards and has appropriate test coverage.
3. Submit your pull request, and ensure all automated tests pass.

## Additional Information

- **Documentation**: Ensure your changes are documented appropriately. Any significant changes should be reflected in this README or other documentation.
- **API Usage**: For usage examples and further API documentation, see the related documentation in the repository or project wiki.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
