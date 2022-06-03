import React from 'react';
import { render, screen } from '@testing-library/react'
import ReviewInfoCardHorizontal from '../../../src/app/Components/ReviewInfoCardHorizontal';

describe('<ReviewInfoCardHorizontal />', ()=> {
    it('should be defined', () => {
        expect(ReviewInfoCardHorizontal).toBeDefined()
    })

    it("should match existing snapshot", () => {
        expect(render(<ReviewInfoCardHorizontal />).asFragment()).toMatchSnapshot()
    })

    it("should display covid test info", () => {
        render(
            <ReviewInfoCardHorizontal 
                reviewType={"TEST"}
                covidTestResult={"POSITIVE"}
                covidTestDate={"2021-11-10"}
                submissionDate={"2021-12-10"}
            />
        )

        expect(screen.getByDisplayValue('POSITIVE')).toBeTruthy()
        expect(screen.getByDisplayValue('2021-12-10')).toBeTruthy()
        expect(screen.getByDisplayValue('11-10-2021')).toBeTruthy()
    })

    it("should display covid vax info", () => {
        render(
            <ReviewInfoCardHorizontal 
                reviewType={"VAX"}
                vaccineBrand={"Moderna"}
                vaccineDate={"2021-11-10"}
                vaccineLotNumber={"lot1"}
                reviewStatus={"ACCEPTED"}
                submissionDate={"2021-12-10"}
            />
        )

        expect(screen.getByDisplayValue('Moderna')).toBeTruthy()
        expect(screen.getByDisplayValue('2021-12-10')).toBeTruthy()
        expect(screen.getByDisplayValue('lot1')).toBeTruthy()
        expect(screen.getByDisplayValue('11-10-2021')).toBeTruthy()
        expect(screen.getByDisplayValue('ACCEPTED')).toBeTruthy()
    })

    it("should display covid vax info with submitted by", () => {
      render(
          <ReviewInfoCardHorizontal 
              reviewType={"VAX"}
              vaccineBrand={"Moderna"}
              vaccineDate={"2021-11-10"}
              vaccineLotNumber={"lot1"}
              reviewStatus={"ACCEPTED"}
              submissionDate={"2021-12-10"}
              submittedBy={"Mock Submitter"}
          />
      )

      expect(screen.getByDisplayValue('Moderna')).toBeTruthy()
      expect(screen.getByDisplayValue('2021-12-10')).toBeTruthy()
      expect(screen.getByDisplayValue('lot1')).toBeTruthy()
      expect(screen.getByDisplayValue('11-10-2021')).toBeTruthy()
      expect(screen.getByDisplayValue('ACCEPTED')).toBeTruthy()
      expect(screen.getByDisplayValue('Mock Submitter')).toBeTruthy()
  })

  it("should display covid vax info with reviewed by", () => {
    render(
        <ReviewInfoCardHorizontal 
            reviewType={"VAX"}
            vaccineBrand={"Moderna"}
            vaccineDate={"2021-11-10"}
            vaccineLotNumber={"lot1"}
            reviewStatus={"ACCEPTED"}
            submissionDate={"2021-12-10"}
            reviewer={"Mock Reviewer"}
        />
    )

    expect(screen.getByDisplayValue('Moderna')).toBeTruthy()
    expect(screen.getByDisplayValue('11-10-2021')).toBeTruthy()
    expect(screen.getByDisplayValue('lot1')).toBeTruthy()
    expect(screen.getByDisplayValue('2021-12-10')).toBeTruthy()
    expect(screen.getByDisplayValue('ACCEPTED')).toBeTruthy()
    expect(screen.getByDisplayValue('Mock Reviewer')).toBeTruthy()
  })
})