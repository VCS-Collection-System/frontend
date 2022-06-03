import React from 'react';
import { Privacy } from '../../../src/app/Pages/Privacy';
import { fireEvent, render, screen } from '@testing-library/react'
import reactRouterDom from "react-router-dom"

jest.mock("react-router-dom")
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })

describe('<Privacy />', ()=> {
  it('should be defined', () => {
    expect(Privacy).toBeDefined()
  })

  it("should match existing snapshot", () => {
    expect(render(<Privacy />).asFragment()).toMatchSnapshot()
  })

  it("should match existing snapshot", () => {
    expect(render(<Privacy />).asFragment()).toMatchSnapshot()
  })


  it("should have an external link", () => {
    render(<Privacy />)
    expect(screen.getByRole('link', {name: /Covid-19 and VCS Privacy Notice for Red Hat/i}).getAttribute('href'))
    .toEqual("https://source.redhat.com/departments/legal/globallegalcompliance/compliance_folder/vcs_privacy_notice_for_red_hat_globalpdf")
  })

  it("should return to EULA with back button", () => {
    render(<Privacy />)
    const backButton = screen.getByRole('button', {name: /Back/i})
    fireEvent.click(backButton)
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})