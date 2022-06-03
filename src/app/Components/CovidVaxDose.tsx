import React from "react";
import {
  Card,
  CardTitle,
  CardBody,
  DatePicker,
  FormGroup,
  FormSelect,
  FormSelectOption,
  GridItem,
  Text,
  TextInput,
  TextVariants
} from "@patternfly/react-core";
import { TimesIcon } from "@patternfly/react-icons";
import { Controller } from "react-hook-form";
import { 
  dateConvert, 
  americanDateFormat,
  covidVaxDateRules,
  covidVaxDateValidator
} from "@app/utils/utils";

const orderSuffix = ["st", "nd", "rd", "th"];
const minVaxDate = "06/01/2020";

const CovidVaxDose = (props) => {
  const doseText = props.doseNumber + orderSuffix[Math.min(props.doseNumber, orderSuffix.length)-1];

  return (
    <GridItem md={6} sm={12}>
      <Card>
        <CardTitle>{doseText} Dose or Booster {
          props.isRequired ? "" : <Text component={TextVariants.a} style={{float: "right"}} onClick={() => {props.removeDose(props.doseNumber)}} data-testid="remove-dose"><TimesIcon/></Text>
        }</CardTitle>
        <CardBody>
          <Controller
            name={"vax_date_" + props.doseNumber}
            control={props.control}
            defaultValue={props.isHRSubmit ? "" : (dateConvert(sessionStorage.getItem("vax_date_" + props.doseNumber) || ""))}
            render={({ field, fieldState }) => (
              <FormGroup
                helperText="The date you received the dose."
                helperTextInvalid="This field is required, please enter a valid date."
                fieldId={"shot-" + props.doseNumber + "-date"}
                label="Date"
                isRequired={props.isRequired}
                validated={fieldState.error ? "error" : "default"}
              >
                <DatePicker
                  aria-label={"shot-" + props.doseNumber + "-date"}
                  onChange={field.onChange}
                  dateFormat={date => date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                  dateParse={americanDateFormat}
                  placeholder="MM-DD-YYYY"
                  value={field.value}
                  validators={
                    props.doseNumber == 1 ?
                      [ (date) => covidVaxDateValidator(date, minVaxDate, null) ] :
                      [ (date) => covidVaxDateValidator(date, minVaxDate, new Date(props.getValues("vax_date_" + (props.doseNumber-1)).replace(/-/g,'/'))) ]
                  }
                />
              </FormGroup>
            )}
            rules={{ required: props.isRequired, validate: (data) => covidVaxDateRules(data, minVaxDate, props.getValues("vax_date_" + (props.doseNumber-1))), pattern: /^(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])\-(19|20)\d{2}$/ }}
          />
          <Controller
            name={"vaccine_" + props.doseNumber}
            control={props.control}
            defaultValue={props.isHRSubmit ? "" : (sessionStorage.getItem("vaccine_" + props.doseNumber) || "")}
            render={({ field, fieldState }) => (
              <FormGroup
                helperText={
                  props.isHRSubmit ? 
                  "The vendor of this dose as shown on the documentation." : 
                  "The vendor of this dose."
                }
                helperTextInvalid="This field is required, please make a selection."
                isRequired={props.isRequired}
                label="Vaccine Manufacturer"
                fieldId={"vaccine-vendor-" + props.doseNumber}
                validated={fieldState.error ? "error" : "default"}
                style={{marginTop: "var(--pf-global--gutter--md)"}}
              >
                <FormSelect
                  aria-label={"vaccine-vendor-" + props.doseNumber}
                  value={field.value}
                  onChange={field.onChange}
                >
                  <FormSelectOption
                    isPlaceholder
                    isDisabled
                    label="Please Select"
                  />
                  {props.vendorOptions.map((vendorOption, index) => (
                    <FormSelectOption
                      key={index}
                      value={vendorOption.value}
                      label={vendorOption.label}
                    />
                  ))}
                </FormSelect>
              </FormGroup>
            )}
            rules={{ required: true }}
          />
          <Controller
            name={"lot_number_" + props.doseNumber}
            control={props.control}
            defaultValue={props.isHRSubmit ? "" : (sessionStorage.getItem("lot_number_" + props.doseNumber) || "")}
            render={({ field, fieldState }) => (
              <FormGroup 
                fieldId={"lot-number-" + props.doseNumber}
                helperText={
                  props.isHRSubmit ? 
                  "The lot/batch number of the vaccine received as shown on the documentation." : 
                  "The lot/batch number of the vaccine that you received."
                }
                helperTextInvalid="Please enter a valid lot/batch number."
                label="Lot/Batch Number"
                validated={fieldState.error ? "error" : "default"}
                style={{marginTop: "var(--pf-global--gutter--md)"}}
              >
                <TextInput
                  aria-label={"lot-number-" + props.doseNumber}
                  type="text"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormGroup>
            )}
            rules={{
              pattern: /^[A-Za-z0-9-]+$/
            }}
          />
        </CardBody>
      </Card>
    </GridItem>
  )
}

export default CovidVaxDose;