import * as React from "react";
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom";
import { accessibleRouteChangeHandler } from "@app/utils/utils";
import { Eula } from "@app/Pages/Eula";
import { Profile } from "@app/AttestWorkflow/Profile";
import { HRDashboard } from "@app/HRDashboard/HRDashboard";
import { AttestMenu } from "./AttestWorkflow/AttestMenu";
import { SubmitVax } from "@app/AttestWorkflow/SubmitVax";
import { SubmitTest } from "@app/AttestWorkflow/SubmitTest";
import { ReviewVax } from "@app/AttestWorkflow/ReviewVax";
import { ReviewTest } from "@app/AttestWorkflow/ReviewTest";
import { Thankyou } from "@app/AttestWorkflow/Thankyou";
import { NotFound } from "@app/Pages/NotFound";
import { Contact } from "./Pages/Contact";
import { Privacy } from "./Pages/Privacy";
import { useDocumentTitle } from "@app/utils/useDocumentTitle";
import { InboxReview } from "./HRDashboard/AgencyInbox/InboxReview";
import { CaseHistory } from "./HRDashboard/Search/CaseHistory";
import { PriorityReview } from "./HRDashboard/PriorityInbox/PriorityReview";
import { Settings } from "./AttestWorkflow/Settings";
import {
  LastLocationProvider,
  useLastLocation,
} from "react-router-last-location";
import { 
  Bullseye, 
  Card, 
  CardBody, 
  Spinner 
} from "@patternfly/react-core";
import { BLOCKED_COUNTRIES } from "@app/utils/constants";
import { ConsentContext } from "./context";

let routeFocusTimer: number;
export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  routes?: undefined; //NOSONAR
  requireAuthentication?: boolean;
  requireConsent?: boolean;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    component: Profile,
    exact: true,
    label: "Profile",
    path: "/profile",
    title: "VCS | Profile ",
    requireAuthentication: true
  },
  {
    component: AttestMenu,
    exact: true,
    label: "AttestMenu",
    path: "/attestmenu",
    title: "VCS | Attest ",
    requireAuthentication: true
  },
  {
    component: SubmitVax,
    exact: true,
    label: "Vax",
    path: "/attest/vax",
    title: "VCS | Attest | Vax",
    requireAuthentication: true
  },
  {
    component: SubmitTest,
    exact: true,
    label: "SubmitTest",
    path: "/attest/test",
    title: "VCS | Attest | Test",
    requireAuthentication: true
  },
  {
    component: ReviewVax,
    exact: true,
    label: "ReviewVax",
    path: "/attest/review/vax",
    title: "VCS | Attest | Vax | Review",
    requireAuthentication: true,
    requireConsent: true
  },
  {
    component: ReviewTest,
    exact: true,
    label: "ReviewTest",
    path: "/attest/review/test",
    title: "VCS | Attest | Test | Review",
    requireAuthentication: true
  },
  {
    component: HRDashboard,
    exact: true,
    label: "HRDashboard",
    path: "/hrdashboard",
    title: "VCS | HR Verification",
    requireAuthentication: true
  },
  {
    component: InboxReview,
    exact: true,
    label: "InboxReview",
    path: "/hrdashboard/review",
    title: "VCS | HR Verification",
    requireAuthentication: true
  },
  {
    component: CaseHistory,
    exact: true,
    label: "CaseHistory",
    path: "/hrdashboard/history",
    title: "VCS | HR Verification",
    requireAuthentication: true
  },
  {
    component: PriorityReview,
    exact: true,
    label: "PriorityReview",
    path: "/hrdashboard/priorityreview",
    title: "VCS | COVID Result Review",
    requireAuthentication: true
  },
  {
    component: Settings,
    exact: true,
    label: "Settings",
    path: "/settings",
    title: "VCS | Settings",
    requireAuthentication: true
  },
  {
    component: Thankyou,
    exact: true,
    label: "Thankyou",
    path: "/thankyou",
    title: "VCS | Thank You",
    requireAuthentication: true
  },
  {
    component: Contact,
    exact: true,
    label: "Contact",
    path: "/contact",
    title: "VCS | Contact",
  },
  {
    component: Privacy,
    exact: true,
    label: "Privacy",
    path: "/privacy",
    title: "VCS | Privacy",
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({
  component: Component,
  isAsync = false,
  title,
  ...rest
}: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return <Component {...rest} {...routeProps} />;
  }

  return <Route render={routeWithTitle} {...rest} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [
    ...flattened,
    ...(route.routes ? route.routes : [route]),
  ],
  [] as IAppRoute[]
);

const AppRoutes = ({authenticated, login, loadingProfile, userCountry}): React.ReactElement => {  
  const { consented } = React.useContext(ConsentContext); 

    if(authenticated) {
      if(loadingProfile) {
        return (
          <Card isRounded>
            <CardBody>
              <Bullseye>
                <Spinner />
              </Bullseye>
            </CardBody>
          </Card>
        )
      }
      else if(!BLOCKED_COUNTRIES.includes(userCountry)) {
        return (
          <LastLocationProvider>
            <Switch>
              <Route
                exact
                path={"/"}
                render={() => <Redirect to={{ pathname: '/profile' }} />}
                title="VCS | End User License Agreement"
              />
              {flattenedRoutes.map(
                ({ path, exact, component, title, isAsync, requireConsent }, idx) => {
                  if(!requireConsent) {
                    return (
                      <RouteWithTitleUpdates
                        path={path}
                        exact={exact}
                        component={component}
                        key={idx}
                        title={title}
                        isAsync={isAsync}
                      />
                    )
                  }
                  else {
                    if(consented) {
                      return (
                        <RouteWithTitleUpdates
                          path={path}
                          exact={exact}
                          component={component}
                          key={idx}
                          title={title}
                          isAsync={isAsync}
                        />
                      )
                    }

                    return null; 
                  }
                }
              )}
              <PageNotFound title="404 Page Not Found" />
            </Switch>
          </LastLocationProvider>
        )
      }
    }

    return (
      <LastLocationProvider>
        <Switch>
          {flattenedRoutes.map(
            ({ path, exact, component, title, isAsync, requireAuthentication }, idx) => {
              if(!requireAuthentication) {
                return (
                  <RouteWithTitleUpdates
                    path={path}
                    exact={exact}
                    component={component}
                    key={idx}
                    title={title}
                    isAsync={isAsync}
                  />
                )
              }
            }
          )}
          {authenticated ? (<Profile />) : (<Eula login={login} />)}
        </Switch>
      </LastLocationProvider>
    )
  };

export { AppRoutes, routes };
