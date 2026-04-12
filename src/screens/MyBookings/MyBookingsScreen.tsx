import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { Booking, RootStackParamList } from '../../types';
import BookingStatusPill from '../../components/BookingStatusPill/BookingStatusPill';
import EmptyState from '../../components/EmptyState/EmptyState';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import styles from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;
type Tab = typeof TABS[number];

const TAB_EMPTY: Record<Tab, { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; subtitle: string }> = {
  All: { icon: 'calendar-outline', title: 'No bookings yet', subtitle: 'Browse our rooms and make your first booking!' },
  Pending: { icon: 'time-outline', title: 'No pending bookings', subtitle: 'Bookings awaiting confirmation will appear here.' },
  Confirmed: { icon: 'checkmark-circle-outline', title: 'No confirmed bookings', subtitle: 'Approved bookings will appear here.' },
  Completed: { icon: 'star-outline', title: 'No completed stays', subtitle: 'Finished stays eligible for review appear here.' },
  Cancelled: { icon: 'close-circle-outline', title: 'No cancelled bookings', subtitle: 'Cancelled bookings will appear here.' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

const nights = (checkIn: string, checkOut: string) =>
  Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <SkeletonLoader height={130} borderRadius={0} />
      <View style={{ padding: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width={70} height={24} borderRadius={8} />
        </View>
        <SkeletonLoader width="80%" height={12} />
        <SkeletonLoader width="45%" height={12} />
      </View>
    </View>
  );
}

export default function MyBookingsScreen() {
  const { bookings } = useBookings();
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const myBookings = bookings.filter(b => b.userId === user?.id);
  const displayed: Booking[] = activeTab === 'All'
    ? myBookings
    : myBookings.filter(b => b.status === activeTab);

  const empty = TAB_EMPTY[activeTab];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{myBookings.length} booking{myBookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map(tab => {
            const count = tab === 'All' ? myBookings.length : myBookings.filter(b => b.status === tab).length;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
              activeOpacity={0.88}
            >
              <Image source={{ uri: item.room.thumbnailPic?.url }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.roomName} numberOfLines={1}>{item.room.title}</Text>
                  <BookingStatusPill status={item.status} />
                </View>
                <View style={styles.dateRow}>
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateLabel}>CHECK-IN</Text>
                    <Text style={styles.dateValue}>{formatDate(item.checkInDate)}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.gray300} style={{ marginTop: 14 }} />
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateLabel}>CHECK-OUT</Text>
                    <Text style={styles.dateValue}>{formatDate(item.checkOutDate)}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.nights}>{nights(item.checkInDate, item.checkOutDate)} night{nights(item.checkInDate, item.checkOutDate) > 1 ? 's' : ''}</Text>
                  <Text style={styles.price}>${item.totalPrice}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
