import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../types';
import { useRooms } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import styles from './styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;
  route: RouteProp<RootStackParamList, 'RoomDetail'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const pickerOverlay = { flex: 1, justifyContent: 'flex-end' as const, backgroundColor: 'rgba(0,0,0,0.4)' };
const pickerSheet = { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, alignItems: 'center' as const };

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtStr = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function RoomDetailScreen({ navigation, route }: Props) {
  const { roomId } = route.params;
  const { rooms } = useRooms();
  const room = rooms.find(r => r.id === roomId);
  const { showToast } = useToast();
  const { bookings, reviews, addBooking, isRoomBooked } = useBookings();
  const { user } = useAuth();

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [guests, setGuests] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (!room) return null;

  const allPhotos = room.photos && room.photos.length > 0
    ? room.photos
    : room.thumbnailPic
      ? [room.thumbnailPic]
      : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights =
    checkIn && checkOut
      ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
  const totalPrice = nights * room.pricePerNight;

  const isConflict =
    checkIn && checkOut && isRoomBooked(roomId, checkIn.toISOString(), checkOut.toISOString());

  const handleBook = () => {
    if (!checkIn || !checkOut) { showToast('Please select check-in and check-out dates', 'error'); return; }
    if (nights <= 0) { showToast('Check-out must be after check-in', 'error'); return; }
    if (isConflict) { showToast('These dates are already booked. Please choose different dates.', 'error'); return; }
    setModalVisible(true);
  };

  const confirmBooking = () => {
    const bookingId = `booking_${Date.now()}`;
    addBooking({
      id: bookingId,
      userId: user!.id,
      room,
      checkInDate: checkIn!.toISOString(),
      checkOutDate: checkOut!.toISOString(),
      totalGuests: guests,
      totalPrice,
      status: 'Pending',
      bookedAt: new Date().toISOString(),
    });
    setModalVisible(false);
    navigation.replace('BookingSuccess', { bookingId });
  };

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setGalleryIndex(idx);
  };

  const roomReviews = reviews.filter(r => r.roomId === roomId);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Image Gallery */}
        <View>
          <FlatList
            data={allPhotos}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onGalleryScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={[styles.image, { width: SCREEN_WIDTH }]} />
            )}
          />
          {allPhotos.length > 1 && (
            <View style={styles.dotsRow}>
              {allPhotos.map((_, i) => (
                <View key={i} style={[styles.dot, i === galleryIndex && styles.dotActive]} />
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.name}>{room.title}</Text>
            <View>
              <Text style={styles.price}>${room.pricePerNight}</Text>
              <Text style={styles.perNight}>/night</Text>
            </View>
          </View>
          <Text style={styles.type}>{room.type} · Up to {room.maxPeople} guests</Text>
          <Text style={styles.rating}>★ {room.averageRating} ({room.reviewCount} reviews)</Text>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{room.description}</Text>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenities}>
            {room.amenities.map(a => (
              <View key={a} style={styles.amenity}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>

          {room.isAvailable && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Select Dates</Text>
              <View style={styles.dateSection}>
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    style={styles.dateBox}
                    onPress={() => {
                      if (!checkIn) setCheckIn(today);
                      setShowCheckIn(true);
                    }}
                  >
                    <Text style={styles.dateLabel}>CHECK-IN</Text>
                    <Text style={checkIn ? styles.dateValue : styles.datePlaceholder}>
                      {checkIn ? fmtDate(checkIn) : 'Select date'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dateBox}
                    onPress={() => {
                      if (!checkOut) {
                        const base = checkIn || today;
                        setCheckOut(new Date(base.getTime() + 86400000));
                      }
                      setShowCheckOut(true);
                    }}
                  >
                    <Text style={styles.dateLabel}>CHECK-OUT</Text>
                    <Text style={checkOut ? styles.dateValue : styles.datePlaceholder}>
                      {checkOut ? fmtDate(checkOut) : 'Select date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Guest count selector */}
                <View style={styles.guestRow}>
                  <Text style={styles.guestLabel}>Guests</Text>
                  <View style={styles.guestControls}>
                    <TouchableOpacity
                      style={[styles.guestBtn, guests <= 1 && styles.guestBtnDisabled]}
                      onPress={() => setGuests(g => Math.max(1, g - 1))}
                      disabled={guests <= 1}
                    >
                      <Ionicons name="remove" size={18} color={guests <= 1 ? COLORS.gray300 : COLORS.navy} />
                    </TouchableOpacity>
                    <Text style={styles.guestCount}>{guests}</Text>
                    <TouchableOpacity
                      style={[styles.guestBtn, guests >= room.maxPeople && styles.guestBtnDisabled]}
                      onPress={() => setGuests(g => Math.min(room.maxPeople, g + 1))}
                      disabled={guests >= room.maxPeople}
                    >
                      <Ionicons name="add" size={18} color={guests >= room.maxPeople ? COLORS.gray300 : COLORS.navy} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Conflict warning */}
                {isConflict && (
                  <View style={styles.conflictWarning}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.red} />
                    <Text style={styles.conflictText}>The selected dates are unavailable for this room.</Text>
                  </View>
                )}

                {checkIn && checkOut && nights > 0 && !isConflict && (
                  <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Duration</Text>
                      <Text style={styles.summaryValue}>{nights} night{nights > 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Rate</Text>
                      <Text style={styles.summaryValue}>${room.pricePerNight}/night</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Guests</Text>
                      <Text style={styles.summaryValue}>{guests}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total</Text>
                      <Text style={styles.summaryTotal}>${totalPrice}</Text>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Guest Reviews */}
          <View style={styles.divider} />
          <Text style={styles.reviewSectionTitle}>Guest Reviews</Text>
          {roomReviews.length === 0 ? (
            <Text style={styles.reviewEmpty}>No reviews yet for this room.</Text>
          ) : (
            roomReviews.map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Ionicons
                      key={i}
                      name={i <= r.rating ? 'star' : 'star-outline'}
                      size={13}
                      color={COLORS.gold}
                    />
                  ))}
                </View>
                <Text style={styles.reviewUser}>{r.userName}</Text>
                <Text style={styles.reviewText}>{r.text}</Text>
                <Text style={styles.reviewDate}>{fmtStr(r.createdAt)}</Text>
              </View>
            ))
          )}
        </View>

        {room.isAvailable && (
          <TouchableOpacity
            style={[styles.button, (!checkIn || !checkOut || nights <= 0 || !!isConflict) && styles.buttonDisabled]}
            onPress={handleBook}
            disabled={!checkIn || !checkOut || nights <= 0 || !!isConflict}
          >
            <Text style={styles.buttonText}>
              {isConflict ? 'Dates Unavailable' : checkIn && checkOut && nights > 0 ? `Book for $${totalPrice}` : 'Select dates to book'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={showCheckIn} transparent animationType="slide">
        <TouchableOpacity style={pickerOverlay} activeOpacity={1} onPress={() => setShowCheckIn(false)}>
          <View style={pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Check-in Date</Text>
              <TouchableOpacity onPress={() => setShowCheckIn(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={checkIn ?? today}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              themeVariant="light"
              accentColor={COLORS.gold}
              minimumDate={today}
              onChange={(_, date) => {
                if (Platform.OS === 'android') setShowCheckIn(false);
                if (date) { setCheckIn(date); if (checkOut && checkOut <= date) setCheckOut(null); }
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showCheckOut} transparent animationType="slide">
        <TouchableOpacity style={pickerOverlay} activeOpacity={1} onPress={() => setShowCheckOut(false)}>
          <View style={pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Check-out Date</Text>
              <TouchableOpacity onPress={() => setShowCheckOut(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={checkOut ?? (checkIn ? new Date(checkIn.getTime() + 86400000) : today)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              themeVariant="light"
              accentColor={COLORS.gold}
              minimumDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date(today.getTime() + 86400000)}
              onChange={(_, date) => {
                if (Platform.OS === 'android') setShowCheckOut(false);
                if (date) setCheckOut(date);
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmationModal
        visible={modalVisible}
        title="Confirm Booking"
        message={`${room.title}\n${checkIn ? fmtDate(checkIn) : ''} → ${checkOut ? fmtDate(checkOut) : ''}\n${nights} night${nights > 1 ? 's' : ''} · ${guests} guest${guests > 1 ? 's' : ''} · $${totalPrice}`}
        onConfirm={confirmBooking}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
}
