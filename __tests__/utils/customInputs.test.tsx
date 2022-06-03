import React from "react"
import {useDarkMode} from "@app/utils/customInputs"
import { act, fireEvent, render, screen } from '@testing-library/react'
import { KONAMI_CODE } from "@app/utils/constants"

const MockElement = () => {
  const darkMode = useDarkMode(); 

  return (
      <div data-testid="mockComponent">
        {darkMode ? "on" : "off"}
      </div>
  )
}

describe('<useDarkMode />', ()=> {
  it('should be defined', () => {
    expect(useDarkMode).toBeDefined()
  })

  it("should match existing snapshot", () => {
    expect(render(<MockElement />).asFragment()).toMatchSnapshot()
  })

  it('should be false by default', async () => {
    await act(async () => {
      render(<MockElement />);
    })

    expect(screen.getByText("off")).toBeTruthy();
  })

  it('should be true when all keystrokes are correct', async () => {
    await act(async () => {
      render(<MockElement />);
    })
    const mockElement = screen.getByTestId('mockComponent');
    expect(screen.getByText("off")).toBeTruthy();

    KONAMI_CODE.forEach((key) => {
      fireEvent.keyDown(mockElement, {
        code: key
      });
      fireEvent.keyUp(mockElement, {
        code: key
      });
    })

    expect(screen.getByText("on")).toBeTruthy();
  })

  it('should be false when keystrokes are not correct', async () => {
    await act(async () => {
      render(<MockElement />);
    })
    const mockElement = screen.getByTestId('mockComponent');
    expect(screen.getByText("off")).toBeTruthy();
    const WRONG_CODE = [ "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyB"];
    WRONG_CODE.forEach((key) => {
      fireEvent.keyDown(mockElement, {
        code: key
      });
      fireEvent.keyUp(mockElement, {
        code: key
      });
    })

    expect(screen.getByText("off")).toBeTruthy();
  })
})