import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContextProvider } from './src/context/AuthContext';
import { BookingProvider } from './src/context/BookingContext';
import { RoomProvider } from './src/context/RoomContext';
import { ToastProvider } from './src/context/ToastContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { SystemProvider } from './src/context/SystemContext';
import AppNavigator from './src/navigation/AppNavigator';
import ToastContainer from './src/components/Toast/ToastContainer';
import ErrorBoundary from './src/components/ErrorBoundary/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner/OfflineBanner';

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SystemProvider>
          <AuthContextProvider>
            <RoomProvider>
              <BookingProvider>
                <NotificationProvider>
                  <ToastProvider>
                    <StatusBar style="light" />
                    <OfflineBanner />
                    <AppNavigator />
                    <ToastContainer />
                  </ToastProvider>
                </NotificationProvider>
              </BookingProvider>
            </RoomProvider>
          </AuthContextProvider>
        </SystemProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
