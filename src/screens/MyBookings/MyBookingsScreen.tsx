import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { Booking, RootStackParamList } from '../../types';
import EmptyState from '../../components/EmptyState/EmptyState';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import styles from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['Upcoming', 'Completed', 'Cancelled'] as const;
type Tab = typeof TABS[number];

const TAB_EMPTY: Record<Tab, { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; subtitle: string }> = {
  Upcoming: { icon: 'calendar-outline', title: 'No upcoming reservations', subtitle: 'Book your next stay and it will appear here!' },
  Completed: { icon: 'star-outline', title: 'No completed stays', subtitle: 'Finished stays eligible for review appear here.' },
  Cancelled: { icon: 'close-circle-outline', title: 'No cancelled bookings', subtitle: 'Cancelled bookings will appear here.' },
};

const formatDate = (d: string) =>
  new Date(d).toISOString().split('T')[0]; // YYYY-MM-DD as seen in Figma

const nightsCount = (checkIn: string, checkOut: string) =>
  Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <SkeletonLoader height={144} borderRadius={0} />
      <View style={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonLoader width={100} height={14} />
          <SkeletonLoader width={100} height={14} />
          <SkeletonLoader width={100} height={14} />
        </View>
        <View style={styles.divider} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonLoader width={80} height={40} />
          <SkeletonLoader width={160} height={32} borderRadius={14} />
        </View>
      </View>
    </View>
  );
}

const getStatusBadgeConfig = (status: Booking['status']) => {
  switch (status) {
    case 'Confirmed':
      return { bg: '#F0FDF4', color: '#10B981', icon: 'checkmark-circle-outline' as const };
    case 'Pending':
      return { bg: '#FEFCE8', color: '#D97706', icon: 'time-outline' as const };
    case 'Completed':
      return { bg: '#EFF6FF', color: '#2563EB', icon: 'star-outline' as const };
    case 'Cancelled':
      return { bg: '#FEF2F2', color: '#DC2626', icon: 'close-circle-outline' as const };
    default:
      return { bg: '#F3F4F6', color: '#6B7280', icon: 'help-circle-outline' as const };
  }
};

export default function MyBookingsScreen() {
  const { bookings, isLoading } = useBookings();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  const [activeTab, setActiveTab] = useState<Tab>('Upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const myBookings = bookings.filter(b => b.userId === user?.id);
  
  const displayed = myBookings.filter(b => {
    if (activeTab === 'Upcoming') return b.status === 'Confirmed' || b.status === 'Pending';
    if (activeTab === 'Completed') return b.status === 'Completed';
    if (activeTab === 'Cancelled') return b.status === 'Cancelled';
    return false;
  });

  const empty = TAB_EMPTY[activeTab];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reservations</Text>
        <Text style={styles.subtitle}>{myBookings.length} total booking{myBookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map(tab => {
            const count = myBookings.filter(b => {
              if (tab === 'Upcoming') return b.status === 'Confirmed' || b.status === 'Pending';
              if (tab === 'Completed') return b.status === 'Completed';
              if (tab === 'Cancelled') return b.status === 'Cancelled';
              return false;
            }).length;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.list}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, displayed.length === 0 && styles.listEmpty]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} colors={[COLORS.gold]} />}
          ListEmptyComponent={<EmptyState icon={empty.icon} title={empty.title} subtitle={empty.subtitle} />}
          renderItem={({ item }) => {
            const badge = getStatusBadgeConfig(item.status);
            const nights = nightsCount(item.checkInDate, item.checkOutDate);

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
                activeOpacity={0.88}
              >
                <View style={styles.cardHeader}>
                  <Image source={{ uri: item.room.photos?.[0]?.url || item.room.thumbnailPic?.url }} style={styles.cardImage} />
                  <View style={styles.cardImageOverlay} />
                  <View style={styles.cardHeaderContent}>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardCategory}>{item.room.type}</Text>
                      <Text style={styles.cardTitle}>{item.room.title}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Ionicons name={badge.icon} size={14} color={badge.color} style={styles.statusIcon} />
                      <Text style={[styles.statusText, { color: badge.color }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Check-in</Text>
                      <Text style={styles.detailValue}>{formatDate(item.checkInDate)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Nights</Text>
                      <Text style={styles.detailValue}>{nights} night{nights !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Check-out</Text>
                      <Text style={styles.detailValue}>{formatDate(item.checkOutDate)}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.paidLabel}>Total paid</Text>
                      <Text style={styles.paidValue}>${item.totalPrice}</Text>
                    </View>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id, action: 'edit' })}
                      >
                        <Ionicons name="create-outline" size={14} color={COLORS.navy} style={styles.actionBtnIcon} />
                        <Text style={styles.actionBtnText}>Edit Booking</Text>
                      </TouchableOpacity>
                      {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnCancel]}
                          onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id, action: 'cancel' })}
                        >
                          <Ionicons name="close-outline" size={14} color="#DC2626" style={styles.actionBtnIcon} />
                          <Text style={[styles.actionBtnText, styles.actionBtnTextCancel]}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
