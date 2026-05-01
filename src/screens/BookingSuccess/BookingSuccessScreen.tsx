import React from 'react';
import { Text, TouchableOpacity, View, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { formatPrice } from '../../utils/formatUtils';
import { styles } from './BookingSuccessStyle';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingSuccess'>;
  route: RouteProp<RootStackParamList, 'BookingSuccess'>;
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-CA'); // YYYY-MM-DD as seen in Figma

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

  if (!booking) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.successIconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={40} color={COLORS.gold} />
          </View>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your reservation at</Text>
        <Text style={styles.roomName}>{booking.room.title}</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-in</Text>
            <Text style={styles.detailValue}>{fmt(booking.checkInDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-out</Text>
            <Text style={styles.detailValue}>{fmt(booking.checkOutDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nights</Text>
            <Text style={styles.detailValue}>{nights}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>${formatPrice(booking.totalPrice)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={goBookings}>
            <Text style={styles.primaryBtnText}>View My Reservations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
            <Text style={styles.secondaryBtnText}>Browse More Rooms</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
