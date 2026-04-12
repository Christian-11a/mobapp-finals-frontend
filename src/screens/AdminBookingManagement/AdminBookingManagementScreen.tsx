import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { VALIDATION } from '../../constants';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { styles } from './AdminBookingManagementStyle';

type StatusFilter = 'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

const FILTERS: StatusFilter[] = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_COLOR: Record<string, string> = {
  Pending: COLORS.yellow,
  Confirmed: COLORS.green,
  Completed: '#3b82f6',
  Cancelled: COLORS.red,
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AdminBookingManagementScreen() {
  const { bookings, approveBooking, cancelBooking } = useBookings();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<StatusFilter>('All');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  const handleApprove = (id: string) => {
    approveBooking(id);
    showToast('Booking approved.', 'success');
  };

  const handleCancel = () => {
    if (!cancelTarget) return;
    const booking = bookings.find(b => b.id === cancelTarget);
    if (booking?.status === 'Cancelled') {
      showToast(VALIDATION.CANCEL_ALREADY_CANCELLED, 'error');
      setCancelTarget(null);
      return;
    }
    cancelBooking(cancelTarget);
    setCancelTarget(null);
    showToast(VALIDATION.BOOKING_CANCELLED, 'info');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Booking Management</Text>
        <Text style={styles.subtitle}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabs}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.gray700} />
            <Text style={styles.emptyText}>No {filter !== 'All' ? filter.toLowerCase() : ''} bookings</Text>
          </View>
        }
        renderItem={({ item }) => {
          const color = STATUS_COLOR[item.status] ?? COLORS.gray400;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.roomTitle} numberOfLines={1}>{item.room.title}</Text>
                <View style={[styles.statusPill, { backgroundColor: color + '25' }]}>
                  <Text style={[styles.statusText, { color }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.gray400} />
                <Text style={styles.infoText}>
                  {formatDate(item.checkInDate)} → {formatDate(item.checkOutDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={13} color={COLORS.gray400} />
                <Text style={styles.infoText}>{item.totalGuests} guest{item.totalGuests !== 1 ? 's' : ''}</Text>
                <Text style={styles.price}> · ${item.totalPrice}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={13} color={COLORS.gray400} />
                <Text style={styles.infoText}>User: {item.userId}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                {item.status === 'Pending' && (
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                    <Ionicons name="checkmark-outline" size={15} color={COLORS.green} />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                )}
                {item.status !== 'Cancelled' && item.status !== 'Completed' && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setCancelTarget(item.id)}>
                    <Ionicons name="close-outline" size={15} color={COLORS.red} />
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      <ConfirmationModal
        visible={!!cancelTarget}
        title="Cancel Booking?"
        message="Cancel this booking on behalf of the guest?"
        confirmText="Yes, Cancel"
        cancelText="Keep"
        confirmColor={COLORS.red}
        icon="close-circle-outline"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </View>
  );
}
