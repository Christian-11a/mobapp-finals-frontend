import React, { useState } from 'react';
import { Image, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../types';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { VALIDATION } from '../../constants';
import { validateReviewRating, validateReviewText } from '../../utils/validation';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import styles from './styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingDetail'>;
  route: RouteProp<RootStackParamList, 'BookingDetail'>;
};

const CANCELLATION_FEE_PERCENT = 0.15;
const pickerOverlay = { flex: 1, justifyContent: 'flex-end' as const, backgroundColor: 'rgba(0,0,0,0.4)' };
const pickerSheet = { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, alignItems: 'center' as const };

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

const fmtShort = (d: Date) =>
  d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function BookingDetailScreen({ navigation, route }: Props) {
  const { bookingId } = route.params;
  const { bookings, cancelBooking, rescheduleBooking, isRoomBooked, reviews, addReview } = useBookings();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [cancelModal, setCancelModal] = useState(false);

  // Reschedule state
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState<Date | null>(null);
  const [newCheckOut, setNewCheckOut] = useState<Date | null>(null);
  const [showPickerIn, setShowPickerIn] = useState(false);
  const [showPickerOut, setShowPickerOut] = useState(false);

  // Review state
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingErr, setRatingErr] = useState('');
  const [textErr, setTextErr] = useState('');

  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return null;

  const nights = Math.round(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const cancellationFee = Math.round(booking.totalPrice * CANCELLATION_FEE_PERCENT);
  const refundAmount = booking.totalPrice - cancellationFee;

  const existingReview = reviews.find(r => r.bookingId === bookingId);

  const handleCancel = () => {
    cancelBooking(bookingId);
    setCancelModal(false);
    showToast('Booking cancelled. Refund processed minus cancellation fee.', 'info');
    navigation.goBack();
  };

  // ── Reschedule ───────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleReschedule = () => {
    if (!newCheckIn || !newCheckOut) {
      showToast('Please select new dates.', 'error');
      return;
    }
    const inStr = newCheckIn.toISOString();
    const outStr = newCheckOut.toISOString();
    if (isRoomBooked(booking.room.id, inStr, outStr, bookingId)) {
      showToast(VALIDATION.DOUBLE_BOOKING, 'error');
      return;
    }
    rescheduleBooking(bookingId, inStr, outStr);
    setRescheduleModal(false);
    showToast(VALIDATION.BOOKING_RESCHEDULED, 'success');
  };

  // ── Review ───────────────────────────────────────────────────────────────────
  const handleSubmitReview = () => {
    const rErr = validateReviewRating(rating);
    const tErr = validateReviewText(reviewText);
    setRatingErr(rErr ?? '');
    setTextErr(tErr ?? '');
    if (rErr || tErr) { showToast('Please complete all review fields.', 'error'); return; }

    addReview({
      id: `review_${Date.now()}`,
      bookingId,
      userId: user!.id,
      roomId: booking.room.id,
      rating,
      text: reviewText.trim(),
      createdAt: new Date().toISOString(),
      userName: `${user!.firstName} ${user!.lastName}`,
    });
    setReviewModal(false);
    setRating(0);
    setReviewText('');
    showToast(VALIDATION.REVIEW_SUBMITTED, 'success');
  };

  // ── Status badge map ─────────────────────────────────────────────────────────
  const statusStyle: Record<string, any> = {
    Confirmed: { badge: styles.confirmed, text: styles.confirmedText },
    Pending: { badge: styles.pending, text: styles.pendingText },
    Cancelled: { badge: styles.cancelled, text: styles.cancelledText },
    Completed: { badge: styles.completed, text: styles.completedText },
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>

        <Image source={{ uri: booking.room.thumbnailPic?.url }} style={styles.image} />

        <View style={styles.body}>
          <View style={styles.statusRow}>
            <Text style={styles.roomTitle}>{booking.room.title}</Text>
            <View style={[styles.badge, statusStyle[booking.status]?.badge]}>
              <Text style={statusStyle[booking.status]?.text}>{booking.status}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>STAY DETAILS</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Check-in</Text>
              <Text style={styles.rowValue}>{fmt(booking.checkInDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Check-out</Text>
              <Text style={styles.rowValue}>{fmt(booking.checkOutDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Duration</Text>
              <Text style={styles.rowValue}>{nights} night{nights > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Guests</Text>
              <Text style={styles.rowValue}>{booking.totalGuests}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>PRICE BREAKDOWN</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>${booking.room.pricePerNight} × {nights} night{nights > 1 ? 's' : ''}</Text>
              <Text style={styles.rowValue}>${booking.totalPrice}</Text>
            </View>
            {booking.status === 'Cancelled' && (
              <>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Cancellation Fee (15%)</Text>
                  <Text style={[styles.rowValue, { color: COLORS.red }]}>-${cancellationFee}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Refund Amount</Text>
                  <Text style={[styles.rowValue, { color: COLORS.green }]}>${refundAmount}</Text>
                </View>
              </>
            )}
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>${booking.totalPrice}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>ROOM INFO</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Type</Text>
              <Text style={styles.rowValue}>{booking.room.type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Max Guests</Text>
              <Text style={styles.rowValue}>{booking.room.maxPeople}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Rating</Text>
              <Text style={styles.rowValue}>★ {booking.room.averageRating}</Text>
            </View>
          </View>
        </View>

        {/* Action area */}
        {booking.status === 'Cancelled' && (
          <View style={styles.cancelledNote}>
            <Text style={styles.cancelledNoteText}>This booking has been cancelled.</Text>
          </View>
        )}

        {booking.status === 'Completed' && (
          <>
            {existingReview ? (
              <View style={styles.reviewedNote}>
                <Text style={styles.reviewedNoteText}>✓ You reviewed this stay. Thank you!</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.reviewBtn} onPress={() => setReviewModal(true)}>
                <Text style={styles.reviewBtnText}>Leave a Review</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {booking.status === 'Confirmed' && (
          <TouchableOpacity style={styles.rescheduleBtn} onPress={() => setRescheduleModal(true)}>
            <Text style={styles.rescheduleBtnText}>Reschedule</Text>
          </TouchableOpacity>
        )}

        {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setCancelModal(true)}>
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Cancel confirmation */}
      <ConfirmationModal
        visible={cancelModal}
        title="Cancel Booking?"
        message={`A cancellation fee of $${cancellationFee} (15%) will be charged.\n\nYou will receive a refund of $${refundAmount}.`}
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        confirmColor={COLORS.red}
        icon="close-circle-outline"
        onConfirm={handleCancel}
        onCancel={() => setCancelModal(false)}
      />

      {/* Reschedule Modal */}
      <Modal visible={rescheduleModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Reschedule Booking</Text>

            <Text style={styles.modalLabel}>New Check-in</Text>
            <TouchableOpacity
              style={styles.dateBox2}
              onPress={() => {
                if (!newCheckIn) setNewCheckIn(today);
                setShowPickerIn(true);
              }}
            >
              <Text style={styles.dateLabel2}>CHECK-IN</Text>
              <Text style={newCheckIn ? styles.dateValue2 : styles.datePlaceholder2}>
                {newCheckIn ? fmtShort(newCheckIn) : 'Select date'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalLabel, { marginTop: 12 }]}>New Check-out</Text>
            <TouchableOpacity
              style={styles.dateBox2}
              onPress={() => {
                if (!newCheckOut) {
                  const base = newCheckIn || today;
                  setNewCheckOut(new Date(base.getTime() + 86400000));
                }
                setShowPickerOut(true);
              }}
            >
              <Text style={styles.dateLabel2}>CHECK-OUT</Text>
              <Text style={newCheckOut ? styles.dateValue2 : styles.datePlaceholder2}>
                {newCheckOut ? fmtShort(newCheckOut) : 'Select date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleReschedule}>
              <Text style={styles.modalSaveBtnText}>Confirm Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRescheduleModal(false)}>
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPickerIn} transparent animationType="slide">
        <TouchableOpacity style={pickerOverlay} activeOpacity={1} onPress={() => setShowPickerIn(false)}>
          <View style={pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Check-in Date</Text>
              <TouchableOpacity onPress={() => setShowPickerIn(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={newCheckIn ?? today}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              themeVariant="light"
              accentColor={COLORS.gold}
              minimumDate={today}
              onChange={(_, date) => {
                if (Platform.OS === 'android') setShowPickerIn(false);
                if (date) { setNewCheckIn(date); if (newCheckOut && newCheckOut <= date) setNewCheckOut(null); }
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showPickerOut} transparent animationType="slide">
        <TouchableOpacity style={pickerOverlay} activeOpacity={1} onPress={() => setShowPickerOut(false)}>
          <View style={pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Check-out Date</Text>
              <TouchableOpacity onPress={() => setShowPickerOut(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={newCheckOut ?? (newCheckIn ? new Date(newCheckIn.getTime() + 86400000) : today)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              themeVariant="light"
              accentColor={COLORS.gold}
              minimumDate={newCheckIn ? new Date(newCheckIn.getTime() + 86400000) : new Date(today.getTime() + 86400000)}
              onChange={(_, date) => {
                if (Platform.OS === 'android') setShowPickerOut(false);
                if (date) setNewCheckOut(date);
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Review Modal */}
      <Modal visible={reviewModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Leave a Review</Text>

            <Text style={styles.modalLabel}>Your Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => { setRating(i); setRatingErr(''); }}>
                  <Ionicons
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={COLORS.gold}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {!!ratingErr && <Text style={styles.modalError}>{ratingErr}</Text>}

            <Text style={[styles.modalLabel, { marginTop: 12 }]}>Your Review</Text>
            <TextInput
              style={[styles.modalInput, !!textErr && styles.modalInputError]}
              value={reviewText}
              onChangeText={v => { setReviewText(v); setTextErr(''); }}
              placeholder="Share your experience (min 10 characters)..."
              placeholderTextColor={COLORS.gray400}
              multiline
              numberOfLines={4}
            />
            {!!textErr && <Text style={styles.modalError}>{textErr}</Text>}

            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSubmitReview}>
              <Text style={styles.modalSaveBtnText}>Submit Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => { setReviewModal(false); setRating(0); setReviewText(''); setRatingErr(''); setTextErr(''); }}
            >
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
