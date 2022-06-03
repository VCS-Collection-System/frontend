import React, { useContext, useEffect, useState } from "react";
import { 
  Checkbox,
  Form, 
  FormGroup, 
  TextInput, 
  FormSelect, 
  FormSelectOption, 
  DatePicker, 
  FileUpload, 
  Button, 
  Flex,
  FlexItem,
  Text
} from "@patternfly/react-core";
import { useKeycloak } from "@react-keycloak/web";
import { CheckCircleIcon, OutlinedPaperPlaneIcon } from "@patternfly/react-icons";
import { Controller, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import Feature, { showFeature } from "@app/Components/Feature";
import { ConsentContext } from "@app/context";
import { 
  dateConvert, 
  americanDateFormat,
  covidTestDateRules,
  covidTestDateValidator,
  birthDateValidator,
  birthDateRules
} from "@app/utils/utils";
import {
  ALTERNATE_CONSENT_LABEL
} from "@app/utils/constants";

const CovidTestForm = (props) => {

  const history = useHistory();
  const { keycloak } = useKeycloak();
  const { control, handleSubmit } = useForm();
  const [isTestFileRejected, setIsTestFileRejected] = useState(false);
  const { setConsented } = useContext(ConsentContext);
  const [ isCovidTest, setIsCovidTest ] = useState(false); 
  const [ isRecovery, setIsRecovery ] = useState(false);
  const [allowPDF, setAllowPDF] = useState(false);

  let resultLabel = "";
  if(isCovidTest) {
    resultLabel += "COVID Test Result";
    if(isRecovery) {
      resultLabel += " or Certificate of Recovery";
    }
  } else {
    resultLabel += "Type of Submission";
  }
  resultLabel += ".";

  let resultHelper = "Please select the ";
  if(isCovidTest) {
    resultHelper += "COVID test result";
    if(isRecovery) {
      resultHelper += " or certificate of recovery";
    }
  } else {
    resultHelper += "type of submission";
  }
  resultHelper += ".";

  let dateHelper = "Please enter the date the ";
  if(isCovidTest) {
    dateHelper += "COVID test";
    if(isRecovery) {
      dateHelper += " or certificate of recovery";
    }
  } else {
    dateHelper += "certificate of recovery";
  }
  dateHelper += " was administered.";

  useEffect(() => {
    showFeature("covidTest", keycloak, props.employeeCountry).then(config => {
      setIsCovidTest(config);
    });

    showFeature("recovery", keycloak, props.employeeCountry).then(config => {
      setIsRecovery(config);
    });

    showFeature("allowPdf", keycloak, props.employeeCountry).then(config => {
      setAllowPDF(config);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ImageHelperText = ({isInvalidText}) => {    
    return (
      <Text className={isInvalidText ? "helperText warningText" : "helperText"}> 
        Must be a {allowPDF ? "PDF," : ""} JPG, JPEG, or PNG file no larger than 3.9 MB 
        <br />
        Please refer to &nbsp;
        <a href="https://redhat.service-now.com/help?id=kb_article_view&sysparm_article=KB0015729" target="_blank"  rel="noreferrer">
          Image Submission FAQ
        </a> 
        &nbsp; for further guidance. 
      </Text>
    )
  }

  const getAcceptableProofs = () => {
    return ".jpg,.jpeg,.png" + (allowPDF ? ",.pdf" : "" );
  }

  return (
    <Form onSubmit={handleSubmit(props.onSubmit)}>
      {!props.isHRSubmit ? (
        <Feature name="consentCheckboxAlternate">
          <Controller
            name="consent"
            control={control}
            render={({ field, fieldState }) => (
              <FormGroup 
                fieldId="consent-checkbox" 
                isRequired
                label="Consent Agreement"
                helperTextInvalid="This field is required, please complete consent agreement."
                validated={fieldState.error ? "error" : "default"}
              >
                <Checkbox 
                  label={ALTERNATE_CONSENT_LABEL} 
                  aria-label="consent-checkbox" 
                  id="consent-checkbox" 
                  isChecked={field.value}
                  onChange={(value) => {
                    setConsented(value);
                    field.onChange(value);
                  }}
                />
              </FormGroup>
            )}
            rules={{ required: true }}
          />
        </Feature>
      ) : ""}
      <FormGroup
        fieldId="employee-full-name"
        helperText={
          props.isHRSubmit ? 
          "Make sure this matches the full name of the person you are submitting for." : 
          "Make sure this matches your full name."
        }
        label="Full Name"
      >
        <TextInput
          aria-label="employee-full-name"
          isDisabled
          type="text"
          value={props.employeeName}
        />
      </FormGroup>
      <Controller
        name="alt_first_name"
        control={control}
        defaultValue={props.isHRSubmit ? "" : (sessionStorage.getItem("alt_first_name") || "")}
        render={({ field, fieldState }) => (
          <FormGroup 
            fieldId="alt-first-name" 
            helperText={
              props.isHRSubmit ? 
              "Individual's first name as displayed on the documentation if different than above." : 
              "Your first name as displayed on the documentation if different than above."
            }
            label="Preferred First Name (if applicable)"
            validated={fieldState.error ? "error" : "default"}
          >
            <TextInput
              aria-label="alt-first-name"
              type="text"
              value={field.value}
              onChange={field.onChange}
            />
          </FormGroup>
        )}
      />
      <Controller
        name="alt_last_name"
        control={control}
        defaultValue={props.isHRSubmit ? "" : (sessionStorage.getItem("alt_last_name") || "")}
        render={({ field, fieldState }) => (
          <FormGroup 
            fieldId="alt-last-name" 
            helperText={
              props.isHRSubmit ? 
              "Individual's last name as displayed on the documentation if different than above." : 
              "Your last name as displayed on the documentation if different than above."
            }
            label="Preferred Last Name (if applicable)"
            validated={fieldState.error ? "error" : "default"}
          >
            <TextInput
              aria-label="alt-last-name"
              type="text"
              value={field.value}
              onChange={field.onChange}
            />
          </FormGroup>
        )}
      />
      <Feature name="dateOfBirth" employeeCountry={props.employeeCountry}>
        <Controller
          name="date_of_birth"
          control={control}
          defaultValue={props.isHRSubmit ? "" : (dateConvert(sessionStorage.getItem("date_of_birth") || ""))}
          render={({ field, fieldState }) => (
            <FormGroup
              helperText={
                props.isHRSubmit ?
                "Please enter the birth date as shown on the documentation." :
                "Please enter your birth date."
              }
              helperTextInvalid="This field is required, please enter a valid date."
              fieldId="date_of_birth"
              label="Date of Birth"
              isRequired
              validated={fieldState.error ? "error" : "default"}
            >
              <DatePicker
                aria-label="date_of_birth"
                onChange={field.onChange}
                dateFormat={date => date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                dateParse={americanDateFormat}
                placeholder="MM-DD-YYYY"
                value={field.value}
                validators={[birthDateValidator]}
              />
            </FormGroup>
          )}
          rules={{ required: true, validate: birthDateRules, pattern: /^(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])\-(19|20)\d{2}$/ }}
        />
      </Feature>
      <Controller
        name="test_results"
        control={control}
        rules={{ required: true }}
        defaultValue={props.isHRSubmit ? "" : (sessionStorage.getItem("test_results") || "")}
        render={({ field, fieldState }) => (
          <FormGroup
            fieldId="test-results-input"
            helperText={resultHelper}
            isRequired
            validated={fieldState.error ? "error" : "default"}
            label={resultLabel}
            helperTextInvalid="This field is required to proceed."
          >
            <FormSelect
              aria-label="test-results-input"
              onChange={field.onChange}
              validated={fieldState.error ? "error" : "default"}
              value={field.value}
            >
              <FormSelectOption
                isPlaceholder
                isDisabled
                label="Please Select"
              />
              <Feature name="covidTest" employeeCountry={props.employeeCountry}>
                <FormSelectOption label="Negative" value="Negative" />
                <FormSelectOption label="Positive" value="Positive" />
                <FormSelectOption label="Inconclusive" value="Inconclusive" />
              </Feature>
              <Feature name="recovery" employeeCountry={props.employeeCountry}>
                <FormSelectOption label="Certificate of Recovery" value="Recovery" />
              </Feature>
            </FormSelect>
          </FormGroup>
        )}
      />
      <Controller
        control={control}
        defaultValue={props.isHRSubmit ? "" : (dateConvert(sessionStorage.getItem("test_date") || ""))}
        name="test_date"
        render={({ field, fieldState }) => (
          <FormGroup
            label="Date"
            fieldId="test-results-date"
            helperText={dateHelper}
            helperTextInvalid="This field is required to proceed."
            isRequired
            validated={fieldState.error ? "error" : "default"}
          >
            <DatePicker
              aria-label="test-results-date"
              dateFormat={date => date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
              dateParse={americanDateFormat}
              placeholder="MM-DD-YYYY"
              onChange={field.onChange}
              value={field.value}
              validators={[covidTestDateValidator]}
            />
          </FormGroup>
        )}
        rules={{ required: true, validate: covidTestDateRules, pattern: /^(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])\-(19|20)\d{2}$/  }}
      />
      {!props.isHRSubmit &&
        <Controller
          control={control}
          defaultValue={props.onLoad}
          name="test_image_file"
          render={({ field, fieldState }) => (
            <FormGroup
              fieldId="test-record-image"
              isRequired
              label="Provide a copy of supporting documentation."
              helperText={<ImageHelperText isInvalidText={false}/>}
              helperTextInvalid={<ImageHelperText isInvalidText={true}/>}
              validated={isTestFileRejected || fieldState.error ? "error" : "default"}
            >
              <FileUpload
                hideDefaultPreview
                filename={field.value ? field.value["name"] : ""}
                id="test-record-image"
                value={field.value}
                onChange={field.onChange}
                dropzoneProps={{
                  accept: getAcceptableProofs(),
                  maxSize: 3900000,
                  onDropRejected: () => {
                    setIsTestFileRejected(true);
                  },
                  onDropAccepted: () => {
                    setIsTestFileRejected(false);
                  }
                }}
                validated={isTestFileRejected ? "error" : "default"}
              />
            </FormGroup>
          )}
          rules={{ required: true }}
        />
      }
      {props.isHRSubmit &&
        <Controller
          name="alternate_email"
          defaultValue={""}
          control={control}
          render={({ field, fieldState }) => (
            <FormGroup
              id="alternative-email"
              label="Alternate Email (optional)"
              helperText="Optional email for notifications"
              helperTextInvalid="This needs to be a valid email address."
              fieldId="alternative-email"
              validated={fieldState.error ? "error" : "default"}
            >
              <TextInput
                aria-label="alternative-email"
                onChange={field.onChange}
                placeholder="example@mail.com"
                type="email"
                value={field.value}
              />
            </FormGroup>
          )}
          rules={{
            required: false,
            pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/g, // NOSONAR
          }}
        />
      }
      {props.isHRSubmit ? 
        <FormGroup fieldId="accept-test-buttons">
          <Flex>
            <FlexItem align={{ default: "alignRight" }}>
              <Button
                icon={<OutlinedPaperPlaneIcon />}
                variant="primary"
                type="submit"
                isDisabled={props.isFormSubmitting}
                isLoading={props.isFormSubmitting}
              >
                Submit
              </Button>
            </FlexItem>
          </Flex>
        </FormGroup>
        :
        <FormGroup fieldId="accept-test-buttons">
          <Button 
            icon={<CheckCircleIcon />} 
            variant="primary" 
            type="submit"
          >
            Accept
          </Button>
          <Button 
            variant="plain" 
            onClick={() => history.push("/attestmenu")}
          >
            Back
          </Button>
        </FormGroup>
      }
    </Form>
  )
};

export default CovidTestForm;
