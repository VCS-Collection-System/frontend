import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  FileUpload,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  Text,
  TextInput,
  TextVariants
} from "@patternfly/react-core";
import { useKeycloak } from "@react-keycloak/web";
import { CheckCircleIcon, OutlinedPaperPlaneIcon, PlusIcon } from "@patternfly/react-icons";
import { useHistory } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import CovidVaxDose from "@app/Components/CovidVaxDose";
import { 
  dateConvert, 
  americanDateFormat, 
  birthDateValidator,
  birthDateRules
} from "@app/utils/utils";
import {
  ALTERNATE_CONSENT_LABEL,
  CONSENT_LABEL,
  MAX_DOSES
} from "@app/utils/constants";
import Feature, { showFeature } from "./Feature";
import { ConsentContext } from "@app/context";

const vendorOptions = [
  { value: "AstraZeneca", label: "AstraZeneca" },
  { value: "Comirnaty", label: "Comirnaty" },
  { value: "Covaxin", label: "Covaxin" },
  { value: "Covishield", label: "Covishield" },
  { value: "Covovax", label: "Covovax" },
  { value: "Janssen", label: "Janssen" },
  { value: "Johnson", label: "Johnson & Johnson" },
  { value: "Moderna", label: "Moderna" },
  { value: "Novavax", label: "Novavax" },
  { value: "Oxford", label: "Oxford" },
  { value: "Pfizer", label: "Pfizer" },
  { value: "Sinopharm", label: "Sinopharm" },
  { value: "Sinovac_CoronaVac", label: "Sinovac-CoronaVac" },
  { value: "Spikevax", label: "Spikevax" },
  { value: "Sputnik", label: "Sputnik" },
  { value: "Vaxzevria", label: "Vaxzevria" }
];

/*  
IMPLEMENTATION NOTE: 

The employeeCountry prop that is passed to this component allows us to use config for the user being submitted 
for in case of an HR submission, since a superadmin HR user is not guaranteed to be in the same country as the user
they are submitting for.
*/

const CovidVaxForm = (props) => {
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const { control, handleSubmit, getValues, setValue } = useForm();
  const { setConsented } = useContext(ConsentContext);
  const [isRejected, setIsRejected] = useState(false);
  const [previousDoses] = useState(0);
  const [allowPDF, setAllowPDF] = useState(false);
  const [proofOptional, setProofOptional] = useState(false);

  let initialMax = 1;
  const vaxType = getValues("vaccine") || sessionStorage.getItem("vaccine");
  if(vaxType) {
    initialMax = MAX_DOSES[vaxType] || 1;
  }
  const [maxDoses] = useState(initialMax);

  const clearDose = (doseNumber) => {
    setValue("vax_date_" + doseNumber, "");
    setValue("lot_number_" + doseNumber, "");
  }

  const hasDose = (i) => {
    const vaxDate = getValues("vax_date_" + i) || sessionStorage.getItem("vax_date_" + i);
    if(typeof(vaxDate) === "undefined" || vaxDate == null || vaxDate == "") {
      return false;
    } else {
      return true;
    }
  }

  const initialDose = [{number: 1, isRequired: true}];
  for(let i = 2; hasDose(i); i++) {
    initialDose.push({number: i, isRequired: false});
  }
  const [doses, setDoses] = useState(initialDose);

  const addDose = () => {
    const newDose = {number: previousDoses+doses.length+1, isRequired: false};
    const newDoses = doses.map((dose) => {return dose});
    newDoses.push(newDose);
    setDoses(newDoses);
  }

  const removeDose = (number) => {
    if(number == 0) {
      return;
    }
    doses.splice(number-previousDoses-1, 1);
    const newDoses = doses.map((dose) => {
      if(dose.number > number) {
        dose.number--;
      }
      return dose;
    });
    setDoses(newDoses);
    clearDose(doses.length+1);
  }

  const ImageHelperText = ({isInvalidText}) => {
    const invalidFieldText = "Must be a " + (allowPDF ? "PDF," : "") + " JPG, JPEG, or PNG file no larger than 3.9 MB";
    const validFieldText = "Copy of CDC/Vaccine Record Card along with vaccine type, dates, and lot/batch numbers."; 

    return (
      <Text className={isInvalidText ? "helperText warningText" : "helperText"}> 
        {isInvalidText ? invalidFieldText : validFieldText}
        <br />
        Please refer to &nbsp;
        <a href="https://redhat.service-now.com/help?id=kb_article_view&sysparm_article=KB0015729" target="_blank"  rel="noreferrer">
          Image Submission FAQ
        </a> 
        &nbsp; for further guidance. 
      </Text>
    )
  }

  useEffect(() => {
    showFeature("allowPdf", keycloak, props.employeeCountry).then(config => {
      setAllowPDF(config);
    });

    if(props.isHRSubmit) {
      setProofOptional(true);
    } else {
      showFeature("proofOptional", keycloak, props.employeeCountry).then(config => {
        setProofOptional(config);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAcceptableProofs = () => {
    return ".jpg,.jpeg,.png" + (allowPDF ? ",.pdf" : "" );
  }

  const isProofOptional = () => {
    return props.isHRSubmit || showFeature("proofOptional", keycloak, props.employeeCountry);
  }

  return (
    <Form onSubmit={handleSubmit(props.onSubmit)}>
      {!props.isHRSubmit ? (
        <>
          <Feature name="consentCheckbox">
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
                    label={CONSENT_LABEL} 
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
        </>
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
              "Individual's first name as displayed on vaccination record if different than above." : 
              "Your first name as displayed on vaccination record if different than above."
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
              "Individual's last name as displayed on vaccination record if different than above." : 
              "Your last name as displayed on vaccination record if different than above."
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
                "Please enter the birth date as shown on the vaccination record." :
                "Please enter your birth date as shown on your vaccination record."
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
      {previousDoses > 0 && 
        <Text component={TextVariants.small} style={{fontWeight: 600}}>{previousDoses} dose(s) have already been submitted.</Text>
      }
      <Grid hasGutter>
        {doses.map((dose, i) => (
          <CovidVaxDose control={control} getValues={getValues} key={i} doseNumber={dose.number} removeDose={removeDose} isRequired={dose.isRequired} isHRSubmit={props.isHRSubmit} booster={dose.number > maxDoses} vendorOptions={vendorOptions} />
        ))}
      </Grid>
      <Text component={TextVariants.a} onClick={addDose} data-testid="add-dose"><PlusIcon/> Add Dose</Text>
      <Feature name="proof" employeeCountry={props.employeeCountry}>
        <Controller
          name="proof_type"
          control={control}
          defaultValue={props.isHRSubmit ? "" : (sessionStorage.getItem("proof_type") || "")}
          render={({ field, fieldState }) => (
            <FormGroup
              helperText={
                props.isHRSubmit ? 
                "What type of vaccination record will be uploaded?" : 
                "What type of vaccination record did you receive?"
              }
              helperTextInvalid="This field is required, please make a selection."
              isRequired={!proofOptional}
              label="Vaccination Record Type"
              fieldId="proof-type"
              validated={fieldState.error ? "error" : "default"}
            >
              <FormSelect
                aria-label="proof-type"
                value={field.value}
                onChange={field.onChange}
              >
                <FormSelectOption
                  isPlaceholder
                  isDisabled
                  label="Please Select"
                />
                <Feature name="cdc" employeeCountry={props.employeeCountry}>
                  <FormSelectOption value="CDC" label="CDC Vaccination Card" />
                </Feature>
                <Feature name="divoc" employeeCountry={props.employeeCountry}>
                  <FormSelectOption value="DIVOC" label="Digital Certification of Vaccination" />
                </Feature>
                <Feature name="eugc" employeeCountry={props.employeeCountry}>
                  <FormSelectOption value="EUGC" label="EU Digital COVID Certificate" />
                </Feature>
                <Feature name="greenPass" employeeCountry={props.employeeCountry}>
                  <FormSelectOption value="GREEN_PASS" label="Green Pass" />
                </Feature>
                <FormSelectOption value="OTHER" label="Other" />
              </FormSelect>
            </FormGroup>
          )}
          rules={{ required: !proofOptional }}
        />
        <Controller
          control={control}
          defaultValue={props.isHRSubmit ? props.onHRLoad : props.onLoad}
          name="vax_image"
          render={({ field, fieldState }) => (
            <FormGroup
              fieldId="vaccination-record-image"
              isRequired={!isProofOptional()}
              label="Select Proof of Vaccination Record"
              helperText={<ImageHelperText isInvalidText={false}/>}
              helperTextInvalid={<ImageHelperText isInvalidText={true}/>}
              validated={isRejected || fieldState.error ? "error" : "default"}
            >
              <FileUpload
                hideDefaultPreview
                filename={field.value ? field.value["name"] : ""}
                id="vaccination-record-image"
                value={field.value}
                onChange={field.onChange}
                dropzoneProps={{
                  accept: getAcceptableProofs(),
                  maxSize: 3900000,
                  onDropRejected: () => {
                    setIsRejected(true);
                  },
                  onDropAccepted: () => {
                    setIsRejected(false);
                  }
                }}
                validated={isRejected ? "error" : "default"}
              />
              {
                proofOptional && field.value && typeof field.value !== "undefined" &&
                <FormGroup label="Attachment preview" fieldId="review-vax-image-preview">
                  <img
                    src={URL.createObjectURL(field.value)}
                    alt="vaccination-card"
                  />
                </FormGroup>
              }
            </FormGroup>
          )}
          rules={{ required: !proofOptional }}
        />
      </Feature>
      {props.isHRSubmit ? 
        <FormGroup fieldId="accept-button">
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
        <FormGroup fieldId="accept buttons">
          <Button 
            icon={<CheckCircleIcon />} 
            type="submit" 
            variant="primary"
          >
            Accept
          </Button>
          <Button 
            onClick={() => history.push("/attestmenu")} 
            variant="plain"
          >
            Back
          </Button>
        </FormGroup>
      }
    </Form>
  )
}

export default CovidVaxForm;
