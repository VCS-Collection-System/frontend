import React from "react"
import Feature, { showFeature } from "@app/Components/Feature"
import { render, screen } from '@testing-library/react'
import mockKeycloak from "../../../__mocks__/keycloakMock"
import { getConfig } from "../../../__mocks__/configMock"
import { CONFIG_URL } from "@app/utils/constants"

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: jest.fn(() => ({ keycloak: mockKeycloak })),
}))

jest.mock("@app/utils/constants", () => ({
  CONSENT_COUNTRIES: ["AUS"],
  FEATURE_FLAGS: [
    {
      "name": "fakeFeature", 
      "active": true
    },
    { 
      "name": "hrdashboard",
      "active": true
    }, 
    { 
      "name": "inactive",
      "active": false
    }, 
    {
      "name": "covidTest",
      "active": true
    },
    {
      "name": "consentCheckbox",
      "active": true
    },
    {
      "name": "customInput",
      "active": true
    }
  ],
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_ID: "attributes.workforceid[0]",
  CONFIG_URL: "config/"
}));

const config = {"default": {
  "allowPdf": false,
  "dateOfBirth": true,
  "consentCheckbox": false,
  "covidTest": false,
  "customInput": true,
  "hrdashboard": true,
  "hrsearch": true,
  "cdc": false,
  "divoc": false,
  "greenPass": false,
  "recovery": false,
  "fakeFeature": true
}};

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL: string) => getConfig(URL, CONFIG_URL, config)
}))

describe('<Feature />', ()=> {
  it('should be defined', () => {
    expect(Feature).toBeDefined()
  })
  it("should match existing snapshot", () => {
    expect(render(<Feature name="fakeFeature"><div /></Feature>).asFragment()).toMatchSnapshot()
  })

  it("should render child component when set in feature flag", async () => {
    render(
      <Feature name="fakeFeature">
        <div data-testid="mockComponent"/>
      </Feature> 
    )
    await new Promise(process.nextTick);
    expect(screen.getByTestId('mockComponent')).toBeTruthy();
  })

  it("should not render child component when not in feature flag", async () => {
    render(
      <Feature name="fakeFeature2">
        <div data-testid="mockComponent"/>
      </Feature>
    )
    await new Promise(process.nextTick);
    expect(screen.queryByTestId('mockComponent')).toBeFalsy();
  })

  it("should not render child component when active is false", async () => {
    render(
      <Feature name="inactive">
        <div data-testid="mockComponent"/>
      </Feature> 
    )
    await new Promise(process.nextTick);
    expect(screen.queryByTestId('mockComponent')).toBeFalsy();
  })

  it("should render off when not in feature", async () => {
    render(
      <Feature 
        name="notfeature"
        renderOff={() => <div data-testid="mockComponentOff"/> }
      >
        <div data-testid="mockComponentOn"/>
      </Feature> 
    )
    await new Promise(process.nextTick);
    expect(screen.getByTestId('mockComponentOff')).toBeTruthy();
  })

  it("should return whether to show feature", async () => {
    showFeature("fakeFeature", mockKeycloak).then(actualObject => {
      expect(actualObject).toEqual(true); 
    });

    showFeature("inactive", mockKeycloak).then(actualObjectTwo => {
      expect(actualObjectTwo).toEqual(false); 
    });
  })

  it("should return false when not defined", async () => {
    showFeature("notFeature", mockKeycloak).then(actualObject => {
      expect(actualObject).toEqual(false);
    })
  });
})