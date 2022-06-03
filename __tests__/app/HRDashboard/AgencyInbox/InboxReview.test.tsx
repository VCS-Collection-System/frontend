import React from 'react';
import { InboxReview } from '../../../../src/app/HRDashboard/AgencyInbox/InboxReview';
import mockKeycloak from '../../../../__mocks__/keycloakMock'
import { attachmentObject, mockTask } from '../../../../__mocks__/dataMock'
import { act } from 'react-dom/test-utils';
import { ATTACHMENT_URL,  PAM_TASK_URL } from '../../../../src/app/utils/constants'
import { fireEvent, render, screen } from '@testing-library/react'
import reactRouterDom from 'react-router-dom'

jest.mock('react-router-dom')
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush})

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: jest.fn( ()=>({keycloak: mockKeycloak}))
})) 

jest.mock("@app/utils/constants", () => ({
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_ID: "attributes.workforceid[0]",
  APPROVER_ROLES: ["mock-approver"],
  FEATURE_FLAGS: ["fakeFeature"],
  VAX_TASK_DOCUMENT_URL: "vax_task_url/",
  PAM_TASK_URL: "pam_task_url/",
  GLOBAL_CONFIG: {"default": {
    "allowPdf": false,
    "dateOfBirth": true,
    "consentCheckbox": false,
    "covidTest": false,
    "customInput": true,
    "hrdashboard": true,
    "hrsearch": true,
    "proofType": {"cdc": false, "divoc": false, "greenPass": false},
    "recovery": false,
    "fakeFeature": true
  }}
}))

const pamURLEnding = "?withInputData=true&withOutputData=true&withAssignments=true"

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL) => {
    let returnData; 
    if(URL === PAM_TASK_URL + "mockID" + pamURLEnding){
      returnData = {data: mockTask}
    }
    if(URL === PAM_TASK_URL + "mockIDSix" + pamURLEnding){
      const pdfAttachment =  {
        "originalFileName":"mockPDF",
        "size":100,
        "contentType":"image/png",
        "s3BucketName":"mockBucket",
        "s3UUID":"mockUUID"
      }
      const pdfTask = mockTask;
      pdfTask['task-input-data']['documentList']['com.redhat.vcs.model.VaccineDocumentList']['documents'][0]['com.redhat.vcs.model.VaccineCardDocument']['attachment']['com.redhat.vcs.model.Attachment'] = pdfAttachment
      returnData = {data: pdfTask}
    }
    else{
      returnData = {data: mockTask};
    }
    return Promise.resolve(returnData)
  },
  post: (URL, props) => {
    let returnData; 

    if(URL === ATTACHMENT_URL && props.originalFileName === 'mockPDF'){
      returnData = {data: {}, headers: {"content-type": "application/pdf"}};
    }
    else if(URL === ATTACHMENT_URL){
      returnData = {data: {}, headers: {}};
    }
    return Promise.resolve(returnData)
  },
  put: (URL) => {
    let returnData; 
    const pamTaskEnding = "/states/completed?auto-progress=true"
    if(URL === PAM_TASK_URL + "mockID" + pamTaskEnding){
      returnData = {data: {}}
    }
    else if(URL === PAM_TASK_URL + "mockIDTwo" + pamTaskEnding){
      return Promise.reject({})
    }
    else if(URL === PAM_TASK_URL + "mockIDThree" + pamTaskEnding){
      return Promise.reject({response: {status: 500}})
    }
    else if(URL === PAM_TASK_URL + "mockIDFour" + "/states/released"){
      returnData = {data: {}}
    }
    else if(URL === PAM_TASK_URL + "mockIDFive" + "/states/released"){
      return Promise.reject({})
    }
    else{
      returnData = {data: {}};
    }
    return Promise.resolve(returnData)
  }
}))

beforeEach(() => {
  sessionStorage.setItem("approveId", "mockID");
  window.URL.createObjectURL = jest.fn();
})

afterEach(() => {
  sessionStorage.clear(); 
})

describe('<InboxReview />', ()=> {
  it('should be defined', () => {
    expect(InboxReview).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    await act(async () => {
      const { asFragment } = render(
        <InboxReview />
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it("should display information from task", async () => {
    await act(async () => {
      render(<InboxReview />)
    })

    expect(screen.getByDisplayValue('MODERNA')).toBeTruthy();
    expect(screen.getByDisplayValue('mockLot')).toBeTruthy();
    expect(screen.getByDisplayValue('Mock Tester')).toBeTruthy()
  })

  it("should be able to accept a task", async () => {
    await act(async () => {
      render(<InboxReview />)
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(mockPush).toBeCalledTimes(1);
  })

  it("should be able to decline a task", async () => {
    await act(async () => {
      render(<InboxReview />)
    })

    const declineButton = screen.getByRole('button', {name: /Decline/i})

    await act(async () => {
      fireEvent.click(declineButton)
    })

    expect(screen.getByText('Attachments are not legible')).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole('radio', {name: /Attachments are not legible/i}))
      fireEvent.click(screen.getByRole('button', {name: /Confirm/i}))
    })

    expect(mockPush).toBeCalledTimes(1);
  })

  it("should react to submit error", async () => {
    sessionStorage.setItem("approveId", "mockIDTwo");
    await act(async () => {
      render(<InboxReview />)
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(mockPush).toBeCalledTimes(0);
  })

  it("should display network error", async () => {
    sessionStorage.setItem("approveId", "mockIDThree");
    await act(async () => {
      render(<InboxReview />)
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(screen.getByText('Server is unable to respond. Please try again later.')).toBeTruthy();
  })

  it("should return to hr dashboard when back button is clicked", async () => {
    sessionStorage.setItem("approveId", "mockIDFour");
    await act(async () => {
      render(<InboxReview />)
    })

    const backButton = screen.getByRole('button', {name: /Back/i})

    await act(async () => {
      fireEvent.click(backButton)
    })

    expect(mockPush).toBeCalledTimes(1)
    expect(mockPush).toBeCalledWith('/hrdashboard')
  })

  it("should return to hr dashboard even when network error", async () => {
    sessionStorage.setItem("approveId", "mockIDFive");
    await act(async () => {
      render(<InboxReview />)
    })

    const backButton = screen.getByRole('button', {name: /Back/i})

    await act(async () => {
      fireEvent.click(backButton)
    })

    expect(mockPush).toBeCalledTimes(1)
    expect(mockPush).toBeCalledWith('/hrdashboard')
  })

  it("should display PDFS", async () => {
    sessionStorage.setItem("approveId", "mockIDSix");
    await act(async () => {
      render(<InboxReview />)
    })

    expect(screen.getByText('Vaccination Card PDF')).toBeTruthy()
  })
})
