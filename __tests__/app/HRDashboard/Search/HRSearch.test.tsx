import React from 'react';
import { HRSearch } from '../../../../src/app/HRDashboard/Search/HRSearch';
import { act } from 'react-dom/test-utils';
import { EMPLOYEE_URL, EMPLOYEE_NAME_URL } from '../../../../src/app/utils/constants'
import { fireEvent, render, screen } from '@testing-library/react'
import reactRouterDom from 'react-router-dom'

jest.mock('react-router-dom')
const mockPush = jest.fn()
reactRouterDom.useHistory = jest.fn().mockReturnValue({push: mockPush})

jest.mock("@app/utils/constants", () => ({
  EMPLOYEE_URL: "employee-id",
  EMPLOYEE_NAME_URL: "employee-name"
}))

jest.mock('@app/utils/axiosInterceptor', () => ({
  get: (URL) => {
    let returnData;
    if(URL === EMPLOYEE_NAME_URL + 'validName'){
      returnData = {data: [{lastName: "mockLast", firstName: "mockFirst", employeeId: "validID"}]}
    }
    else if(URL === EMPLOYEE_NAME_URL + 'invalidName'){
      return Promise.reject({data: {}})
    }
    else if(URL === EMPLOYEE_URL + 'validID'){
      returnData = {data: {lastName: "mockLast", firstName: "mockFirst", employeeId: "validID"}}
    }
    else if(URL === EMPLOYEE_URL + 'invalidID'){
      return Promise.reject({data: {}})
    }
    else{
      returnData = {};
    }

    return Promise.resolve(returnData)
  },
}))

afterEach(() => {
  sessionStorage.clear(); 
})

describe('<HRSearch />', ()=> {
  it('should be defined', () => {
    expect(HRSearch).toBeDefined()
  })

  it("should match existing snapshot", async () => {
    const { asFragment } = render(<HRSearch />)
    expect(asFragment()).toMatchSnapshot()
  })

  it("should return with No results for invalid user", async () => {
    render(<HRSearch />)

    const searchInput = screen.getByRole('textbox', {name: /Search input/i})
    const searchButton = screen.getAllByRole('button', {name: /Search/i})[0]
    fireEvent.change(searchInput, {target: {value: 'mockInput'}})
    await act(async () => {
      fireEvent.click(searchButton)
    })

    expect(screen.getByText('No results for mockInput')).toBeTruthy(); 
  })

  it("should return results for valid user and clickable", async () => {
    render(<HRSearch />)

    const searchInput = screen.getByRole('textbox', {name: /Search input/i})
    const searchButton = screen.getAllByRole('button', {name: /Search/i})[0]
    fireEvent.change(searchInput, {target: {value: 'validID'}})
    await act(async () => {
      fireEvent.click(searchButton)
    })

    expect(screen.getByText('mockLast, mockFirst [validID]')).toBeTruthy(); 

    const resultButton = screen.getByRole('button', {name: "mockLast, mockFirst [validID]"})
    await act(async () => {
      fireEvent.click(resultButton)
    })

    expect(mockPush).toHaveBeenCalledWith('/hrdashboard/history')
  })

  it("should return results for valid user when hitting enter", async () => {
    render(<HRSearch />)

    const searchInput = screen.getByRole('textbox', {name: /Search input/i})
    fireEvent.change(searchInput, {target: {value: 'validID'}})
    await act(async () => {
      fireEvent.keyPress(searchInput, { key: "Enter", keyCode: 13, code: 13, charCode: 13 })
    })

    expect(screen.getByText('mockLast, mockFirst [validID]')).toBeTruthy(); 
  })

  // it("should return results for valid user when searching with last name", async () => {
  //   render(<HRSearch />)

  //   const searchInput = screen.getByRole('textbox', {name: /Search input/i})
  //   fireEvent.change(searchInput, {target: {value: 'validName'}})
  //   await act(async () => {
  //     fireEvent.keyPress(searchInput, { key: "Enter", keyCode: 13, code: 13, charCode: 13 })
  //   })

  //   expect(screen.getByText('mockLast, mockFirst [validID]')).toBeTruthy(); 
  // })

  it("should not return results for valid user when not hitting enter", async () => {
    render(<HRSearch />)

    const searchInput = screen.getByRole('textbox', {name: /Search input/i})
    fireEvent.change(searchInput, {target: {value: 'validID'}})
    await act(async () => {
      fireEvent.keyPress(searchInput, { key: "a", keyCode: 65, code: 65, charCode: 65})
    })
    expect(screen.queryAllByText('mockLast, mockFirst [validID]')).toEqual([]);
    expect(mockPush).toBeCalledTimes(0)
  })

  it("should return no result if API errors", async () => {
    render(<HRSearch />)

    const searchInput = screen.getByRole('textbox', {name: /Search input/i})
    const searchButton = screen.getAllByRole('button', {name: /Search/i})[0]
    fireEvent.change(searchInput, {target: {value: 'invalidID'}})
    await act(async () => {
      fireEvent.click(searchButton)
    })

    expect(screen.getByText('No results for invalidID')).toBeTruthy(); 
  })

  // it("should return no result if Last name API errors", async () => {
  //   render(<HRSearch />)

  //   const searchInput = screen.getByRole('textbox', {name: /Search input/i})
  //   const searchButton = screen.getAllByRole('button', {name: /Search/i})[0]
  //   fireEvent.change(searchInput, {target: {value: 'invalidName'}})
  //   await act(async () => {
  //     fireEvent.click(searchButton)
  //   })

  //   expect(screen.getByText('No results for invalidName')).toBeTruthy(); 
  // })

  it("should be able to clear search input", async () => {
    render(<HRSearch />)

    const searchInput = screen.getByRole('textbox', {name: /Search input/i})
    await act(async () => {
      fireEvent.change(searchInput, {target: {value: 'invalidID'}})
    })
    const resetButton = screen.getByRole('button', {name: /Reset/i})
    expect(resetButton).toBeTruthy(); 
    await act(async () => {
      fireEvent.click(resetButton)
    })
    expect(searchInput.getAttribute('value')).toEqual("")
  })
})