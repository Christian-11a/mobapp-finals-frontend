import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SystemConfig } from '../types';
import { systemService } from '../services/systemService';

interface SystemContextType {
  config: SystemConfig;
  isLoading: boolean;
  updateConfig: (updates: Partial<SystemConfig>) => Promise<void>;
  getCurrencySymbol: () => string;
}

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
  isLoading: true,
  updateConfig: async () => {},
  getCurrencySymbol: () => '$',
});

export const SystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Real-time subscription to system configuration
    const unsubscribe = systemService.subscribeToConfig((newConfig) => {
      setConfig(newConfig);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateConfig = useCallback(async (updates: Partial<SystemConfig>) => {
    try {
      await systemService.updateConfig(updates);
      // Local state is updated automatically via the subscription in useEffect
    } catch (error) {
      console.error('[SystemContext] Failed to update config:', error);
      throw error;
    }
  }, []);

  const getCurrencySymbol = useCallback(() => {
    return systemService.getCurrencySymbol(config.currency);
  }, [config.currency]);

  const value = useMemo(() => ({
    config,
    isLoading,
    updateConfig,
    getCurrencySymbol
  }), [config, isLoading, updateConfig, getCurrencySymbol]);

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
