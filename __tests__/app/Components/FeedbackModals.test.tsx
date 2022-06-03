import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react'
import { GenericResponseModal, ResponseErrorModal }  from '../../../src/app/Components/FeedbackModals';

const mockSetIsModalOpen = jest.fn(); 

describe('<ResponseErrorModal />', ()=> {
    it('should be defined', () => {
        expect(ResponseErrorModal).toBeDefined()
    })

    it("should match existing snapshot", () => {
        expect(render(<ResponseErrorModal isModalOpen={true}/>).baseElement).toMatchSnapshot()
    })

    it("should render default error message", () => {
        render(
            <ResponseErrorModal 
                isModalOpen={true}
            />
        )

        expect(screen.queryByText("Server is unable to respond. Please try again later.")).toBeTruthy(); 
    })

    it("should render error 400 message", () => {
        render(
            <ResponseErrorModal 
                isModalOpen={true}
                errorState={400}
            />
        )

        expect(screen.queryByText("Form entry is incorrect. Please review form entries.")).toBeTruthy(); 
    })

    it("should be able to close modal with corner x", () => {
        render(
            <ResponseErrorModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
            />
        )
        const closeButton = screen.getAllByRole('button', {name: /Close/i})[0]
        fireEvent.click(closeButton)
        expect(mockSetIsModalOpen).toBeCalledWith(false)
    })

    it("should be able to close modal with close button", () => {
        render(
            <ResponseErrorModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
            />
        )
        const closeButton = screen.getAllByRole('button', {name: /Close/i})[1]
        fireEvent.click(closeButton)
        expect(mockSetIsModalOpen).toBeCalledWith(false)
    })
})

describe('<GenericResponseModal />', ()=> {
    it('should be defined', () => {
        expect(GenericResponseModal).toBeDefined()
    })

    it("should match existing snapshot", () => {
        expect(render(<GenericResponseModal isModalOpen={true}/>).baseElement).toMatchSnapshot()
    })

    it("should render messages", () => {
        render(
            <GenericResponseModal 
                isModalOpen={true}
                message={"MOCK MESSAGE"}
            />
        )

        expect(screen.queryByText("MOCK MESSAGE")).toBeTruthy(); 
    })

    it("should be able to close modal with corner x", () => {
        render(
            <GenericResponseModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
            />
        )
        const closeButton = screen.getAllByRole('button', {name: /Close/i})[0]
        fireEvent.click(closeButton)
        expect(mockSetIsModalOpen).toBeCalledWith(false)
    })

    it("should be able to close modal with close button", () => {
        render(
            <GenericResponseModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
            />
        )
        const closeButton = screen.getAllByRole('button', {name: /Close/i})[1]
        fireEvent.click(closeButton)
        expect(mockSetIsModalOpen).toBeCalledWith(false)
    })
})
