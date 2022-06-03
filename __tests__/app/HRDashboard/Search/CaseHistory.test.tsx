import React from 'react';
import { CaseHistory } from '../../../../src/app/HRDashboard/Search/CaseHistory';
import mockKeycloak from '../../../../__mocks__/keycloakMock'
import { act } from 'react-dom/test-utils';
import { EMPLOYEE_VAX_HISTORY_URL, ATTACHMENT_URL } from '../../../../src/app/utils/constants'
import { fireEvent, render, screen } from '@testing-library/react'
import reactRouterDom from 'react-router-dom'
import { employeeInfo, vaxHistory,} from '../../../../__mocks__/dataMock'

let mockVaxHistory = [{}];
const errorState = 'error';

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

    if(URL === EMPLOYEE_VAX_HISTORY_URL + employeeInfo['employeeId']){
      returnData = {data: mockVaxHistory}
    }
    else{
      returnData = {data: []};
    }

    return Promise.resolve(returnData)
  },
  post: (URL) => {
    let returnData; 

    if(URL === ATTACHMENT_URL){
      returnData = {data: {}, headers: {}};
    }

    return Promise.resolve(returnData)
  }
}))

beforeEach(() => {
  mockVaxHistory = [];
  sessionStorage.setItem("searchResultInfo", JSON.stringify(employeeInfo))
})

afterEach(() => {
  sessionStorage.clear(); 
})

describe('<CaseHistory />', ()=> {
  it('should be defined', () => {
    expect(CaseHistory).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    await act(async () => {
      const { asFragment } = render(<CaseHistory />)
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it("should render without Vax Data", async () => {
    await act(async () => {
      render(<CaseHistory />)
    })
    expect(screen.getByText('[No Vaccination Records]')).toBeTruthy(); 
    expect(screen.queryAllByText('Mock Tester')).toEqual([]);
    expect(screen.queryAllByText('test@mock.com')).toEqual([]);
    expect(screen.queryAllByText('mock1')).toEqual([]);
    expect(screen.queryAllByText('"2021-10-07"')).toEqual([]);
  })

  it("should render Vax Data", async () => {
    mockVaxHistory = [vaxHistory]
    await act(async () => {
      render(<CaseHistory />)
    })
    expect(screen.getByRole('button', {name: /10-04-2021 ACCEPTED/i})).toBeTruthy();
  })

  it("should be able to click Vaccination History menu items", async () => {
    mockVaxHistory = [vaxHistory]
    window.URL.createObjectURL = jest.fn();
    await act(async () => {
      render(<CaseHistory />)
    })
    const vaxItem = await screen.getByRole('button', {name: /10-04-2021 ACCEPTED/i})
    await act(async () => {
      fireEvent.click(vaxItem)
    })
    const caseObject = JSON.parse(sessionStorage.getItem("caseHistoryInfo") || "{}")
    expect(sessionStorage.getItem("caseHistoryType")).toEqual("VAX")
    expect(caseObject).toMatchObject(vaxHistory)
  })

  it("should be able render Vaccination History without review and auto approved", async () => {
    mockVaxHistory = [{
      "review": null,
      "autoApproved":true,
      "vaccineBrand":"MODERNA",
      "vaccineAdministrationDate":"2021-10-04",
      "vaccineShotNumber":2,
      "documentType":"VaccineDocument"
    }]
    await act(async () => {
      render(<CaseHistory />)
    })
    expect(screen.getByText('AUTO-ACCEPTED')).toBeTruthy()
  })

  it("should be able render Vaccination History without review and not reviewed", async () => {
    mockVaxHistory = [{
      "review": null,
      "autoApproved":false,
      "vaccineBrand":"MODERNA",
      "vaccineAdministrationDate":"2021-10-04",
      "vaccineShotNumber":2,
      "documentType":"VaccineDocument"
    }]
    await act(async () => {
      render(<CaseHistory />)
    })
    expect(screen.getByText('NOT REVIEWED')).toBeTruthy()
  })

  it("should sort Vaccination History by date", async () => {
    mockVaxHistory = [{
      "review": null,
      "autoApproved":false,
      "vaccineBrand":"MODERNA",
      "vaccineAdministrationDate":"2021-10-05",
      "vaccineShotNumber":2,
      "documentType":"VaccineDocument"
    },
    {
      "review": null,
      "autoApproved":false,
      "vaccineBrand":"MODERNA",
      "vaccineAdministrationDate":"2021-10-04",
      "vaccineShotNumber":1,
      "documentType":"VaccineDocument"
    }]
    await act(async () => {
      render(<CaseHistory />)
    })
    expect(screen.getByText((content, element) => {
      if(!element) {
        return false;
      }
      const listItem = element.closest(".pf-c-menu__list-item");
      if(!listItem) {
        return false;
      }
      return (content === "10-04-2021" &&
        listItem.nextSibling != null)
    })).toBeTruthy();
  })

  it("should be able to click Back to return to HR Dashboard", async () => {
    await act(async () => {
      render(<CaseHistory />)
    })
    const backButton = await screen.getByRole('button', {name: /Back/i})
    fireEvent.click(backButton)
    expect(mockPush).toHaveBeenCalledWith('/hrdashboard')
  })

  // update with new modal
  /*it("should be able to click Add Record to see Modal", async () => {
    await act(async () => {
      render(<CaseHistory />)
    })
    const addRecordButton = await screen.getByRole('button', {name: /Add Record/i})
    fireEvent.click(addRecordButton)
    expect(screen.getByRole('button', {name: /Close/i})).toBeTruthy();
    expect(screen.getByRole('heading', {name: /Add Record/i})).toBeTruthy();
    expect(screen.getByRole('button', {name: /Submit/i})).toBeTruthy();
  })

  it("should be able to close Add Record", async () => {
    const spy = jest.spyOn(console, errorState).mockReturnValue()
    await act(async () => {
      render(<CaseHistory />)
    })
    const addRecordButton = await screen.getByRole('button', {name: /Add Record/i})
    fireEvent.click(addRecordButton)
    const closeButton = await screen.getByRole('button', {name: /Close/i})
    fireEvent.click(closeButton)
    expect(screen.queryByText('Vaccine Submission')).toBeNull();
    expect(screen.queryByText('Submit')).toBeNull()
    spy.mockRestore();
  })*/

  it("should not crash if missing employee info", async () => {
    const spy = jest.spyOn(console, errorState).mockReturnValue()
    sessionStorage.clear()
    await act(async () => {
      render(<CaseHistory />)
    })
    expect(screen.queryByText('Mock Tester')).toBeNull();
    expect(screen.queryByText('test@mock.com')).toBeNull();
    expect(screen.queryByText('mock1')).toBeNull();
    expect(screen.queryByText('"2021-10-07"')).toBeNull();
    spy.mockRestore();
  })
})
