import React, { createContext, useContext, useState, useEffect } from 'react';

interface SystemConfig {
  hotelName: string;
  currency: string;
  taxRate: number;
  checkInTime: string;
  checkOutTime: string;
  autoConfirmBookings: boolean;
}

interface SystemContextType {
  config: SystemConfig;
  updateConfig: (updates: Partial<SystemConfig>) => void;
  getCurrencySymbol: () => string;
}

const SYMBOLS: Record<string, string> = {
  USD: '$',
  PHP: '₱',
  EUR: '€',
  GBP: '£',
};

const DEFAULT_CONFIG: SystemConfig = {
  hotelName: 'LuxeStay Grand Hotel',
  currency: 'USD',
  taxRate: 12,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  autoConfirmBookings: false,
};

const SystemContext = createContext<SystemContextType>({
  config: DEFAULT_CONFIG,
  updateConfig: () => {},
  getCurrencySymbol: () => '$',
});

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

  const updateConfig = (updates: Partial<SystemConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const getCurrencySymbol = () => SYMBOLS[config.currency] || '$';

  return (
    <SystemContext.Provider value={{ config, updateConfig, getCurrencySymbol }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
