'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../lib/functions/process-message').handler
const Services = require('../../lib/helpers/services')
const sinon = require('sinon')
const aws = require('../../lib/helpers/aws')
const AWS = require('aws-sdk')

// setup mocks
lab.experiment('Notification API Client', () => {
  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    await sinon.createSandbox()
    // stub the put message db call
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    })

    // stub the errorLog call
    sinon.stub(Services.prototype, 'errorLog').callsFake(() => {
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

  lab.test('1 - xml is rejected because its blank', async () => {
    const err = await Code.expect(handler({
      bodyXml: ' '
    })).to.reject()
    Code.expect(err.message).to.equal('[500] Cannot read property \'WarningMessage\' of null')
  })

  lab.test(' 2 - getting error when severity is not 1-4', async () => {
    const err = await Code.expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>10</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).to.reject()
    Code.expect(err.message).to.equal('[500] ValidationError: "severity" is required')
  })

  lab.test(' 3 - getting error when language is not English', async () => {
    const err = await Code.expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="French"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).to.reject()
    Code.expect(err.message).to.equal('[500] ValidationError: "language" with value "French" fails to match the required pattern: /^(English|english)$/')
  })

  lab.test(' 4 - getting error when targetArea does not have a match in databse', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
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
    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      return Promise.reject(new Error('Test error'))
    })

    const err = await Code.expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).to.reject()
    Code.expect(err.message).to.equal('[500] Test error')
  })

  lab.test(' 5 - getting error when database is unavailible', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
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

    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      return Promise.reject(new Error('Test error'))
    })

    const err = await Code.expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).to.reject()
    Code.expect(err.message).to.equal('[500] Test error')
  })

  lab.test(' 6 - test xml2js errors when unable to parse incoming xml', async () => {
    const err = await Code.expect(handler({
      bodyXml: '<arningMessage>'
    })).to.reject()
    Code.expect(err.message).to.equal('[500] Unclosed root tag\nLine: 0\nColumn: 15\nChar: ')
  })

  lab.test('7 - Severity < 5 with blank situation should error', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
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

    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situationChanged).to.equal('2018-10-12T12:29:00.000Z')
      Code.expect(message.severityChanged).to.equal('2018-10-12T12:29:00.000Z')
      Code.expect(message.createdByName).to.be.undefined()
      Code.expect(message.createdById).to.be.undefined()
      Code.expect(message.createdByEmail).to.be.undefined()
      return Promise.resolve({})
    })

    const err = await Code.expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>3</SeverityLevel><InternetSituation><![CDATA[]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).to.reject()

    Code.expect(err.message).to.equal('[500] ValidationError: "situation" is not allowed to be empty')
  })

  lab.test('8 - Lambda invoke should throw error', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: [require('../data/db-response/last-message-db.json')]
      })
    })

    // Stub lambda.invoke

    Services.prototype.putMessage.restore()
    const lambdaInvokeStub = AWS.Lambda.prototype.invoke = sinon.stub()
    lambdaInvokeStub.returns({ promise: () => { throw new Error('Catch error') } })

    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      return Promise.resolve({})
    })

    const response = await Code.expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>3</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).to.reject()
    Code.expect(response.message).to.equal('[500] Catch error')
  })
})
