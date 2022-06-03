import { useKeycloak } from "@react-keycloak/web";
import React, { useEffect, useState } from "react";
import { showFeature } from '@app/Components/Feature'

interface ConsentContextInterface {
  consented: boolean,
  setConsented: (boolean) => void;
}

export const ConsentContext = React.createContext<ConsentContextInterface>({consented: false, setConsented: () => ({})})

export const ConsentProvider: React.FunctionComponent = ({ children }) => {
  const [consented, setConsented] = useState(false); 
  const { keycloak } = useKeycloak();

  useEffect(() => {
    if(keycloak.authenticated && keycloak.profile) {
      showFeature("consentCheckbox", keycloak).then(config => {
        if(!config) {
          setConsented(true); 
        }
      });
    }
  }, [keycloak, keycloak.profile]);

  return (
    <ConsentContext.Provider 
      value={{
        consented: consented,
        setConsented: setConsented
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}
