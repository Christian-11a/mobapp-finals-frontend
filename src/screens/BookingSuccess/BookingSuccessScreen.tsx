import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { styles } from './BookingSuccessStyle';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingSuccess'>;
  route: RouteProp<RootStackParamList, 'BookingSuccess'>;
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function BookingSuccessScreen({ navigation, route }: Props) {
  const { bookingId } = route.params;
  const { getBookingById } = useBookings();
  const booking = getBookingById(bookingId);

  const nights = booking
    ? Math.round(
        (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const goHome = () =>
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

  const goBookings = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'MyBookings' } }],
    });

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={40} color={COLORS.green} />
      </View>

      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>Your reservation has been placed successfully.</Text>

      {booking && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BOOKING SUMMARY</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Room</Text>
            <Text style={[styles.rowValue, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
              {booking.room.title}
            </Text>
          </View>
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
            <Text style={styles.rowValue}>{nights} night{nights !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Guests</Text>
            <Text style={styles.rowValue}>{booking.totalGuests}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${booking.totalPrice}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.primaryBtn} onPress={goBookings}>
        <Text style={styles.primaryBtnText}>View My Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
        <Text style={styles.secondaryBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
