import React from 'react';
import reactRouterDom from 'react-router-dom'
import { render, fireEvent } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { shallow } from 'enzyme';
import CovidVaxForm from '../../../src/app/Components/CovidVaxForm';
import mockKeycloak from "../../../__mocks__/keycloakMock"
import { getConfig } from "../../../__mocks__/configMock"
import { CONFIG_URL } from '@app/utils/constants';

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: jest.fn(() => ({ keycloak: mockKeycloak })),
}))

jest.mock("@app/utils/constants", () => ({
  FEATURE_FLAGS: [],
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
  "aus": {"consentCheckbox": true},
  "deu": {"consentCheckboxAlternate": true}
}

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL: string) => getConfig(URL, CONFIG_URL, config)
}))

jest.mock("react-router-dom");
const mockPush = jest.fn();
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush});

describe('<CovidVaxForm />', ()=> {
    it('should be defined', () => {
        expect(CovidVaxForm).toBeDefined()
    })
    it("should render without crashing", () => {
        const wrapper = shallow(<CovidVaxForm />)
        expect(wrapper)
    })
    it("should match existing snapshot", () => {
        const wrapper = shallow(<CovidVaxForm />)
        expect(wrapper).toMatchSnapshot()
    })
    it("birth date should be after min birth date", async () => {
        render(<CovidVaxForm />)
        await new Promise(process.nextTick);
        fireEvent.change(screen.getByLabelText("date_of_birth"), {target: {value: "12-31-1920"}});
        fireEvent.blur(screen.getByLabelText("date_of_birth"));
        expect(screen.getByLabelText("date_of_birth")).toHaveAttribute("aria-invalid", "true");
    })
    it("should be after min dose date", () => {
        render(<CovidVaxForm />)
        fireEvent.change(screen.getByLabelText("shot-1-date"), {target: {value: "05-01-2020"}});
        fireEvent.blur(screen.getByLabelText("shot-1-date"));
        expect(screen.getByLabelText("shot-1-date")).toHaveAttribute("aria-invalid", "true");
    })
    it("should add optional dose when clicking Add Dose", () => {
        render(<CovidVaxForm />)
        expect(screen.getByTestId("add-dose")).toBeTruthy();
        userEvent.click(screen.getByTestId("add-dose"));
        expect(screen.getByTestId("remove-dose")).toBeTruthy();
    })
    it("should validate 2nd dose is after 1st dose", () => {
        render(<CovidVaxForm />)
        userEvent.click(screen.getByTestId("add-dose"));
        fireEvent.change(screen.getByLabelText("shot-1-date"), {target: {value: "01-02-2022"}});
        fireEvent.change(screen.getByLabelText("shot-2-date"), {target: {value: "01-01-2022"}});
        fireEvent.blur(screen.getByLabelText("shot-2-date"));
        expect(screen.getByLabelText("shot-2-date")).toHaveAttribute("aria-invalid", "true");
    })
    it("should remove optional dose when clicking Remove Dose", () => {
        render(<CovidVaxForm />)
        userEvent.click(screen.getByTestId("add-dose"));
        userEvent.click(screen.getByTestId("remove-dose"));
        expect(screen.queryByTestId("remove-dose")).toBeFalsy();
    })
    it("should accept without consent in non-consent countries", () => {
        render(<CovidVaxForm />)
        expect(screen.queryByLabelText("consent-checkbox")).toBeFalsy();
    })
    it("should require consent in consent countries", async () => {
        mockKeycloak.profile.attributes.agency[0] = "AUS";
        render(<CovidVaxForm />);
        await new Promise(process.nextTick);
        expect(screen.getByLabelText("consent-checkbox")).toBeTruthy();
    })
    it("should require consent in alternate consent countries", async () => {
        mockKeycloak.profile.attributes.agency[0] = "DEU";
        render(<CovidVaxForm />);
        await new Promise(process.nextTick);
        expect(screen.getByLabelText("consent-checkbox")).toBeTruthy();
        mockKeycloak.profile.attributes.agency[0] = "USA";
    })
    it("should be able to click Back to return to menu", () => {
        render(<CovidVaxForm />);
        fireEvent.click(screen.getByText("Back"));
        expect(mockPush).toHaveBeenCalledWith('/attestmenu');
    })
})
