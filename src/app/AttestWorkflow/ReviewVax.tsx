import React, { useState } from "react";
import {
  Card,
  CardFooter,
  CardBody,
  Button,
  Form,
  FormGroup,
  Grid,
  TextInput
} from "@patternfly/react-core";
import { ExternalLinkAltIcon, OutlinedPaperPlaneIcon } from '@patternfly/react-icons';
import { useHistory } from "react-router-dom";
import { convertBase64ToBlob, dateConvert } from "@app/utils/utils";
import authaxios from "@app/utils/axiosInterceptor";
import { ResponseErrorModal } from '@app/Components/FeedbackModals';
import { useKeycloak } from "@react-keycloak/web";
import CardWithTitle from "@app/Components/CardWithTitle";
import ReviewVaxDose from "@app/Components/ReviewVaxDose";
import Feature from "@app/Components/Feature";
import { getEmployeeInfo } from "@app/utils/getEmployeeInfo";
import { SUBMIT_VAX_URL } from "@app/utils/constants"; 

const ReviewVax: React.FunctionComponent = () => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorState, setErrorState] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const altFirstName = sessionStorage.getItem("alt_first_name") || "";
  const altLastName = sessionStorage.getItem("alt_last_name") || "";
  const employeeDOB = sessionStorage.getItem("date_of_birth") || "";
  const proofType = sessionStorage.getItem("proof_type") || "";
  const vaxImage = sessionStorage.getItem("vax_image") || "";
  const vaxFilename = sessionStorage.getItem("vax_image_filename") || "";

  const doses: {number: number, date: string, lotNumber: string, vaccine: string}[] = [];

  for(let i = 1; sessionStorage.getItem("vax_date_" + i) != null && sessionStorage.getItem("vax_date_" + i) != ""; i++) {
    doses.push({
      number: i,
      date: sessionStorage.getItem("vax_date_" + i) || "",
      lotNumber: sessionStorage.getItem("lot_number_" + i) || "",
      vaccine: sessionStorage.getItem("vaccine_" + i) || ""
    });
  }

  const history = useHistory();
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const employeeFirstName = employee.firstName;
  const employeeLastName = employee.lastName;
  const employeeID = employee.id;
  const employeeEmail = employee.email;
  const employeeCountry = employee.country;

  const altName = (altFirstName ? altFirstName : employeeFirstName) + " " +  (altLastName ? altLastName : employeeLastName);

  const formSubmitSuccess = () => {
    setIsFormSubmitting(false);
    history.push("/thankyou");
  }
  const handleSubmit = () => {
    setIsFormSubmitting(true);

    const employeeInfo = {
      id: employeeID,
      firstName: employeeFirstName,
      lastName: employeeLastName,
      altFirstName: altFirstName,
      altLastName: altLastName,
      dateOfBirth: employeeDOB,
      email: employeeEmail,
      agencyCode: employeeCountry,
      agencyName: employeeCountry,
      divisionCode: ""
    };

    const vaxInfos = doses.map((dose) => {
      return {
        vaccineBrand: dose.vaccine.toUpperCase(),
        vaccineAdministrationDate: dose.date,
        vaccineShotNumber: dose.number,
        lotNumber: dose.lotNumber,
        proofType: proofType
      };
    });
    
    const formData = new FormData();

    formData.append("employee", new Blob([JSON.stringify(employeeInfo)], { type: "application/json" }));
    formData.append("documents", new Blob([JSON.stringify(vaxInfos)], { type: "application/json" }));
    if(vaxFilename !== "") {
      const vaxCard = convertBase64ToBlob(vaxImage);
      const attachmentExtension = vaxFilename.split('.').pop()?.toLowerCase();
      let attachmentType;

      if(attachmentExtension === "pdf") {
        attachmentType = "application/pdf";
      }
      else if(attachmentExtension === "jpg") {
        attachmentType = "image/jpeg";
      }
      else {
        attachmentType = "image/" + attachmentExtension;
      }

      formData.append("attachment", new Blob([vaxCard], { type: attachmentType }), "blob."+attachmentExtension);
    } else {
      formData.append('attachment', new Blob([], { type: "image/png" }), "blob.png");
    }

    const headers = {
      "Content-Type": "multipart/form-data;",
    };

    authaxios.post(SUBMIT_VAX_URL, formData, {
      headers: headers
    }).then(() => {
      formSubmitSuccess();
    }).catch((res) => {
      if (res.response) {
        setIsFormSubmitting(false);
        setErrorState(res.response.status);
        setIsErrorModalOpen(true);
      }
    });
  }

  const recordOptions = [
    { value: "CDC", label: "CDC Vaccination Card" },
    { value: "DIVOC", label: "Digital Certification of Vaccination" },
    { value: "GREEN_PASS", label: "Green Pass" },
    { value: "OTHER", label: "Other" }
  ];

  const proofPreview = recordOptions.find(option => option.value === proofType) || {};

  return (
    <Card isRounded>
      <ResponseErrorModal 
        isModalOpen={isErrorModalOpen} 
        setIsModalOpen={setIsErrorModalOpen} 
        errorState={errorState}
      />
      <CardWithTitle
        title="Review Vaccination Submission"
        info="Please review your vaccination record submission and validate that card image matches displayed data or it will be rejected. Please press Submit below to proceed."
      />
      <CardBody>
        <Form>
          <FormGroup
            fieldId="review-vax-form-employee-full-name"
            label="Full Name"
          >
            <TextInput
              aria-label="review-vax-form-employee-full-name"
              isDisabled
              type="text"
              value={employeeFirstName + " " + employeeLastName}
            />
          </FormGroup>
          <FormGroup
            fieldId="review-vax-form-employee-alt-name"
            label="Full Preferred Name (as displayed on vaccination record)"
          >
            <TextInput
              aria-label="review-vax-form-employee-alt-name"
              isDisabled
              type="text"
              value={altName}
            />
          </FormGroup>
          <Feature name="dateOfBirth">
            <FormGroup
              label="Date of Birth"
              fieldId="review-vax-form-date-of-birth"
            >
              <TextInput
                aria-label="review-vax-form-date-of-birth"
                isDisabled
                type="text"
                value={dateConvert(employeeDOB)}
              />
            </FormGroup>
          </Feature>
          <Grid hasGutter>
            {doses.map((dose, i) => (
              <ReviewVaxDose doseNumber={dose.number} key={i} date={dateConvert(dose.date)} lotNumber={dose.lotNumber} vaccine={dose.vaccine} />
            ))}
          </Grid>
          <Feature name="proof">
            <FormGroup label="Vaccination Record Type" fieldId="review-vax-form-vaccine-proof">
              <TextInput
                aria-label="review-vax-form-vaccine-proof"
                isDisabled
                type="text"
                value={proofPreview['label']}
              />
            </FormGroup>
            <FormGroup label="Attachment preview" fieldId="review-vax-image-preview">
              {vaxImage && vaxFilename.split('.').pop()?.toLowerCase() == "pdf" && (typeof vaxImage !== "undefined" ? (
                  <Button
                    icon={<ExternalLinkAltIcon />}
                    variant="link"
                    component="a"
                    href={URL.createObjectURL(convertBase64ToBlob(vaxImage))}
                    target="_blank"
                  >
                    Vaccination Card PDF
                  </Button>
              ) : null)}
              {vaxImage && vaxFilename.split('.').pop()?.toLowerCase() != "pdf" &&
                (typeof vaxImage !== "undefined" ? (
                  <div>
                    <img
                      src={URL.createObjectURL(convertBase64ToBlob(vaxImage))}
                      alt="vaccination-card"
                    />
                  </div>
                ) : null)}
              {!vaxImage && (
                <p>No image attached.</p>
              )}
            </FormGroup>
          </Feature>
        </Form>
      </CardBody>
      <CardFooter>
        <Button
          icon={<OutlinedPaperPlaneIcon />}
          isDisabled={isFormSubmitting}
          isLoading={isFormSubmitting}
          variant="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
        <Button variant="plain" onClick={() => history.push("/attest/vax")}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
};

export { ReviewVax };
