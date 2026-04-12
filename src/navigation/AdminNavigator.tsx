import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AdminTabParamList } from '../types';

import AdminDashboardScreen from '../screens/AdminDashboard/AdminDashboardScreen';
import AdminRoomManagementScreen from '../screens/AdminRoomManagement/AdminRoomManagementScreen';
import AdminBookingManagementScreen from '../screens/AdminBookingManagement/AdminBookingManagementScreen';
import AdminReviewModerationScreen from '../screens/AdminReviewModeration/AdminReviewModerationScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Dashboard: 'grid',
  AdminRooms: 'bed',
  AdminBookings: 'calendar',
  AdminReviews: 'star',
};

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name] as any} size={size} color={color} />
        ),
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: { backgroundColor: COLORS.navy, borderTopColor: COLORS.navyLight },
        tabBarLabelStyle: { fontSize: 11 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="AdminRooms" component={AdminRoomManagementScreen} options={{ title: 'Rooms' }} />
      <Tab.Screen name="AdminBookings" component={AdminBookingManagementScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="AdminReviews" component={AdminReviewModerationScreen} options={{ title: 'Reviews' }} />
    </Tab.Navigator>
  );
}
