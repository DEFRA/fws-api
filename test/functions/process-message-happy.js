'use strict'

const handler = require('../../lib/functions/process-message').handler
const Services = require('../../lib/helpers/services')
const aws = require('../../lib/helpers/aws')

// setup mocks
describe('Notification API Client', () => {
  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  beforeEach(async () => {
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    })

    // stub the email after each error
    jest.spyOn(aws.email, 'publishMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: [{
          MessageId: '64f5e0ab-c4f0-5e5b-bf77-b4538794b2d6',
          ResponseMetadata: {}
        }]
      })
    })

    jest.spyOn(Services.prototype, 'errorLog').mockImplementation(() => {
      return Promise.resolve({})
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it(' 1 - Full Happy Path - no severity change', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: [require('../data/db-response/last-message-db.json')]
      })
    })
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      expect(message.situationChanged).toEqual('2018-10-12T12:29:00.000Z')
      // severity the same and previous message so expect severitychanged date to be previous message severity_changed
      expect(message.severityChanged).toEqual('2019-09-19T08:19:08.318Z')
      return Promise.resolve({})
    })

    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    expect(response.statusCode).toEqual(200)
  })

  it(' 1b - Full Happy Path - severity change', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: [require('../data/db-response/last-message-db.json')]
      })
    })
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      expect(message.situationChanged).toEqual('2018-10-12T12:29:00.000Z')
      // severity differs so expect severitychanged date to be new message date
      expect(message.severityChanged).toEqual('2018-10-12T12:29:00.000Z')
      return Promise.resolve({})
    })

    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>3</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    expect(response.statusCode).toEqual(200)
  })

  it(' 2 - testing GMT is added to the database', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: []
      })
    })
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      expect(message.situationChanged).toEqual('2019-02-01T12:00:00.000Z')
      expect(message.severityChanged).toEqual('2019-02-01T12:00:00.000Z')
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/02/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ Test This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    expect(response.statusCode).toEqual(200)
  })

  it(' 3 - testing BST is added to the database', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: []
      })
    })
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      expect(message.situationChanged).toEqual('2019-05-01T11:00:00.000Z')
      expect(message.severityChanged).toEqual('2019-05-01T11:00:00.000Z')
      expect(message.createdByName).toBeUndefined()
      expect(message.createdById).toBeUndefined()
      expect(message.createdByEmail).toBeUndefined()
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/05/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ Test This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    expect(response.statusCode).toEqual(200)
  })

  it(' 4 - testing Profile is correctly added to database', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: []
      })
    })
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      expect(message.situationChanged).toEqual('2019-05-01T11:00:00.000Z')
      expect(message.severityChanged).toEqual('2019-05-01T11:00:00.000Z')
      expect(message.createdByName).toEqual('John Smith')
      expect(message.createdById).toEqual('16e4cc73-da2a-4557-a00b-78c0800e7eb4')
      expect(message.createdByEmail).toEqual('john.smith@defra.net')
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
    expect(response.statusCode).toEqual(200)
  })

  it(' 5 - Different severity in new message, ensure severity date changed', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
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
    expect(response.statusCode).toEqual(200)
  })

  it('6 - Severity 5 with blank situation to clear down message', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
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
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      expect(message.situationChanged).toEqual('2018-10-12T12:29:00.000Z')
      expect(message.severityChanged).toEqual('2018-10-12T12:29:00.000Z')
      expect(message.createdByName).toBeUndefined()
      expect(message.createdById).toBeUndefined()
      expect(message.createdByEmail).toBeUndefined()
      return Promise.resolve({})
    })

    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>5</SeverityLevel><InternetSituation><![CDATA[]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    expect(response.statusCode).toEqual(200)
  })
  it(' 7 - testing situation text is escaped in the database', async () => {
    jest.spyOn(Services.prototype, 'getLastMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: []
      })
    })
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      expect(message.situation).toEqual('&lt;script&gt;alert(&quot;This is an alert&quot;)&lt;/script&gt;')
      return Promise.resolve({})
    })
    const response = await handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="01/02/2019 12:00" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[<script>alert("This is an alert")</script>]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })
    expect(response.statusCode).toEqual(200)
  })
})
