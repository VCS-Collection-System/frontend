import React from "react"
import GlobalStyle from "@app/utils/GlobalStyle"
import { render } from '@testing-library/react'

jest.spyOn(console, 'warn').mockReturnValue();

describe('<GlobalStyle />', ()=> {
  it('should be defined', () => {
    expect(GlobalStyle).toBeDefined()
  })
  it("should match existing snapshot", () => {
    expect(render(<GlobalStyle />).asFragment()).toMatchSnapshot()
  })
})