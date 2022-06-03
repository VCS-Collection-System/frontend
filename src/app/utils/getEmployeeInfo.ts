import {
  KEYCLOAK_FIRST_NAME, 
  KEYCLOAK_LAST_NAME, 
  KEYCLOAK_EMAIL,
  KEYCLOAK_COUNTRY,
  KEYCLOAK_ID
} from "@app/utils/constants"; 

export function getEmployeeInfo(keycloak) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jp = require('jsonpath');
  const profile = keycloak.profile;
  const employeeFirstName = jp.query(profile, KEYCLOAK_FIRST_NAME)[0];
  const employeeLastName = jp.query(profile, KEYCLOAK_LAST_NAME)[0];
  const employeeEmail = jp.query(profile, KEYCLOAK_EMAIL)[0];
  const employeeCountry = jp.query(profile, KEYCLOAK_COUNTRY)[0];
  const employeeID = jp.query(profile, KEYCLOAK_ID)[0];

  const isApprover = () => {
    if(employeeCountry && 
      (keycloak.hasRealmRole("vcs-superapprover") || keycloak.hasRealmRole("vcs-approver-" + employeeCountry.toLowerCase()))){
        return true;
    }

    return false;
  }

  const isSuperApprover = () => {
    return keycloak.hasRealmRole("vcs-superapprover");
  }

  return {
    firstName: employeeFirstName, 
    lastName: employeeLastName,
    email: employeeEmail,
    country: employeeCountry,
    id: employeeID,
    isApprover: isApprover(),
    isSuperApprover: isSuperApprover()
  }
}
