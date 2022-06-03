import * as React from 'react';
import { Button, Card, CardBody, CardFooter, Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import { HRInbox } from './AgencyInbox/HRInbox';
import { HRPriority } from './PriorityInbox/HRPriority';
import { HRSearch } from './Search/HRSearch';
import { useHistory } from 'react-router-dom';
import Feature from '@app/Components/Feature';

const HRDashboard: React.FunctionComponent = () => {
  const history = useHistory();

  return (
    <Card isRounded>
      <CardBody>
        <Grid hasGutter>
          <Feature name='hrSearch'
            renderOff={() =>
              <>
                <GridItem span={6}>
                  <HRInbox />
                </GridItem>
                <GridItem span={6}>
                  <HRPriority />
                </GridItem>
              </>
            }>
            <>
              <GridItem span={4}>
                <HRInbox />
              </GridItem>
              <GridItem span={4}>
                <HRSearch />
              </GridItem>
              <GridItem span={4}>
                <HRPriority />
              </GridItem>
            </>
          </Feature>
        </Grid>
      </CardBody>
      <CardFooter>
        <Flex>
          <FlexItem align={{ default: "alignLeft" }}>
            <Button 
              variant="plain" 
              onClick={() => history.push("/attestmenu")
            }>
              Back
            </Button>
          </FlexItem>
        </Flex>
      </CardFooter>
    </Card>
  )
};

export { HRDashboard };

