![Build status](https://github.com/DEFRA/fws-api/actions/workflows/ci.yml/badge.svg)[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fws-api&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_fws-api)[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fws-api&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_fws-api)


# FWS-API

These are the serverless backend services for the Fwis replacement API and Fwis management tool (FWS-app)

# Environment Variables

Env vars can be found in a .profile file stored in gitlab.

The file `./lib/config.js` contains the validation for the environment variables, and therefore shows what env vars you require to run the project.

# Deployment

`npm run deploy`
