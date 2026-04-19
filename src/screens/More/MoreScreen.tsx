import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import styles from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;
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

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { bookings, reviews } = useBookings();
  const { showToast } = useToast();

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  
  // Real stats calculation
  const userStats = useMemo(() => {
    const userBookings = bookings.filter(b => b.userId === user?.id);
    const userReviews = reviews.filter(r => r.userId === user?.id);
    const totalSpent = userBookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      bookingCount: userBookings.length,
      reviewCount: userReviews.length,
      totalSpent: totalSpent.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    };
  }, [bookings, reviews, user?.id]);

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully.', 'info');
  };

  const showPlaceholder = (feature: string) => {
    showToast(`${feature} is coming soon!`, 'info');
  };

  const accountItems: MenuItem[] = [
    { 
      icon: 'person-outline', 
      label: 'Personal Information', 
      subLabel: 'Name, email, phone', 
      onPress: () => navigation.navigate('EditProfile') 
    },
    { 
      icon: 'card-outline', 
      label: 'Payment Methods', 
      subLabel: 'Saved cards & billing', 
      onPress: () => navigation.navigate('PaymentMethods') 
    },
    { 
      icon: 'notifications-outline', 
      label: 'Notifications', 
      subLabel: 'Email & push preferences', 
      onPress: () => navigation.navigate('NotificationSettings') 
    },
  ];

  const preferenceItems: MenuItem[] = [
    { 
      icon: 'heart-outline', 
      label: 'Saved Rooms', 
      subLabel: 'Your wishlist', 
      onPress: () => navigation.navigate('SavedRooms') 
    },
    { 
      icon: 'shield-checkmark-outline', 
      label: 'Password & Security', 
      subLabel: 'Change password, 2FA', 
      onPress: () => navigation.navigate('Security') 
    },
    { 
      icon: 'help-circle-outline', 
      label: 'Help & Support', 
      subLabel: 'FAQs and contact us', 
      onPress: () => navigation.navigate('FAQ') 
    },
    { 
      icon: 'document-text-outline', 
      label: 'Terms & Privacy', 
      subLabel: 'Legal information', 
      onPress: () => navigation.navigate('Policies') 
    },
    { 
      icon: 'information-circle-outline', 
      label: 'About Us', 
      subLabel: 'Learn more about LuxeStay', 
      onPress: () => navigation.navigate('AboutUs') 
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>Member</Text>
              </View>
              <Text style={styles.sinceText}>Since 2024-03-15</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Floating Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.bookingCount}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: '#f0ede8' }} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.reviewCount}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: '#f0ede8' }} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <MenuSection title="Account" items={accountItems} />
        <MenuSection title="Preferences" items={preferenceItems} />

        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.red} style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>LuxeStay v1.0.0 · Hotel Booking</Text>
        </View>
      </ScrollView>
    </View>
  );
}
