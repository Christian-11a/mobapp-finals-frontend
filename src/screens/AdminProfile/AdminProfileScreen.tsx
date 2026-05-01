import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useRooms } from '../../context/RoomContext';
import { COLORS } from '../../constants/colors';
import { styles } from './AdminProfileStyle';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '@react-navigation/native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  icon: IoniconsName;
  label: string;
  subLabel: string;
  onPress: () => void;
}

interface SectionProps {
  title: string;
  items: MenuItem[];
}

const MenuSection = ({ title, items }: SectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionHeader}>{title}</Text>
    <View style={styles.menuCard}>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={item.label} 
          style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]}
          onPress={item.onPress}
          activeOpacity={0.6}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={16} color={COLORS.gold} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuSubLabel}>{item.subLabel}</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color="#b0b8c1" />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();
  const { bookings, reviews } = useBookings();
  const { rooms } = useRooms();
  const { showToast } = useToast();
  const navigation = useNavigation<any>();

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const handleSoon = (feature: string) => {
    showToast(`${feature} is coming soon!`, 'info');
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully.', 'info');
  };

  const accountItems: MenuItem[] = [
    { 
      icon: 'person-outline', 
      label: 'Personal Information', 
      subLabel: 'Name, email, phone', 
      onPress: () => navigation.navigate('EditProfile') 
    },
    { 
      icon: 'shield-checkmark-outline', 
      label: 'Password & Security', 
      subLabel: 'Change password, 2FA', 
      onPress: () => navigation.navigate('Security') 
    },
    { 
      icon: 'notifications-outline', 
      label: 'Notifications', 
      subLabel: 'System alerts & reports', 
      onPress: () => navigation.navigate('NotificationSettings') 
    },
  ];

  const adminItems: MenuItem[] = [
    { 
      icon: 'grid-outline', 
      label: 'Dashboard', 
      subLabel: 'Analytics & overview', 
      onPress: () => navigation.navigate('Dashboard') 
    },
    { 
      icon: 'bed-outline', 
      label: 'Room Management', 
      subLabel: 'Manage room listings', 
      onPress: () => navigation.navigate('AdminRooms') 
    },
    { 
      icon: 'list-outline', 
      label: 'Bookings', 
      subLabel: 'View all reservations', 
      onPress: () => navigation.navigate('AdminBookings') 
    },
    { 
      icon: 'star-outline', 
      label: 'Guest Reviews', 
      subLabel: 'Moderate & respond', 
      onPress: () => navigation.navigate('AdminReviews') 
    },
  ];

  const systemItems: MenuItem[] = [
    { 
      icon: 'settings-outline', 
      label: 'System Settings', 
      subLabel: 'App configuration', 
      onPress: () => navigation.navigate('SystemSettings') 
    },
    { 
      icon: 'book-outline', 
      label: 'Help & Documentation', 
      subLabel: 'Admin guides', 
      onPress: () => navigation.navigate('AdminHelp') 
    },
    { 
      icon: 'document-text-outline', 
      label: 'Terms & Privacy', 
      subLabel: 'Legal information', 
      onPress: () => navigation.navigate('Policies') 
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Dark Header */}
      <View style={styles.header}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        
        <Text style={styles.headerTitle}>Profile</Text>
        
        <View style={styles.profileRow}>
          <View style={[styles.avatar, user?.avatarUrl ? { padding: 0, overflow: 'hidden' } : null]}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={10} color={COLORS.gold} />
                <Text style={styles.adminBadgeText}>Administrator</Text>
              </View>
              <Text style={styles.sinceText}>Since 2024-01-01</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Floating Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{rooms.length}</Text>
          <Text style={styles.statLabel}>Rooms</Text>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: '#f0ede8' }} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: '#f0ede8' }} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <MenuSection title="Admin Account" items={accountItems} />
        <MenuSection title="Administration" items={adminItems} />
        <MenuSection title="System" items={systemItems} />

        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.red} style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>LuxeStay v1.0.0 · Admin Panel</Text>
        </View>
      </ScrollView>
    </View>
  );
}
