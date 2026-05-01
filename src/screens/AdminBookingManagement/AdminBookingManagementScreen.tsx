import React, { useState, useMemo } from 'react';
import {
  FlatList, Modal, ScrollView, Text, TextInput,
  TouchableOpacity, View, Image, ImageBackground, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { formatPrice } from '../../utils/formatUtils';
import { styles } from './AdminBookingManagementStyle';
import { useNavigation } from '@react-navigation/native';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { Booking } from '../../types';

type StatusFilter = 'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

const FILTERS: StatusFilter[] = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  Pending: { bg: '#fefce8', text: '#d97706', icon: 'time-outline' },
  Confirmed: { bg: '#f0fdf4', text: '#10b981', icon: 'checkmark-circle-outline' },
  Completed: { bg: '#eef2ff', text: '#6366f1', icon: 'checkmark-done-circle-outline' },
  Cancelled: { bg: '#fef2f2', text: '#ef4444', icon: 'close-circle-outline' },
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function AdminBookingManagementScreen() {
  const { bookings, updateBookingStatus, isLoading } = useBookings();
  const { showToast } = useToast();
  const navigation = useNavigation();

  const [filter, setFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesFilter = filter === 'All' || b.status === filter;
      const matchesSearch = 
        b.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchQuery]);

  const totalRevenue = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);
  }, [bookings]);

  const handleUpdateStatus = (booking: Booking) => {
    setSelectedBooking(booking);
    setStatusModalVisible(true);
  };

  const onStatusSelect = async (status: Booking['status']) => {
    if (selectedBooking) {
      setIsUpdating(status);
      try {
        await updateBookingStatus(selectedBooking.id, status);
        showToast(`Booking status updated to ${status}`, 'success');
        setStatusModalVisible(false);
        setSelectedBooking(null);
      } catch (error) {
        showToast('Failed to update status', 'error');
      } finally {
        setIsUpdating(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>All Bookings</Text>
            <Text style={styles.headerSubtitle}>Revenue: ${formatPrice(totalRevenue)}</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={14} color={COLORS.gold} />
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#99a1af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by guest, room, or ID..."
            placeholderTextColor="#99a1af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.tab, filter === f && styles.tabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
                {f} {filter === f ? `(${filteredBookings.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ padding: 20 }}>
          <SkeletonLoader height={180} style={{ marginBottom: 16 }} />
          <SkeletonLoader height={180} style={{ marginBottom: 16 }} />
          <SkeletonLoader height={180} style={{ marginBottom: 16 }} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={b => b.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.gray200} />
              <Text style={styles.emptyText}>No bookings found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
            return (
              <View style={styles.card}>
                <ImageBackground
                  source={{ uri: item.room.thumbnailPic?.url || item.room.photos?.[0]?.url || 'https://via.placeholder.com/300' }}
                  style={styles.cardBanner}
                >
                  <View style={styles.cardBannerOverlay}>
                    <Text style={styles.bannerRoomType}>{item.room.type}</Text>
                    <Text style={styles.bannerRoomTitle}>{item.room.title}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Ionicons name={status.icon as any} size={12} color={status.text} />
                    <Text style={[styles.statusBadgeText, { color: status.text }]}>{item.status}</Text>
                  </View>
                </ImageBackground>

                <View style={styles.cardBody}>
                  <View style={styles.guestRow}>
                    <View style={styles.guestAvatar}>
                      <Text style={styles.guestAvatarText}>U</Text>
                    </View>
                    <View style={styles.guestInfo}>
                      <Text style={styles.guestName}>{item.userId.slice(0, 8)}...</Text>
                      <Text style={styles.guestEmail}>guest@example.com</Text>
                    </View>
                    <Text style={styles.bookingId}>#{item.id.slice(-4)}</Text>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>Check-in</Text>
                      <Text style={styles.gridValue}>{formatDate(item.checkInDate)}</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>Duration</Text>
                      <Text style={styles.gridValue}>3 Nights</Text>
                    </View>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>Guests</Text>
                      <Text style={styles.gridValue}>{item.totalGuests} pax</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.totalSection}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>${formatPrice(item.totalPrice)}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.updateStatusBtn}
                      onPress={() => handleUpdateStatus(item)}
                    >
                      <Text style={styles.updateStatusText}>Update Status</Text>
                      <Ionicons name="chevron-down" size={14} color={COLORS.navy} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Booking Status</Text>
              <TouchableOpacity 
                style={styles.closeBtn}
                onPress={() => setStatusModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={COLORS.navy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.currentStatusText}>
              Currently: <Text style={{ fontWeight: 'bold', color: STATUS_CONFIG[selectedBooking?.status || 'Pending'].text }}>
                {selectedBooking?.status}
              </Text>
            </Text>

            <View style={styles.statusOptions}>
              {Object.keys(STATUS_CONFIG).map((s) => {
                const config = STATUS_CONFIG[s];
                const isActive = selectedBooking?.status === s;
                const updatingThis = isUpdating === s;

                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusOption, 
                      isActive && styles.statusOptionActive,
                      !!isUpdating && { opacity: 0.6 }
                    ]}
                    onPress={() => onStatusSelect(s as Booking['status'])}
                    disabled={!!isUpdating}
                  >
                    {updatingThis ? (
                      <ActivityIndicator size="small" color={COLORS.gold} style={{ marginRight: 12 }} />
                    ) : (
                      <Ionicons name={config.icon as any} size={18} color={isActive ? config.text : COLORS.navy} style={{ marginRight: 12 }} />
                    )}
                    <Text style={[styles.statusOptionText, isActive && styles.statusOptionTextActive, { flex: 1 }]}>
                      {s}
                    </Text>
                    {isActive && !updatingThis && <Text style={styles.currentLabel}>(current)</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
