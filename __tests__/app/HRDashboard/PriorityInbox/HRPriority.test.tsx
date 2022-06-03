import React from 'react';
import { HRPriority } from '../../../../src/app/HRDashboard/PriorityInbox/HRPriority';
import { act } from 'react-dom/test-utils';
import { PRIORITY_URL } from '../../../../src/app/utils/constants'
import { fireEvent, render, screen } from '@testing-library/react'
import reactRouterDom from 'react-router-dom'
import mockKeycloak from '../../../../__mocks__/keycloakMock'

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
  PRIORITY_URL: "priority/"
}))

jest.mock('react-router-dom')
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush})
let priorityItems = [
  {"id":4, "employeeId":"4200000", "covidTestDate":"2022-01-01", "submissionType":"positiveTest"},
  {"id":5, "employeeId":"4200000", "covidTestDate":"2022-02-01", "submissionType":"recovery"}
];

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL) => {
    let returnData; 
    if(URL === PRIORITY_URL){
      returnData = {data: priorityItems}
    }

    else{
      returnData = {data: []};
    }

    return Promise.resolve(returnData)
  }
}))

beforeEach(() => {
  priorityItems = [
    {"id":4, "employeeId":"4200000", "covidTestDate":"2022-01-01", "submissionType":"positiveTest"},
    {"id":5, "employeeId":"4200000", "covidTestDate":"2022-02-01", "submissionType":"recovery"}
  ];
})

afterEach(() => {
  sessionStorage.clear(); 
})

describe('<HRPriority />', ()=> {
  it('should be defined', () => {
    expect(HRPriority).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    await act(async () => {
      const { asFragment } = render(<HRPriority />)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it("should display empty list when no tasks", async () => {
    priorityItems = [];
    await act(async () => {
      render(<HRPriority />)
    })
    expect(screen.getByText('[No Positive Tests]')).toBeTruthy();
    expect(screen.getByText('[No Certificates of Recovery]')).toBeTruthy(); 
  })

  it("should display list with items", async () => {
    await act(async () => {
      render(<HRPriority />)
    })
    expect(screen.getByRole('button', {name: /4200000 Test Date: 01-01-2022/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /4200000 Test Date: 02-01-2022/i})).toBeTruthy();
  })

  it("should allow positive tests to be clickable", async () => {
    await act(async () => {
      render(<HRPriority />)
    })
    const positiveItem = screen.getByRole('button', {name: /4200000 Test Date: 01-01-2022/i});
    fireEvent.click(positiveItem);
    expect(mockPush).toBeCalledWith('/hrdashboard/priorityreview')
  })

  it("should allow certificates of recovery to be clickable", async () => {
    await act(async () => {
      render(<HRPriority />)
    })
    const recoveryItem = screen.getByRole('button', {name: /4200000 Test Date: 02-01-2022/i});
    await act(async () => {
      fireEvent.click(recoveryItem);
    })
    expect(mockPush).toBeCalledWith('/hrdashboard/priorityreview')
  })
})