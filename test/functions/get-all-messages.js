'use strict'

const handler = require('../../lib/functions/get-all-messages').handler
const eventJson = require('../data/events/get-all-messages-json.json')
const eventPlusJson = require('../data/events/get-all-messages-plus-json.json')
const eventXml = require('../data/events/get-all-messages-xml.json')
const Services = require('../../lib/helpers/services')

describe('functions/get-all-messages', () => {
  beforeEach(() => {
    // setup mocks
    jest.spyOn(Services.prototype, 'getAllMessages').mockImplementation(() => {
      return Promise.resolve({
        rows: []
      })
    })
    jest.spyOn(Services.prototype, 'clearDownNoLongerInForce').mockImplementation(() => {
      return Promise.resolve({})
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Happy: get all messages json function (empty)', async () => {
    const response = await handler(eventJson)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/json')
    expect(response.body).toEqual('{"warnings":[]}')
  })

  it('Happy: get all messages plus json function (empty)', async () => {
    const response = await handler(eventPlusJson)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/json')
    expect(response.body).toEqual('{"warnings":[]}')
  })

  it('Happy: get all messages xml function (empty)', async () => {
    const response = await handler(eventXml)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/xml')
    expect(response.body).toEqual('<?xml version="1.0" encoding="utf-8"?><warningreport/>')
  })

  it('Happy: get all messages json function (populated)', async () => {
    jest.spyOn(Services.prototype, 'getAllMessages').mockImplementation(() => {
      return Promise.resolve({
        rows: require('../data/db-response/messages-db.json')
      })
    })

    const response = await handler(eventJson)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/json')
    expect(response.body).toEqual(JSON.stringify(require('../data/lambda-response/fwis.json')))
  })

  it('Happy: get all messages plus json function (populated)', async () => {
    jest.spyOn(Services.prototype, 'getAllMessages').mockImplementation(() => {
      return Promise.resolve({
        rows: require('../data/db-response/messages-db.json')
      })
    })

    const response = await handler(eventPlusJson)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/json')
    expect(response.body).toEqual(JSON.stringify(require('../data/lambda-response/fwis-plus.json')))
  })

  it('Happy: get all messages xml function (populated)', async () => {
    jest.spyOn(Services.prototype, 'getAllMessages').mockImplementation(() => {
      return Promise.resolve({
        rows: require('../data/db-response/messages-db.json')
      })
    })

    const response = await handler(eventXml)
    expect(response.statusCode).toEqual(200)
    expect(response.headers['Content-Type']).toEqual('application/xml')
    expect(response.body).toEqual('<?xml version="1.0" encoding="utf-8"?><warningreport><warning taId="32601" taCode="013FWFGM2C" taName="River Irwell at Salford Area C" taDescription="Areas at risk include properties in the Lower Kersal, Lower Broughton, Charlestown and Wallness neighbourhoods including the University area to Adelphi Street and Trinity Way up to the junction of the A6041" quickDial="305001" version="2" taCategory="Flood Warning" ownerArea="Greater Manchester, Merseyside and Cheshire" createdDate="2017-04-11T00:00:00.000Z" lastModifiedDate="2017-04-11T00:00:00.000Z" situationChanged="2019-07-18T13:30:00.000Z" severityChanged="2019-07-18T13:30:00.000Z" timeMessageReceived="2019-07-19T11:20:13.377Z" severityValue="3" severity="Severe Flood Warning"><situation>Sent from jmeter</situation></warning></warningreport>')
  })

  it('Sad: get all messages throw error', async () => {
    jest.spyOn(Services.prototype, 'getAllMessages').mockImplementation(() => {
      return Promise.reject(new Error('test error'))
    })
    await expect(handler(eventJson)).rejects.toThrow(new Error('[500] test error'))
  })

  it('Sad: get all messages plus throw error', async () => {
    jest.spyOn(Services.prototype, 'getAllMessages').mockImplementation(() => {
      return Promise.reject(new Error('test error'))
    })
    await expect(handler(eventPlusJson)).rejects.toThrow(new Error('[500] test error'))
  })
})
