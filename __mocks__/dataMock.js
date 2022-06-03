export const employeeInfo = {
  "employeeId":"mock1",
  "firstName":"Mock",
  "lastName":"Tester",
  "email":"test@mock.com",
  "agencyCode":"Department of Mock Safety",
  "agencyName":"Department of Mock Safety",
  "divisionCode":"App Mocking",
  "divisionName":null,
  "supervisor":null,
  "dateOfBirth":"2021-10-07",
  "alternateEmail":"mock@email.com",
  "age":0,
  "ageInMonth":0,
  "workforceId":"mock2",
  "hr":false
}

export const attachmentObject = {
  "originalFileName":"blob",
  "size":100,
  "contentType":"image/png",
  "s3BucketName":"mockBucket",
  "s3UUID":"mockUUID"
}

export const vaxHistory = {
  "id":0,
  "employee": employeeInfo,
  "submissionDate":"2021-10-04T15:12:14.875",
  "review":{
     "reviewerEmployeeId":"z2",
     "reviewerNotes":"",
     "reviewDate":"2021-10-05T14:04:29.296",
     "reviewOutcome":"ACCEPTED",
     "rejectReason":""
  },
  "submittedBy":null,
  "autoApproved":false,
  "lastUpdatedTime":null,
  "lastUpdatedBy":null,
  "vaccineBrand":"MODERNA",
  "vaccineAdministrationDate":"2021-10-04",
  "fullVaccinatedFlag":false,
  "vaccineShotNumber":2,
  "documentType":"VaccineDocument",
  "attachment": {}
}

const taskEmployeeObject = {
  "employeeId":"mock1",
  "firstName":"Mock",
  "lastName":"Tester",
  "email":"test@mock.com",
  "agencyCode":"Department of Mock Safety",
  "agencyName":"Department of Mock Safety",
  "divisionCode":"App Mocking",
  "divisionName":null,
  "supervisor":null,
  "dateOfBirth": {
    "year": "2021",
    "monthValue": "12",
    "dayOfMonth": "16"
  },
  "alternateEmail":"mock@email.com",
  "age":0,
  "ageInMonth":0,
  "workforceId":"mock2",
  "hr":false
}

export const mockTask = {
  "task-input-data": {
    "documentList": {
      "com.redhat.vcs.model.VaccineDocumentList": {
        "documents": [ {
          "com.redhat.vcs.model.VaccineCardDocument": {
            "employee": {
              "com.redhat.vcs.model.Employee": taskEmployeeObject
            },
            "vaccineBrand": {
              "com.redhat.vcs.model.VaccineBrand": "MODERNA"
            },
            "attachment": {
              "com.redhat.vcs.model.Attachment": attachmentObject
            },
            "vaccineAdministrationDate": {
              "year": "2021",
              "monthValue": "12",
              "dayOfMonth": "16"
            },
            "lotNumber": "mockLot"
          } }
        }
      }
    }
  }
}
