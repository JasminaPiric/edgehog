/*
  This file is part of Edgehog.

  Copyright 2021 - 2025 SECO Mind Srl

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  SPDX-License-Identifier: Apache-2.0
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Nav from "react-bootstrap/Nav";
import NavItem from "react-bootstrap/NavItem";
import NavLink from "react-bootstrap/NavLink";
import _ from "lodash";

type EventKey = string;

type TabRef = {
  eventKey: EventKey;
  title: React.ReactNode;
};

type TabsContextValue = {
  activeKey: EventKey | undefined;
  registerTab: (tabRef: TabRef) => void;
  unregisterTab: (eventKey: EventKey) => void;
};

const defaultContextValue: TabsContextValue = {
  activeKey: undefined,
  registerTab: () => {},
  unregisterTab: () => {},
};

const TabsContext = createContext<TabsContextValue>(defaultContextValue);

type TabsProps = {
  children?: React.ReactNode;
  className?: string;
  defaultActiveKey?: EventKey;
  tabsOrder?: EventKey[];
};

const Tabs = ({
  children,
  className,
  defaultActiveKey,
  tabsOrder = [],
}: TabsProps) => {
  // We keep track of the user's explicit selection
  const [activeKey, setActiveKey] = useState<EventKey | undefined>(
    defaultActiveKey,
  );
  const [tabRefs, setTabRefs] = useState<TabRef[]>([]);

  // SIMPLIFIED: Just add the tab to the list. Don't worry about activeKey here.
  const registerTab = useCallback((tabRef: TabRef) => {
    setTabRefs((refs) => _.uniqBy([...refs, tabRef], "eventKey"));
  }, []);

  // SIMPLIFIED: Just remove the tab. Auto-selection is handled by derived state below.
  const unregisterTab = useCallback((eventKey: EventKey) => {
    setTabRefs((tabRefs) =>
      tabRefs.filter((tabRef) => tabRef.eventKey !== eventKey),
    );
  }, []);

  const sortedTabRefs = useMemo(() => {
    const tabRefsByEventKey = _.keyBy(tabRefs, "eventKey");
    const eventKeys = _.keys(tabRefsByEventKey);
    const sortedEventKeys = _.union(
      _.intersection(tabsOrder, eventKeys),
      eventKeys,
    );
    return sortedEventKeys.map((eventKey) => tabRefsByEventKey[eventKey]);
  }, [tabRefs, tabsOrder]);

  // DERIVED STATE: Calculate the actual active key during render.
  // 1. Check if the current state `activeKey` is valid (exists in the sorted list).
  const isCurrentKeyValid = sortedTabRefs.some(
    (tab) => tab.eventKey === activeKey,
  );

  // 2. Determine the final key to display:
  //    - If the state key is valid, use it.
  //    - If not, try the default key (only if it's currently in the list? Optional, but safer).
  //    - Finally, fallback to the first available tab.
  const currentActiveKey = isCurrentKeyValid
    ? activeKey
    : sortedTabRefs.length > 0
      ? sortedTabRefs[0].eventKey
      : undefined;

  const contextValue = useMemo(
    () => ({
      activeKey: currentActiveKey, // Pass the derived key to children
      registerTab,
      unregisterTab,
    }),
    [currentActiveKey, registerTab, unregisterTab],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>
        {sortedTabRefs.length > 0 && (
          <Nav role="tablist" as="ul" className="nav-tabs">
            {sortedTabRefs.map((tabRef) => (
              <NavItem key={tabRef.eventKey} as="li" role="presentation">
                <NavLink
                  as="button"
                  type="button"
                  // Use derived key for visual state
                  active={currentActiveKey === tabRef.eventKey}
                  // Update state on click
                  onClick={() => setActiveKey(tabRef.eventKey)}
                >
                  {tabRef.title}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        )}
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const useTabs = (): TabsContextValue => {
  const tabsContextValue = useContext(TabsContext);
  if (tabsContextValue == null) {
    throw new Error("TabsContext has not been Provided");
  }
  return tabsContextValue;
};

type TabProps = {
  children?: React.ReactNode;
  className?: string;
  eventKey: EventKey;
  title?: string;
};

const Tab = ({ children, className, eventKey, title }: TabProps) => {
  const { registerTab, unregisterTab, activeKey } = useTabs();

  useEffect(() => {
    registerTab({ eventKey, title });
    return () => unregisterTab(eventKey);
  }, [registerTab, unregisterTab, eventKey, title]);

  // This relies on the derived key passed down from context
  const isActive = activeKey === eventKey;

  if (!isActive) {
    return null;
  }

  return <div className={className}>{children}</div>;
};

export { Tab };

export default Tabs;
