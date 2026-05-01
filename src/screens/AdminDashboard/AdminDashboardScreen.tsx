import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useRooms } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { useSystem } from '../../context/SystemContext';
import { COLORS } from '../../constants/colors';
import { styles } from './AdminDashboardStyle';
import { useNavigation } from '@react-navigation/native';

const STATUS_CONFIG: Record<string, { bg: string; dot: string; text: string }> = {
  Pending: { bg: '#fff7ed', dot: '#f97316', text: '#f97316' },
  Confirmed: { bg: '#f0fdf4', dot: '#10b981', text: '#10b981' },
  Completed: { bg: '#eef2ff', dot: '#6366f1', text: '#6366f1' },
  Cancelled: { bg: '#fef2f2', dot: '#ef4444', text: '#ef4444' },
};

import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';

const SkeletonStatCard = () => (
  <View style={styles.statCard}>
    <View style={styles.statCardTop}>
      <SkeletonLoader width={32} height={32} borderRadius={8} />
      <SkeletonLoader width={40} height={16} borderRadius={4} />
    </View>
    <SkeletonLoader width="80%" height={24} style={{ marginTop: 12 }} />
    <SkeletonLoader width="50%" height={12} style={{ marginTop: 8 }} />
  </View>
);

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const { bookings, reviews, isLoading: bookingsLoading } = useBookings();
  const { rooms, isLoading: roomsLoading } = useRooms();
  const { config, isLoading: systemLoading } = useSystem();
  const { showToast } = useToast();
  const navigation = useNavigation<any>();

  const isLoading = bookingsLoading || roomsLoading || systemLoading;

  const [analyticsTab, setAnalyticsTab] = useState<'Revenue' | 'Bookings'>('Revenue');

  const handleAnalyticsToggle = (tab: 'Revenue' | 'Bookings') => {
    setAnalyticsTab(tab);
    showToast(`${tab} analytics is coming soon in the next update!`, 'info');
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((s, b) => s + b.totalPrice, 0);

  const occupiedRoomIds = new Set(
    bookings
      .filter(b =>
        b.status === 'Confirmed' &&
        new Date(b.checkInDate) <= today &&
        new Date(b.checkOutDate) > today,
      )
      .map(b => b.room.id),
  );
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRoomIds.size / rooms.length) * 100) : 0;
  const totalGuests = bookings.reduce((sum, b) => sum + (b.totalGuests || 0), 0); // Approx
  
  const statusCounts = {
    Pending: bookings.filter(b => b.status === 'Pending').length,
    Confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    Completed: bookings.filter(b => b.status === 'Completed').length,
    Cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
    .slice(0, 4);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SkeletonLoader width={120} height={14} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={200} height={28} />
        </View>
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </View>
          <View style={[styles.sectionBox, { height: 200 }]}>
            <SkeletonLoader width="100%" height="100%" borderRadius={24} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerDate}>
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <Text style={styles.headerTitle}>{config.hotelName}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.avatarContainer, user?.avatarUrl ? { padding: 0, overflow: 'hidden' } : null]} 
              onPress={() => navigation.navigate('AdminProfile')}
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={styles.avatarText}>{user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.roleContainer}>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.gold} />
              <Text style={styles.roleBadgeText}>Administrator</Text>
            </View>
            <Text style={styles.headerStatsText}>·  {rooms.length} rooms · {bookings.length} bookings</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stat Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statCardTop}>
                <View style={styles.statIconBox}>
                  <Ionicons name="cash-outline" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>+12.5%</Text>
                </View>
              </View>
              <Text style={styles.statValue}>${totalRevenue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statCardTop}>
                <View style={styles.statIconBox}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>+8.2%</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{bookings.length}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statCardTop}>
                <View style={styles.statIconBox}>
                  <Ionicons name="business-outline" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>+3.1%</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{occupancyRate}%</Text>
              <Text style={styles.statLabel}>Occupancy</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statCardTop}>
                <View style={styles.statIconBox}>
                  <Ionicons name="people-outline" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>+5.7%</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{totalGuests}</Text>
              <Text style={styles.statLabel}>Guests</Text>
            </View>
          </View>

          {/* Analytics */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sectionTitle}>Analytics</Text>
                <View style={styles.soonBadge}>
                  <Text style={styles.soonBadgeText}>Soon</Text>
                </View>
              </View>
              <View style={styles.analyticsToggle}>
                <TouchableOpacity 
                  style={analyticsTab === 'Revenue' ? styles.analyticsTabActive : styles.analyticsTabInactive}
                  onPress={() => handleAnalyticsToggle('Revenue')}
                >
                  <Text style={analyticsTab === 'Revenue' ? styles.analyticsTabTextActive : styles.analyticsTabTextInactive}>Revenue</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={analyticsTab === 'Bookings' ? styles.analyticsTabActive : styles.analyticsTabInactive}
                  onPress={() => handleAnalyticsToggle('Bookings')}
                >
                  <Text style={analyticsTab === 'Bookings' ? styles.analyticsTabTextActive : styles.analyticsTabTextInactive}>Bookings</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="bar-chart-outline" size={32} color={COLORS.gray300} />
              <Text style={{color: COLORS.gray400, marginTop: 8, fontSize: 12}}>Real-time charting is in development</Text>
            </View>
          </View>

          {/* Booking Status */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Booking Status</Text>
            </View>
            <View style={styles.bookingStatusGrid}>
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <View key={status} style={[styles.statusBlock, { backgroundColor: config.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: config.dot }]} />
                  <View>
                    <Text style={[styles.statusBlockLabel, { color: config.text }]}>{status}</Text>
                    <Text style={styles.statusBlockValue}>{statusCounts[status as keyof typeof statusCounts]}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AdminRooms', { openAdd: true })}>
                <Text style={styles.quickActionEmoji}>🏨</Text>
                <Text style={styles.quickActionTitle}>Add Room</Text>
                <Text style={styles.quickActionDesc}>Create new listing</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AdminBookings')}>
                <Text style={styles.quickActionEmoji}>📋</Text>
                <Text style={styles.quickActionTitle}>Bookings</Text>
                <Text style={styles.quickActionDesc}>{bookings.length} reservations</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AdminRooms')}>
                <Text style={styles.quickActionEmoji}>🛏️</Text>
                <Text style={styles.quickActionTitle}>Manage Rooms</Text>
                <Text style={styles.quickActionDesc}>{rooms.length} rooms listed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('AdminReviews')}>
                <Text style={styles.quickActionEmoji}>⭐</Text>
                <Text style={styles.quickActionTitle}>Reviews</Text>
                <Text style={styles.quickActionDesc}>{reviews.length} published</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Bookings */}
          <View style={{ marginBottom: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminBookings')}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
            <View>
              {recentBookings.length === 0 ? (
                <View style={styles.chartPlaceholder}>
                  <Text style={{color: COLORS.gray400}}>No recent bookings</Text>
                </View>
              ) : (
                recentBookings.map(b => {
                  const statusConfig = STATUS_CONFIG[b.status] || STATUS_CONFIG.Pending;
                  return (
                    <View key={b.id} style={styles.recentBookingCard}>
                      <Image source={{ uri: b.room.thumbnailPic?.url || b.room.photos?.[0]?.url || 'https://via.placeholder.com/150' }} style={styles.recentBookingImage} />
                      <View style={styles.recentBookingInfo}>
                        <Text style={styles.recentBookingRoom} numberOfLines={1}>{b.room.title}</Text>
                        <Text style={styles.recentBookingDate}>
                          {b.userId.slice(0, 6)}... · {formatDate(b.checkInDate)}
                        </Text>
                      </View>
                      <View style={styles.recentBookingRight}>
                        <Text style={styles.recentBookingPrice}>${b.totalPrice.toLocaleString()}</Text>
                        <View style={[styles.statBadge, { backgroundColor: statusConfig.bg, paddingVertical: 2 }]}>
                          <Text style={[styles.statBadgeText, { color: statusConfig.text, fontSize: 10 }]}>{b.status}</Text>
                        </View>
                      </View>
                    </View>
                  )
                })
              )}
            </View>
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}
