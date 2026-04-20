import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AdminTabParamList } from '../types';

import AdminDashboardScreen from '../screens/AdminDashboard/AdminDashboardScreen';
import AdminRoomManagementScreen from '../screens/AdminRoomManagement/AdminRoomManagementScreen';
import AdminBookingManagementScreen from '../screens/AdminBookingManagement/AdminBookingManagementScreen';
import AdminReviewModerationScreen from '../screens/AdminReviewModeration/AdminReviewModerationScreen';
import AdminProfileScreen from '../screens/AdminProfile/AdminProfileScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const TAB_ICONS: Record<string, { focused: string; outline: string }> = {
  Dashboard: { focused: 'grid', outline: 'grid-outline' },
  AdminRooms: { focused: 'bed', outline: 'bed-outline' },
  AdminBookings: { focused: 'list', outline: 'list-outline' },
  AdminReviews: { focused: 'star', outline: 'star-outline' },
  AdminProfile: { focused: 'person', outline: 'person-outline' },
};

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icon = TAB_ICONS[route.name];
          const iconName = focused ? icon.focused : icon.outline;
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: '#b0b8c1',
        tabBarStyle: {
          borderTopColor: '#f0ede8',
          backgroundColor: COLORS.white,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: COLORS.navy,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.07,
          shadowRadius: 24,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="AdminRooms" component={AdminRoomManagementScreen} options={{ title: 'Rooms' }} />
      <Tab.Screen name="AdminBookings" component={AdminBookingManagementScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="AdminReviews" component={AdminReviewModerationScreen} options={{ title: 'Reviews' }} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
