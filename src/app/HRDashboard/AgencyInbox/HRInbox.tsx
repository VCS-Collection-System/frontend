import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  MenuContent, 
  MenuList, 
  MenuItem, 
  Card, 
  MenuGroup 
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import CardWithTitle from '@app/Components/CardWithTitle';
import authaxios from "@app/utils/axiosInterceptor";
import { GenericResponseModal } from '@app/Components/FeedbackModals';
import { useKeycloak } from "@react-keycloak/web";
import { getEmployeeInfo } from '@app/utils/getEmployeeInfo';
import { 
  PAM_TASK_URL, 
  RESERVED_TASK_URL, 
  INPROGRESS_TASK_URL,
  ALL_TASK_URL
} from "@app/utils/constants"

const HRInbox: React.FunctionComponent = () => {
  const [activeItem, setActiveItem] = useState('0'); 
  const [inboxList, setInboxList] = useState([]);
  const [refreshData, setRefreshData] = useState(false)
  const [inProgressList, setInProgressList] = useState([]);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false); 
  const history = useHistory();
  const { keycloak } = useKeycloak();
  const employee = getEmployeeInfo(keycloak);
  const reviewerID = employee.id;

  useEffect(() => {
    authaxios.get(RESERVED_TASK_URL + reviewerID)
    .then(resOne => {
      authaxios.get(INPROGRESS_TASK_URL + reviewerID)
      .then(resTwo => {
        setInProgressList(resOne.data["task-summary"].concat(resTwo.data["task-summary"]))
      })
    })

    authaxios.get(ALL_TASK_URL)
    .then(res => {
      setInboxList(res.data["task-summary"])
    })
  }, [refreshData, reviewerID]);

  const onSelect = (event, itemId) => {
    const itemIndex = parseInt(itemId.split(':')[1]);
    const taskUrl = PAM_TASK_URL + itemIndex + "/states"

    const headers = {
      'Content-Type': 'application/json'
    }

    if(itemId.includes('INPROGRESS')) {
      sessionStorage.setItem("approveId", "" + itemIndex);
      setActiveItem(itemId)
      history.push('/hrdashboard/review');
    }
    else {
      authaxios.put(taskUrl + "/claimed", {}, {
        headers: headers
      })
      .then(() => {
        sessionStorage.setItem("approveId", "" + itemIndex);
        setActiveItem(itemId)
        history.push('/hrdashboard/review');
      })
      .catch(() => {
        setIsClaimModalOpen(true)
      })
    }
  }

  const convertToDate = (dateString) => {
    const date = parseInt(dateString);
    const d = new Date(date);
    return  ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + "-" + d.getFullYear();
  }

  const closeAndRefresh = () => {
    setRefreshData(!refreshData); 
    setIsClaimModalOpen(false);
  }

  return (
    <Card isRounded>
      <GenericResponseModal
        isModalOpen={isClaimModalOpen}
        setIsModalOpen={closeAndRefresh}
        title="Task Was Claimed"
        message="Please select another one."
      />
      <CardWithTitle title="Inbox" info="Select an item below to review" />
      <Menu onSelect={onSelect} activeItemId={activeItem}>
        <MenuContent menuHeight="350px">
          <MenuGroup label="Your In-Progress Tasks">
            <MenuList id="in-progress-list" className="indentList">
              {
                inProgressList.length == 0 &&
                <MenuItem key="empty" itemId="empty" isDisabled>
                  [No In-Progress Tasks]
                </MenuItem>
              }
              {
                inProgressList.length > 0 &&
                  inProgressList.map(item => (
                    <MenuItem 
                    key={item["task-id"]} 
                    data-id={item["task-id"]}
                    description={"Submitted on: " + convertToDate(item["task-created-on"]["java.util.Date"])}
                    itemId={"INPROGRESS:" + item["task-id"]}>
                      {item["task-description"]}
                    </MenuItem>
                  ))
              }
            </MenuList>
          </MenuGroup>
          <MenuGroup label="All Available Tasks">
            <MenuList id="all-available-list" className="indentList">
              {
                inboxList.length == 0 &&
                <MenuItem key="empty" itemId="empty" isDisabled>
                  [No Available Tasks]
                </MenuItem>
              }
              {
                inboxList.length > 0 &&
                  inboxList.map(item => (
                    <MenuItem 
                    key={item["task-id"]}
                    data-id={item["task-id"]} 
                    description={"Submitted on: " + convertToDate(item["task-created-on"]["java.util.Date"])} 
                    itemId={"READY:" + item["task-id"]}>
                      {item["task-description"]}
                    </MenuItem>
                  ))
              }
            </MenuList>
          </MenuGroup>
        </MenuContent>
      </Menu>
    </Card>
  );
};

export { HRInbox };
