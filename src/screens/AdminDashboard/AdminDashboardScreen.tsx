import React from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { useRooms } from '../../context/RoomContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getRegisteredUsersCount } from '../../services/authService';
import { COLORS } from '../../constants/colors';
import { styles } from './AdminDashboardStyle';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_COLOR: Record<string, string> = {
  Pending: COLORS.yellow,
  Confirmed: COLORS.green,
  Completed: '#3b82f6',
  Cancelled: COLORS.red,
};

export default function AdminDashboardScreen() {
  const { bookings, reviews } = useBookings();
  const { rooms } = useRooms();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

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
  const occupancyRate =
    rooms.length > 0 ? Math.round((occupiedRoomIds.size / rooms.length) * 100) : 0;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: 'cash-outline', color: COLORS.green },
    { label: 'Total Bookings', value: String(bookings.length), icon: 'calendar-outline', color: COLORS.gold },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: 'business-outline', color: '#3b82f6' },
    { label: 'Registered Users', value: String(getRegisteredUsersCount()), icon: 'people-outline', color: '#a855f7' },
    { label: 'Avg Rating', value: String(avgRating), icon: 'star-outline', color: COLORS.yellow },
    { label: 'Total Reviews', value: String(reviews.length), icon: 'chatbubbles-outline', color: '#ec4899' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatarCircle}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.gold} />
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => { logout(); showToast('Logged out successfully.', 'info'); }}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stat cards grid */}
      <View style={styles.grid}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: s.color + '20' }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        {recentBookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        ) : (
          recentBookings.map(b => (
            <View key={b.id} style={styles.bookingRow}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingRoom} numberOfLines={1}>{b.room.title}</Text>
                <Text style={styles.bookingDate}>
                  {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
                </Text>
                <Text style={styles.bookingPrice}>${b.totalPrice}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[b.status] + '25' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLOR[b.status] }]}>{b.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
