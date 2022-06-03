import React, { useEffect, useState } from 'react';
import { 
  Button,
  Card, 
  CardBody, 
  CardFooter,
  Grid,
  Flex,
  FlexItem,
  GridItem,
  Spinner,
  Split
} from '@patternfly/react-core';
import { CheckCircleIcon, ErrorCircleOIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import CardWithTitle from '@app/Components/CardWithTitle';
import authaxios from "@app/utils/axiosInterceptor";
import ReviewInfoCardHorizontal from '@app/Components/ReviewInfoCardHorizontal';
import { ResponseErrorModal, GenericResponseModal } from '@app/Components/FeedbackModals';
import DeclineReasonModal from '@app/Components/DeclineReasonModal';
import { useKeycloak } from "@react-keycloak/web";
import { PAM_TASK_URL, VAX_TASK_DOCUMENT_URL, ATTACHMENT_URL, DELETE_VAX_URL } from '@app/utils/constants'
import { getEmployeeInfo } from '@app/utils/getEmployeeInfo';
import DeleteConfirmationModal from '@app/Components/DeleteConfirmationModal';


interface AppProps {
  hasSelectedItem: boolean;
  setHasSelectedItem: (boolean) => void; 
  updatePanel: boolean;
  refreshCaseHistory: boolean; 
  setResfreshCaseHistory: (boolean) => void; 
}

const CaseReviewPanel: React.FunctionComponent<AppProps> = ({
  hasSelectedItem, 
  setHasSelectedItem,
  updatePanel, 
  refreshCaseHistory, 
  setResfreshCaseHistory
}) => {
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const reviewerID = employee.id;
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false); 
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); 
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);  
  const [errorState, setErrorState] = useState(''); 
  const [genericModalTitle, setGenericModalTitle] = useState("");
  const [genericModalMessage, setGenericModalMessage] = useState("");
  const [deleteModalTitle, setDeleteModalTitle] = useState("");
  const [deleteModalMessage, setDeleteModalMessage] = useState("");
  const [disableReview, setDisableReview] = useState(false); 

  const [submissionDate, setSubmissionDate] = useState(""); 
  const [historyType, setHistoryType] = useState("");
  const [testResult, setTestResult] = useState(""); 
  const [testDate, setTestDate] = useState("");
  const [reviewDate, setReviewDate] = useState(""); 
  const [vaxBrand, setVaxBrand] = useState("");
  const [vaxDate, setVaxDate] = useState(""); 
  const [vaxLotNumber, setVaxLotNumber] = useState("");
  const [vaxReview, setVaxReview] = useState("");
  const [reviewer, setReviewer] = useState(""); 
  const [taskId, setTaskId] = useState("");
  const [isPendingReview, setIsPendingReview] = useState(false)

  const [attachment, setAttachment] = useState(""); 
  const [attachmentType, setAttachmentType] = useState(""); 
  const [hasAttachment, setHasAttachment] = useState(false); 

  const [submittedBy, setSubmittedBy] = useState("");

  useEffect(() => {
    if(hasSelectedItem) {
      setIsContentLoading(true); 
      setIsPendingReview(false);
      setReviewer("");
      setDisableReview(false); 

      const reviewType = sessionStorage.getItem("caseHistoryType") || "";
      const sessionReivewData = sessionStorage.getItem("caseHistoryInfo") || "{}";
      const reviewData = JSON.parse(sessionReivewData);
      const attachmentProperty = reviewData['attachment'] || {};
      setHasAttachment(attachmentProperty['size'] !== 0)

      setSubmittedBy(reviewData['submittedBy']); 

      if(reviewType.includes('TEST')){
        setHistoryType("TEST")
        setTestResult(reviewData['covidTestResult']);
        setTestDate(reviewData['covidTestDate']);
        setSubmissionDate(returnNewDate(reviewData['submissionDate']));
      }
      else if(reviewType.includes('VAX')) {
        setHistoryType("VAX");
        setVaxBrand(reviewData['vaccineBrand']);
        setVaxDate(reviewData['vaccineAdministrationDate']);
        setVaxLotNumber(reviewData['lotNumber'])
        setSubmissionDate(returnNewDate(reviewData['submissionDate']));

        if(reviewData['review']){
          setVaxReview(reviewData['review']['reviewOutcome'])
          setReviewer(reviewData['review']['reviewerEmployeeId']); 
          setReviewDate(returnNewDate(reviewData['review']['reviewDate']));
        }
        else {
          if(!reviewData['autoApproved']) {
            setVaxReview("NOT REVIEWED");
            authaxios.get(VAX_TASK_DOCUMENT_URL + reviewData['id'])
            .then(res => {
              setIsPendingReview(true);
              setTaskId(res['data']['taskId']);
              authaxios.get(PAM_TASK_URL + res['data']['taskId'])
              .then(taskRes => {
                const taskData = taskRes['data']
                if(taskData['task-status'] === "Reserved") {
                  setDisableReview(true);
                  setGenericModalTitle("Task Was Claimed");
                  setGenericModalMessage("Please select another one.");
                  setIsGenericModalOpen(true);
                }
                else {
                  setDisableReview(false); 
                }
              })
            })
          }
          else{
            setVaxReview("AUTO-ACCEPTED");
          }
        }        
      }

      if(reviewType.includes('TEST') || reviewType.includes('VAX')) {
        authaxios.post(ATTACHMENT_URL, attachmentProperty, {
          responseType: 'arraybuffer'
        })
        .then(res => {
          setAttachment(res['data']);
          setAttachmentType(res.headers['content-type']);
        })
        .finally(() => {
          setIsContentLoading(false); 
        })
      }
      else {
        setIsContentLoading(false);
      }
    }
  }, [hasSelectedItem, updatePanel]);

  const handleDeleteRecord = () => {
    setIsFormSubmitting(true);
   
    const sessionReivewData = sessionStorage.getItem("caseHistoryInfo") || "{}";
    const recordId = JSON.parse(sessionReivewData)["id"];

    const headers = {
      'Accept': 'application/json'
    }

    authaxios.delete(DELETE_VAX_URL + recordId, {
      headers: headers
    }).then(() => {
        setHasSelectedItem(false);
        setDeleteModalTitle("Deleted Successfully!");
        setDeleteModalMessage("Record has been Deleted!");
    }).catch((res) => {
      if (res.response) {
        setIsFormSubmitting(false);
        setErrorState(res.response.status);
        setIsErrorModalOpen(true);
      }
    });

    setIsDeleteModalOpen(false);
  }

  const sendReview = (accepted, reason) => {
    setIsFormSubmitting(true)
    setIsDeclineModalOpen(false);
    const taskUrl = PAM_TASK_URL + taskId + "/states"
    const outcome = accepted ? "ACCEPTED" : "DECLINED"

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    const acceptData = {
      "documentReview": {
        "com.redhat.vcs.model" : {
            "reviewerEmployeeId": reviewerID,
            "reviewOutcome": outcome,
            "reviewerNotes": reason,
            "rejectReason": reason
        }        
      }
    }

    authaxios.put(taskUrl + "/claimed", {}, {
      headers: headers
    })
    .then(() => {
      authaxios.put(taskUrl + "/completed?auto-progress=true", acceptData, {
        headers: headers
      })
      .then(() => {
        setHasSelectedItem(false);
        setGenericModalTitle("Submitted Successfully!");
        setGenericModalMessage("Review has been submitted!");
        setIsGenericModalOpen(true); 
      })
      .catch(submitResult => {
        if(submitResult.response) {
          setErrorState(submitResult.response.status);
          setIsErrorModalOpen(true);
        }
      })
    })
    .catch(claimResult => {
      if(claimResult.response) {
        setErrorState(claimResult.response.status);
        setIsErrorModalOpen(true);
      }
    }).finally(() => {
      setIsFormSubmitting(false)
    })
  }

  function returnNewDate(resDate) {
    const longDate = new Date(resDate);
    return ("0"+(longDate.getMonth()+1)).slice(-2) + "-" + ("0"+ longDate.getDate()).slice(-2) + "-" + longDate.getFullYear();
  }

  const closeReviewAndRefresh = () => {
    setResfreshCaseHistory(!refreshCaseHistory);
    setIsGenericModalOpen(false);
  }

  const ReviewInfo = () => {
    if (historyType === "TEST") {
      return (             
        <ReviewInfoCardHorizontal
          reviewType="TEST"
          covidTestResult={testResult}
          covidTestDate={testDate}
          submittedBy={submittedBy}
          submissionDate={submissionDate}
          reviewer={reviewer}
        />
      )
    }
    else if (historyType === "VAX") {
      return (
        <ReviewInfoCardHorizontal
          reviewType="VAX"
          vaccineBrand={vaxBrand}
          vaccineDate={vaxDate}
          vaccineLotNumber={vaxLotNumber}
          submittedBy={submittedBy}
          submissionDate={submissionDate}
          reviewer={reviewer}
          reviewDate={reviewDate}
          reviewStatus={vaxReview}
        />
      )
    }
    else {
      return null;
    }
  }

  const CaseAttachment = () => {
    if(attachmentType == "application/pdf") {
      return (
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
    else {
      return (<img src={URL.createObjectURL(new Blob([attachment]))} style={{maxHeight: '500px'}}/>)
    }
  }
  const DeleteContentButton = () => {
    if(hasSelectedItem) {
      return (
        <Button 
        variant="danger"
        onClick={() => setIsDeleteModalOpen(true)}
        style={{ marginLeft: "80%" }}
        >
          Delete Record</Button>
      )
    } else {
      return null;
    }
  }

  const CardContent = () => {
    if(!hasSelectedItem) {
      return (
        <CardBody>
          {"Please Select an Item"}
        </CardBody>
      )
    }
    else if(isContentLoading) {
      return (
        <CardBody isFilled>
          <Flex justifyContent={{ default: "justifyContentCenter" }}>
            <FlexItem>
              <Spinner isSVG/>
            </FlexItem>
          </Flex>
        </CardBody>
      )
    }
    else {
      return (
        <>
          <CardBody>
            <Grid hasGutter>
              <GridItem span={12}> 
                <ReviewInfo />
              </GridItem>
              <Flex justifyContent={{ default: "justifyContentCenter" }}>
                <FlexItem>
                  <GridItem span={12}> 
                    {
                      !hasAttachment ? "No Image" : <CaseAttachment />
                    }
                  </GridItem>
                </FlexItem>
              </Flex>
            </Grid>
          </CardBody>
          <CardFooter>
            {
              isPendingReview &&
              <Split hasGutter>
                <Button 
                  icon={<CheckCircleIcon />} 
                  isDisabled={disableReview}
                  variant="primary" 
                  onClick={() => sendReview(true, "")}
                >
                  Accept
                </Button>
                <Button 
                  icon={<ErrorCircleOIcon />} 
                  isDisabled={disableReview}
                  variant="danger" 
                  onClick = { () => setIsDeclineModalOpen(true) }
                >
                  Decline
                </Button>
              </Split>
            }
          </CardFooter>
        </>
      )
    }
  }

  return (
    <Card isRounded height="500px">
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
      <GenericResponseModal 
        isModalOpen={isGenericModalOpen}
        setIsModalOpen={closeReviewAndRefresh}
        title={genericModalTitle}
        message={genericModalMessage}
      />
      <DeleteConfirmationModal 
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        title={deleteModalTitle}
        message={deleteModalMessage}
        handleDelete={handleDeleteRecord}
      />
      <CardWithTitle title="Attestation Details"/>
      <CardContent />
      <CardFooter>
        <Split hasGutter>
          <DeleteContentButton />
        </Split>
      </CardFooter>
    </Card>
  );
}

export { CaseReviewPanel };
