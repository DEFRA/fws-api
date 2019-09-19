'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../lib/functions/get-all-messages').handler
const eventJson = require('../data/events/get-all-messages-json.json')
const eventXml = require('../data/events/get-all-messages-xml.json')
const Services = require('../../lib/helpers/services')

const sinon = require('sinon').createSandbox()

lab.experiment('functions/get-all-messages', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(Services.prototype, 'getAllMessages').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })
    sinon.stub(Services.prototype, 'clearDownNoLongerInForce').callsFake(() => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('Happy: get all messages json function (empty)', async () => {
    const response = await handler(eventJson)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/json')
    Code.expect(response.body).to.equal('{"warnings":[]}')
  })

  lab.test('Happy: get all messages xml function (empty)', async () => {
    const response = await handler(eventXml)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/xml')
    Code.expect(response.body).to.equal('<?xml version="1.0" encoding="utf-8"?><warningreport/>')
  })

  lab.test('Happy: get all messages json function (populated)', async () => {
    Services.prototype.getAllMessages.restore()
    sinon.stub(Services.prototype, 'getAllMessages').callsFake(() => {
      return Promise.resolve({
        rows: require('../data/db-response/messages-db.json')
      })
    })

    const response = await handler(eventJson)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/json')
    Code.expect(response.body).to.equal(JSON.stringify(require('../data/lambda-response/fwis.json')))
  })

  lab.test('Happy: get all messages xml function (populated)', async () => {
    Services.prototype.getAllMessages.restore()
    sinon.stub(Services.prototype, 'getAllMessages').callsFake(() => {
      return Promise.resolve({
        rows: require('../data/db-response/messages-db.json')
      })
    })

    const response = await handler(eventXml)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/xml')
    Code.expect(response.body).to.equal('<?xml version="1.0" encoding="utf-8"?><warningreport><warning taId="32601" taCode="013FWFGM2C" taName="River Irwell at Salford Area C" taDescription="Areas at risk include properties in the Lower Kersal, Lower Broughton, Charlestown and Wallness neighbourhoods including the University area to Adelphi Street and Trinity Way up to the junction of the A6041" quickDial="305001" version="2" taCategory="Flood Warning" ownerArea="Greater Manchester, Merseyside and Cheshire" createdDate="2017-04-11T00:00:00.000Z" lastModifiedDate="2017-04-11T00:00:00.000Z" situationChanged="2019-07-18T13:30:00.000Z" severityChanged="2019-07-18T13:30:00.000Z" timeMessageReceived="2019-07-19T11:20:13.377Z" severityValue="3" severity="Severe Flood Warning"><situation>Sent from jmeter</situation></warning></warningreport>')
  })

  lab.test('Sad: get all messages throw error', async () => {
    Services.prototype.getAllMessages.restore()
    sinon.stub(Services.prototype, 'getAllMessages').callsFake(() => {
      return Promise.reject(new Error('test error'))
    })
    const err = await Code.expect(handler(eventJson)).to.reject()
    Code.expect(err.message).to.equal('[500] test error')
  })
})
