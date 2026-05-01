import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { useRooms } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { useBookings } from '../../context/BookingContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingStep1'>;
  route: RouteProp<RootStackParamList, 'BookingStep1'>;
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

const pickerOverlay = { flex: 1, justifyContent: 'flex-end' as const, backgroundColor: 'rgba(0,0,0,0.4)' };
const pickerSheet = { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32, alignItems: 'center' as const };

export default function BookingStep1Screen({ navigation, route }: Props) {
  const { roomId } = route.params;
  const { rooms } = useRooms();
  const room = rooms.find(r => r.id === roomId);
  const { showToast } = useToast();
  const { isRoomBooked } = useBookings();

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [guests, setGuests] = useState(1);
  const [isChecking, setIsChecking] = useState(false);

  if (!room) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights =
    checkIn && checkOut
      ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
  
  const basePrice = nights * room.pricePerNight;
  const tax = basePrice * 0.12;
  const totalPrice = basePrice + tax;

  const handleContinue = async () => {
    if (!checkIn || !checkOut) {
      showToast('Please select check-in and check-out dates', 'error');
      return;
    }
    if (nights <= 0) {
      showToast('Check-out must be after check-in', 'error');
      return;
    }

    setIsChecking(true);
    try {
      const isBooked = await isRoomBooked(room.id, checkIn.toISOString(), checkOut.toISOString());
      if (isBooked) {
        showToast('These dates are not available. Please select different dates.', 'error');
        setIsChecking(false);
        return;
      }

      navigation.navigate('BookingStep2', {
        room: {
          id: room.id,
          name: room.title,
          image: room.thumbnailPic?.url || '',
          price: room.pricePerNight,
          category: room.type,
          floor: 'High',
          bedType: 'Premium',
        },
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
        totalPrice,
      });
    } catch (error) {
      showToast('Failed to verify room availability. Please try again.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Room</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Dates</Text>
          </View>
          <View style={styles.stepLineInactive} />
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleInactive}>
              <Text style={[styles.stepNumberText, { color: 'rgba(255,255,255,0.5)' }]}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: 'rgba(255,255,255,0.5)' }]}>Details</Text>
          </View>
          <View style={styles.stepLineInactive} />
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleInactive}>
              <Text style={[styles.stepNumberText, { color: 'rgba(255,255,255,0.5)' }]}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: 'rgba(255,255,255,0.5)' }]}>Confirm</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Room Summary Card */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: room.thumbnailPic?.url }} style={styles.roomThumb} />
          <View style={styles.roomInfo}>
            <Text style={styles.roomType}>{room.type}</Text>
            <Text style={styles.roomName}>{room.title}</Text>
            <Text style={styles.roomMeta}>Floor High · Premium</Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceText}>${room.pricePerNight}</Text>
            <Text style={styles.perNight}>/night</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>CHECK-IN DATE</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              if (!checkIn) setCheckIn(today);
              setShowCheckIn(true);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.gold} style={styles.inputIcon} />
            <Text style={checkIn ? styles.inputValue : styles.inputPlaceholder}>
              {checkIn ? fmtDate(checkIn) : 'Select date'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>CHECK-OUT DATE</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => {
              if (!checkOut) setCheckOut(new Date((checkIn || today).getTime() + 86400000));
              setShowCheckOut(true);
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.gold} style={styles.inputIcon} />
            <Text style={checkOut ? styles.inputValue : styles.inputPlaceholder}>
              {checkOut ? fmtDate(checkOut) : 'Select date'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>GUESTS</Text>
          <View style={styles.guestSelector}>
            <TouchableOpacity 
              style={styles.guestBtn}
              onPress={() => setGuests(prev => Math.max(1, prev - 1))}
            >
              <Ionicons name="remove" size={20} color={COLORS.navy} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guests}</Text>
            <TouchableOpacity 
              style={styles.guestBtn}
              onPress={() => setGuests(prev => Math.min(room.maxPeople, prev + 1))}
            >
              <Ionicons name="add" size={20} color={COLORS.navy} />
            </TouchableOpacity>
            <Text style={styles.guestLimit}>Max: {room.maxPeople}</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        {nights > 0 && (
          <View style={styles.breakdown}>
            <Text style={styles.breakdownTitle}>Price Breakdown</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>${room.pricePerNight} x {nights} nights</Text>
              <Text style={styles.breakdownValue}>${basePrice.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Taxes & Fees (12%)</Text>
              <Text style={styles.breakdownValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Pickers */}
      <Modal visible={showCheckIn} transparent animationType="slide">
        <View style={pickerOverlay}>
          <View style={pickerSheet}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Check-in</Text>
              <TouchableOpacity onPress={() => setShowCheckIn(false)}>
                <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={checkIn || today}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => setCheckIn(date || checkIn)}
              minimumDate={today}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showCheckOut} transparent animationType="slide">
        <View style={pickerOverlay}>
          <View style={pickerSheet}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Check-out</Text>
              <TouchableOpacity onPress={() => setShowCheckOut(false)}>
                <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={checkOut || new Date((checkIn || today).getTime() + 86400000)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => setCheckOut(date || checkOut)}
              minimumDate={checkIn ? new Date(checkIn.getTime() + 86400000) : today}
            />
          </View>
        </View>
      </Modal>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueBtn, isChecking && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.continueText}>Continue to Details</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
