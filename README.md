# ESS Client Backend API Documentation

## Authentication & Session
All endpoints require a cookie:
- `EmpID`: Employee ID (string)

Responses:
- **Success**: HTTP 200 with JSON payload or message
- **Error**: HTTP 500 `{ error: string }` (and 404 for not found where applicable)

---

## Profile
Base URL: `/api/profile`

### GET /getProfile
- Cookies:
  - `EmpID` (string): Employee ID
- Response (200):
```json
{
  "empID": "FI000004",
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com",
  "department": "Engineering",
  "designation": "Software Engineer"
}
```

### PUT /updateProfile
- Cookies:
  - `EmpID` (string)
- Request Body (application/json):
```json
{
  "name": "Alice J. Johnson",
  "email": "alice.johnson@newdomain.com",
  "designation": "Senior Software Engineer"
}
```
- Response (200):
```json
{
  "message": "Profile updated successfully"
}
```

### POST /uploadPhoto
- Cookies:
  - `EmpID` (string)
- Request Body (multipart/form-data):
  - `photo` (file): JPEG or PNG image
- Response (200):
```json
{
  "message": "Photo uploaded successfully"
}
```

### GET /getPhoto
- Cookies:
  - `EmpID` (string)
- Response (200): binary image (Content-Type: image/jpeg or image/png)

### DELETE /deletePhoto
- Cookies:
  - `EmpID` (string)
- Response (200):
```json
{
  "message": "Photo deleted successfully"
}
```

### GET /getEmploymentSummary
- Cookies:
  - `EmpID` (string)
- Response (200):
```json
{
  "empID": "FI000004",
  "joiningDate": "2020-05-15",
  "totalExperience": "5 years",
  "currentDesignation": "Software Engineer"
}
```

### GET /getPersonalInfo
- Cookies:
  - `EmpID` (string)
- Response (200):
```json
{
  "empID": "FI000004",
  "address": "123 Main St, Anytown, USA",
  "dob": "1990-04-22",
  "pan": "ABCDE1234F"
}
```

### PUT /updatePersonalInfo
- Cookies:
  - `EmpID` (string)
- Request Body (application/json):
```json
{
  "address": "456 Elm St, Anytown, USA",
  "contactNumber": "555-1234"
}
```
- Response (200):
```json
{
  "message": "Personal info updated successfully"
}
```

### GET /getContactInfo
- Cookies:
  - `EmpID` (string)
- Response (200):
```json
{
  "empID": "FI000004",
  "contactNumber": "555-1234",
  "emergencyContact": "555-5678"
}
```

### PUT /updateContactInfo
- Cookies:
  - `EmpID` (string)
- Request Body (application/json):
```json
{
  "contactNumber": "555-9876",
  "emergencyContact": "555-4321"
}
```
- Response (200):
```json
{
  "message": "Contact info updated successfully"
}
```

### GET /getProfileSummary
- Cookies:
  - `EmpID` (string)
- Response (200):
```json
{
  "empID": "FI000004",
  "name": "Alice Johnson",
  "designation": "Software Engineer",
  "pendingRequests": 2
}
```

### GET /getCalendar
- Cookies:
  - `EmpID` (string)
- Response (200):
```json
[
  {
    "date": "2025-08-01",
    "event": "Team Meeting"
  },
  {
    "date": "2025-08-05",
    "event": "Project Deadline"
  }
]
```

---

## Attendance
Base URL: `/api/attendance`

### POST /markAttendance
- Cookies:
  - `EmpID` (string): Employee ID
  - `CompanyID` (string): Company context
- Request Body (application/json):
```json
{
  "date": "2025-08-07",
  "checkIn": "09:00:00",
  "checkOut": "18:00:00"
}
```
- Response (200):
```json
{
  "message": "Attendance marked successfully"
}
```

### GET /getCheckinCheckoutHistory
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Response (200):
```json
[
  {
    "date": "2025-08-07",
    "checkIn": "09:00:00",
    "checkOut": "18:00:00"
  },
  {
    "date": "2025-08-06",
    "checkIn": "09:15:00",
    "checkOut": "17:45:00"
  }
]
```

---

## Business Trip
Base URL: `/api/businessTrip`

### GET /getBusinessTripRequestDetails
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Headers:
  - `reqid` (string)
- Response (200):
```json
{
  "reqID": "JEZ909O08N",
  "empID": "FI000004",
  "companyID": "COMP123",
  "location": "Chicago",
  "startDate": "2025-07-25T00:00:00.000Z",
  "endDate": "2025-07-27T00:00:00.000Z",
  "travelMode": "Cab",
  "reason": "Team collaboration",
  "attachmentID": null,
  "approverEmpID": null,
  "createdDate": "2025-07-24T00:00:00.000Z",
  "status": "Approved"
}
```

### GET /getBusinessTripTransactions
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Response (200):
```json
[
  {
    "reqID": "JEZ909O08N",
    "location": "Chicago",
    "status": "Approved",
    "createdDate": "2025-07-24T00:00:00.000Z"
  },
  {
    "reqID": "NOMZZ8WXQD",
    "location": "San Diego",
    "status": "Draft",
    "createdDate": "2025-07-17T00:00:00.000Z"
  }
]
```

### POST /submitBusinessTripRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (multipart/form-data):
  - Text fields:
    - `ReqID` (string)
    - `location` (string)
    - `startDate` (YYYY-MM-DD)
    - `endDate` (YYYY-MM-DD)
    - `travelMode` (string)
    - `reason` (string)
  - File field:
    - `attachment` (file)
- Response (200):
```json
{
  "message": "Business trip request submitted"
}
```

### POST /submitBusinessTripRequestOnBehalf
- Cookies:
  - `EmpID` (string) – actor EmpID
  - `CompanyID` (string)
- Request Body (multipart/form-data):
  - Text fields:
    - `EmpID` (string) – target employee ID
    - `ReqID`, `location`, `startDate`, `endDate`, `travelMode`, `reason`
  - File field:
    - `attachment` (file)
- Response (200):
```json
{
  "message": "Business trip request submitted on behalf"
}
```

### PATCH /editBusinessTripRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "tripId": "JEZ909O08N",
  "location": "Chicago",
  "startDate": "2025-07-26",
  "endDate": "2025-07-28",
  "travelMode": "Flight",
  "reason": "Client meeting"
}
```
- Response (200):
```json
{
  "message": "Business trip request updated"
}
```

### POST /draftSaveBusinessTripRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (multipart/form-data): same as submit
- Response (200):
```json
{
  "message": "Business trip request draft saved"
}
```

### POST /delegateBusinessTripRequest
- Cookies:
  - `EmpID` (string) – approver EmpID
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "reqID": "JEZ909O08N",
  "newApproverEmpID": "FI000010",
  "comments": "On vacation, please handle"
}
```
- Response (200):
```json
{
  "message": "Business trip request delegated"
}
```

### PATCH /changeBusinessTripApproval
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "tripId": "JEZ909O08N",
  "approvalStatus": "Approved"
}
```
- Response (200):
```json
{
  "message": "Business trip approval status changed"
}
```

### PATCH /approveRejectBusinessTripRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "tripId": "JEZ909O08N",
  "action": "approve",
  "comments": "Looks good"
}
```
- Response (200):
```json
{
  "message": "Business trip has been approved"
}
```

### GET /getPendingBusinessTripRequests
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Response (200):
```json
[
  {
    "reqID": "JEZ909O08N",
    "location": "Chicago",
    "status": "Pending",
    "createdDate": "2025-07-24T00:00:00.000Z"
  }
]
```

### GET /getPendingBusinessTripRequestDetails
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Headers:
  - `tripid` (string)
- Response (200):
```json
{
  "reqID": "JEZ909O08N",
  "empID": "FI000004",
  "companyID": "COMP123",
  "location": "Chicago",
  "startDate": "2025-07-25T00:00:00.000Z",
  "endDate": "2025-07-27T00:00:00.000Z",
  "travelMode": "Cab",
  "reason": "Team collaboration",
  "attachmentID": null,
  "approverEmpID": null,
  "createdDate": "2025-07-24T00:00:00.000Z",
  "status": "Pending"
}
```

---

## Document
Base URL: `/api/document`

### GET /downloadDocument
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Headers:
  - `id` (string): Document ID
- Response (200): binary file
  - Content-Type: appropriate MIME
  - Content-Disposition: attachment; filename="..."

### POST /uploadDocument
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (multipart/form-data):
  - `document` (file)
  - JSON fields (as form fields):
    - `DocumentReqID` (string)
    - `Type` (string)
    - `Reason` (string, optional)
- Response (200):
```json
{
  "message": "Document uploaded successfully"
}
```

### PUT /updateDocumentById
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "id": "DOC123456",
  "Type": "Contract",
  "Reason": "Updated terms"
}
```
- Response (200):
```json
{
  "message": "Document metadata updated"
}
```

### DELETE /deleteDocument
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Headers:
  - `id` (string)
- Response (200):
```json
{
  "message": "Document deleted successfully"
}
```

### GET /getDocumentTransactions
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Headers:
  - `docid` (string)
- Response (200):
```json
[
  {
    "timelineID": "abc123",
    "action": "Created",
    "actorEmpID": "FI000004",
    "comments": null,
    "actionDate": "2025-07-24T10:00:00.000Z"
  }
]
```

### GET /getDocumentRequestDetails
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Response (200):
```json
{
  "documentReqID": "DOC123456",
  "empID": "FI000004",
  "companyID": "COMP123",
  "ReqDate": "2025-07-24",
  "status": "Pending",
  "approverEmpID": "FI000010",
  "Type": "Contract",
  "Reason": "Initial request"
}
```

### POST /submitDocumentRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "DocumentReqID": "DOC123456",
  "Type": "Contract",
  "Reason": "Need for audit"
}
```
- Response (200):
```json
{
  "message": "Document request submitted"
}
```

### POST /submitDocumentRequestOnBehalf
- Cookies:
  - `EmpID` (string) – actor
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "EmpID": "FI000020",
  "DocumentReqID": "DOC123456",
  "Type": "Contract",
  "Reason": "Audit"
}
```
- Response (200):
```json
{
  "message": "Document request submitted on behalf"
}
```

### PATCH /editDocumentRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "requestId": "DOC123456",
  "Type": "Policy",
  "Reason": "Update"
}
```
- Response (200):
```json
{
  "message": "Document request updated"
}
```

### POST /draftSaveDocumentRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "DocumentReqID": "DOC123457",
  "Type": "Policy",
  "Reason": "Draft"
}
```
- Response (200):
```json
{
  "message": "Document request draft saved"
}
```

### POST /delegateDocumentApproval
- Cookies:
  - `EmpID` (string) – approver
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "requestId": "DOC123456",
  "newApproverEmpID": "FI000030",
  "comments": "Please review"
}
```
- Response (200):
```json
{
  "message": "Document approval delegated"
}
```

### PATCH /changeDocumentApproval
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "requestId": "DOC123456",
  "approvalStatus": "Approved"
}
```
- Response (200):
```json
{
  "message": "Document approval status changed"
}
```

### PATCH /approveRejectDocumentRequest
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Request Body (application/json):
```json
{
  "requestId": "DOC123456",
  "action": "approve",
  "comments": "Looks good"
}
```
- Response (200):
```json
{
  "message": "Document request approved"
}
```

### GET /getPendingDocumentRequests
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Response (200):
```json
[
  {
    "documentReqID": "DOC123456",
    "Type": "Contract",
    "status": "Pending",
    "ReqDate": "2025-07-24"
  }
]
```

### GET /getPendingDocumentRequestDetails
- Cookies:
  - `EmpID` (string)
  - `CompanyID` (string)
- Headers:
  - `requestid` (string)
- Response (200):
```json
{
  "documentReqID": "DOC123456",
  "empID": "FI000004",
  "companyID": "COMP123",
  "ReqDate": "2025-07-24",
  "status": "Pending",
  "approverEmpID": "FI000010",
  "Type": "Contract",
  "Reason": "Initial request"
}
```

---

## Excuse
Base URL: `/api/excuse`

**POST /submitExcuseRequest**
- Cookies: `EmpID`
- Body: `multipart/form-data` file field `attachment` + JSON data
- Response: `{ message: "Excuse submitted successfully" }`

**POST /submitExcuseOnBehalf**
- Cookies: `EmpID` (actor)
- Body: file + JSON data
- Response: `{ message: "Excuse submitted on behalf successfully" }`

**GET /getExcuseTransactions**
- Cookies: `EmpID`
- Headers: `excuseid` (string, optional)
- Response: Array of transactions

**GET /getExcuseTypes**
- Response: Array of excuse type objects

**GET /getExcuseRequestDetails**
- Cookies: `EmpID`
- Response: JSON details

**GET /getPendingExcuseRequests**
- Cookies: `EmpID`
- Response: Array of pending excuses

**GET /getPendingExcuseRequestDetails**
- Cookies: `EmpID`
- Headers: `requestid` (string)
- Response: JSON details

**PATCH /approveRejectExcuseRequest**
- Cookies: `EmpID`
- Body: `{ excuseId, action, comments }`
- Response: `{ message: "Excuse approved/rejected successfully" }`

**PATCH /changeExcuseApproval**
- Cookies: `EmpID`
- Body: `{ requestId, approvalStatus }`
- Response: `{ message: "Excuse approval status changed" }`

**POST /delegateExcuseApproval**
- Cookies: `EmpID` (actor)
- Body: `{ requestId, newApproverEmpID, comments? }`
- Response: `{ message: "Excuse approval delegated" }`

---

## Flight Ticket
Base URL: `/api/flightTicket`

**GET /getFlightTicketRequestDetails**
- Cookies: `EmpID`
- Response: JSON details

**GET /getFlightTicketTransactions**
- Cookies: `EmpID`
- Response: Array of transactions

**POST /submitFlightTicketRequest**
- Cookies: `EmpID`
- Body: JSON data
- Response: `{ message: "Flight ticket request submitted" }`

**POST /submitFlightTicketRequestOnBehalf**
- Cookies: `EmpID` (actor)
- Body: JSON data
- Response: `{ message: "Flight ticket request submitted on behalf" }`

**PATCH /editFlightTicketRequest**
- Cookies: `EmpID`
- Body: `{ requestId, ...updateData }`
- Response: `{ message: "Flight ticket request updated" }`

**POST /draftSaveFlightTicketRequest**
- Cookies: `EmpID`
- Body: JSON data
- Response: `{ message: "Flight ticket request draft saved" }`

**POST /delegateFlightTicketApproval**
- Cookies: `EmpID` (actor)
- Body: `{ requestId, newApproverEmpID, comments? }`
- Response: `{ message: "Flight ticket approval delegated" }`

**PATCH /changeFlightTicketApproval**
- Cookies: `EmpID`
- Body: `{ requestId, approvalStatus }`
- Response: `{ message: "Flight ticket approval status changed" }`

**PATCH /approveRejectFlightTicketRequest**
- Cookies: `EmpID`
- Body: `{ requestId, action, comments }`
- Response: `{ message: "Flight ticket request approved/rejected" }`

**GET /getPendingFlightTicketRequestsDetails**
- Cookies: `EmpID`
- Response: JSON details

**GET /getPendingFlightTicketRequests**
- Cookies: `EmpID`
- Response: Array of pending requests

---

## Leave
Base URL: `/api/leave`

**POST /applyLeave**
- Cookies: `EmpID`
- Body: JSON leave application data
- Response: Application confirmation

**GET /getLeaveBalance**
- Cookies: `EmpID`
- Response: Available leave balance

**GET /getLeaveHistory`
- Cookies: `EmpID`
- Response: Array of past leaves

**GET /getLeaveTypes`
- Response: Array of leave types

**GET /getLeaveStatus`
- Cookies: `EmpID`
- Headers: `leavereqid` (string)
- Response: Leave status

**DELETE /cancelLeave`
- Cookies: `EmpID`
- Headers: `leaveid` (string)
- Response: `{ message: "Leave cancelled successfully" }`

**PUT /approveRejectLeave`
- Cookies: `EmpID`
- Body: `{ leaveId, action, comments }`
- Response: `{ message: "Leave approved/rejected" }`

**GET /getPendingLeaves`
- Cookies: `EmpID`
- Response: Array of pending leaves

**GET /getLeavesById`
- Cookies: `EmpID`
- Headers: `leaveid` (string)
- Response: Leave details

**PUT /updatedLeave`
- Cookies: `EmpID`
- Body: `{ leaveId, ...updateData }`
- Response: `{ message: "Leave updated" }`

**GET /getLeaveRequestTransactions`
- Cookies: `EmpID`
- Headers: `requestid` (string)
- Response: Array of transactions

**GET /getLeaveRequestDetails`
- Cookies: `EmpID`
- Headers: `requestid` (string)
- Response: JSON details

**POST /submitLeave`
- Cookies: `EmpID`
- Body: JSON request data
- Response: `{ message: "Leave request submitted" }`

**POST /submitLeaveOnBehalf`
- Cookies: `EmpID` (actor)
- Body: JSON data
- Response: `{ message: "Leave request submitted on behalf" }`

**PATCH /editLeaveRequest`
- Cookies: `EmpID`
- Body: `{ requestId, ...updateData }`
- Response: `{ message: "Leave request updated" }`

**POST /draftSaveLeaveRequest`
- Cookies: `EmpID`
- Body: JSON data
- Response: `{ message: "Leave request draft saved" }`

**GET /getPendingLeaveRequestDetails`
- Cookies: `EmpID`
- Headers: `requestid` (string)
- Response: JSON details

**PATCH /approveRejectLeaveRequest`
- Cookies: `EmpID`
- Body: `{ requestId, action, comments }`
- Response: `{ message: "Leave request approved/rejected" }`

**PATCH /changeLeaveRequestApproval`
- Cookies: `EmpID`
- Body: `{ requestId, approvalStatus }`
- Response: `{ message: "Leave approval status changed" }`

**GET /getDelegates`
- Cookies: `EmpID`
- Response: Delegate list

**POST /delegateLeaveApproval`
- Cookies: `EmpID` (actor)
- Body: `{ requestId, newApproverEmpID, comments? }`
- Response: `{ message: "Leave approval delegated" }`

---

## Manager
Base URL: `/api/manager`

**POST /bulk-approve`
- Body: JSON array of approvals
- Response: Result summary

**GET /getTeamAttendanceSummary`
- Cookies: `EmpID` (manager)
- Headers: `month` (number), `year` (number)
- Response: Attendance summary

---

## Notification
Base URL: `/api/notification`

**GET /getNotifications`
**GET /getNotifications**
- Cookies: `EmpID`
- Response: Array of notifications

**POST /createNotification**
- Body: JSON notification data
- Response: `{ message: "Notification created" }`

**POST /broadcaseNotification**
- Body: JSON with `allEmpIDs` and message
- Response: `{ message: "Broadcast sent" }`

---

## Payroll
Base URL: `/api/payroll`

**GET /payslip**
- Cookies: `EmpID`
- Response: Payslip object

**GET /getPayslipHistory**
- Cookies: `EmpID`
- Response: Array of payslip records

**GET /getPayrollSummary**
- Cookies: `EmpID`
- Response: Summary object

---

## Reimbursement
Base URL: `/api/reimbursement`

**POST /submitReimbursement**
- Cookies: `EmpID`
- Body: `multipart/form-data` file field `receipt` + JSON data
- Response: `{ message: "Reimbursement request submitted" }`

**GET /getReimbursementHistory**
- Cookies: `EmpID`
- Response: Array of reimbursement history

**GET /getReimbursementStatus**
- Cookies: `EmpID`
- Query: `requestId` (optional)
- Response: Status object

**PUT /action**
- Cookies: `EmpID`
- Body: `{ requestId, action, comments }`
- Response: `{ message: "Reimbursement approved/rejected" }`

**GET /getReimbursementTypes**
- Response: Array of types

**GET /getPendingReimbursements**
- Cookies: `EmpID`
- Response: Array of pending reimbursements

**DELETE /cancelReimbursement**
- Cookies: `EmpID`
- Query: `requestId`
- Response: `{ message: "Reimbursement cancelled" }`

**GET /getReimbursementById**
- Cookies: `EmpID`
- Query: `requestId`
- Response: Request detail

**GET /downloadReimbursementReceipt**
- Cookies: `EmpID`
- Query: `requestId`
- Response: File attachment

**GET /getReimbursementSummary**
- Cookies: `EmpID`
- Response: Summary object

**GET /getReimbursementTransactions**
- Cookies: `EmpID`
- Query: `requestId`
- Response: Transaction array

**GET /getReimbursementRequestDetails**
- Cookies: `EmpID`
- Query: `requestId`
- Response: Request detail

**POST /submitReimbursementRequest**
- Cookies: `EmpID`
- Body: JSON data
- Response: `{ message: "Reimbursement request submitted" }`

**POST /submitReimbursementRequestOnBehalf**
- Cookies: `EmpID` (actor)
- Body: JSON data
- Response: `{ message: "Reimbursement request submitted on behalf" }`

**PATCH /editReimbursementRequest**
- Cookies: `EmpID`
- Body: `{ requestId, ...updateData }`
- Response: `{ message: "Reimbursement request updated" }`

**POST /draftSaveReimbursementRequest**
- Cookies: `EmpID`
- Body: JSON data
- Response: `{ message: "Draft saved" }`

**POST /delegateReimbursementRequest**
- Cookies: `EmpID` (actor)
- Body: `{ requestId, newApproverEmpID, comments? }`
- Response: `{ message: "Reimbursement delegated" }`

**PATCH /changeReimbursementApproval**
- Cookies: `EmpID`
- Body: `{ requestId, approvalStatus }`
- Response: `{ message: "Approval status changed" }`

**PATCH /approveRejectReimbursementRequest**
- Cookies: `EmpID`
- Body: `{ requestId, action, comments }`
- Response: `{ message: "Reimbursement approved/rejected" }`

**GET /getPendingReimbursementRequestDetails**
- Cookies: `EmpID`
- Query: `requestId`
- Response: Request detail

**GET /getPendingReimbursementRequests**
- Cookies: `EmpID`
- Response: Array of pending requests

---

## Team
Base URL: `/api/team`

**GET /getTeamHeirarchy**
- Cookies: `EmpID`
- Response: Organizational hierarchy

**GET /getTeamCalendar**
- Cookies: `EmpID`
- Response: Team calendar

---

## Request
Base URL: `/api/request`

**GET /getRequestTransactions**
- Cookies: `EmpID`
- Response: Transaction history
