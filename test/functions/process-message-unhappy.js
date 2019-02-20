'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../lib/functions/process-message').handler
const services = require('../../lib/helpers/services')
const sinon = require('sinon').createSandbox()

lab.experiment('test', () => {
  lab.beforeEach(() => {
    services.putMessage = (query) => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  })
  lab.afterEach(() => {
    sinon.restore()
  })
  lab.test('getting 400 response code when targetArea does not have a match in databse', async () => {
    const response = await handler({
      bodyXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?><WarningMessage xmlns=\"http://www.environment-agency.gov.uk/XMLSchemas/EAFWD\" approved=\"12/10/2018 13:29\" requestId=\"\" language=\"English\"><TargetAreaCode><![CDATA[555]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday's high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>"
    })
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.errorMessage).to.equal('insert or update on table "message" violates foreign key constraint "fk_tacode_message_target_area"')
  })
  lab.test('getting 400 response code when xml fails Joi validation', async () => {
    const response = await handler({})
    Code.expect(response.statusCode).to.equal(400)
    Code.expect(response.errorMessage).to.equal(`Cannot read property 'substring' of undefined`)
  })
})
