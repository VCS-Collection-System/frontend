import React from 'react';
import { CaseReviewPanel } from '../../../../src/app/HRDashboard/Search/CaseReviewPanel';
import mockKeycloak from '../../../../__mocks__/keycloakMock'
import { act } from 'react-dom/test-utils';
import { ATTACHMENT_URL, VAX_TASK_DOCUMENT_URL, PAM_TASK_URL } from '../../../../src/app/utils/constants'
import { fireEvent, render, screen } from '@testing-library/react'
import reactRouterDom from 'react-router-dom'
import { employeeInfo, attachmentObject} from '../../../../__mocks__/dataMock'

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
  CONSENT_COUNTRIES: ["AUS"],
  RECORD_TYPES: {"USA": [{"value": "CDC", "label": "CDC Vaccination Card"}]},
  VAX_TASK_DOCUMENT_URL: "vax_task_url/",
  PAM_TASK_URL: "pam_task_url/"
}))

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL) => {
    let returnData; 
    if(URL === VAX_TASK_DOCUMENT_URL + "1") {
      returnData = {data: {taskId: "mockID"}}
    }
    else if(URL === VAX_TASK_DOCUMENT_URL + "2") {
      returnData = {data: {taskId: "mockIDTwo"}}
    }
    else if(URL === VAX_TASK_DOCUMENT_URL + "3") {
      returnData = {data: {taskId: "mockIDThree"}}
    }
    else if(URL === VAX_TASK_DOCUMENT_URL + "4") {
      returnData = {data: {taskId: "mockIDFour"}}
    }
    else if(URL === VAX_TASK_DOCUMENT_URL + "5") {
      returnData = {data: {taskId: "mockIDFive"}}
    }
    else if(URL === VAX_TASK_DOCUMENT_URL + "6") {
      returnData = {data: {taskId: "mockIDSix"}}
    }
    else if(URL === PAM_TASK_URL + "mockID"){
      returnData = {data: {"task-status": "ready"}}
    }
    else if(URL === PAM_TASK_URL + "mockIDTwo"){
      returnData = {data: {"task-status": "Reserved"}}
    }
    else if(URL === PAM_TASK_URL + "mockIDThree"){
      returnData = {data: {"task-status": "ready"}}
    }
    else if(URL === PAM_TASK_URL + "mockIDFour"){
      returnData = {data: {"task-status": "ready"}}
    }
    else if(URL === PAM_TASK_URL + "mockIDFive"){
      returnData = {data: {"task-status": "ready"}}
    }
    else if(URL === PAM_TASK_URL + "mockIDSix"){
      returnData = {data: {"task-status": "ready"}}
    }
    else{
      returnData = {data: []};
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

    if(URL === PAM_TASK_URL + "mockID" + "/states/claimed"){
      returnData = {data: {}}
    }
    else if(URL === PAM_TASK_URL + "mockID" + "/states/completed?auto-progress=true"){
      returnData = {data: {}}
    }
    else if(URL === PAM_TASK_URL + "mockIDThree" + "/states/claimed"){
      return Promise.reject({response: {status: 500}})
    }
    else if(URL === PAM_TASK_URL + "mockIDFour" + "/states/claimed"){
      returnData = {data: {}}
    }
    else if(URL === PAM_TASK_URL + "mockIDFour" + "/states/completed?auto-progress=true"){
      return Promise.reject({response: {status: 500}})
    }
    else if(URL === PAM_TASK_URL + "mockIDFive" + "/states/claimed"){
      return Promise.reject({})
    }
    else if(URL === PAM_TASK_URL + "mockIDSix" + "/states/claimed"){
      returnData = {data: {}}
    }
    else if(URL === PAM_TASK_URL + "mockIDSix" + "/states/completed?auto-progress=true"){
      return Promise.reject({})
    }
    else{
      returnData = {data: {}};
    }
    return Promise.resolve(returnData)
  }
}))

const mockCaseHistoryInfo = {
  "id":1,
  "employee": employeeInfo,
  "attachment": attachmentObject,
  "submissionDate":"2021-11-08T15:44:47.06042",
  "review":null,
  "submittedBy":null,
  "autoApproved":true,
  "vaccineBrand":"MODERNA",
  "vaccineAdministrationDate":"2021-11-08",
  "vaccineShotNumber":1,
  "lotNumber":"1",
  "proofType":"CDC"
}

beforeEach(() => {
  sessionStorage.setItem("caseHistoryInfo", JSON.stringify(mockCaseHistoryInfo))
  sessionStorage.setItem("caseHistoryType", "VAX")
  window.URL.createObjectURL = jest.fn();
})

afterEach(() => {
  sessionStorage.clear(); 
})

const mockSetHasSelectedItem = jest.fn(); 
const mockSetRefreshCaseHistory = jest.fn(); 

describe('<CaseReviewPanel />', ()=> {
  it('should be defined', () => {
    expect(CaseReviewPanel).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    sessionStorage.setItem("caseHistoryType", "MOCK")
    await act(async () => {
      const { asFragment } = render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it("should display Vax: Auto-Accepted", async () => {
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    expect(screen.getByDisplayValue('AUTO-ACCEPTED')).toBeTruthy()
  })

  it("should display Vax: NOT REVIEWED", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    expect(screen.getByDisplayValue('NOT REVIEWED')).toBeTruthy()
  })

  it("should display Vax: NOT REVIEWED and reserved", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    expectData.id=2
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    expect(screen.getByText('Task Was Claimed')).toBeTruthy();

    const closeButton = screen.getAllByRole('button', {name: /Close/i})[0]

    await act(async () => {
      fireEvent.click(closeButton)
    })

    expect(screen.queryAllByText('Task Was Claimed')).toEqual([]);
  })

  it("should be able to accept a task", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    expectData.id=1
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(screen.getByText('Submitted Successfully!')).toBeTruthy();
  })

  it("should be able to decline a task", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    expectData.id=1
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
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

    expect(screen.getByText('Submitted Successfully!')).toBeTruthy();
  })

  it("should display claim errors", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    expectData.id=3
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(screen.getByText('Server is unable to respond. Please try again later.')).toBeTruthy();
  })

  it("should not display claim errors if error does not return an error", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    expectData.id=5
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(screen.queryAllByText('Server is unable to respond. Please try again later.')).toEqual([])
  })

  it("should display submit errors", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    expectData.id=4
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(screen.getByText('Server is unable to respond. Please try again later.')).toBeTruthy();
  })

  it("should not display submit errors if server does not return an error", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.autoApproved=false;
    expectData.id=6
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    const acceptButton = screen.getByRole('button', {name: /Accept/i})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(screen.queryAllByText('Server is unable to respond. Please try again later.')).toEqual([])
  })

  it("should display pdf", async () => {
    const expectData = mockCaseHistoryInfo;
    expectData.attachment = {
      "originalFileName":"mockPDF",
      "size":100,
      "contentType":"image/png",
      "s3BucketName":"mockBucket",
      "s3UUID":"mockUUID"
    }
    sessionStorage.setItem("caseHistoryInfo", JSON.stringify(expectData))
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    expect(screen.getByText('Vaccination Card PDF')).toBeTruthy()
  })

  it("should not display anything if no data in session", async () => {
    sessionStorage.clear()
    await act(async () => {
      render(
        <CaseReviewPanel 
          hasSelectedItem={true}
          setHasSelectedItem={mockSetHasSelectedItem}
          updatePanel={false}
          refreshCaseHistory={false}
          setResfreshCaseHistory={mockSetRefreshCaseHistory}
        />
      )
    })

    expect(screen.queryAllByText('NOT REVIEWED')).toEqual([]);
    expect(screen.queryAllByText('ACCEPTED')).toEqual([]);
    expect(screen.queryAllByText('DECLINED')).toEqual([]);
    expect(screen.queryAllByText('AUTO-ACCEPTED')).toEqual([]);
  })
})