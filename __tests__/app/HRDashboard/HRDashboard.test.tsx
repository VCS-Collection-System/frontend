import React from 'react';
import { HRDashboard } from '../../../src/app/HRDashboard/HRDashboard';
import { act, fireEvent, render, screen } from '@testing-library/react'
import reactRouterDom from "react-router-dom"
import mockKeycloak from '../../../__mocks__/keycloakMock'
import { ALL_TASK_URL, INPROGRESS_TASK_URL, RESERVED_TASK_URL } from '@app/utils/constants';

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL) => {
    let returnData; 
    if(URL === RESERVED_TASK_URL + "mockId"){
      returnData = {data: {"task-summary":[]}}
    }
    else if(URL === INPROGRESS_TASK_URL + "mockId"){
      returnData = {data: {"task-summary":[]}}
    }
    else if(URL === ALL_TASK_URL){
      returnData = {data: {"task-summary":[]}}
    }

    else{
      returnData = {data: []};
    }

    return Promise.resolve(returnData)
  }
}))

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: jest.fn( ()=>({keycloak: mockKeycloak}))
})) 

let findValue = {
  active: true
};

const mockFind = jest.fn(() => {
  return findValue; 
})

jest.mock("@app/utils/constants", () => ({
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_ID: "attributes.workforceid[0]",
  APPROVER_ROLES: ["mock-approver"],
  CONSENT_COUNTRIES: ["AUS"],
  FEATURE_FLAGS: {
    find: () => mockFind()
  },
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

jest.mock("react-router-dom")
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })

describe('<HRDashboard />', ()=> {
  it('should be defined', () => {
    expect(HRDashboard).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    await act(async () => {
      const { asFragment } = render(<HRDashboard />)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it("should render on with flag", async () => {
    await act(async () => {
      render(<HRDashboard />)
    })

    expect(screen.getByText('[No In-Progress Tasks]')).toBeTruthy();
    expect(screen.findByDisplayValue('Red Hat VCS Search')).toBeTruthy();
  })

  it("should render on with flag", async () => {
    findValue = {
      active: false
    }
    await act(async () => {
      render(<HRDashboard />)
    })

    expect(screen.getByText('[No In-Progress Tasks]')).toBeTruthy();
  })

  it("should render on with flag", async () => {
    await act(async () => {
      render(<HRDashboard />)
    })

    const backButton = screen.getByRole('button', {name: /Back/i})
    fireEvent.click(backButton)
    expect(mockPush).toHaveBeenCalledWith('/attestmenu')
  })
})