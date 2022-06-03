import React from 'react';
import DeclineReasonModal from '../../../src/app/Components/DeclineReasonModal';
import { act, fireEvent, render, screen } from '@testing-library/react';

const mockSetIsModalOpen = jest.fn()
const mockSendReview = jest.fn()

describe('<DeclineReasonModal />', ()=> {
    it('should be defined', () => {
        expect(DeclineReasonModal).toBeDefined()
    })

    it("should match existing snapshot", () => {
        expect(render(<DeclineReasonModal isModalOpen={true}/>)).toMatchSnapshot()
    })

    it("should display all decline options", () => {
        render(
            <DeclineReasonModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
                sendReview={mockSendReview}
            />
        )
        expect(screen.getByLabelText('Attachments are not legible')).toBeTruthy()
        expect(screen.getByLabelText('Supporting documentation is missing required information')).toBeTruthy()
        expect(screen.getByLabelText('Supporting documentation is not in an acceptable format')).toBeTruthy()
        expect(screen.getByLabelText('Supporting documentation differs from entered employee or vaccination information')).toBeTruthy()
        expect(screen.getByLabelText('Other (more information to be provided)')).toBeTruthy()
    })

    it("should be able to choose an option", async () => {
        render(
            <DeclineReasonModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
                sendReview={mockSendReview}
            />
        )
        await act(async () => {
            fireEvent.click(screen.getByRole('radio', {name: /Supporting documentation is not in an acceptable format/i}))
            fireEvent.click(screen.getByRole('button', {name: /Confirm/i}))
        })
        expect(mockSendReview).toBeCalledWith(false, 'Supporting documentation is not in an acceptable format')
    })

    it("should not be able to submit without an option", async () => {
        render(
            <DeclineReasonModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
                sendReview={mockSendReview}
            />
        )
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {name: /Confirm/i}))
        })
        expect(screen.getByText('* Please select a reason to proceed')).toBeTruthy()
        expect(mockSendReview).toBeCalledTimes(0)
    })

    it("should be able to close modal with Close header", async () => {
        render(
            <DeclineReasonModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
                sendReview={mockSendReview}
            />
        )
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {name: /Close/i}))
        })
        expect(mockSetIsModalOpen).toBeCalledTimes(1)
        expect(mockSetIsModalOpen).toBeCalledWith(false)
    })

    it("should be able to close modal with Cancel button", async () => {
        render(
            <DeclineReasonModal 
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
                sendReview={mockSendReview}
            />
        )
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {name: /Cancel/i}))
        })
        expect(mockSetIsModalOpen).toBeCalledTimes(1)
        expect(mockSetIsModalOpen).toBeCalledWith(false)
    })
})