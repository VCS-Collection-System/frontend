import React, { useState } from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { Card, CardBody, Bullseye, Spinner } from "@patternfly/react-core";
import { BrowserRouter as Router } from "react-router-dom";
import { AppLayout } from "@app/Components/AppLayout";
import { AppRoutes } from "@app/routes";
import { useKeycloak } from '@react-keycloak/web';
import { ConsentProvider } from "@app/context";
import "@app/app.css";

const App: React.FunctionComponent = () => {
  const { initialized, keycloak } = useKeycloak();
  const [loggedIn, isLoggedIn] = useState(sessionStorage.getItem("loggedIn"));
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userCountry, setUserCountry] = useState(""); 

  if(sessionStorage.getItem("loggingIn") && keycloak.authenticated) {
    login();
  }

  if(keycloak.authenticated && loggedIn) {
    keycloak.loadUserProfile().then((profile) => {
      setLoadingProfile(false);
      if(typeof(profile?.attributes.agency) !== "undefined") {
        setUserCountry(profile?.attributes.agency[0]);
      }
    });
  }

  const login = () => {
    if(!keycloak.authenticated) {
      sessionStorage.setItem("loggingIn", true);
      keycloak.login();
    }
    sessionStorage.setItem("loggedIn", true);
    sessionStorage.removeItem("loggingIn");
    isLoggedIn(true);
  }

  const loading = (init) => (
    init ?
      <AppRoutes 
        authenticated={loggedIn && keycloak.authenticated}
        login={login}
        loadingProfile={loadingProfile}
        userCountry={userCountry}
      />
      :
      <Card isRounded>
        <CardBody>
          <Bullseye>
            <Spinner />
          </Bullseye>
        </CardBody>
      </Card>
  )
  return (
    <ConsentProvider>
      <Router>
        <AppLayout loggedIn={loggedIn}>
          {loading(initialized)}
        </AppLayout>
      </Router>
    </ConsentProvider>
  )
};

export default App;