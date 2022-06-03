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
import Feature from "@app/Components/Feature";
import { dateConvert } from "@app/utils/utils";

const EmployeeInfoHorizontalCard = (props) => {

  return (
    <Card>
      <CardWithTitle 
        title="Employee Information"
      />
      <CardBody>
        <Form>
          <Grid hasGutter>
            <GridItem span={6}> 
              <FormGroup
                label="Person ID"
                fieldId="profile-form-employee-id"
              >
                <TextInput
                  aria-label="profile-input-employee-id"
                  isDisabled
                  type="text"
                  value={props.employeeId}
                />
              </FormGroup>
              <FormGroup
                label="Name"
                fieldId="profile-form-employee-name"
              >
                <TextInput
                  aria-label="profile-input-employee-name"
                  isDisabled
                  type="text"
                  value={props.employeeName}
                />
              </FormGroup>
            </GridItem> 
            <GridItem span={6}> 
              <FormGroup
                label="Email"
                fieldId="profile-form-employee-email"
              >
                <TextInput
                  aria-label="profile-input-employee-email"
                  isDisabled
                  type="text"
                  value={props.employeeEmail}
                />
              </FormGroup>
              <Feature name="dateOfBirth">
                <FormGroup
                  label="Date of Birth"
                  fieldId="profile-form-employee-dob"
                >
                  <TextInput
                    aria-label="profile-input-employee-dob"
                    isDisabled
                    type="text"
                    value={dateConvert(props.employeeDOB)}
                  />
                </FormGroup>
              </Feature>
            </GridItem>
          </Grid>
        </Form>
      </CardBody>
    </Card>
  )
}

export default EmployeeInfoHorizontalCard;