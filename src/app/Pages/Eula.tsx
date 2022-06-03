import React from 'react';
import {
  Button, 
  Card,
  CardFooter,
  CardBody,
  Stack,
  Text,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons'
import CardWithTitle from '@app/Components/CardWithTitle';

const Eula = ({login}) => {

  return (     
    <Card isRounded>
      <CardWithTitle title="Welcome" info="VCS Privacy Notice" />
      <CardBody>
        <Stack hasGutter>
          <Text>
           Please review the <a href="https://source.redhat.com/departments/legal/globallegalcompliance/compliance_folder/vcs_privacy_notice_for_red_hat_globalpdf" target="_blank"  rel="noreferrer">Covid-19 and VCS Privacy Notice available on The Source</a> for information on how Red Hat collects, uses, stores, transfers, and otherwise processes personal information about you in connection with COVID-19 and the validation check-in system (VCS) for Red Hat.
          </Text>
        </Stack>
      </CardBody>
      <CardFooter>
        <Button
          icon={<CheckCircleIcon />}
          variant="primary"
          onClick={login}>
          Accept
        </Button>
      </CardFooter>
    </Card>  
  );
};

export { Eula };
