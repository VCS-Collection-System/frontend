import React, { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Card, 
  CardBody, 
  Form, 
  FormGroup, 
  TextInput 
} from '@patternfly/react-core';
import CardWithTitle from './CardWithTitle';
import { dateConvert } from "@app/utils/utils";

const ReviewInfoCard = (props) => {

  const CovidTestInfo = () => {
    return (
      <>
        <FormGroup
          label="Test Result or Submission Type"
          fieldId="test-result">
          <TextInput
            id="test-result"
            isDisabled
            type="text"
            value={props.covidTestResult}
          />
        </FormGroup> 
        <FormGroup
          label="Effective Date"
          fieldId="test-date">
          <TextInput
            id="test-date"
            isDisabled
            type="text"
            value={dateConvert(props.covidTestDate)}
          />
        </FormGroup>
      </>
    )
  }

  const CovidVaccineInfo = () => {
    const [expanded, setExpanded] = useState(["shot-" + (props.doses.length-1) + "-toggle"]);

    const toggle = (id) => {
      const index = expanded.indexOf(id);
      const newExpanded: string[] =
        index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, id];
      setExpanded(newExpanded);
    };

    return (
      <Accordion asDefinitionList={false} className="pf-m-bordered">
        {props.doses.map((dose, i) => (
          <AccordionItem key={i}>
            <AccordionToggle
              onClick={() => toggle("shot-" + i + "-toggle")}
              isExpanded={expanded.includes("shot-" + i + "-toggle")}
              id={"shot-" + i + "-toggle"}
            >
              Shot {i+1}
            </AccordionToggle>
            <AccordionContent id={"shot-" + i + "-content"} isHidden={!expanded.includes("shot-" + i + "-toggle")}>
              <FormGroup
                label="Vaccine"
                fieldId={"vaccine-brand-" + i}
              >
                <TextInput
                  id={"vaccine-brand-" + i}
                  isDisabled
                  type="text"
                  value={dose.vaccineBrand}
                />
              </FormGroup>
              <FormGroup
                label="Date Administered"
                fieldId={"vaccine-date-administered-" + i}
                style={{marginTop: "1rem"}}
              >
                <TextInput
                  id={"vaccine-date-administered-" + i}
                  isDisabled
                  type="text"
                  value={dateConvert(dose.vaccineDate)}
                />
              </FormGroup>
              <FormGroup
                label="Lot/Batch Number"
                fieldId={"vaccine-lot-number-" + i}
                style={{marginTop: "1rem"}}
              >
                <TextInput
                  id={"vaccine-lot-number-" + i}
                  isDisabled
                  type="text"
                  value={dose.vaccineLotNumber}
                />
              </FormGroup>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
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

  const HRActionInfo = () => {
    if(props.submittedBy) {
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
    else if(props.reviewer) {
      return (
        <FormGroup
          className="warningText"
          label="Reviewed By"
          fieldId="profile-form-submitted-by"
        >
          <TextInput
            id="profile-input-submitted-by"
            isDisabled
            type="text"
            value={props.reviewer}
          />
        </FormGroup>
      )
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
          <HRActionInfo />
          <ReviewTypeInfo />
        </Form>
      </CardBody>
    </Card>
  )
}

export default ReviewInfoCard;