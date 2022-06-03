import React from 'react';
import { HRVaxSubmit } from "@app/HRDashboard/Search/AddRecord/HRVaxSubmit";
import { act, fireEvent, render, screen } from '@testing-library/react'
import mockKeycloak from '../../../../../__mocks__/keycloakMock'
import { employeeInfo } from '../../../../../__mocks__/dataMock'
import { SUBMIT_VAX_URL } from '@app/utils/constants'
import { convertBase64ToBlob } from '@app/utils/utils';

let mockStatus;
const mockURL = SUBMIT_VAX_URL; 
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
  MAX_DOSES: {"AstraZeneca":2,"Janssen":1,"Johnson":1,"Moderna":2,"Novavax":2,"Pfizer":2},
  CONSENT_COUNTRIES: ["AUS"],
  GLOBAL_CONFIG: {"default": {
    "allowPdf": false,
    "dateOfBirth": true,
    "consentCheckbox": false,
    "covidTest": false,
    "customInput": true,
    "hrdashboard": true,
    "hrsearch": true,
    "fakeFeature": true,
    "proof": true,
    "proofOptional": false,
    "proofType": {"cdc": true, "divoc": false, "greenPass": false},
    "recovery": false,  
  }}
}))

const mockPost = jest.fn((url, payload) => {
  if(mockStatus == 500) {
    return Promise.reject({response: {status: 500}})
  }
  else if(mockStatus == 501) {
    return Promise.reject({})
  }
  else if(mockStatus == 502) {
    mockStatus = 501
    return Promise.resolve({status: mockStatus})
  }
  else if(mockStatus == 503) {
    mockStatus = 500
    return Promise.resolve({status: mockStatus})
  }
  else if(url === mockURL){
      return Promise.resolve({status: mockStatus})
  }
  else {
      return Promise.resolve({status: 500})
  }
})

jest.mock('@app/utils/axiosInterceptor', () => ({
  post: (url, payload) => mockPost(url, payload)
  }))

const mockCloseParentModal = jest.fn();
const mockVaxOneInfo = {
  "vaccineBrand": 'MODERNA',
  "vaccineAdministrationDate": '2021-09-01',
  "vaccineShotNumber": 1,
  "submittedBy": 'mockId',
  "lotNumber": 1,
  "proofType": "OTHER"
}

const mockVaxTwoInfo = {
  "vaccineBrand": 'MODERNA',
  "vaccineAdministrationDate": '2021-09-15',
  "vaccineShotNumber": 2,
  "submittedBy": 'mockId',
  "lotNumber": 2,
  "proofType": "OTHER"
}

const mockVaxProofInfo = {
  "vaccineBrand": 'MODERNA',
  "vaccineAdministrationDate": '2021-09-15',
  "vaccineShotNumber": 2,
  "submittedBy": 'mockId',
  "lotNumber": 1,
  "proofType": "CDC"
}

const base64Image = "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg";

const mockFormDataOne = new FormData();
mockFormDataOne.append('employee', new Blob([JSON.stringify(employeeInfo)], {type: "application/json"}) );
mockFormDataOne.append('documents', new Blob([JSON.stringify(mockVaxOneInfo)], {type: "application/json"}));
mockFormDataOne.append('attachment', new Blob([]));

const mockFormDataTwo = new FormData();
mockFormDataTwo.append('employee', new Blob([JSON.stringify(employeeInfo)], {type: "application/json"}) );
mockFormDataTwo.append('documents', new Blob([JSON.stringify(mockVaxTwoInfo)], {type: "application/json"}));
mockFormDataTwo.append('attachment', new Blob([]));

const mockFormDataPDF = new FormData();
mockFormDataPDF.append('employee', new Blob([JSON.stringify(employeeInfo)], {type: "application/json"}) );
mockFormDataPDF.append('documents', new Blob([JSON.stringify(mockVaxProofInfo)], {type: "application/json"}));
mockFormDataPDF.append("attachment", new Blob([convertBase64ToBlob(base64Image)], { type: "application/pdf" }), "blob.pdf");

const mockFormDataJPG = new FormData();
mockFormDataJPG.append('employee', new Blob([JSON.stringify(employeeInfo)], {type: "application/json"}) );
mockFormDataJPG.append('documents', new Blob([JSON.stringify(mockVaxProofInfo)], {type: "application/json"}));
mockFormDataJPG.append("attachment", new Blob([convertBase64ToBlob(base64Image)], { type: "image/jpeg" }), "blob.jpg");

const mockFormDataPNG = new FormData();
mockFormDataPNG.append('employee', new Blob([JSON.stringify(employeeInfo)], {type: "application/json"}) );
mockFormDataPNG.append('documents', new Blob([JSON.stringify(mockVaxTwoInfo)], {type: "application/json"}));
mockFormDataPNG.append("attachment", new Blob([convertBase64ToBlob(base64Image)], { type: "image/png" }), "blob.png");

const mockFormDataEmpty = new FormData();
mockFormDataEmpty.append('employee', new Blob([JSON.stringify(employeeInfo)], {type: "application/json"}) );
mockFormDataEmpty.append('documents', new Blob([JSON.stringify(mockVaxTwoInfo)], {type: "application/json"}));
mockFormDataEmpty.append("attachment", new Blob([convertBase64ToBlob(base64Image)], { type: "image/" }), "blob.");

beforeEach(() => {
  mockStatus = 200
  sessionStorage.setItem("searchResultInfo", JSON.stringify(employeeInfo))
})

describe('<HRVaxSubmit />', ()=> {
  it('should be defined', () => {
    expect(HRVaxSubmit).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    sessionStorage.clear()
    const { asFragment } = render(<HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    expect(asFragment()).toMatchSnapshot()
  })

  it("should allow to submit one shot of complete form", async () => {
    jest.spyOn(console,'error').mockReturnValue()
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const submitButton = screen.getByRole('button', { name: /Submit/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(screen.getByText('Submitted Successfully!')).toBeTruthy()
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataOne)
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /Close/i})[0])
    })
    expect(mockCloseParentModal).toBeCalled()
  })

  it("should allow to submit two shots of complete form", async () => {
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
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
    const submitButton = screen.getByRole('button', { name: /Submit/i})

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
      fireEvent.click(submitButton)
    })
    expect(screen.getByText('Submitted Successfully!')).toBeTruthy()
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataOne)
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataTwo)
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /Close/i})[0])
    })
    expect(mockCloseParentModal).toBeCalled()
  })

  it("should allow to submit with pdf", async () => {
    window.URL.createObjectURL = jest.fn();
    sessionStorage.setItem("hr_vax_image", "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg")
    sessionStorage.setItem("hr_vax_image_filename", "blob.pdf")
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const submitButton = screen.getByRole('button', { name: /Submit/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'CDC'}})

    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(screen.getByText('Submitted Successfully!')).toBeTruthy()
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataPDF)
  })

  it("should allow to submit with jpg", async () => {
    window.URL.createObjectURL = jest.fn();
    sessionStorage.setItem("hr_vax_image", "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg")
    sessionStorage.setItem("hr_vax_image_filename", "blob.jpg")
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const submitButton = screen.getByRole('button', { name: /Submit/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'CDC'}})

    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(screen.getByText('Submitted Successfully!')).toBeTruthy()
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataJPG)
  })

  it("should allow to submit with png", async () => {
    window.URL.createObjectURL = jest.fn();
    sessionStorage.setItem("hr_vax_image", "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg")
    sessionStorage.setItem("hr_vax_image_filename", "blob.png")
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const submitButton = screen.getByRole('button', { name: /Submit/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(screen.getByText('Submitted Successfully!')).toBeTruthy()
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataPNG)
  })

  it("should allow to submit with no attachment name and no proof type", async () => {
    window.URL.createObjectURL = jest.fn();
    sessionStorage.clear();
    sessionStorage.setItem("hr_vax_image", "data:image/png;base64,VEhJUyBJUyBUSEUgQU5TV0VSCg")
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const submitButton = screen.getByRole('button', { name: /Submit/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})

    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(screen.getByText('Submitted Successfully!')).toBeTruthy()
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataEmpty)
  })

  it("should not display shot one error if no response", async () => {
    mockStatus = 501
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const submitButton = screen.getByRole('button', { name: /Submit/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(screen.queryByText('Submitted Successfully!')).toBeNull();
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataOne)
  })

  it("should display shot one error with response", async () => {
    mockStatus = 500
    await act(async () => {
      render( <HRVaxSubmit closeParentModal={mockCloseParentModal}/>)
    })
    const dobInput = screen.getByRole('textbox', { name: /date_of_birth/i})
    const covidBrandSelect = screen.getByRole('combobox', { name: /vaccine-vendor-1/i})
    const dateOneInput = screen.getByRole('textbox', { name: /shot-1-date/i})
    const lotOneInput = screen.getByRole('textbox', { name: /lot-number-1/i})
    const vaxType = screen.getByRole('combobox', { name: /proof-type/i})
    const submitButton = screen.getByRole('button', { name: /Submit/i})

    fireEvent.change(dobInput, {target: {value: '09-01-2021'}})
    fireEvent.change(covidBrandSelect, {target: {value: 'Moderna'}})
    fireEvent.change(dateOneInput, {target: {value: '09-01-2021'}})
    fireEvent.change(lotOneInput, {target: {value: '1'}})
    fireEvent.change(vaxType, {target: {value: 'OTHER'}})

    await act(async () => {
      fireEvent.click(submitButton)
    })
    expect(mockPost).toBeCalledTimes(1) 
    expect(mockPost).toBeCalledWith(mockURL, mockFormDataOne)
    expect(screen.queryByText('Submitted Successfully!')).toBeNull();
    expect(screen.getByText('Error Submitting Form')).toBeTruthy()
  })
})