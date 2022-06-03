import React from "react";
import {
  Card,
  CardTitle,
  CardBody,
  FormGroup,
  GridItem,
  TextInput
} from "@patternfly/react-core";

const orderSuffix = ["st", "nd", "rd", "th"];

const ReviewVaxDose = (props) => {
  const doseText = props.doseNumber + orderSuffix[Math.min(props.doseNumber, orderSuffix.length)-1];

  return (
    <GridItem md={6} sm={12}>
      <Card>
        <CardTitle>{doseText} Dose</CardTitle>
        <CardBody>
          <FormGroup
            label="Date"
            fieldId={"review-vax-form-shot-" + props.doseNumber + "-date"}
          >
            <TextInput
              aria-label={"review-vax-form-shot-" + props.doseNumber + "-date"}
              isDisabled
              type="text"
              value={props.date}
            />
          </FormGroup>
          <FormGroup label="Vaccine" fieldId={"review-vax-form-vaccine-brand-" + props.doseNumber} style={{marginTop: "var(--pf-global--gutter--md)"}}>
            <TextInput
              aria-label={"review-vax-form-vaccine-brand-" + props.doseNumber}
              isDisabled
              type="text"
              value={
                props.vaccine.localeCompare("Johnson") ? props.vaccine : "Johnson & Johnson"
              }
            />
          </FormGroup>
          <FormGroup
            fieldId={"review-vax-form-lot-number-" + props.doseNumber}
            label="Lot/Batch Number"
            style={{marginTop: "var(--pf-global--gutter--md)"}}
          >
            <TextInput
              aria-label={"review-vax-form-lot-number-" + props.doseNumber}
              isDisabled
              type="text"
              value={props.lotNumber}
            />
          </FormGroup>
        </CardBody>
      </Card>
    </GridItem>
  )
}

export default ReviewVaxDose;