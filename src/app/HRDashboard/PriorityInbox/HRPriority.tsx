import React, { useState } from 'react';
import { Menu, MenuContent, MenuGroup, MenuList, MenuItem, Card } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
import CardWithTitle from '@app/Components/CardWithTitle';
import { useEffect } from 'react';
import authaxios from "@app/utils/axiosInterceptor";
import { dateConvert } from "@app/utils/utils";
import { PRIORITY_URL } from "@app/utils/constants"; 

const HRPriority: React.FunctionComponent = () => {
  const [activeItem, setActiveItem] = useState('0');
  const [inboxList, setInboxList] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [positiveList, setPositiveList] = useState<Record<string, any>[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recoveryList, setRecoveryList] = useState<Record<string, any>[]>([]);
  const history = useHistory();

  function onSelect(event, itemId) {
    sessionStorage.setItem("priorityData", JSON.stringify(inboxList.find(item => item['id'] === itemId)));
    setActiveItem(itemId);
    history.push('/hrdashboard/priorityreview');
  }

  useEffect(() => {
    const headers = {
      'Accept': 'application/json'
    }

    authaxios.get(PRIORITY_URL, {
      headers: headers
    })
    .then(res => {
      setInboxList(res['data']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const positiveItems: Record<string, any>[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recoveryItems: Record<string, any>[] = [];
      res['data'].forEach(item => {
        if(item.submissionType === "recovery") {
          recoveryItems.push(item);
        } else {
          positiveItems.push(item);
        }
      });
      setPositiveList(positiveItems);
      setRecoveryList(recoveryItems);
    })
    .catch((res) => {res})
  }, []);

  return (
    <Card isRounded className="warningText">
      <CardWithTitle title="Priority Inbox" info="Select an item below to review" />
      <Menu onSelect={onSelect} activeItemId={activeItem}>
        <MenuContent menuHeight="350px">
          <MenuGroup label="Positive Tests">
              <MenuList id="positive-test-list" className="indentList">
              {
                positiveList.length == 0 &&
                <MenuItem key="empty" itemId="empty" isDisabled>
                  [No Positive Tests]
                </MenuItem>
              }
              {
                positiveList.length > 0 &&
                  positiveList.map((item, index) => (
                    <MenuItem key={index} description={"Test Date: " + dateConvert(item['covidTestDate'])} itemId={item['id']}>
                      {item['employeeId']}
                    </MenuItem>
                  ))
              }
            </MenuList>
          </MenuGroup>
          <MenuGroup label="Certificates of Recovery">
              <MenuList id="recovery-list" className="indentList">
              {
                recoveryList.length == 0 &&
                <MenuItem key="empty" itemId="empty" isDisabled>
                  [No Certificates of Recovery]
                </MenuItem>
              }
              {
                recoveryList.length > 0 &&
                  recoveryList.map((item, index) => (
                    <MenuItem key={index} description={"Test Date: " + dateConvert(item['covidTestDate'])} itemId={item['id']}>
                      {item['employeeId']}
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

export { HRPriority };