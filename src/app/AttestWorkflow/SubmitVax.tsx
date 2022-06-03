import React from "react";
import {
  Card,
  CardBody
} from "@patternfly/react-core";
import { useHistory } from "react-router-dom";
import { convertBase64ToBlob, convertBlobToBase64, dateConvert } from "@app/utils/utils";
import { useKeycloak } from "@react-keycloak/web";
import CardWithTitle from "@app/Components/CardWithTitle";
import CovidVaxForm from "@app/Components/CovidVaxForm";
import { getEmployeeInfo } from "@app/utils/getEmployeeInfo";

const SubmitVax: React.FunctionComponent = () => {
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const employeeFirstName = employee.firstName;
  const employeeLastName = employee.lastName;
  const employeeID = employee.id;

  const onLoad = () => {
    const data = sessionStorage.getItem("vax_image") || "";

    if (data !== "") {
      return new File([convertBase64ToBlob(data)], sessionStorage.getItem("vax_image_filename") || "");
    }

    return "";
  }

  const onSubmit = (data) => {
    sessionStorage.setItem("alt_first_name", data["alt_first_name"]);
    sessionStorage.setItem("alt_last_name", data["alt_last_name"]);
    sessionStorage.setItem("date_of_birth", dateConvert(data["date_of_birth"]));
    sessionStorage.setItem("vaccine", data["vaccine"]);
    sessionStorage.setItem("proof_type", data["proof_type"] || "OTHER");
    sessionStorage.setItem("vax_image_filename", data["vax_image"]?.name || "");
    for(let i = 1; typeof(data["vax_date_" + i]) !== "undefined"; i++) {
      sessionStorage.setItem("vax_date_" + i, dateConvert(data["vax_date_" + i]));
      sessionStorage.setItem("lot_number_" + i, data["lot_number_" + i]);
      sessionStorage.setItem("vaccine_" + i, data["vaccine_" + i]);
    }
    if(data["vax_image"]?.name) {
      convertBlobToBase64(data["vax_image"]).then((base64) => {
        sessionStorage["vax_image"] = base64;
      }).then(()=> history.push("/attest/review/vax"));
    } else {
      history.push("/attest/review/vax");
    }
  };

  return (
    <Card isRounded>
      <CardWithTitle title="Vaccination Form" info="Enter vaccination info" />
      <CardBody>
        <CovidVaxForm 
          isHRSubmit={false}
          employeeId={employeeID || ""}
          employeeName={(employeeFirstName || "") + " " + (employeeLastName || "")}
          onSubmit={onSubmit}
          onLoad={onLoad}
        />
      </CardBody>
    </Card>
  );
};

export { SubmitVax };
