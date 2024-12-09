# FWS REST API Documentation

## **Overview**
The FWS REST API is designed to handle XML messages. It processes requests using a Lambda function triggered by the API Gateway. The API expects an XML payload sent as a string, processes it, and returns a response.


---

## **Authentication**
This API uses an API key for authentication.

- **Header**: `x-api-key`
- **Type**: `apiKey`
- **Required**: Yes

---

## **Endpoints**

### 1. **Send a Message**
- **Endpoint**: `/message`
- **Method**: `POST`
- **Produces**:
  - `application/xml`
  - `application/json`


#### **Request Format**

- **Headers**:
  - `x-api-key`: Your API key (required).
  - **Content-Type**: (one of the following required): 
    - Use `text/html` if sending XML as a string.
    - Use `text/xml` for XML compatibility.

### Request Body format 
The API expects an XML payload directly in the body of the request. Please ensure the `<sent>` date is set to within the last 5 days and the `<expires>` date is in the future.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>4eb3b7350ab7aa443650fc9351f02940E</identifier>
  <sender>www.gov.uk/environment-agency</sender>
  <sent>2024-11-29:07:02-00:00</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <source>Flood warning service</source>
  <scope>Public</scope>
  <info>
    <language>en-GB</language>
    <category>Met</category>
    <event><![CDATA[TEST TEST TEST 064 Issue Flood Alert EA]]></event>
    <urgency>Immediate</urgency>
    <expires>2024-12-03T12:00:02-00:00</expires>
    <area>
      <geocode>
        <valueName>TargetAreaCode</valueName>
        <value><![CDATA[TESTAREA1]]></value>
      </geocode>
    </area>
  </info>
</alert>
```

#### **Responses**
- **200 OK**: Successfully processed the message.
- **400 Bad Request**: Unsupported Media Type. Check the `Content-Type` header and body is XML.
- **500 Internal Server Error**: An error occurred during processing.

---

### 2. **Retrieve a Message by ID**

<b>This requires a seperate get api key</b>

- **Endpoint**: `/message/{id}`
- **Method**: `GET`
- **Consumes**:
  - `application/xml`
  - `application/json`
- **Produces**:
  - `application/xml`
  - `application/json`
- **Headers**:
  - `x-api-key`: Your API key (required).

#### **Parameters**
| Name   | In   | Required | Type   | Description            |
|--------|------|----------|--------|------------------------|
| `id`   | Path | Yes      | String | The ID of the message. |

#### **Responses**
- **200 OK**: Returns the message with the specified ID.
- **404 Not Found**: The message with the specified ID was not found.
- **500 Internal Server Error**: An error occurred during retrieval.

---

### 3. **Retrieve All Messages**
- **Endpoint**: `/messages.atom`
- **Method**: `GET`
- **Produces**:
  - `application/xml`
  - `application/json`
- **Headers**:
  - `x-api-key`: Your GET API key (required).

#### **Responses**
- **200 OK**: Returns a list of messages.
- **500 Internal Server Error**: An error occurred during retrieval.

---

## **Error Handling**
- **200 OK**: The request was successful.
- **404 Not Found**: The requested resource does not exist.
- **500 Internal Server Error**: There was an issue processing the request.

---

## **Security**
Ensure the API key is included in the `x-api-key` header and the `Content-type` for all requests.

---
