import * as React from 'react';
import { useEffect } from 'react';
import { 
  Button,
  Card, 
  CardBody, 
  CardFooter,
  Grid,
  Flex,
  FlexItem,
  GridItem
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { CheckCircleIcon } from '@patternfly/react-icons';
import CardWithTitle from '@app/Components/CardWithTitle';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import authaxios from "@app/utils/axiosInterceptor";
import EmployeeInfoCard from '@app/Components/EmployeeInfoCard';
import ReviewInfoCard from '@app/Components/ReviewInfoCard';
import { 
  ATTACHMENT_URL,
  EMPLOYEE_URL,
  PRIORITY_CONFIRM_URL
} from "@app/utils/constants"; 

const PriorityReview: React.FunctionComponent = () => {

  const history = useHistory();
  const [covidTestResult, setCovidTestResult] = useState("");
  const [covidTestDate, setCovidTestDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDOB, setEmployeeDOB] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeAgency, setEmployeeAgency] = useState("");
  const [employeeDivision, setEmployeeDivision] = useState("");
  const [priorityId, setPriorityId] = useState(""); 
  const [attachment, setAttachment] = useState("");
  const [attachmentType, setAttachmentType] = useState(""); 
  const [attachmentSize, setAttachmentSize] = useState(0);  

  useEffect(() => {
    const sessionData = sessionStorage.getItem("priorityData") || "";
    const priorityData = JSON.parse(sessionData);
    const personId = priorityData['employeeId'];
    const resAttachment = priorityData['attachment'];
    setAttachmentSize(resAttachment.size);

    if(priorityData['submissionType'] === "recovery") {
      setCovidTestResult("RECOVERY");
    } else {
      setCovidTestResult("POSITIVE")
    }
    setCovidTestDate(priorityData['covidTestDate']); 
    setPriorityId(priorityData['id']); 

    const headers = {
      'Accept': 'application/json'
    }

    authaxios.get(EMPLOYEE_URL + personId, {
      headers: headers
    })
    .then(res => {
      const personData = res['data'];
      setEmployeeId(personData['employeeId']);
      setEmployeeName(personData['firstName'] + " " + personData['lastName']);
      setEmployeeDOB(personData['dateOfBirth']);
      setEmployeeEmail(personData['alternateEmail'] ? personData['alternateEmail'] : (personData['email'] ? personData['email'] : "Not Provided")); 
      setEmployeeAgency(personData['agencyCode']);
      setEmployeeDivision(personData['divisionCode']); 
    })

    authaxios.post(ATTACHMENT_URL, resAttachment, {
      responseType: 'arraybuffer'
    })
    .then(res => {
      setAttachment(res['data']);
      setAttachmentType(res.headers['content-type']);
    })

  }, []);

  function handleConfirm() {

    const headers = {
      'Accept': 'application/json'
    }

    authaxios.delete(PRIORITY_CONFIRM_URL + priorityId, {
      headers: headers
    })
    .then(() => {
      history.push('/hrdashboard');
    })
  }

  return (
    <Card isRounded>
      <CardWithTitle title="HR Review" info="Review COVID Results"/>
      <CardBody>
        <Grid hasGutter>
          <GridItem rowSpan={2} span={6}> 
          {
            attachment && attachmentSize === 0 &&
            "No image"
          }
          {
            attachment && attachmentType != 'application/pdf' && attachmentSize > 0 &&
            <img src={URL.createObjectURL(new Blob([attachment]))} /> 
          }
          {
            attachment && attachmentType == 'application/pdf' && attachmentSize > 0 &&
            <Button
              icon={<ExternalLinkAltIcon />}
              variant="link"
              component="a"
              href={URL.createObjectURL(new Blob([attachment], {type: 'application/pdf'}))}
              target="_blank"
            >
              Test Result PDF
            </Button>
          }
          </GridItem>
          <GridItem span={6}> 
            <ReviewInfoCard
              reviewType="TEST"
              covidTestResult={covidTestResult}
              covidTestDate={covidTestDate}
            />
            <EmployeeInfoCard 
              employeeId={employeeId}
              employeeName={employeeName}
              employeeDOB={employeeDOB}
              employeeEmail={employeeEmail}
              employeeAgency={employeeAgency}
              employeeDivision={employeeDivision}
            />
          </GridItem>
        </Grid>
      </CardBody>
      <CardFooter>
        <Flex>
          <FlexItem align={{ default: "alignLeft" }}>
            <Button variant="plain" onClick={() => history.push("/hrdashboard")}>
              Back
            </Button>
          </FlexItem>
          <FlexItem align={{ default: "alignRight" }}>
            <Button icon={<CheckCircleIcon />} variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </FlexItem>
        </Flex>
      </CardFooter>
    </Card>
  );
}

export { PriorityReview };