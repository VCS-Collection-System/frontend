import React, { useContext } from "react";
import { ConsentContext, ConsentProvider } from "@app/context";
import { Button } from "@patternfly/react-core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import mockKeycloak from '../../__mocks__/keycloakMock'

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: jest.fn( ()=>({keycloak: mockKeycloak}))
})) 

let contextStatus;

const mockContext = jest.fn(() => {
  return Promise.resolve(contextStatus);
})

jest.mock('@app/Components/Feature', () => ({
  showFeature: (feature, keycloak) => mockContext()
}))

jest.mock("@app/utils/constants", () => ({
  KEYCLOAK_FIRST_NAME: "firstName",
  KEYCLOAK_LAST_NAME: "lastName",
  KEYCLOAK_EMAIL: "email",
  KEYCLOAK_COUNTRY: "attributes.agency[0]",
  KEYCLOAK_ID: "attributes.workforceid[0]",
  APPROVER_ROLES: ["mock-approver"],
  FEATURE_FLAGS: [
    {
      "name": "fakeFeature", 
      "active": true
    },
    { 
      "name": "hrdashboard",
      "active": true
    }, 
    { 
      "name": "inactive",
      "active": false
    }, 
    {
      "name": "covidTest",
      "active": true
    },
    {
      "name": "consentCheckbox",
      "active": false
    }
  ],
  INCLUDE_COUNTRIES: {"consent": ["AUS"], "covidTest": ["DEU", "AUT"]}
}))

const MockNonProvider = () => {
  const { consented, setConsented } = useContext(ConsentContext); 
  return (
    <div>
      {consented ? "Consent Accepted" : "Consent Rejected"}
      <Button 
        onClick={() => setConsented(true)}
      >
        Update
      </Button>
    </div>
  )
}

const MockConsentElement = () => {
  const { consented, setConsented } = useContext(ConsentContext); 

  return (
      <div>
        {consented ? "Consent Accepted" : "Consent Rejected"}
        <Button 
          onClick={() => setConsented(true)}
        >
          Update
        </Button>
      </div>
  )
}

const MockConsentContext = () => {
  return (
    <ConsentProvider>
      <MockConsentElement />
    </ConsentProvider>
  )
}


describe("Consent Context ", () =>{
  it('should be defined', () => {
      expect(MockConsentContext).toBeDefined()
  })

  it("should match existing snapshot", () => {
    expect(render(<MockConsentContext />).asFragment()).toMatchSnapshot()
  })

  it("Should default to false", async () => {
    await act(async () => {
      render(<MockConsentContext />);  
    })
    expect(screen.getByText("Consent Rejected")).toBeTruthy();
  });

  it("Should default to false without provider", async () => {
    await act(async () => {
      render(<MockNonProvider />);  
    })
    expect(screen.getByText("Consent Rejected")).toBeTruthy();
  });

  it("Should not change value with default values", async () => {
    await act(async () => {
      render(<MockNonProvider />);  
    })
    const updateButton = screen.getByRole('button', {name: /Update/i})
    await act(async () => {
        fireEvent.click(updateButton)
    })
    expect(screen.getByText("Consent Rejected")).toBeTruthy();
  });

  it("Should update when button clicked", async () => {
    await act(async () => {
      render(<MockConsentContext />);  
    })
    const updateButton = screen.getByRole('button', {name: /Update/i})
    await act(async () => {
        fireEvent.click(updateButton)
    })
    expect(screen.getByText("Consent Accepted")).toBeTruthy();
  });

  it("Should default to consented if user not in target country", async () => {
    mockKeycloak.authenticated = true; 
    await act(async () => {
      render(<MockConsentContext />);  
    })
    expect(screen.getByText("Consent Accepted")).toBeTruthy();
  });

  it("Should default to not consented if user is in target country", async () => {
    mockKeycloak.profile.attributes.agency = ["AUS"]
    mockKeycloak.authenticated = true; 
    contextStatus = true; 
    await act(async () => {
      render(<MockConsentContext />);  
    })
    expect(screen.getByText("Consent Rejected")).toBeTruthy();
  });
})
