import React, { createContext, useContext, useState, useCallback } from 'react';

interface TabBarContextType {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType>({
  visible: true,
  setVisible: () => {},
});

export const TabBarProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(true);
  return (
    <TabBarContext.Provider value={{ visible, setVisible }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => useContext(TabBarContext);
