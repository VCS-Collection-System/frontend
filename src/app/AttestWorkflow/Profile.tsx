import React from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Checkbox,
  Form,
  FormGroup,
  TextInput,
} from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import CardWithTitle from "@app/Components/CardWithTitle";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { getEmployeeInfo } from "@app/utils/getEmployeeInfo";
import { BLOCKED_COUNTRIES } from "@app/utils/constants";

const Profile: React.FunctionComponent = () => {
  const history = useHistory();
  const { handleSubmit } = useForm();
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const employeeFirstName = employee.firstName;
  const employeeLastName = employee.lastName;
  const employeeEmail = employee.email;
  const employeeCountry = employee.country;

  const onSubmit = () => {
    history.push("/attestmenu");
  };

  return (
    <Card isRounded>
      {typeof(employeeCountry) === "undefined" || BLOCKED_COUNTRIES.includes(employeeCountry) ? (
        <Alert variant="danger" title="This application is not currently available in your region." style={{marginBottom: "var(--pf-global--gutter--md)"}}>
          Please visit our <a href="/contact">Help</a> page for more information.
        </Alert>
      ) : ""}
      <CardWithTitle
        title="Profile"
        info="The information below is retrieved from your Red Hat user account."
      />
      <CardBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup
            id="employee-full-name"
            label="Full Name"
            fieldId="profile-form-employee-full-name"
          >
            <TextInput
              aria-label="employee-full-name"
              isDisabled
              type="text"
              value={(employeeFirstName || "") + " " + (employeeLastName || "")}
            />
          </FormGroup>
          <FormGroup
            id="employee-email-display"
            label="Email"
            fieldId="profile-form-email"
          >
            <TextInput
              aria-label="employee-email-display"
              isDisabled
              type="email"
              value={employeeEmail || ""}
            />
          </FormGroup>
          {employee.isApprover && 
            (
              <Checkbox
                id="reviewer-checkbox"
                label="Red Hat VCS Reviewer"
                aria-label="disabled checked checkbox"
                defaultChecked
                isDisabled
              />
          )}
          <FormGroup fieldId="accept-test-buttons">
            <Button 
              icon={<CheckCircleIcon />} 
              variant="primary" 
              type="submit"
              isDisabled={typeof(employeeCountry) === "undefined" || BLOCKED_COUNTRIES.includes(employeeCountry)}
              >
              Accept
            </Button>
          </FormGroup>
        </Form>
      </CardBody>
    </Card>
  );
};

export { Profile };
