import {getEmployeeInfo} from "@app/utils/getEmployeeInfo"

let approver_roles = ["vcs-approver-mockagency", "vcs-superapprover"];

jest.mock("@app/utils/constants", () => ({
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_ID: "attributes.workforceid[0]"
}))

const mockKeycloakObject = {
  profile: {
    firstName: "mockFirst",
    lastName: "mockLast",
    email: "mock@email.com",
    attributes: {
      agency: ["mockAgency"],
      workforceid: ["mockID"]
    }
  },
  hasRealmRole: (role) => {
    return approver_roles.includes(role); 
  } 
}

describe('getEmployeeInfo', ()=> {
  it('should return all the correct data', async () => {
    const expectedResult = {
      firstName: 'mockFirst',
      lastName: 'mockLast',
      email: 'mock@email.com',
      country: 'mockAgency',
      id: 'mockID',
      isApprover: true,
      isSuperApprover: true
    }
    const handler = getEmployeeInfo(mockKeycloakObject);
    expect(handler).toEqual(expectedResult)
  });

  it('should return undefined and not crash if field does not exist', async () => {
    const expectedResult = {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      country: undefined,
      id: undefined,
      isApprover: false,
      isSuperApprover: false
    }

    const approver_roles: Array<string> = [];
    const mockKeycloakObject = {  
      profile: {},
      hasRealmRole: (role) => {
        return approver_roles.includes(role); 
      } 
    }
    const handler = getEmployeeInfo(mockKeycloakObject);
    expect(handler).toEqual(expectedResult)
  });

  it('isApprover should return false if user does not have an approver role', async () => {
    const expectedResult = {
      firstName: 'mockFirst',
      lastName: 'mockLast',
      email: 'mock@email.com',
      country: 'mockAgency',
      id: 'mockID',
      isApprover: false,
      isSuperApprover: false
    }
    approver_roles = ["wrong-approver"]
    const handler = getEmployeeInfo(mockKeycloakObject);
    expect(handler).toEqual(expectedResult)
  });

  it('isSuperApprover should return false if user does not have a super approver role', async () => {
    const expectedResult = {
      firstName: 'mockFirst',
      lastName: 'mockLast',
      email: 'mock@email.com',
      country: 'mockAgency',
      id: 'mockID',
      isApprover: true,
      isSuperApprover: false
    }
    approver_roles = ["vcs-approver-mockagency"]
    const handler = getEmployeeInfo(mockKeycloakObject);
    expect(handler).toEqual(expectedResult)
  });
})