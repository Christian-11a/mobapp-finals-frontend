import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { RootStackParamList, MainTabParamList } from '../types';

import LandingScreen from '../screens/Landing/LandingScreen';
import SignInScreen from '../screens/SignIn/SignInScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import RoomsScreen from '../screens/Rooms/RoomsScreen';
import RoomDetailScreen from '../screens/RoomDetail/RoomDetailScreen';
import BookingStep1Screen from '../screens/BookingStep1/BookingStep1Screen';
import BookingStep2Screen from '../screens/BookingStep2/BookingStep2Screen';
import MyBookingsScreen from '../screens/MyBookings/MyBookingsScreen';
import BookingDetailScreen from '../screens/BookingDetail/BookingDetailScreen';
import MoreScreen from '../screens/More/MoreScreen';
import AboutUsScreen from '../screens/AboutUs/AboutUsScreen';
import FAQScreen from '../screens/FAQ/FAQScreen';
import PoliciesScreen from '../screens/Policies/PoliciesScreen';
import SecurityScreen from '../screens/Security/SecurityScreen';
import PaymentMethodsScreen from '../screens/PaymentMethods/PaymentMethodsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import NotificationSettingsScreen from '../screens/Notifications/NotificationSettingsScreen';
import SavedRoomsScreen from '../screens/SavedRooms/SavedRoomsScreen';
import AdminNavigator from './AdminNavigator';
import EditProfileScreen from '../screens/EditProfile/EditProfileScreen';
import BookingSuccessScreen from '../screens/BookingSuccess/BookingSuccessScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function GuestTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'bed-outline', MyBookings: 'calendar-outline', More: 'person-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: '#b0b8c1',
        tabBarStyle: { 
          backgroundColor: COLORS.white, 
          borderTopWidth: 1,
          borderTopColor: '#f0ede8',
          height: Platform.OS === 'ios' ? 88 : 68, 
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          elevation: 8,
          shadowColor: '#0a1e3d',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.07,
          shadowRadius: 20,
        },
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Rooms' }} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, navigationBarHidden: true }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="Policies" component={PoliciesScreen} />
          </>
        ) : isAdmin ? (
          <Stack.Screen name="AdminTabs" component={AdminNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={GuestTabNavigator} />
            <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
            <Stack.Screen name="BookingStep1" component={BookingStep1Screen} />
            <Stack.Screen name="BookingStep2" component={BookingStep2Screen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="SavedRooms" component={SavedRoomsScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="Policies" component={PoliciesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
