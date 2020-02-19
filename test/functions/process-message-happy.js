'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../lib/functions/process-message').handler
const Services = require('../../lib/helpers/services')
const sinon = require('sinon')
const aws = require('../../lib/helpers/aws')

// setup mocks
lab.experiment('Notification API Client', () => {
  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  lab.beforeEach(async () => {
    await sinon.createSandbox()

    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      return new Promise((resolve, reject) => {
        resolve()
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

    sinon.stub(Services.prototype, 'errorLog').callsFake(() => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test(' 1 - Full Happy Path - no severity change', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: [require('../data/db-response/last-message-db.json')]
      })
    })

    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situationChanged).to.equal('2018-10-12T12:29:00.000Z')
      // severity the same and previous message so expect severitychanged date to be previous message severity_changed
      Code.expect(message.severityChanged).to.equal('2019-09-19T08:19:08.318Z')
      return Promise.resolve({})
    })

    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test(' 1b - Full Happy Path - severity change', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: [require('../data/db-response/last-message-db.json')]
      })
    })

    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situationChanged).to.equal('2018-10-12T12:29:00.000Z')
      // severity differs so expect severitychanged date to be new message date
      Code.expect(message.severityChanged).to.equal('2018-10-12T12:29:00.000Z')
      return Promise.resolve({})
    })

    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>3</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test(' 2 - testing GMT is added to the database', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })

    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
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
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })

    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situationChanged).to.equal('2019-05-01T11:00:00.000Z')
      Code.expect(message.severityChanged).to.equal('2019-05-01T11:00:00.000Z')
      Code.expect(message.createdByName).to.be.undefined()
      Code.expect(message.createdById).to.be.undefined()
      Code.expect(message.createdByEmail).to.be.undefined()
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/05/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ Test This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test(' 4 - testing Profile is correctly added to database', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })
    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situationChanged).to.equal('2019-05-01T11:00:00.000Z')
      Code.expect(message.severityChanged).to.equal('2019-05-01T11:00:00.000Z')
      Code.expect(message.createdByName).to.equal('John Smith')
      Code.expect(message.createdById).to.equal('16e4cc73-da2a-4557-a00b-78c0800e7eb4')
      Code.expect(message.createdByEmail).to.equal('john.smith@defra.net')
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/05/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ Test This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>',
      profile: {
        id: '16e4cc73-da2a-4557-a00b-78c0800e7eb4',
        name: 'John Smith',
        email: 'john.smith@defra.net'
      }
    })
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test(' 5 - Different severity in new message, ensure severity date changed', async () => {
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
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>3</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('6 - Severity 5 with blank situation to clear down message', async () => {
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

    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>5</SeverityLevel><InternetSituation><![CDATA[]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })
  lab.test(' 7 - testing situation text is escaped in the database', async () => {
    sinon.stub(Services.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })

    Services.prototype.putMessage.restore()
    sinon.stub(Services.prototype, 'putMessage').callsFake((message) => {
      Code.expect(message.situation).to.equal('&lt;script&gt;alert(&quot;This is an alert&quot;)&lt;/script&gt;')
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/02/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[<script>alert("This is an alert")</script>]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    Code.expect(response.statusCode).to.equal(200)
  })
})
