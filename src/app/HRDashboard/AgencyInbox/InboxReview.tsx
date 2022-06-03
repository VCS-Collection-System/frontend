import React, { useEffect, useState } from 'react';
import { 
  Button,
  Card, 
  CardBody, 
  CardFooter,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Split,
} from '@patternfly/react-core';
import { CheckCircleIcon, ErrorCircleOIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import CardWithTitle from '@app/Components/CardWithTitle';
import { useHistory } from 'react-router-dom';
import authaxios from "@app/utils/axiosInterceptor";
import ReviewInfoCard from '@app/Components/ReviewInfoCard';
import EmployeeInfoCard from '@app/Components/EmployeeInfoCard';
import { ResponseErrorModal } from '@app/Components/FeedbackModals';
import DeclineReasonModal from '@app/Components/DeclineReasonModal';
import { useKeycloak } from "@react-keycloak/web";
import { getEmployeeInfo } from '@app/utils/getEmployeeInfo';
import { PAM_TASK_URL, ATTACHMENT_URL } from "@app/utils/constants"

const PKG = "com.redhat.vcs.model.";
const VAX_DOCUMENT = PKG + "VaccineCardDocument";
const VAX_DOCUMENT_LIST = PKG + "VaccineDocumentList";
const VAX_BRAND = PKG + "VaccineBrand";
const VAX_EMPLOYEE = PKG + "Employee";
const VAX_ATTACHMENT = PKG + "Attachment";
const VAX_DOC_REVIEW = PKG + "DocumentReview";

const InboxReview: React.FunctionComponent = () => {
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const reviewerID = employee.id;

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false); 
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorState, setErrorState] = useState(''); 
  const [doses, setDoses] = useState<Array<Record<string, string>>>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDOB, setEmployeeDOB] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [attachment, setAttachment] = useState("");
  const [attachmentType, setAttachmentType] = useState(""); 
  const [attachmentSize, setAttachmentSize] = useState(0); 

  useEffect(() => {
    const taskNumber = sessionStorage.getItem("approveId")
    const taskUrl = PAM_TASK_URL + taskNumber + "?withInputData=true&withOutputData=true&withAssignments=true"

    authaxios.get(taskUrl)
    .then(result => {
      let vaxDocument = null;
      if(result['data']['task-input-data']['document']) {
        vaxDocument = result['data']['task-input-data']['document'][VAX_DOCUMENT];

        if(vaxDocument != null) {
          const vaccineShotDate = vaxDocument['vaccineAdministrationDate'];
          const vaxDoses = [{
            vaccineBrand: vaxDocument['vaccineBrand'][VAX_BRAND],
            vaccineDate: vaccineShotDate['year'] + "-" + vaccineShotDate['monthValue'] + "-" + vaccineShotDate['dayOfMonth'],
            vaccineLotNumber: vaxDocument['lotNumber']
          }];
          setDoses(vaxDoses);
        }
      } else {
        const vaxDocuments = result['data']['task-input-data']['documentList'][VAX_DOCUMENT_LIST]['documents'];

        const vaxDoses = vaxDocuments.map((dose) => {
          dose = dose[VAX_DOCUMENT];
          const vaccineShotDate = dose['vaccineAdministrationDate'];
          return {
            vaccineBrand: dose['vaccineBrand'][VAX_BRAND],
            vaccineDate: vaccineShotDate['year'] + "-" + vaccineShotDate['monthValue'].toString().padStart(2, '0') + "-" + vaccineShotDate['dayOfMonth'].toString().padStart(2, '0'),
            vaccineLotNumber: dose['lotNumber']
          }
        });
        // Must sort because order of doses from server is not guaranteed to be in date order
        vaxDoses.sort((a, b) => {
          return a.vaccineDate.localeCompare(b.vaccineDate);
        });
        setDoses(vaxDoses);

        vaxDocument = vaxDocuments[vaxDocuments.length-1][VAX_DOCUMENT];
      }

      if(vaxDocument != null) {
        const employeeInfo = vaxDocument['employee'][VAX_EMPLOYEE]
        const dateOfBirth = employeeInfo['dateOfBirth']
        const resAttachment = vaxDocument['attachment'][VAX_ATTACHMENT]
        setAttachmentSize(resAttachment['size']);
        setEmployeeId(employeeInfo['employeeId'])
        setEmployeeName(employeeInfo['firstName'] + " " + employeeInfo['lastName'])
        if(dateOfBirth) {
          setEmployeeDOB(dateOfBirth['year'] + "-" + dateOfBirth['monthValue'] + "-" + dateOfBirth['dayOfMonth'])
        }
        setEmployeeEmail(employeeInfo['email']);

        authaxios.post(ATTACHMENT_URL, resAttachment, {
          responseType: 'arraybuffer'
        })
        .then(attachmentResult => {
          setAttachment(attachmentResult['data']);
          setAttachmentType(attachmentResult['headers']['content-type']);
        })
      }
    })
  }, []);

  const sendReview = (accepted, reason) => {
    setIsFormSubmitting(true)
    const taskNumber = sessionStorage.getItem("approveId")
    const taskUrl = PAM_TASK_URL + taskNumber + "/states/completed?auto-progress=true"
    const outcome = accepted ? "ACCEPTED" : "DECLINED"

    const acceptData = {
      "documentReview": {}
    }

    acceptData["documentReview"][VAX_DOC_REVIEW] = {
      "reviewerEmployeeId": reviewerID,
      "reviewOutcome": outcome,
      "reviewerNotes": reason,
      "rejectReason": reason
    }

    authaxios.put(taskUrl, acceptData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(() => {
      history.push("/hrdashboard")
    })
    .catch(res => {
      if(res.response) {
        setErrorState(res.response.status);
        setIsErrorModalOpen(true);
      }
    }).finally(()=> {
      setIsDeclineModalOpen(false)
      setIsFormSubmitting(false)
    })
  }

  const releaseTask = () => {
    const taskNumber = sessionStorage.getItem("approveId")
    const taskUrl = PAM_TASK_URL + taskNumber + "/states/released"
    const headers = {
      'Content-Type': 'application/json'
    }

    authaxios.put(taskUrl, {}, {
      headers: headers
    })
    .then(() => {
      history.push("/hrdashboard")
    })
    .catch(() => {
      history.push("/hrdashboard")
    })
  }

  return (
    <Card isRounded>
      <ResponseErrorModal 
        isModalOpen={isErrorModalOpen} 
        setIsModalOpen={setIsErrorModalOpen} 
        errorState={errorState}
      />
      <DeclineReasonModal 
        isModalOpen={isDeclineModalOpen}
        isSendingReview={isFormSubmitting}
        setIsModalOpen={setIsDeclineModalOpen}
        sendReview={sendReview}
      />
      <CardWithTitle title="HR Review" info="Review Vaccination Record"/>
      <CardBody>
        <Grid hasGutter>
          <GridItem rowSpan={2} span={6}> 
            <Flex justifyContent={{ default: "justifyContentCenter" }}>
              <FlexItem>
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
                  (
                    <Button
                      icon={<ExternalLinkAltIcon />}
                      variant="link"
                      component="a"
                      href={URL.createObjectURL(new Blob([attachment], {type: 'application/pdf'}))}
                      target="_blank"
                    >
                      Vaccination Card PDF
                    </Button>
                  )
                }
              </FlexItem>
            </Flex>
          </GridItem>
          <GridItem span={6}> 
            <ReviewInfoCard
              reviewType="VAX"
              doses={doses}
            />
            <EmployeeInfoCard 
              employeeId={employeeId}
              employeeName={employeeName}
              employeeDOB={employeeDOB}
              employeeEmail={employeeEmail}
            />
          </GridItem>
        </Grid>
      </CardBody>
      <CardFooter>
        <Split hasGutter>
          <Button 
            icon={<CheckCircleIcon />}
            isDisabled={isFormSubmitting}
            isLoading={isFormSubmitting}
            onClick={() => sendReview(true, "")}
            variant="primary" 
          >
            Accept
          </Button>
          <Button 
            icon={<ErrorCircleOIcon />} 
            variant="danger" 
            onClick = {() => setIsDeclineModalOpen(true)}
          >
            Decline
          </Button>
          <Button 
            variant="plain" 
            onClick={() => releaseTask()}
          >
            Back
          </Button>
        </Split>
      </CardFooter>
    </Card>
  );
}

export { InboxReview };
