import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { VALIDATION } from '../../constants';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { styles } from './AdminReviewModerationStyle';

const Stars = ({ rating }: { rating: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Ionicons
        key={i}
        name={i <= rating ? 'star' : 'star-outline'}
        size={13}
        color={COLORS.gold}
      />
    ))}
  </View>
);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AdminReviewModerationScreen() {
  const { reviews, deleteReview, getBookingById } = useBookings();
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteReview(deleteTarget);
    setDeleteTarget(null);
    showToast(VALIDATION.REVIEW_DELETED, 'info');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Review Moderation</Text>
        <Text style={styles.subtitle}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="star-outline" size={40} color={COLORS.gray700} />
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const booking = getBookingById(item.bookingId);
          const roomName = booking?.room.title ?? `Room ${item.roomId}`;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Stars rating={item.rating} />
                  <Text style={styles.userName}>{item.userName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setDeleteTarget(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                </TouchableOpacity>
              </View>

              <Text style={styles.reviewText} numberOfLines={3}>{item.text}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <Ionicons name="bed-outline" size={12} color={COLORS.gray400} />
                  <Text style={styles.roomName} numberOfLines={1}>{roomName}</Text>
                </View>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          );
        }}
      />

      <ConfirmationModal
        visible={!!deleteTarget}
        title="Delete Review?"
        message="This will permanently remove the review. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor={COLORS.red}
        icon="trash-outline"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
