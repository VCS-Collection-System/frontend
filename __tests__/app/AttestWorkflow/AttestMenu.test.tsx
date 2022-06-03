import React from "react"
import { shallow, mount } from "enzyme"
import { AttestMenu } from "../../../src/app/AttestWorkflow/AttestMenu"
import mockKeycloak from "../../../__mocks__/keycloakMock"
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
  FEATURE_FLAGS: [  
    { 
      "name": "hrdashboard",
      "active": "true"
    }, 
    {
      "name": "covidTest",
      "active": "true"
    }
  ],
  CONFIG_URL: "config/"
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
}};

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL: string) => getConfig(URL, CONFIG_URL, config)
}))

// mock history.push
import reactRouterDom from "react-router-dom"
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })
jest.mock("react-router-dom")

describe('AttestWorkflow - AttestMenu', () => {
  it('should be defined', () => {
    expect(AttestMenu).toBeDefined()
  })
  it('should render without crashing', () => {
    const wrapper = shallow(<AttestMenu />)
    expect(wrapper)
  })
  it('should match existing snapshot', () => {
    const wrapper = shallow(<AttestMenu />)
    expect(wrapper).toMatchSnapshot()
  })

  it('Button 0 push to /attest/vax page', async () => {
    const attestMenu = shallow(<AttestMenu />)
    const button = attestMenu.find('#submit-vax-card-menu-button')
    button.simulate('click')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/attest/vax')
  })

  it('Button 1 push to /attest/test page', async () => {
    const attestMenu = mount(<AttestMenu />)
    
    // await new Promise(process.nextTick) doesn't work with 'mount', so use basic timeout instead
    setTimeout(() => {
      const button = attestMenu.find('#submit-vax-test-menu-button').at(0)
      button.simulate('click')
      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/attest/test')
    }, 500);
    
  })

  it('Button 2 pushes to attest /hrdashboard page', async () => {
    mockKeycloak.hasRealmRole.mockReturnValue(true)
    const attestMenu = mount(<AttestMenu />)
    
    // await new Promise(process.nextTick) doesn't work with 'mount', so use basic timeout instead
    setTimeout(() => {
      const button = attestMenu.find('#validate-submissions-button').at(0)
      button.simulate('click')
      expect(mockPush).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/hrdashboard')
    }, 500);
  })

  it('Button 3 pushes to attest /settings page', async () => {
    mockKeycloak.hasRealmRole.mockReturnValue(true)
    const attestMenu = mount(<AttestMenu />)
    const button = attestMenu.find('#settings-button').at(0)
    button.simulate('click')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/settings')
  })

  it('Back Button pushes to attest /profile page', async () => {
    mockKeycloak.hasRealmRole.mockReturnValue(false)
    const attestMenu = shallow(<AttestMenu />)
    const button = attestMenu.find('#attest-menu-back-button')
    button.simulate('click')
    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/profile')
  })
})
