import React, { useState } from 'react';
import { Image, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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
  const { bookingId, action } = route.params;
  const { bookings, cancelBooking, editBooking, isRoomBooked, reviews, addReview } = useBookings();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [cancelModal, setCancelModal] = useState(false);

  // Edit state
  const [editModal, setEditModal] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState<Date | null>(null);
  const [newCheckOut, setNewCheckOut] = useState<Date | null>(null);
  const [newGuests, setNewGuests] = useState<number>(1);
  const [showPickerIn, setShowPickerIn] = useState(false);
  const [showPickerOut, setShowPickerOut] = useState(false);

  // Review state
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingErr, setRatingErr] = useState('');
  const [textErr, setTextErr] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const booking = bookings.find(b => b.id === bookingId);

  React.useEffect(() => {
    if (action === 'edit' && booking) {
      setNewCheckIn(new Date(booking.checkInDate));
      setNewCheckOut(new Date(booking.checkOutDate));
      setNewGuests(booking.totalGuests);
      setEditModal(true);
    }
    if (action === 'cancel') setCancelModal(true);
  }, [action, booking]);

  if (!booking) return null;

  const originalNights = Math.round(
    (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  
  // Computed values for Edit Preview
  const newNights = newCheckIn && newCheckOut 
    ? Math.round((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24))
    : originalNights;
  
  const newTotalPrice = newNights * booking.room.pricePerNight;
  const priceDiff = newTotalPrice - booking.totalPrice;

  const cancellationFee = Math.round(booking.totalPrice * CANCELLATION_FEE_PERCENT);
  const refundAmount = booking.totalPrice - cancellationFee;

  const existingReview = reviews.find(r => r.bookingId === bookingId);

  const handleCancel = async () => {
    setIsSaving(true);
    try {
      await cancelBooking(bookingId);
      setCancelModal(false);
      showToast('Booking cancelled. Refund processed minus cancellation fee.', 'info');
      navigation.goBack();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Edit Booking ─────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleEditBooking = async () => {
    if (!newCheckIn || !newCheckOut) {
      showToast('Please select dates.', 'error');
      return;
    }

    const isSameDateIn = newCheckIn.toISOString() === new Date(booking.checkInDate).toISOString();
    const isSameDateOut = newCheckOut.toISOString() === new Date(booking.checkOutDate).toISOString();
    const isSameGuests = newGuests === booking.totalGuests;

    if (isSameDateIn && isSameDateOut && isSameGuests) {
      showToast('No changes made.', 'info');
      setEditModal(false);
      return;
    }

    const inStr = newCheckIn.toISOString();
    const outStr = newCheckOut.toISOString();
    
    setIsSaving(true);
    try {
      if (await isRoomBooked(booking.room.id, inStr, outStr, bookingId)) {
        showToast('These dates are no longer available. Please choose others.', 'error');
        setIsSaving(false);
        return;
      }

      await editBooking(bookingId, inStr, outStr, newGuests, newTotalPrice);
      setEditModal(false);
      showToast('Booking updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update booking', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Review ───────────────────────────────────────────────────────────────────
  const handleSubmitReview = async () => {
    const rErr = validateReviewRating(rating);
    const tErr = validateReviewText(reviewText);
    setRatingErr(rErr ?? '');
    setTextErr(tErr ?? '');
    if (rErr || tErr) { showToast('Please complete all review fields.', 'error'); return; }

    setIsSaving(true);
    try {
      await addReview({
        bookingId,
        userId: user!.id,
        roomId: booking.room.id,
        rating,
        text: reviewText.trim(),
        userName: `${user!.firstName} ${user!.lastName}`,
      });
      setReviewModal(false);
      setRating(0);
      setReviewText('');
      showToast(VALIDATION.REVIEW_SUBMITTED, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSaving(false);
    }
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

        <Image 
          source={{ uri: booking.room.photos?.[0]?.url || booking.room.thumbnailPic?.url }} 
          style={styles.image} 
        />

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
              <Text style={styles.rowValue}>{originalNights} night{originalNights > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Guests</Text>
              <Text style={styles.rowValue}>{booking.totalGuests} Guests</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>PRICE BREAKDOWN</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>${booking.room.pricePerNight} × {originalNights} night{originalNights > 1 ? 's' : ''}</Text>
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
          <TouchableOpacity 
            style={styles.rescheduleBtn} 
            onPress={() => {
              setNewCheckIn(new Date(booking.checkInDate));
              setNewCheckOut(new Date(booking.checkOutDate));
              setNewGuests(booking.totalGuests);
              setEditModal(true);
            }}
          >
            <Text style={styles.rescheduleBtnText}>Edit Booking</Text>
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

      {/* Edit Booking Modal */}
      <Modal visible={editModal} transparent animationType="slide" statusBarTranslucent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditModal(false)}
        >
          <TouchableOpacity
            style={styles.modalSheet}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Edit Your Booking</Text>

            <View style={styles.dateRow2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>CHECK-IN</Text>
                <TouchableOpacity
                  style={styles.dateBox2}
                  onPress={() => setShowPickerIn(true)}
                >
                  <Text style={newCheckIn ? styles.dateValue2 : styles.datePlaceholder2}>
                    {newCheckIn ? fmtShort(newCheckIn) : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>CHECK-OUT</Text>
                <TouchableOpacity
                  style={styles.dateBox2}
                  onPress={() => setShowPickerOut(true)}
                >
                  <Text style={newCheckOut ? styles.dateValue2 : styles.datePlaceholder2}>
                    {newCheckOut ? fmtShort(newCheckOut) : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={styles.modalLabel}>NUMBER OF GUESTS</Text>
              <View style={styles.guestSelector}>
                <TouchableOpacity
                  style={styles.guestBtn}
                  onPress={() => setNewGuests(Math.max(1, newGuests - 1))}
                >
                  <Ionicons name="remove" size={20} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.guestCountText}>{newGuests} Guest{newGuests > 1 ? 's' : ''}</Text>
                <TouchableOpacity
                  style={styles.guestBtn}
                  onPress={() => setNewGuests(Math.min(booking.room.maxPeople, newGuests + 1))}
                >
                  <Ionicons name="add" size={20} color={COLORS.navy} />
                </TouchableOpacity>
              </View>
              <Text style={styles.capacityText}>Maximum capacity: {booking.room.maxPeople} guests</Text>
            </View>

            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Duration Change</Text>
                <Text style={styles.previewValue}>
                  {originalNights} → {newNights} night{newNights > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Price Difference</Text>
                <Text style={[
                  styles.previewValue,
                  { color: priceDiff > 0 ? COLORS.red : priceDiff < 0 ? COLORS.green : COLORS.navy }
                ]}>
                  {priceDiff > 0 ? `+$${priceDiff}` : priceDiff < 0 ? `-$${Math.abs(priceDiff)}` : 'No change'}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewTotalLabel}>New Total</Text>
                <Text style={styles.previewTotalValue}>${newTotalPrice}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.modalSaveBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleEditBooking}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.modalSaveBtnText}>Confirm Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setEditModal(false)}
            >
              <Text style={styles.modalCancelBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Pickers */}
      {showPickerIn && (
        Platform.OS === 'ios' ? (
          <Modal visible={showPickerIn} transparent animationType="slide">
            <TouchableOpacity style={pickerOverlay} activeOpacity={1} onPress={() => setShowPickerIn(false)}>
              <View style={pickerSheet}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Check-in Date</Text>
                  <TouchableOpacity onPress={() => setShowPickerIn(false)}>
                    <Text style={styles.pickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={newCheckIn ?? today}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  accentColor={COLORS.gold}
                  minimumDate={today}
                  onChange={(_, date) => {
                    if (date) { 
                      setNewCheckIn(date); 
                      if (newCheckOut && newCheckOut <= date) {
                        setNewCheckOut(new Date(date.getTime() + 86400000));
                      }
                    }
                  }}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={newCheckIn ?? today}
            mode="date"
            display="default"
            minimumDate={today}
            onChange={(_, date) => { 
              setShowPickerIn(false); 
              if (date) {
                setNewCheckIn(date);
                if (newCheckOut && newCheckOut <= date) {
                  setNewCheckOut(new Date(date.getTime() + 86400000));
                }
              }
            }}
          />
        )
      )}

      {showPickerOut && (
        Platform.OS === 'ios' ? (
          <Modal visible={showPickerOut} transparent animationType="slide">
            <TouchableOpacity style={pickerOverlay} activeOpacity={1} onPress={() => setShowPickerOut(false)}>
              <View style={pickerSheet}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Check-out Date</Text>
                  <TouchableOpacity onPress={() => setShowPickerOut(false)}>
                    <Text style={styles.pickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={newCheckOut ?? (newCheckIn ? new Date(newCheckIn.getTime() + 86400000) : today)}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  accentColor={COLORS.gold}
                  minimumDate={newCheckIn ? new Date(newCheckIn.getTime() + 86400000) : new Date(today.getTime() + 86400000)}
                  onChange={(_, date) => date && setNewCheckOut(date)}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={newCheckOut ?? (newCheckIn ? new Date(newCheckIn.getTime() + 86400000) : today)}
            mode="date"
            display="default"
            minimumDate={newCheckIn ? new Date(newCheckIn.getTime() + 86400000) : new Date(today.getTime() + 86400000)}
            onChange={(_, date) => { setShowPickerOut(false); if (date) setNewCheckOut(date); }}
          />
        )
      )}

      {/* Review Modal */}
      <Modal visible={reviewModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Leave a Review</Text>

            <KeyboardAwareScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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

              <TouchableOpacity 
                style={[styles.modalSaveBtn, isSaving && { opacity: 0.7 }]} 
                onPress={handleSubmitReview}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Submit Review</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setReviewModal(false); setRating(0); setReviewText(''); setRatingErr(''); setTextErr(''); }}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
