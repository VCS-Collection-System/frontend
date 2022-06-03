import React from 'react';
import { Button, Card, CardBody, CardFooter } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import CardWithTitle from '@app/Components/CardWithTitle';
import { useHistory } from 'react-router-dom';

const Contact: React.FunctionComponent = () => {
  const history = useHistory();
  return (
    <Card isRounded>
      <CardWithTitle
        title="Help"
        info="If you need more information, use the links below."
      />
      <CardBody>
        <Button
          icon={<ExternalLinkAltIcon />}
          variant="link"
          component="a"
          href="https://redhat.service-now.com/help?id=kb_article_view&sysparm_article=KB0015661"
          target="_blank"
        >
          VCS User Guide
        </Button>
        <br />
        <Button
          icon={<ExternalLinkAltIcon />}
          variant="link"
          component="a"
          href="https://redhat.service-now.com/help?id=kb_search&spa=1&workflow_state=published&kb_knowledge_base=9f106876db5b8890ab8fe8ca4896199c"
          target="_blank"
        >
          Frequently asked questions (FAQs) and related knowledge base articles
        </Button>
        <br />
        <Button
          icon={<ExternalLinkAltIcon />}
          variant="link"
          component="a"
          href="https://redhat.service-now.com/help?id=sc_cat_item&sys_id=89e35ece1b4074102d12c880604bcb6a"
          target="_blank"
        >
          Contact People Helpdesk for process questions and systems issues
        </Button>
        <br />
        <Button
          icon={<ExternalLinkAltIcon />}
          variant="link"
          component="a"
          href="https://www.redhat.com/en/services/consulting"
          target="_blank"
        >
          Developed by the Red Hat NAPS Services Team
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

export { Contact };
