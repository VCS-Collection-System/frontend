import React from "react"
import { Settings } from "../../../src/app/AttestWorkflow/Settings"
import { act, fireEvent, render, screen } from '@testing-library/react'
import mockKeycloak from "../../../__mocks__/keycloakMock"
import reactRouterDom from "react-router-dom"
import { getConfig } from "../../../__mocks__/configMock"
import { CONFIG_URL } from "@app/utils/constants"

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: jest.fn(() => ({ keycloak: mockKeycloak })),
}))
jest.mock("@app/utils/constants", () => ({
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_ID: "attributes.workforceid[0]",
  APPROVER_ROLES: ["mock-approver"],
  BLOCKED_COUNTRIES: [],
  FEATURE_FLAGS: [],
  CONFIG_URL: "config/",
  SAVE_CONFIG_URL: "save/"
}))

const config = {"default": {
  "allowPdf": false,
  "dateOfBirth": true,
  "consentCheckbox": false,
  "covidTest": true,
  "customInput": true,
  "hrDashboard": true,
  "hrSearch": true,
  "cdc": false,
  "divoc": false,
  "greenPass": false,
  "recovery": false,
  "fakeFeature": true
}, "aut": {
  "allowPdf": false,
  "dateOfBirth": false,
  "consentCheckbox": true,
  "covidTest": true,
  "customInput": true,
  "hrDashboard": true,
  "hrSearch": true,
  "cdc": false,
  "divoc": false,
  "greenPass": false,
  "recovery": true,
  "fakeFeature": true
}}

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL: string) => getConfig(URL, CONFIG_URL, config),
  post: (URL: string) => {
    if(URL === "save/") {
      return Promise.resolve({status: 200})
    } else {
      return Promise.reject({status: 400});
    }
  }
}))

jest.mock("react-router-dom")

const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })

describe('<Settings />', ()=> {
  it('should be defined', () => {
      expect(Settings).toBeDefined()
  })
  it("should match existing snapshot", () => {
      expect(render(<Settings />).asFragment()).toMatchSnapshot()
  })
  it("should be able to go attestmenu", async () => {
    mockKeycloak.profile = {
      firstName: "mockFirst",
      lastName: "mockLast",
      email: "mock@email.com",
      attributes: {
          workforceid: ["mockId"],
          agency: ["USA"]
      }
    }
    await act(async () => {
      render(<Settings />)
      const acceptButton = await screen.getByRole('button', {name: /Back/i})
      fireEvent.click(acceptButton)
    })
    
    expect(mockPush).toHaveBeenCalledWith('/attestmenu')
  })

  it("should show user country by default", async () => {
    await act(async () => {
      render(<Settings />)
      await new Promise(process.nextTick);
    })

    expect(!screen.getByLabelText("consentCheckbox-switch").hasAttribute("checked"));
    expect(!screen.getByLabelText("consentCheckboxAlternate-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("dateOfBirth-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("covidTest-switch").hasAttribute("checked"));
    expect(!screen.getByLabelText("recovery-switch").hasAttribute("checked"));

    expect(screen.getByLabelText("proof-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("proofOptional-switch").hasAttribute("checked"));
    expect(!screen.getByLabelText("allowPdf-switch").hasAttribute("checked"));

    expect(screen.getByLabelText("hrDashboard-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("hrSearch-switch").hasAttribute("checked"));
  })

  it("should show country specific settings", async () => {
    await act(async () => {
      render(<Settings />)
      await new Promise(process.nextTick);
      fireEvent.change(screen.getByLabelText("country-select"), {target: {value: "AUT"}});
      await new Promise(process.nextTick);
    })

    expect(!screen.getByLabelText("dateOfBirth-switch").getAttribute("disabled"));
    expect(screen.getByTestId("dateOfBirth-off-label").style.color === "#151515");
    expect(screen.getByTestId("dateOfBirth-gs-value").textContent === "(On)");

    expect(screen.getByLabelText("consentCheckbox-switch").hasAttribute("checked"));
    expect(!screen.getByLabelText("consentCheckboxAlternate-switch").hasAttribute("checked"));
    expect(!screen.getByLabelText("dateOfBirth-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("covidTest-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("recovery-switch").hasAttribute("checked"));

    expect(screen.getByLabelText("proof-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("proofOptional-switch").hasAttribute("checked"));
    expect(!screen.getByLabelText("allowPdf-switch").hasAttribute("checked"));

    expect(screen.getByLabelText("hrDashboard-switch").hasAttribute("checked"));
    expect(screen.getByLabelText("hrSearch-switch").hasAttribute("checked"));

    await act(async () => {
      fireEvent.change(screen.getByLabelText("country-select"), {target: {value: "USA"}});
      await new Promise(process.nextTick);
    })

    expect(screen.getByLabelText("dateOfBirth-switch").hasAttribute("disabled"));
    expect(screen.getByTestId("dateOfBirth-off-label").style.color === "#6a6e73");
    expect(!screen.getByTestId("dateOfBirth-gs-value"));
  })
  
  it("should save country specific settings", async () => {
    await act(async () => {
      render(<Settings />)
      await new Promise(process.nextTick);
    })

    // should use Global Standard by default
    expect(screen.getByLabelText("dateOfBirth-switch").hasAttribute("disabled"));
    expect(screen.getByTestId("dateOfBirth-off-label").style.color === "#6a6e73");
    expect(!screen.getByTestId("dateOfBirth-gs-value"));

    await act(async () => {
      fireEvent.change(screen.getByLabelText("dateOfBirth-gs"), {target: {value: false}});
    })

    expect(!screen.getByLabelText("dateOfBirth-switch").getAttribute("disabled"));
    expect(screen.getByTestId("dateOfBirth-off-label").style.color === "#151515");
    expect(screen.getByTestId("dateOfBirth-gs-value").textContent === "(On)");

    await act(async () => {
      fireEvent.change(screen.getByLabelText("dateOfBirth-switch"), {target: {value: false}});
      fireEvent.click(screen.getByText("Save"));
      await new Promise(process.nextTick);
    })

    expect(screen.getByTestId("saved"));

    await act(async () => {
      fireEvent.change(screen.getByLabelText("dateOfBirth-gs"), {target: {value: true}});
    })

    expect(screen.getByLabelText("dateOfBirth-switch").hasAttribute("disabled"));
    expect(screen.getByTestId("dateOfBirth-off-label").style.color === "#6a6e73");
    expect(!screen.getByTestId("dateOfBirth-gs-value"));
  })
})