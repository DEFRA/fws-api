[![Build Status](https://travis-ci.com/DEFRA/fws-api.svg?token=gaJqX8fxhoSAADGJKMvM&branch=master)](https://travis-ci.com/DEFRA/fws-api)[![Maintainability](https://api.codeclimate.com/v1/badges/01644956b0df48b0d3c8/maintainability)](https://codeclimate.com/github/DEFRA/fws-api/maintainability)[![Test Coverage](https://api.codeclimate.com/v1/badges/01644956b0df48b0d3c8/test_coverage)](https://codeclimate.com/github/DEFRA/fws-api/test_coverage)

# FWS-API

These are the serverless backend services for the Fwis replacement API and Fwis management tool (FWS-app)

# Environment Variables

Env vars can be found in a .profile file stored in gitlab.

The file `./lib/config.js` contains the validation for the environment variables, and therefore shows what env vars you require to run the project.

# Deployment

`npm run deploy`