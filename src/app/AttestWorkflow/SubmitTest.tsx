import React, {useEffect, useState} from "react";
import {
  Card,
  CardBody
} from "@patternfly/react-core";
import { useHistory } from "react-router-dom";
import { convertBase64ToBlob, convertBlobToBase64, dateConvert } from "@app/utils/utils";
import CardWithTitle from "@app/Components/CardWithTitle";
import { useKeycloak } from "@react-keycloak/web";
import CovidTestForm from "@app/Components/CovidTestForm";
import { getEmployeeInfo } from "@app/utils/getEmployeeInfo";
import { showFeature } from "@app/Components/Feature";

const SubmitTest: React.FunctionComponent = () => {
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const employeeID = employee.id;
  const employeeName = (employee.firstName || "") + " " + (employee.lastName || ""); 
  const [ isCovidTest, setIsCovidTest ] = useState(false); 
  const [ isRecovery, setIsRecovery ] = useState(false);

  const onLoad = () => {
    const data = sessionStorage.getItem("test_image_file") || "";

    if (data !== "") {
      return new File([convertBase64ToBlob(data)], sessionStorage.getItem("test_image_filename") || "");
    }

    return "";
  }

  const onSubmit = data => {
    sessionStorage.setItem("alt_first_name", data["alt_first_name"]);
    sessionStorage.setItem("alt_last_name", data["alt_last_name"]);
    sessionStorage.setItem("date_of_birth", dateConvert(data["date_of_birth"]));
    sessionStorage.setItem("test_results", data["test_results"]);
    sessionStorage.setItem("test_date", dateConvert(data["test_date"]));
    sessionStorage.setItem("test_image_filename", data["test_image_file"].name)
    convertBlobToBase64(data["test_image_file"]).then(base64 => {
      sessionStorage["test_image_file"] = base64;
    }).then(() => history.push("/attest/review/test"));
  };

  let cardTitle = "";
  if(isCovidTest) {
    cardTitle += "COVID Test Results";
    if(isRecovery) {
      cardTitle += " or Certificate of Recovery";
    }
  } else {
    cardTitle += "Certificate of Recovery";
  }

  useEffect(() => {
    showFeature("covidTest", keycloak).then(config => {
      setIsCovidTest(config);
    });

    showFeature("recovery", keycloak).then(config => {
      setIsRecovery(config);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card isRounded>
      <CardWithTitle title={cardTitle} info="Submit Supporting Documentation" />
      <CardBody>
        <CovidTestForm
          isHRSubmit={false}
          employeeId={employeeID}
          employeeName={employeeName}
          onSubmit={onSubmit}
          onLoad={onLoad}
        />
      </CardBody>
    </Card>
  );
};

export { SubmitTest };