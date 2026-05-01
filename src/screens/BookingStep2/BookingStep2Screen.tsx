import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { formatPrice } from '../../utils/formatUtils';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingStep2'>;
  route: RouteProp<RootStackParamList, 'BookingStep2'>;
};

const fmtDate = (d: string) =>
  new Date(d).toISOString().split('T')[0];

export default function BookingStep2Screen({ navigation, route }: Props) {
  const { room, checkIn, checkOut, guests, totalPrice } = route.params;
  const { user } = useAuth();
  const [specialRequests, setSpecialRequests] = useState('');

  const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

  const handleContinue = () => {
    navigation.navigate('Payment', {
      room,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      specialRequests,
    });
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
            <View style={styles.stepCircleDone}>
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.stepText}>Dates</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Details</Text>
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

      <KeyboardAwareScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Room Summary Card */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: room.image }} style={styles.roomThumb} />
          <View style={styles.roomInfo}>
            <Text style={styles.roomType}>{room.category}</Text>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomMeta}>Floor {room.floor} · {room.bedType}</Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceText}>${formatPrice(room.price)}</Text>
            <Text style={styles.perNight}>/night</Text>
          </View>
        </View>

        {/* Reservation Summary */}
        <View style={styles.reservationCard}>
          <Text style={styles.sectionTitle}>RESERVATION SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guest Name</Text>
            <Text style={styles.summaryValue}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Email</Text>
            <Text style={styles.summaryValue}>{user?.email}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <Text style={styles.summaryValue}>{fmtDate(checkIn)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-out</Text>
            <Text style={styles.summaryValue}>{fmtDate(checkOut)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nights</Text>
            <Text style={styles.summaryValue}>{nights} night{nights !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{guests}</Text>
          </View>
        </View>

        {/* Special Requests */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>SPECIAL REQUESTS (OPTIONAL)</Text>
          <View style={styles.textAreaContainer}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color={COLORS.gold} style={styles.inputIcon} />
            <TextInput
              style={styles.textArea}
              placeholder="e.g. Late check-in, extra pillows, honeymoon setup..."
              placeholderTextColor="rgba(10, 30, 61, 0.4)"
              multiline
              numberOfLines={4}
              value={specialRequests}
              onChangeText={setSpecialRequests}
            />
          </View>
        </View>

        {/* Cancellation Alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertIconContainer}>
            <Text style={styles.alertEmoji}>ℹ️</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Free Cancellation</Text>
            <Text style={styles.alertText}>
              Cancel for free up to 24 hours before check-in for a full refund.
            </Text>
          </View>
        </View>
        
        <View style={{ height: 120 }} />
      </KeyboardAwareScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
