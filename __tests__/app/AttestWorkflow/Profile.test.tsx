import React from "react"
import { Profile } from "../../../src/app/AttestWorkflow/Profile"
import { act, fireEvent, render, screen } from '@testing-library/react'
import mockKeycloak from "../../../__mocks__/keycloakMock"
import reactRouterDom from "react-router-dom"

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
  BLOCKED_COUNTRIES: []
}))
jest.mock("react-router-dom")

const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })

describe('<Profile />', ()=> {
  it('should be defined', () => {
      expect(Profile).toBeDefined()
  })
  it("should match existing snapshot", () => {
      expect(render(<Profile />).asFragment()).toMatchSnapshot()
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
      render(<Profile />)
    })
    const acceptButton = await screen.getByRole('button', {name: /Accept/i})
    await fireEvent.click(acceptButton)
    expect(mockPush).toHaveBeenCalledWith('/attestmenu')
  })

  it("Empty values should not return undefined", async () => {
    mockKeycloak.profile = {
      firstName: "",
      lastName: "",
      email: "",
      attributes: {
          workforceid: ["mockId"],
          agency: ["USA"]
      }
    }
    await act(async () => {
      render(<Profile />)
    })
    expect(screen.queryAllByText('undefined')).toEqual([])
    expect(screen.getByRole('textbox', {name: /employee-full-name/i}).getAttribute('value')).toEqual(" ")
    expect(screen.getByRole('textbox', {name: /employee-email-display/i}).getAttribute('value')).toEqual("")
  })

  it("Should render caution banner when not in allowed countries", async () => {
    mockKeycloak.profile = {
      firstName: "",
      lastName: "",
      email: "",
      attributes: {
          workforceid: ["mockId"],
          agency: ["FAKE"]
      }
    }
    await act(async () => {
      render(<Profile />)
    })
    expect(screen.queryAllByText('This application is not currently available in your region.')).toBeTruthy()
  })

  it("should display approver role when is an approver", async () => {
    mockKeycloak.hasRealmRole.mockReturnValue(true)
    await act(async () => {
      render(<Profile />)
    })
    expect(screen.getByText('Red Hat VCS Reviewer')).toBeTruthy();
  })

  it("should not display approver role when not an approver", async () => {
    mockKeycloak.hasRealmRole.mockReturnValue(false)
    await act(async () => {
      render(<Profile />)
    })
    expect(screen.queryAllByText('Red Hat VCS Reviewer')).toEqual([])
  })
})