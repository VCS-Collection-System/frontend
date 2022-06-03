import React from 'react';
import reactRouterDom from 'react-router-dom'
import { render, fireEvent, act } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { shallow } from 'enzyme';
import CovidTestForm from '../../../src/app/Components/CovidTestForm';
import mockKeycloak from "../../../__mocks__/keycloakMock"
import { getConfig } from "../../../__mocks__/configMock"
import { CONFIG_URL } from "@app/utils/constants"

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: jest.fn(() => ({ keycloak: mockKeycloak })),
}))

jest.mock("@app/utils/constants", () => ({
  FEATURE_FLAGS: [
    {
      "name": "consentCheckbox",
      "active": true
    }
  ],
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_ID: "attributes.workforceid[0]",
  MAX_DOSES: {"Pfizer": 2},
  CONFIG_URL: "config/"
}))

const config = {"default": {
    "allowPdf": false,
    "dateOfBirth": true,
    "consentCheckboxAlternate": false,
    "consentCheckbox": false,
    "covidTest": false,
    "customInput": true,
    "hrDashboard": true,
    "hrSearch": true,
    "cdc": false, 
    "divoc": false, 
    "greenPass": false,
    "recovery": false,
    "fakeFeature": true
  },
  "deu": {"consentCheckboxAlternate": true}
};

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL: string) => getConfig(URL, CONFIG_URL, config)
}))

jest.mock("react-router-dom");
const mockPush = jest.fn();
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush});

describe('<CovidTestForm />', ()=> {
    it('should be defined', () => {
        expect(CovidTestForm).toBeDefined()
    })
    it("should render without crashing", () => {
        const wrapper = shallow(<CovidTestForm />)
        expect(wrapper)
    })
    it("should match existing snapshot", () => {
        const wrapper = shallow(<CovidTestForm />)
        expect(wrapper).toMatchSnapshot()
    })
    it("birth date should be after min birth date", async () => {
        render(<CovidTestForm />)
        await new Promise(process.nextTick);
        fireEvent.change(screen.getByLabelText("date_of_birth"), {target: {value: "12-31-1920"}});
        fireEvent.blur(screen.getByLabelText("date_of_birth"));
        expect(screen.getByLabelText("date_of_birth")).toHaveAttribute("aria-invalid", "true");
    })
    it("should be after min dose date", () => {
        render(<CovidTestForm />);
        fireEvent.change(screen.getByLabelText("test-results-date"), {target: {value: "06-01-2021"}});
        fireEvent.blur(screen.getByLabelText("test-results-date"));
        expect(screen.getByLabelText("test-results-date")).toHaveAttribute("aria-invalid", "true");
    })
    it("should accept without consent in non-consent countries", () => {
        render(<CovidTestForm />)
        expect(screen.queryByLabelText("consent-checkbox")).toBeFalsy();
    })
    it("should require consent in consent countries", async () => {
        mockKeycloak.profile.attributes.agency[0] = "DEU";
        render(<CovidTestForm />);
        await new Promise(process.nextTick);
        expect(screen.getByLabelText("consent-checkbox")).toBeTruthy();
        mockKeycloak.profile.attributes.agency[0] = "USA";
    })
    it("should be able to click Back to return to menu", () => {
        render(<CovidTestForm />);
        fireEvent.click(screen.getByText("Back"));
        expect(mockPush).toHaveBeenCalledWith('/attestmenu');
    })
})
