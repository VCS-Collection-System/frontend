import React from 'react';
import { render, screen } from '@testing-library/react'
import ReviewInfoCard from '../../../src/app/Components/ReviewInfoCard';

describe('<ReviewInfoCard />', ()=> {
    it('should be defined', () => {
        expect(ReviewInfoCard).toBeDefined()
    })

    it("should match existing snapshot", () => {
        expect(render(<ReviewInfoCard />).asFragment()).toMatchSnapshot()
    })

    it("should display covid test info", () => {
        render(
            <ReviewInfoCard 
                reviewType={"TEST"}
                covidTestResult={"POSITIVE"}
                covidTestDate={"2021-12-10"}
            />
        )

        expect(screen.getByDisplayValue('POSITIVE')).toBeTruthy()
        expect(screen.getByDisplayValue('12-10-2021')).toBeTruthy()
    })

    it("should display covid vax info", () => {
        const doses = [{
            vaccineBrand: "Moderna",
            vaccineDate: "2021-12-10",
            vaccineLotNumber: "lot1"
        }]

        render(
            <ReviewInfoCard 
                reviewType={"VAX"}
                doses={doses}
            />
        )

        expect(screen.getByDisplayValue('Moderna')).toBeTruthy()
        expect(screen.getByDisplayValue('12-10-2021')).toBeTruthy()
        expect(screen.getByDisplayValue('lot1')).toBeTruthy()
    })

    it("should display submit by info", () => {
        render(
            <ReviewInfoCard 
                submittedBy={"Mock Submitter"}
            />
        )

        expect(screen.getByDisplayValue('Mock Submitter')).toBeTruthy()
    })

    it("should display reviewed by info", () => {
        render(
            <ReviewInfoCard 
                reviewer={"Mock Reviewer"}
            />
        )

        expect(screen.getByDisplayValue('Mock Reviewer')).toBeTruthy()
    })
})
