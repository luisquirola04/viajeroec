import React, { createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {

  const [refreshAction, setRefreshAction] = useState(null);
  const [loading, setLoading] = useState(false);

 
  const triggerRefresh = async () => {
    if (refreshAction) {
      setLoading(true);
      await refreshAction(); 
      setLoading(false);
    }
  };


  const registerRefreshHandler = (handler) => {
    setRefreshAction(() => handler);
  };

  return (
    <RefreshContext.Provider value={{ triggerRefresh, registerRefreshHandler, loading }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);