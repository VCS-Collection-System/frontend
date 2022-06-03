import React from 'react';
import { Button, Card, CardBody, CardFooter } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import CardWithTitle from '@app/Components/CardWithTitle';
import { useHistory } from 'react-router-dom';

const Privacy: React.FunctionComponent = () => {
  const history = useHistory();
  return (
    <Card isRounded>
      <CardWithTitle
        title="Privacy"
        info="Covid-19 and VCS Privacy Notice is available on The Source. Please review the link below for more information on how Red Hat collects, uses, stores, transfers, and otherwise processes personal information about you in connection with COVID-19 and the validation check-in system (VCS) for Red Hat."
      />
      <CardBody>
        <Button
          icon={<ExternalLinkAltIcon />}
          variant="link"
          component="a"
          href="https://source.redhat.com/departments/legal/globallegalcompliance/compliance_folder/vcs_privacy_notice_for_red_hat_globalpdf"
          target="_blank"
        >
          Covid-19 and VCS Privacy Notice for Red Hat
        </Button>
      </CardBody>
      <CardFooter>
        <Button variant="plain" onClick={() => history.push("/")}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
};

export { Privacy };
