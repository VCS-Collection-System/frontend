import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody
} from '@patternfly/react-core';
import authaxios from "@app/utils/axiosInterceptor";
import { ResponseErrorModal, GenericResponseModal } from '@app/Components/FeedbackModals';
import { convertBase64ToBlob, dateConvert } from "@app/utils/utils";
import { useKeycloak } from "@react-keycloak/web";
import CovidVaxForm from '@app/Components/CovidVaxForm';
import { getEmployeeInfo } from '@app/utils/getEmployeeInfo';
import { SUBMIT_VAX_URL } from '@app/utils/constants'

interface AppProps {
  closeParentModal: () => void;
}

const HRVaxSubmit : React.FunctionComponent<AppProps> = (props: AppProps) => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); 
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); 
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [errorState, setErrorState] = useState(''); 
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDOB, setEmployeeDOB] = useState("");
  const [employeeFN, setEmployeeFN] = useState("");
  const [employeeLN, setEmployeeLN] = useState("");
  const [email, setEmail] = useState(""); 
  const [agency, setAgency] = useState(""); 
  const [division, setDivision] = useState(""); 
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const reviewerID = employee.id;

  useEffect(() => {
    const sessionEmployee = sessionStorage.getItem("searchResultInfo") || "{}"; 
    const employeeInfo = JSON.parse(sessionEmployee); 
    setEmployeeId(employeeInfo['employeeId']);
    setEmployeeName(employeeInfo['firstName'] + " " + employeeInfo['lastName'])
    setEmployeeFN(employeeInfo['firstName']);
    setEmployeeLN(employeeInfo['lastName']);
    setEmployeeDOB(employeeInfo['dateOfBirth']);
    setEmail(employeeInfo['email']);
    setAgency(employeeInfo['agencyCode']);
    setDivision(employeeInfo['divisionCode']); 
  }, []);

  const formSubmitSuccess = () => {
    setIsFormSubmitting(false);
    setIsSuccessModalOpen(true)
  }

  const onHRLoad = () => {
    const data = sessionStorage.getItem("hr_vax_image") || "";

    if (data !== "") {
      return new File([convertBase64ToBlob(data)], sessionStorage.getItem("hr_vax_image_filename") || "");
    }

    return "";
  }

  const onSubmit = (data) => {
    setIsFormSubmitting(true);
    
    const doses: {number: number, date: string, lotNumber: string, vaccine: string}[] = [];

    for(let i = 1; data["vax_date_" + i] != null && data["vax_date_" + i] != ""; i++) {
      doses.push({
        number: i,
        date: data["vax_date_" + i],
        lotNumber: data["lot_number_" + i],
        vaccine: data["vaccine_" + i]
      });
    }

    const vaxInfo = doses.map((dose) => {
      return {
        vaccineBrand: dose.vaccine.toUpperCase(),
        vaccineAdministrationDate: dateConvert(dose.date),
        vaccineShotNumber: dose.number,
        lotNumber: dose.lotNumber,
        proofType: (data["proof_type"] || "OTHER"),
        submittedBy: reviewerID
      };
    });

    const employeeInfo = {
      "id": employeeId,
      "firstName": employeeFN,
      "lastName": employeeLN,
      "altFirstName": data["alt_first_name"],
      "altLastName": data["alt_last_name"],
      "dateOfBirth": dateConvert(data["date_of_birth"]),
      "email": email,
      "agencyCode": agency,
      "agencyName": agency,
      "divisionCode": division
    }

    const formData = new FormData();

    formData.append("employee", new Blob([JSON.stringify(employeeInfo)], { type: "application/json" }));
    formData.append("documents", new Blob([JSON.stringify(vaxInfo)], { type: "application/json" }));

    if(data["vax_image"]) {
      const attachmentExtension = data["vax_image"]["name"].split('.').pop().toLowerCase();

      let attachmentType;

      if(attachmentExtension === "pdf") {
        attachmentType = "application/pdf";
      }
      else if(attachmentExtension === "jpg") {
        attachmentType = "image/jpeg";
      }
      else {
        attachmentType = "image/" + attachmentExtension;
      }

      formData.append("attachment", new Blob([data["vax_image"]], { type: attachmentType }), "blob."+attachmentExtension);
    }
    else {
      formData.append('attachment', new Blob([], { type: "image/png" }), "blob.png");
    }

    const headers = {
      'Content-Type': 'multipart/form-data;'
    }

    authaxios.post(SUBMIT_VAX_URL, formData, {
      headers: headers
    })
    .then(() => {
      formSubmitSuccess();
    }).catch((res) => {
      if (res.response) {
        setIsFormSubmitting(false);
        setErrorState(res.response.status);
        setIsErrorModalOpen(true);
      }
    });    
  }

  const closeModals = (closeModal) => {
    setIsSuccessModalOpen(closeModal);
    props.closeParentModal(); 
  }

  return (
    <Card>
      <CardBody>
        <GenericResponseModal
          isModalOpen={isSuccessModalOpen}
          setIsModalOpen={closeModals}
          title="Submitted Successfully!"
          message="New record added to user!"
        />
        <ResponseErrorModal 
          isModalOpen={isErrorModalOpen} 
          setIsModalOpen={setIsErrorModalOpen} 
          errorState={errorState}
        />
        <CovidVaxForm 
          isHRSubmit={true}
          employeeId={employeeId}
          employeeName={employeeName}
          employeeDOB={employeeDOB}
          employeeCountry={agency}
          onHRLoad={onHRLoad}
          onSubmit={onSubmit}
          isFormSubmitting={isFormSubmitting}
        />
      </CardBody>
    </Card>
  );
}

export { HRVaxSubmit };