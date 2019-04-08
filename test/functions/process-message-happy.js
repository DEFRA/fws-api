'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../lib/functions/process-message').handler
const services = require('../../lib/helpers/services')
const sinon = require('sinon')
const aws = require('../../lib/helpers/aws')

// setup mocks
lab.experiment('Notification API Client', () => {
  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    await sinon.createSandbox()
    // stub the put message db call
    services.putMessage = () => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }

    // stub the email after each error
    sinon.stub(aws.email, 'publishMessage').callsFake(() => {
      return Promise.resolve({
        rows: [{
          MessageId: '64f5e0ab-c4f0-5e5b-bf77-b4538794b2d6',
          ResponseMetadata: {}
        }]
      })
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test(' 1 - Full Happy Path', async () => {
    sinon.stub(services.prototype, 'putMessage').callsFake(() => {
      return Promise.resolve({
        message: {
          created: '2019-03-01T15:18:34.013Z',
          lastMessage: {
            id: '153',
            message_received: 'Fri Mar 01 2019 15:01:54 GMT+0000 (GMT)',
            severity: 'Flood Warning',
            severity_changed: 'Mon Dec 10 2018 13:29:00 GMT+0000 (GMT)',
            severity_value: '2',
            situation: ' This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.',
            situation_changed: 'Mon Dec 10 2018 13:29:00 GMT+0000 (GMT)',
            target_area_code: '111FWCECD022'
          },
          severity: 'Flood Warning',
          severityChanged: '12/10/2018 13:29',
          severityValue: 2,
          situation: ' This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.',
          situationChanged: '12/10/2018 13:29',
          targetAreaCode: '111FWCECD022'
        }
      })
    })
    // stub the errorLog call
    sinon.stub(services.prototype, 'errorLog').callsFake(() => {
      return Promise.resolve({
        rows: [{
          approved: '2019-03-07T12:02:39.770Z',
          dateCreated: '2019-03-07T12:02:39.770Z',
          errorMessage: 'Failed warning message - missing data',
          language: 'English',
          severity: '2',
          situation: '',
          targetAreaCode: '666'
        }]
      })
    })
    sinon.stub(services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: [{
          id: '153',
          message_received: 'Fri Mar 01 2019 15:01:54 GMT+0000 (GMT)',
          severity: 'Flood Warning',
          severity_changed: 'Mon Dec 10 2018 13:29:00 GMT+0000 (GMT)',
          severity_value: '2',
          situation: ' This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.',
          situation_changed: 'Mon Dec 10 2018 13:29:00 GMT+0000 (GMT)',
          target_area_code: '666'
        }]
      })
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })
  lab.test(' 2 - testing GMT is added to the database', async () => {
    sinon.stub(services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })
    sinon.stub(services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situationChanged).to.equal('2019-02-01T12:00:00.000Z')
      Code.expect(message.severityChanged).to.equal('2019-02-01T12:00:00.000Z')
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/02/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ Test This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })
  lab.test(' 3 - testing BST is added to the database', async () => {
    sinon.stub(services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })
    sinon.stub(services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situationChanged).to.equal('2019-05-01T11:00:00.000Z')
      Code.expect(message.severityChanged).to.equal('2019-05-01T11:00:00.000Z')
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/05/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ Test This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })
})
