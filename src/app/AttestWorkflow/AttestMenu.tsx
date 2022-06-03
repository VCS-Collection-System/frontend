import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Stack,
  Text,
} from "@patternfly/react-core";
import { CheckCircleIcon, CogIcon, FileUploadIcon } from '@patternfly/react-icons';
import { useHistory } from 'react-router-dom';
import CardWithTitle from '@app/Components/CardWithTitle';
import Feature, { showFeature } from '@app/Components/Feature';
import { useKeycloak } from "@react-keycloak/web";
import { getEmployeeInfo } from '@app/utils/getEmployeeInfo';

const AttestMenu: React.FunctionComponent = () => {
    const history = useHistory();
    const { keycloak } = useKeycloak();
    const employee = getEmployeeInfo(keycloak);
    const [ isRecovery, setIsRecovery ] = useState(false); 

    useEffect(() => {
      showFeature("recovery", keycloak).then(config => {
        setIsRecovery(config);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return (
      <Card isRounded>
        <CardWithTitle title="Menu" info="Please select from the following:" />
        <CardBody>
          <Stack hasGutter>
            <Button
              icon={<FileUploadIcon />}
              id="submit-vax-card-menu-button"
              isSmall
              onClick={() => history.push("/attest/vax")}
              variant="tertiary"
            >
              <Text>Submit Vaccination Record</Text>
              <Feature name="proofOptional" renderOff={() => (
                <Text>Supporting Document Upload Required</Text>
              )}>
                &nbsp;
              </Feature>
            </Button>
            <Feature name="covidTest" renderOff={() =>
              <Feature name="recovery"> 
                <Button
                  icon={<FileUploadIcon />}
                  id="submit-vax-test-menu-button"
                  isSmall
                  onClick={() => history.push("/attest/test")}
                  variant="tertiary"
                >
                  <Text>Submit Recovery Certificate</Text>
                  <Text>Supporting Document Upload Required</Text>
                </Button>
              </Feature>
            }> 
              <Button
                icon={<FileUploadIcon />}
                id="submit-vax-test-menu-button"
                isSmall
                onClick={() => history.push("/attest/test")}
                variant="tertiary"
              >
                <Text>Submit Test Results{isRecovery ? " or Recovery Certificate" : ""}</Text>
                <Text>Supporting Document Upload Required</Text>
              </Button>
            </Feature>
            {employee.isApprover ? (
              <Feature name="hrDashboard"> 
                <Button
                  icon={<CheckCircleIcon />}
                  id="validate-submissions-button"
                  isSmall
                  onClick={() => history.push("/hrdashboard")}
                  variant="tertiary"
                >
                  <Text>HR Dashboard</Text>
                  <Text>Review or Update Red Hat VCS Records</Text>
                </Button>
              </Feature>
            ) : ""}
            {employee.isSuperApprover ? (
              <Button
                  icon={<CogIcon />}
                  id="settings-button"
                  isSmall
                  onClick={() => history.push("/settings")}
                  variant="tertiary"
                >
                  <Text>Application Settings</Text>
                  <Text>Update Red Hat VCS Country Settings</Text>
                </Button>
            ) : ""}
          </Stack>
        </CardBody>
        <CardFooter>
          <Button 
            variant="plain" 
            id="attest-menu-back-button"
            onClick={() => history.push("/profile")}
          >
            Back
          </Button>
        </CardFooter>
      </Card>
    );
};
export { AttestMenu }
