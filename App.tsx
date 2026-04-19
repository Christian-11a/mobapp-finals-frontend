import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContextProvider } from './src/context/AuthContext';
import { BookingProvider } from './src/context/BookingContext';
import { RoomProvider } from './src/context/RoomContext';
import { ToastProvider } from './src/context/ToastContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import ToastContainer from './src/components/Toast/ToastContainer';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <RoomProvider>
          <BookingProvider>
            <NotificationProvider>
              <ToastProvider>
                <StatusBar style="light" />
                <AppNavigator />
                <ToastContainer />
              </ToastProvider>
            </NotificationProvider>
          </BookingProvider>
        </RoomProvider>
      </AuthContextProvider>
    </SafeAreaProvider>
  );
}
