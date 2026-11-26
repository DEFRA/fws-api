'use strict'

const handler = require('../../lib/functions/get-all-target-areas').handler
const event = require('../data/events/get-all-target-areas.json')
const Services = require('../../lib/helpers/services')

describe('functions/get-all-historical-messages', () => {
  beforeEach(() => {
    // setup mocks
    jest.spyOn(Services.prototype, 'getAllTargetAreas').mockImplementation(() => {
      return Promise.resolve({
        rows: require('../data/db-response/target-areas-db.json')
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Happy: get all target areas', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/json')
    expect(response.body).toEqual(JSON.stringify(require('../data/lambda-response/target-areas.json')))
  })

  it('Sad: get all target areas error', async () => {
    jest.spyOn(Services.prototype, 'getAllTargetAreas').mockImplementation(() => {
      return Promise.reject(new Error('Test error'))
    })

    await expect(handler(event)).rejects.toThrow(new Error('[500] Test error'))
  })
})
