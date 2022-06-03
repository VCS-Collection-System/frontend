import { 
Card, 
CardBody, 
Form, 
FormGroup, 
Grid, 
GridItem, 
TextInput 
} from '@patternfly/react-core';
import * as React from 'react';
import CardWithTitle from './CardWithTitle';
import { dateConvert } from "@app/utils/utils";

const ReviewInfoCardHorizontal = (props) => {

  const CovidTestInfo = () => {
    return (
      <Grid hasGutter>
        <GridItem span={6}>
          <GridItem span={12}>
            <FormGroup
              label="Test Result"
              fieldId="test-result">
              <TextInput
                id="test-result"
                isDisabled
                type="text"
                value={props.covidTestResult}
              />
            </FormGroup>
          </GridItem>
          <GridItem span={12}>
            <FormGroup
              label="Submission Date"
              fieldId="submission-date">
              <TextInput
                id="submission-date"
                isDisabled
                type="text"
                value={props.submissionDate}
              />
            </FormGroup>
          </GridItem>
          <HRActionInfo infoType={"name"}/>
        </GridItem>
        <GridItem span={6}>
          <FormGroup
            label="Test Date"
            fieldId="test-date">
            <TextInput
              id="test-date"
              isDisabled
              type="text"
              value={dateConvert(props.covidTestDate)}
            />
          </FormGroup>
        </GridItem>
      </Grid>
    )
  }

  const CovidVaccineInfo = () => {
    return (
      <Grid hasGutter>
        <GridItem span={12}>
          <FormGroup
            label="Status"
            fieldId="review-result"
          >
            <TextInput
              id="review-result"
              isDisabled
              type="text"
              value={props.reviewStatus}
            />
          </FormGroup>
        </GridItem>
        <GridItem span={6}>
          <GridItem span={12}>
            <FormGroup
              label="Vaccine"
              fieldId="vaccine-brand"
            >
              <TextInput
                id="vaccine-brand"
                isDisabled
                type="text"
                value={props.vaccineBrand}
              />
            </FormGroup>
          </GridItem>
          <GridItem span={12}>
            <FormGroup
              label="Lot/Batch Number"
              fieldId="vaccine-lot-number"
            >
              <TextInput
                id="vaccine-lot-number"
                isDisabled
                type="text"
                value={props.vaccineLotNumber}
              />
            </FormGroup>
          </GridItem>
          <HRActionInfo infoType={"name"}/>
        </GridItem>
        <GridItem span={6}>
          <GridItem span={12}>
            <FormGroup
              label="Vaccination Date"
              fieldId="vaccine-date-administered"
            >
              <TextInput
                id="vaccine-date-administered"
                isDisabled
                type="text"
                value={dateConvert(props.vaccineDate)}
              />
            </FormGroup>
          </GridItem>
          <GridItem span={12}>
            <FormGroup
              label="Submission Date"
              fieldId="record-submit-date"
            >
              <TextInput
                id="record-submit-date"
                isDisabled
                type="text"
                value={props.submissionDate}
              />
            </FormGroup>
          </GridItem>
          <HRActionInfo infoType={"date"}/>
        </GridItem>
      </Grid>
    )
  }

  const ReviewTypeInfo = () => {
    if(props.reviewType === "TEST") {
      return <CovidTestInfo />
    }
    else if(props.reviewType === "VAX") {
      return <CovidVaccineInfo />
    }
    else {
      return <></>
    }
  }

  const HRActionInfo = ({infoType}) => {
    if(props.submittedBy) {
      if(infoType === "name") {
        return (
          <FormGroup
            className="warningText"
            label="Submitted By"
            fieldId="profile-form-submitted-by"
          >
            <TextInput
              id="profile-input-submitted-by"
              isDisabled
              type="text"
              value={props.submittedBy}
            />
          </FormGroup>
        )
      }
      else {
        return (
          <></>
        )
      }
    }
    else if(props.reviewer) {
      if(infoType === "name") {
        return (
          <FormGroup
            className="warningText"
            label="Reviewer"
            fieldId="profile-form-reviewer"
          >
            <TextInput
              id="profile-input-reviewer"
              isDisabled
              type="text"
              value={props.reviewer}
            />
          </FormGroup>
        )
      }
      else {
        return (
          <FormGroup
          className="warningText"
          label="Review Date"
          fieldId="profile-form-review-date"
        >
          <TextInput
            id="profile-input-review-date"
            isDisabled
            type="text"
            value={props.reviewDate}
          />
        </FormGroup>
        )
      }
    }
    else {
      return <></>
    }
  }

  return (
    <Card>
      <CardWithTitle 
        title="Review Information"
      />
      <CardBody>
        <Form>
          <ReviewTypeInfo />
        </Form>
      </CardBody>
    </Card>
  )
}

export default ReviewInfoCardHorizontal;