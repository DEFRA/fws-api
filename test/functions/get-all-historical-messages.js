'use strict'

const handler = require('../../lib/functions/get-all-historical-messages').handler
const event = require('../data/events/get-all-historical-messages.json')
const Services = require('../../lib/helpers/services')

describe('functions/get-all-historical-messages', () => {
  beforeEach(() => {
    // setup mocks
    jest.spyOn(Services.prototype, 'getAllHistoricalMessages').mockImplementation(() => {
      return Promise.resolve({
        rows: require('../data/db-response/messages-db.json')
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Happy: get all historical messages', async () => {
    const response = await handler(event)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/json')
    expect(response.body).toEqual(JSON.stringify(require('../data/lambda-response/fwis-plus.json')))
  })

  it('Sad: get all historical messages error', async () => {
    jest.spyOn(Services.prototype, 'getAllHistoricalMessages').mockImplementation(() => {
      return Promise.resolve({
        rows: 'sdgfdfshdhndf'
      })
    })

    await expect(handler(event)).rejects.toThrow(new Error('[500] rows.forEach is not a function'))
  })

  it('Sad: get historical messages throw error', async () => {
    jest.spyOn(Services.prototype, 'getAllHistoricalMessages').mockImplementation(() => {
      return Promise.reject(new Error('test error'))
    })
    await expect(handler(event)).rejects.toThrow(new Error('[500] test error'))
  })

  it('Sad: get historical messages bad request throw error', async () => {
    event.pathParameters = undefined
    await expect(handler(event)).rejects.toThrow(new Error('[500] Cannot read properties of undefined (reading \'code\')'))
  })
})
