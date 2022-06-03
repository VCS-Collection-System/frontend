import React, { useState } from 'react';
import {
  Button, 
  Card,
  CardFooter,
  CardBody,
  Form,
  FormGroup,
  TextInput
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, OutlinedPaperPlaneIcon } from '@patternfly/react-icons';
import { useHistory } from 'react-router-dom';
import CardWithTitle from '@app/Components/CardWithTitle';
import { convertBase64ToBlob, dateConvert } from "@app/utils/utils";
import authaxios from "@app/utils/axiosInterceptor";
import { ResponseErrorModal } from '@app/Components/FeedbackModals';
import Feature from "@app/Components/Feature";
import { useKeycloak } from "@react-keycloak/web";
import { getEmployeeInfo } from '@app/utils/getEmployeeInfo';
import { SUBMIT_TEST_URL } from '@app/utils/constants';

const ReviewTest: React.FunctionComponent = () => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); 
  const [errorState, setErrorState] = useState('');
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const employeeFirstName = employee.firstName;
  const employeeLastName = employee.lastName;
  const employeeID = employee.id;
  const employeeEmail = employee.email;
  const employeeCountry = employee.country;
  const employeeName = (employee.firstName || "") + " " + (employee.lastName || ""); 

  const testImage = sessionStorage.getItem("test_image_file") || "";
  const testImageFilename = sessionStorage.getItem("test_image_filename") || "";
  const altFirstName = sessionStorage.getItem("alt_first_name") || "";
  const altLastName = sessionStorage.getItem("alt_last_name") || "";
  const employeeDOB = sessionStorage.getItem("date_of_birth") || "";
  const covidTestResult = sessionStorage.getItem("test_results") || "";
  const covidTestDate = sessionStorage.getItem("test_date") || "";
  const altName = (altFirstName ? altFirstName : employeeFirstName) + " " +  (altLastName ? altLastName : employeeLastName);

  const handleSubmit = ()=> {
    setIsFormSubmitting(true);
    const testCard = convertBase64ToBlob(testImage)
    const formData = new FormData();

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

    const testInfo = {
      covidTestDate: covidTestDate,
      covidTestResult: covidTestResult.toUpperCase()
    }

    const attachmentExtension = testImageFilename.split('.').pop()?.toLowerCase();
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

    formData.append('employee', new Blob([JSON.stringify(employeeInfo)], {type: "application/json"}) );
    formData.append('documents', new Blob([JSON.stringify(testInfo)], {type: "application/json"}));
    formData.append("attachment", new Blob([testCard], { type: attachmentType }), "blob."+attachmentExtension);

    authaxios.post(SUBMIT_TEST_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data;'
      }
    })
    .then(() => {
      setIsFormSubmitting(false);
      history.push('/thankyou');
    })
    .catch(res => {
      if(res.response) {
        setIsFormSubmitting(false);
        setErrorState(res.response.status);
        setIsErrorModalOpen(true);
      }
    })
  }

  return (
    <Card isRounded>
      <ResponseErrorModal 
        isModalOpen={isErrorModalOpen} 
        setIsModalOpen={setIsErrorModalOpen} 
        errorState={errorState}
      />
      <CardWithTitle
        title="Review Submission"
        info="Review your test result submission and validate that test result image matches displayed data. Please press Submit below to proceed."
      />
      <CardBody>
        <Form>
          <FormGroup label="Person ID" fieldId="review-test-form-employee-id">
            <TextInput
              aria-label="review-test-form-employee-id"
              isDisabled
              type="text"
              value={employeeID}
            />
          </FormGroup>
          <FormGroup
            fieldId="review-test-form-employee-full-name"
            label="Full Name"
          >
            <TextInput
              aria-label="review-test-form-employee-full-name"
              isDisabled
              type="text"
              value={employeeName}
            />
          </FormGroup>
          <FormGroup
            fieldId="review-test-form-employee-alt-name"
            label="Full Preferred Name (as displayed on test result)"
          >
            <TextInput
              aria-label="review-test-form-employee-alt-name"
              isDisabled
              type="text"
              value={altName}
            />
          </FormGroup>
          <Feature name="dateOfBirth">
            <FormGroup
              label="Date of Birth"
              fieldId="review-test-date-of-birth"
            >
              <TextInput
                aria-label="review-test-date-of-birth"
                isDisabled
                type="text"
                value={dateConvert(employeeDOB)}
              />
            </FormGroup>
          </Feature>
          <FormGroup label="Test Results" fieldId="review-test-form-results">
            <TextInput
              aria-label="review-test-form-results"
              isDisabled
              type="text"
              value={sessionStorage.getItem("test_results") || ""}
            />
          </FormGroup>
          <FormGroup label="Test Date" fieldId="review-test-form-date">
            <TextInput
              aria-label="review-test-form-date"
              isDisabled
              type="text"
              value={dateConvert(sessionStorage.getItem("test_date") || "")}
            />
          </FormGroup>
          <FormGroup label="Image preview" fieldId="review-vax-image-preview">
            {testImage && testImageFilename.split('.').pop()?.toLowerCase() == "pdf" &&
              (typeof testImage !== "undefined" ? (
                <Button
                  icon={<ExternalLinkAltIcon />}
                  variant="link"
                  component="a"
                  href={URL.createObjectURL(convertBase64ToBlob(testImage))}
                  target="_blank"
                >
                  Test Result PDF
                </Button>
              ) : null)}
            {testImage && testImageFilename.split('.').pop()?.toLowerCase() != "pdf" &&
              (typeof testImage !== "undefined" ? (
                <div>
                  <img
                    src={URL.createObjectURL(convertBase64ToBlob(testImage))}
                    alt="test-results-image"
                  />
                </div>
              ) : null)}
          </FormGroup>
        </Form>
      </CardBody>
      <CardFooter>
        <Button
          icon={<OutlinedPaperPlaneIcon />}
          isDisabled={isFormSubmitting}
          isLoading={isFormSubmitting}
          onClick={handleSubmit}
          variant="primary"
        >
          Submit
        </Button>
        <Button onClick={() => history.push("/attest/test")} variant="plain">
          Back
        </Button>
      </CardFooter>
    </Card>
  );
};

export { ReviewTest };
