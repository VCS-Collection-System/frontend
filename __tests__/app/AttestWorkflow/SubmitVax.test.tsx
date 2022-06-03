import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { SubmitVax } from "../../../src/app/AttestWorkflow/SubmitVax"
import mockKeycloak from "../../../__mocks__/keycloakMock"
import { getConfig } from "../../../__mocks__/configMock"
import vaxImage from "../../../__mocks__/vaxImageMock"
import reactRouterDom from "react-router-dom"
import { convertBase64ToBlob, convertBlobToBase64, dateConvert } from "@app/utils/utils";
import { CONFIG_URL } from "@app/utils/constants"

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: jest.fn( ()=>({keycloak: mockKeycloak}))
}))

jest.mock("@app/utils/constants", () => ({
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_ID: "attributes.workforceid[0]",
  MAX_DOSES: {"Moderna": 2},
  FEATURE_FLAGS: ["fakeFeature"],
  CONFIG_URL: "config/"
}))

const config = {
  "cze": {
    "proofOptional": true
  },
  "deu": {
    "proof": false
  },
  "default": {
    "allowPdf": false,
    "dateOfBirth": true,
    "consentCheckbox": false,
    "covidTest": false,
    "customInput": true,
    "hrdashboard": true,
    "hrsearch": true,
    "proof": true,
    "proofOptional": false,
    "cdc": true,
    "divoc": false,
    "greenPass": false,
    "recovery": false,
    "fakeFeature": true
  }
}

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL: string) => getConfig(URL, CONFIG_URL, config)
}))

jest.mock("react-router-dom")

jest.mock("@app/utils/utils", () => ({
  ...jest.requireActual("@app/utils/utils"),
  convertBlobToBase64: jest.fn( ()=> {return Promise.resolve({})})
}))

const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: mockPush })

describe('<SubmitVax />', ()=> {
  it('should be defined', () => {
    expect(SubmitVax).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    expect(render(<SubmitVax />).asFragment()).toMatchSnapshot()
  })

  it("should not allow to submit without attachments", async () => {
    jest.spyOn(console,'error').mockReturnValue()
    await act(async () => {
      render(<SubmitVax />)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const acceptButton = screen.getByRole('button', { name: /Accept/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(mockPush).toBeCalledTimes(0); 
  })

  it("should be allowed to submit without attachments if optional is true", async () => {
    jest.spyOn(console,'error').mockReturnValue()
    mockKeycloak.profile = {
      firstName: "mockFirst",
      lastName: "mockLast",
      email: "mock@email.com",
      attributes: {
          workforceid: ["mockId"],
          agency: ["CZE"]
      }
    }
    await act(async () => {
      render(<SubmitVax />)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const acceptButton = screen.getByRole('button', { name: /Accept/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(mockPush).toHaveBeenCalledWith("/attest/review/vax");
  })

  it("should be allowed to submit without attachments if proof is false", async () => {
    jest.spyOn(console,'error').mockReturnValue()
    mockKeycloak.profile = {
      firstName: "mockFirst",
      lastName: "mockLast",
      email: "mock@email.com",
      attributes: {
          workforceid: ["mockId"],
          agency: ["DEU"]
      }
    }
    await act(async () => {
      render(<SubmitVax />)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const acceptButton = screen.getByRole('button', { name: /Accept/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(mockPush).toHaveBeenCalledWith("/attest/review/vax");
    expect(sessionStorage.getItem("proof_type")).toBe("OTHER");
  })

  it("should not display undefined when missing attributes", async () => {
    mockKeycloak.profile.firstName = "";
    mockKeycloak.profile.lastName = "";
    mockKeycloak.profile.attributes.workforceid = [];
    mockKeycloak.profile.attributes.agency=[];
    await act(async () => {
      render(<SubmitVax />)
    })

    expect(screen.queryByText("undefined")).toBe(null); 
  })

  it("should allow to submit one shot of complete form", async () => {
    sessionStorage.setItem("vax_image", "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg")
    sessionStorage.setItem("vax_image_filename", "blob.pdf")
    await act(async () => {
      render(<SubmitVax />)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const acceptButton = screen.getByRole('button', { name: /Accept/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(mockPush).toHaveBeenCalledWith("/attest/review/vax")
  })

  it("should allow to submit two shots of complete form", async () => {
    sessionStorage.clear(); 
    sessionStorage.setItem("vax_image", "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg"); 
    await act(async () => {
      render(<SubmitVax />)
    })

    const addDoseButton = screen.getByText('Add Dose') 
    await act(async () => {
      fireEvent.click(addDoseButton)
    })

    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect1 = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const covidBrandSelect2 = screen.getByRole('combobox', { name: /vaccine-vendor-2/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const acceptButton = screen.getByRole('button', { name: /Accept/i})

    await act(async () => {
      fireEvent.change(covidBrandSelect1, {target: {value: 'Moderna'}})
      fireEvent.change(covidBrandSelect2, {target: {value: 'Moderna'}})
    })

    const dateTwoInput = screen.getByRole('textbox', { name: /shot-2-date/i})
    const lotTwoInput = screen.getByRole('textbox', { name: /lot-number-2/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(dateTwoInput, {target: {value: '09-02-2021'}})
    fireEvent.change(lotTwoInput, {target: {value: '2'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(acceptButton)
    })

    expect(mockPush).toHaveBeenCalledWith("/attest/review/vax")
  })
})