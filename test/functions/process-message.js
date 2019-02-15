'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const Db = require('../../lib/helpers/db')
const handler = require('../../lib/functions/process-message').handler
let Message = require('../../lib/models/message')
const services = require('../../lib/helpers/services')

const sinon = require('sinon').createSandbox()

// const Db = {}

lab.experiment('test', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(Message.prototype, 'save').callsFake(() => {
      return Promise.resolve({
        TargetAreaCode: '111FWCECD022',
        Severity: 'Flood Warning',
        SeverityValue: '2',
        Situation: " This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday's high tides, however we are continuing to monitor the situation.",
        SituationChanged: '12/10/2018 13:29',
        SeverityChanged: '12/10/2018 13:29'
      })
    })
    services.putMessage = (query) => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
  })
  lab.afterEach(() => {
    sinon.restore()
  })
  lab.test('xml is rejected', async () => {
    try {
      await handler({
        bodyXml: ' ' })
      Code.expect(true).to.equal(false)
    } catch (err) {
      Code.expect(err).to.be.an.error()
    }
  })
  lab.test('getting 200 response code writing to Database and full message populated', async () => {
    const response = await handler({
      bodyXml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?><WarningMessage xmlns=\"http://www.environment-agency.gov.uk/XMLSchemas/EAFWD\" approved=\"12/10/2018 13:29\" requestId=\"\" language=\"English\"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday's high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>"
    })
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.body.TargetAreaCode).to.equal('111FWCECD022')
    Code.expect(response.body.Severity).to.equal('Flood Warning')
    Code.expect(response.body.SeverityValue).to.equal('2')
    Code.expect(response.body.Situation).to.equal(" This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday's high tides, however we are continuing to monitor the situation.")
    Code.expect(response.body.SituationChanged).to.equal('12/10/2018 13:29')
    Code.expect(response.body.SeverityChanged).to.equal('12/10/2018 13:29')
  })
  lab.test('xml not parseing and throwing error', async () => {
    await Code.expect(handler({ bodyXml: 'xdvxsdvg' }))
      .to.reject()
  })
})
