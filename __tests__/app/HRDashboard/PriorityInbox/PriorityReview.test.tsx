import React from 'react';
import { PriorityReview } from '../../../../src/app/HRDashboard/PriorityInbox/PriorityReview';
import mockKeycloak from '../../../../__mocks__/keycloakMock'
import { attachmentObject, mockTask } from '../../../../__mocks__/dataMock'
import { act } from 'react-dom/test-utils';
import { ATTACHMENT_URL, EMPLOYEE_URL, PRIORITY_CONFIRM_URL } from '../../../../src/app/utils/constants'
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
  ATTACHMENT_URL: "attachment/",
  EMPLOYEE_URL: "employee/",
  PRIORITY_CONFIRM_URL: "priorityconfirm/",
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

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL) => {
    let returnData; 

    if(URL === EMPLOYEE_URL + "4200000") {
      returnData = {data: {
        employeeId: 4200000,
        firstName: "Mock",
        lastName: "Person",
        dateOfBirth: "1990-07-04",
        email: "mock@email.com"
      }}; 
      return Promise.resolve(returnData);
    }
    return Promise.resolve(returnData)
  },
  post: (URL, props) => {
    let returnData; 

    if(URL === ATTACHMENT_URL && props.originalFileName === 'mockPNG'){
      returnData = {data: {}, headers: {"content-type": "application/png"}};
    }
    else if(URL === ATTACHMENT_URL){
      returnData = {data: {}, headers: {}};
    }
    return Promise.resolve(returnData)
  },
  delete: (URL) => {
    let returnData; 
    return Promise.resolve(returnData)
  }
}))

beforeEach(() => {
  const data = {
    id: 1,
    employeeId: 4200000,
    submissionType: "positiveTest",
    covidTestDate: "2022-01-01",
    attachment: {
      originalFileName: "mockPNG",
      size: 0
    }
  }

  sessionStorage.setItem("priorityData", JSON.stringify(data));
})

afterEach(() => {
  sessionStorage.clear(); 
})

afterEach(() => {
  sessionStorage.clear(); 
})

describe('<PriorityReview />', ()=> {
  it('should be defined', () => {
    expect(PriorityReview).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    await act(async () => {
      const { asFragment } = render(
        <PriorityReview />
      )
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it("should display employee information", async () => {
    await act(async () => {
      render(<PriorityReview />)
    })

    expect(screen.getByDisplayValue('4200000')).toBeTruthy();
    expect(screen.getByDisplayValue('Mock Person')).toBeTruthy();
    expect(screen.getByDisplayValue('07-04-1990')).toBeTruthy();
    expect(screen.getByDisplayValue('mock@email.com')).toBeTruthy();
  })

  it("should display information from positive test", async () => {
    await act(async () => {
      render(<PriorityReview />)
    })

    expect(screen.getByDisplayValue('POSITIVE')).toBeTruthy();
    expect(screen.getByDisplayValue('01-01-2022')).toBeTruthy();
  })

  it("should display information from a certificate of recovery", async () => {
    const data = {
      id: 1,
      employeeId: 4200000,
      submissionType: "recovery",
      covidTestDate: "2022-02-01",
      attachment: {
        originalFileName: "mockPNG",
        size: 0
      }
    }

    sessionStorage.setItem("priorityData", JSON.stringify(data));

    await act(async () => {
      render(<PriorityReview />)
    })

    expect(screen.getByDisplayValue('RECOVERY')).toBeTruthy();
    expect(screen.getByDisplayValue('02-01-2022')).toBeTruthy();
  })

  it("should be able to confirm", async () => {
    await act(async () => {
      render(<PriorityReview />)
    })

    const confirmButton = screen.getByRole('button', {name: /Confirm/i})

    await act(async () => {
      fireEvent.click(confirmButton)
    })

    expect(mockPush).toBeCalledTimes(1);
  })

  it("should return to hr dashboard when back button is clicked", async () => {
    await act(async () => {
      render(<PriorityReview />)
    })

    const backButton = screen.getByRole('button', {name: /Back/i})

    await act(async () => {
      fireEvent.click(backButton)
    })

    expect(mockPush).toBeCalledTimes(1)
    expect(mockPush).toBeCalledWith('/hrdashboard')
  })

})