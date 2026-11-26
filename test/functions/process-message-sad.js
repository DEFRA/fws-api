'use strict'

const handler = require('../../lib/functions/process-message').handler
const Services = require('../../lib/helpers/services')
const aws = require('../../lib/helpers/aws')

// setup mocks
describe('Notification API Client', () => {
  // Use a Sinon sandbox to manage spies, stubs and mocks for each test.
  beforeEach(async () => {
    // stub the put message db call
    jest.spyOn(Services.prototype, 'putMessage').mockImplementation((message) => {
      return new Promise((resolve, reject) => {
        resolve()
      })
    })

    // stub the errorLog call
    jest.spyOn(Services.prototype, 'errorLog').mockImplementation(() => {
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
    jest.spyOn(aws.email, 'publishMessage').mockImplementation(() => {
      return Promise.resolve({
        rows: [{
          MessageId: '64f5e0ab-c4f0-5e5b-bf77-b4538794b2d6',
          ResponseMetadata: {}
        }]
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('1 - xml is rejected because its blank', async () => {
    await expect(handler({
      bodyXml: ' '
    })).rejects.toThrow(new Error('[500] Cannot read properties of null (reading \'WarningMessage\')'))
  })

  it(' 2 - getting error when severity is not 1-4', async () => {
    await expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>10</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).rejects.toThrow(new Error('[500] ValidationError: "severity" is required'))
  })

  it(' 3 - getting error when language is not English', async () => {
    await expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="French"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).rejects.toThrow(new Error('[500] ValidationError: "language" with value "French" fails to match the required pattern: /^(English|english)$/'))
  })

  it(' 4 - getting error when targetArea does not have a match in databse', async () => {
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
      return Promise.reject(new Error('Test error'))
    })

    await expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).rejects.toThrow(new Error('[500] Test error'))
  })

  it(' 5 - getting error when database is unavailible', async () => {
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
      return Promise.reject(new Error('Test error'))
    })

    await expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>2</SeverityLevel><InternetSituation><![CDATA[ This warning is in place for Preston Beach, Weymouth with tides at their highest between 7:30pm and 9:30pm today Friday 12th October. Flooding may occur along Preston Beach road. Large waves and spray mixed with shingle are likely so take care near coastal paths and promenades. The highest forecast water level including waves is 4mAOD, this is 3.34 metres above astronomical tide level. The forecast wind direction is SSW and the forecast wind strength is Force 7. Coastal conditions should ease for Saturday\'s high tides, however we are continuing to monitor the situation.]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).rejects.toThrow(new Error('[500] Test error'))
  })

  it(' 6 - test xml2js errors when unable to parse incoming xml', async () => {
    await expect(handler({
      bodyXml: '<arningMessage>'
    })).rejects.toThrow(new Error('[500] Unclosed root tag\nLine: 0\nColumn: 15\nChar: '))
  })

  it('7 - Severity < 5 with blank situation should error', async () => {
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

    await expect(handler({
      bodyXml: '<?xml version="1.0" encoding="UTF-8"?><WarningMessage xmlns="http://www.environment-agency.gov.uk/XMLSchemas/EAFWD" approved="12/10/2018 13:29" requestId="" language="English"><TargetAreaCode><![CDATA[111FWCECD022]]></TargetAreaCode><SeverityLevel>3</SeverityLevel><InternetSituation><![CDATA[]]></InternetSituation><FWISGroupedTACodes><![CDATA[]]></FWISGroupedTACodes></WarningMessage>'
    })).rejects.toThrow(new Error('[500] ValidationError: "situation" is not allowed to be empty'))
  })
})
