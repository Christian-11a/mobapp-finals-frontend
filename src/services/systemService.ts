import { systemRepository } from '../repositories/systemRepository';
import { SystemConfig } from '../types';
import { Unsubscribe } from 'firebase/auth';

const SYMBOLS: Record<string, string> = {
  USD: '$',
  PHP: '₱',
  EUR: '€',
  GBP: '£',
};

export const systemService = {
  /**
   * Fetches the current system configuration
   */
  getConfig: async (): Promise<SystemConfig> => {
    const config = await systemRepository.getSystemConfig();
    if (!config) {
      throw new Error('System configuration not found.');
    }
    return config;
  },

  /**
   * Updates the global system configuration
   * Only accessible by Admins (enforced by Firestore Rules in Phase 7)
   */
  updateConfig: async (updates: Partial<SystemConfig>): Promise<void> => {
    // Validation
    if (updates.taxRate !== undefined && (updates.taxRate < 0 || updates.taxRate > 100)) {
      throw new Error('Tax rate must be between 0 and 100.');
    }

    const timeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
    if (updates.checkInTime && !timeRegex.test(updates.checkInTime)) {
      throw new Error('Invalid check-in time format. Use HH:mm.');
    }
    if (updates.checkOutTime && !timeRegex.test(updates.checkOutTime)) {
      throw new Error('Invalid check-out time format. Use HH:mm.');
    }

    await systemRepository.updateSystemConfig(updates);
  },

  /**
   * Real-time subscription to system configuration
   */
  subscribeToConfig: (callback: (config: SystemConfig) => void): Unsubscribe => {
    return systemRepository.subscribeToSystemConfig(callback);
  },

  /**
   * Utility to get currency symbol
   */
  getCurrencySymbol: (currency: string): string => {
    return SYMBOLS[currency] || '$';
  }
};
