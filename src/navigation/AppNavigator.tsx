import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { RootStackParamList, MainTabParamList } from '../types';

import SignInScreen from '../screens/SignIn/SignInScreen';
import RegisterScreen from '../screens/Register/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import RoomsScreen from '../screens/Rooms/RoomsScreen';
import RoomDetailScreen from '../screens/RoomDetail/RoomDetailScreen';
import MyBookingsScreen from '../screens/MyBookings/MyBookingsScreen';
import BookingDetailScreen from '../screens/BookingDetail/BookingDetailScreen';
import MoreScreen from '../screens/More/MoreScreen';
import AboutUsScreen from '../screens/AboutUs/AboutUsScreen';
import FAQScreen from '../screens/FAQ/FAQScreen';
import PoliciesScreen from '../screens/Policies/PoliciesScreen';
import AdminNavigator from './AdminNavigator';
import EditProfileScreen from '../screens/EditProfile/EditProfileScreen';
import BookingSuccessScreen from '../screens/BookingSuccess/BookingSuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function GuestTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'home', Rooms: 'bed', MyBookings: 'calendar', More: 'menu',
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: { backgroundColor: COLORS.navy, borderTopColor: COLORS.navyLight },
        tabBarLabelStyle: { fontSize: 11 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rooms" component={RoomsScreen} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="More" component={MoreScreen} />
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
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : isAdmin ? (
          <Stack.Screen name="AdminTabs" component={AdminNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={GuestTabNavigator} />
            <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="Policies" component={PoliciesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
