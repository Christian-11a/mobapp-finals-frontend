import React, { useState, useMemo } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, PaymentMethod } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Payment'>;
  route: RouteProp<RootStackParamList, 'Payment'>;
};

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { room, checkIn, checkOut, guests, totalPrice, specialRequests } = route.params;
  const { addBooking } = useBookings();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Saved Methods State
  const savedMethods = user?.paymentMethods || [];
  const defaultMethod = useMemo(() => savedMethods.find(m => m.isDefault) || savedMethods[0], [savedMethods]);
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(defaultMethod || null);
  const [useSaved, setUseSaved] = useState(savedMethods.length > 0);
  const [isChangeModalVisible, setIsChangeModalVisible] = useState(false);

  // Manual Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const validateForm = () => {
    if (useSaved && selectedMethod) return true;

    if (cardNumber.length < 16) {
      showToast('Please enter a valid card number', 'error', 'bottom');
      return false;
    }
    if (cardName.trim().length < 3) {
      showToast('Please enter the cardholder name', 'error', 'bottom');
      return false;
    }
    if (expiry.length < 5) {
      showToast('Please enter a valid expiry date (MM/YY)', 'error', 'bottom');
      return false;
    }
    if (cvv.length < 3) {
      showToast('Please enter a valid CVV', 'error', 'bottom');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    // Mock processing time
    setTimeout(() => {
      try {
        const bookingId = `booking_${Date.now()}`;
        addBooking({
          id: bookingId,
          userId: user!.id,
          room: {
            id: room.id,
            title: room.name,
            description: '', 
            type: (room.category as any) || 'Suite',
            pricePerNight: room.price,
            maxPeople: guests, 
            amenities: [],
            photos: [{ url: room.image }],
            isAvailable: true,
            averageRating: 5,
          },
          checkInDate: checkIn,
          checkOutDate: checkOut,
          totalGuests: guests,
          totalPrice,
          status: 'Confirmed',
          bookedAt: new Date().toISOString(),
        });

        showToast('Payment Successful!', 'success', 'center', 1000);
        
        setTimeout(() => {
          setLoading(false);
          navigation.replace('BookingSuccess', { bookingId });
        }, 1000);
      } catch (error) {
        setLoading(false);
        showToast('Booking failed. Please try again.', 'error', 'bottom');
      }
    }, 1500);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'gcash': return 'wallet';
      case 'maya': return 'flash';
      case 'card': return 'card';
      default: return 'help-circle';
    }
  };

  const getBrandColor = (type: string) => {
    switch (type) {
      case 'gcash': return '#007dfe';
      case 'maya': return '#c1ff00';
      case 'card': return COLORS.navy;
      default: return COLORS.gray400;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.stepText}>Dates</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleActive}>
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.stepText}>Details</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleCurrent}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Confirm</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(0)}</Text>
          </View>
          <Text style={styles.taxNote}>Pay with secured {useSaved ? selectedMethod?.type.toUpperCase() : 'Card'}</Text>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Payment Method</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')}>
              <Text style={{ color: COLORS.gold, fontWeight: 'bold', fontSize: 13 }}>Manage</Text>
            </TouchableOpacity>
          </View>

          {savedMethods.length > 0 ? (
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: useSaved ? '#f8f6f3' : COLORS.white,
                  padding: 16,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: useSaved ? COLORS.gold : '#f0ede8',
                }}
                onPress={() => setUseSaved(true)}
              >
                <View style={{ 
                  width: 40, height: 40, borderRadius: 10, 
                  backgroundColor: getBrandColor(selectedMethod?.type || '') + '20',
                  justifyContent: 'center', alignItems: 'center', marginRight: 12
                }}>
                  <Ionicons name={getIcon(selectedMethod?.type || '') as any} size={20} color={getBrandColor(selectedMethod?.type || '')} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: COLORS.navy }}>
                    {selectedMethod?.type.toUpperCase()} ({selectedMethod?.label})
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.gray400 }}>Saved Method</Text>
                </View>
                <TouchableOpacity onPress={() => setIsChangeModalVisible(true)}>
                  <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>Change</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                onPress={() => setUseSaved(false)}
              >
                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: !useSaved ? COLORS.gold : COLORS.gray300, justifyContent: 'center', alignItems: 'center' }}>
                  {!useSaved && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.gold }} />}
                </View>
                <Text style={{ fontSize: 14, color: COLORS.navy }}>Use another Credit/Debit card</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={{ marginBottom: 20, padding: 16, backgroundColor: 'rgba(212,165,116,0.05)', borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.gold }}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Text style={{ textAlign: 'center', color: COLORS.gold, fontWeight: 'bold' }}>+ Link GCash, Maya or Card for faster checkout</Text>
            </TouchableOpacity>
          )}

          {/* Manual Card Form - Only show if not using saved or no saved exist */}
          {!useSaved && (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CARD NUMBER</Text>
                <MaskedTextInput
                  mask="9999 9999 9999 9999"
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="rgba(10, 30, 61, 0.4)"
                  keyboardType="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CARDHOLDER NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="rgba(10, 30, 61, 0.4)"
                  value={cardName}
                  onChangeText={setCardName}
                  maxLength={50}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>EXPIRY</Text>
                  <MaskedTextInput
                    mask="99/99"
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="rgba(10, 30, 61, 0.4)"
                    keyboardType="numeric"
                    maxLength={5}
                    value={expiry}
                    onChangeText={setExpiry}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="•••"
                    placeholderTextColor="rgba(10, 30, 61, 0.4)"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={3}
                    value={cvv}
                    onChangeText={setCvv}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.secureNote}>
            <Ionicons name="lock-closed" size={14} color={COLORS.gray500} />
            <Text style={styles.secureText}>
              Your payment info is encrypted and secure.
            </Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payButton, loading && { opacity: 0.7 }]}
          onPress={handlePayment}
          disabled={loading}
        >
          <Text style={styles.payButtonText}>
            {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(0)}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Change Method Modal */}
      <Modal visible={isChangeModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(10,30,61,0.6)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: COLORS.white, borderRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.navy, marginBottom: 20 }}>Select Payment Method</Text>
            {savedMethods.map(m => (
              <TouchableOpacity 
                key={m.id} 
                style={{ 
                  flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12,
                  borderWidth: 1, borderColor: selectedMethod?.id === m.id ? COLORS.gold : COLORS.gray100,
                  backgroundColor: selectedMethod?.id === m.id ? '#fffcf9' : COLORS.white
                }}
                onPress={() => { setSelectedMethod(m); setIsChangeModalVisible(false); setUseSaved(true); }}
              >
                <Ionicons name={getIcon(m.type) as any} size={20} color={getBrandColor(m.type)} style={{ marginRight: 12 }} />
                <Text style={{ flex: 1, fontWeight: '600', color: COLORS.navy }}>{m.type.toUpperCase()} ({m.label})</Text>
                {selectedMethod?.id === m.id && <Ionicons name="checkmark-circle" size={20} color={COLORS.gold} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={{ marginTop: 12, alignItems: 'center', padding: 12 }}
              onPress={() => setIsChangeModalVisible(false)}
            >
              <Text style={{ color: COLORS.gray500, fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default PaymentScreen;
