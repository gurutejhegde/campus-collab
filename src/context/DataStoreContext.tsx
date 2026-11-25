import React, { createContext, useContext, useMemo } from 'react';
import { DataStore } from '../data/dataStore.interface';
import { DemoDataStore } from '../data/demoDataStore';

interface DataStoreContextType {
  dataStore: DataStore;
  resetDemoData: () => void;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

export const DataStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const demoStore = useMemo(() => new DemoDataStore(), []);

  const resetDemoData = () => {
    demoStore.resetData();
    window.location.reload();
  };

  return (
    <DataStoreContext.Provider
      value={{
        dataStore: demoStore,
        resetDemoData,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = (): DataStoreContextType => {
  const ctx = useContext(DataStoreContext);
  if (!ctx) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return ctx;
};
