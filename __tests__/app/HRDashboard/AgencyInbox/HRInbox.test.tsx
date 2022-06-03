import React from 'react';
import { HRInbox } from '../../../../src/app/HRDashboard/AgencyInbox/HRInbox';
import { act } from 'react-dom/test-utils';
import { RESERVED_TASK_URL, INPROGRESS_TASK_URL, ALL_TASK_URL, PAM_TASK_URL } from '../../../../src/app/utils/constants'
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
  RESERVED_TASK_URL: "reserve-url/",
  INPROGRESS_TASK_URL: "inprogress-url/",
  ALL_TASK_URL: "task-url/",
  PAM_TASK_URL: "pam-url/"
}))

jest.mock('react-router-dom')
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush})
let reservedTasks = {"task-summary": [{'task-id': "mockID", "task-created-on": {"java.util.Date": "1508484583331"}, "task-description": "mockReserved"}]};
let inprogressTasks = {"task-summary": [{'task-id': "mockID", "task-created-on": {"java.util.Date": "1508484583331"}, "task-description": "mockProgress"}]};
let allTasks = {"task-summary": [{'task-id': "mockID", "task-created-on": {"java.util.Date": "1508484583331"}, "task-description": "mockTask"}]};

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL) => {
    let returnData; 
    if(URL === RESERVED_TASK_URL + "mockId"){
      returnData = {data: reservedTasks}
    }
    else if(URL === INPROGRESS_TASK_URL + "mockId"){
      returnData = {data: inprogressTasks}
    }
    else if(URL === ALL_TASK_URL){
      returnData = {data: allTasks}
    }

    else{
      returnData = {data: []};
    }

    return Promise.resolve(returnData)
  },
  put: (URL) => {
    let returnData; 

    if(URL === PAM_TASK_URL + "2" + "/states/claimed"){
      returnData = {data: allTasks}
    }
    else if(URL === PAM_TASK_URL + "3" + "/states/claimed"){
      return Promise.reject()
    }
    return Promise.resolve(returnData)
  }
}))

beforeEach(() => {
  reservedTasks = {"task-summary": [{'task-id': "0", "task-created-on": {"java.util.Date": "1508484583331"}, "task-description": "mockReserved"}]};
  inprogressTasks = {"task-summary": [{'task-id': "1", "task-created-on": {"java.util.Date": "1508484583331"}, "task-description": "mockProgress"}]};
  allTasks = {"task-summary": [{'task-id': "2", "task-created-on": {"java.util.Date": "1508484583331"}, "task-description": "mockTask"},
                                {'task-id': "3", "task-created-on": {"java.util.Date": "1508484583331"}, "task-description": "mockTask2"} ]};
})

afterEach(() => {
  sessionStorage.clear(); 
})

describe('<HRInbox />', ()=> {
  it('should be defined', () => {
    expect(HRInbox).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    await act(async () => {
      const { asFragment } = render(<HRInbox />)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it("should display empty list when no tasks", async () => {
    reservedTasks = {"task-summary": []};
    inprogressTasks = {"task-summary": []};
    allTasks = {"task-summary": []};
    await act(async () => {
      render(<HRInbox />)
    })
    expect(screen.getByText('[No In-Progress Tasks]')).toBeTruthy(); 
    expect(screen.getByText('[No Available Tasks]')).toBeTruthy(); 
  })

  it("should display list with tasks", async () => {
    await act(async () => {
      render(<HRInbox />)
    })
    expect(screen.getByRole('button', {name: /mockReserved Submitted on: 10-20-2017/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /mockProgress Submitted on: 10-20-2017/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /mockTask Submitted on: 10-20-2017/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /mockTask2 Submitted on: 10-20-2017/i})).toBeTruthy();
  })

  it("should allow in progress tasks to be clickable", async () => {
    await act(async () => {
      render(<HRInbox />)
    })
    const progressItem = screen.getByRole('button', {name: /mockProgress Submitted on: 10-20-2017/i});
    fireEvent.click(progressItem);
    expect(sessionStorage.getItem("approveId")).toEqual("1")
    expect(mockPush).toBeCalledWith('/hrdashboard/review')
  })

  it("should allow regular tasks to be clickable", async () => {
    await act(async () => {
      render(<HRInbox />)
    })
    const taskItem = screen.getByRole('button', {name: /mockTask Submitted on: 10-20-2017/i});
    await act(async () => {
      fireEvent.click(taskItem);
    })
    expect(sessionStorage.getItem("approveId")).toEqual("2")
    expect(mockPush).toBeCalledWith('/hrdashboard/review')
  })

  it("should display modal when task already claimed", async () => {
    await act(async () => {
      render(<HRInbox />)
    })
    const taskItem = screen.getByRole('button', {name: /mockTask2 Submitted on: 10-20-2017/i});
    await act(async () => {
      fireEvent.click(taskItem);
    })
    expect(screen.getByText('Task Was Claimed')).toBeTruthy(); 

    const closeModal = screen.getAllByRole('button', {name: /Close/i})[1];
    await act(async () => {
      fireEvent.click(closeModal);
    })

    expect(screen.queryAllByText('Task Was Claimed')).toEqual([]);
  })
})