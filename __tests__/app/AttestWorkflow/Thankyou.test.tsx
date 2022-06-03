import React from 'react';
import { Thankyou } from '../../../src/app/AttestWorkflow/Thankyou';
import { fireEvent, render, screen } from '@testing-library/react'
import mockKeycloak from "../../../__mocks__/keycloakMock"

jest.mock("@react-keycloak/web", () => ({
  useKeycloak: jest.fn(() => ({ keycloak: mockKeycloak })),
}))

describe('<Thankyou />', ()=> {
  it('should be defined', () => {
    expect(Thankyou).toBeDefined()
  })

  it("should match existing snapshot", () => {
    expect(render(<Thankyou />).asFragment()).toMatchSnapshot()
  })

  it("should logout and clear session", () => {
    const mockLogout = jest.fn(); 
    sessionStorage.setItem("mockKey", "mockValue")
    mockKeycloak.logout = mockLogout 
    render(<Thankyou />)

    const logoutButton = screen.getByRole('button', {name: /Finish and Log Out/i})
    fireEvent.click(logoutButton)

    expect(sessionStorage.getItem("mockKey")).toEqual(null);
    expect(mockLogout).toBeCalledTimes(1); 
  })
})