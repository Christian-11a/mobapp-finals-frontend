import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Alert, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList, PaymentMethod } from '../../types';
import { MaskedTextInput } from 'react-native-mask-text';
import styles from './styles';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PaymentMethods'> };

type FlowStep = 'selection' | 'input' | 'otp' | 'mpin' | 'success' | 'loading';

export default function PaymentMethodsScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [flowVisible, setFlowVisible] = useState(false);
  const [activeFlow, setActiveFlow] = useState<'card' | 'gcash' | 'maya' | null>(null);
  const [step, setStep] = useState<FlowStep>('selection');
  
  // Form States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const methods = user?.paymentMethods || [];

  const startFlow = (type: 'card' | 'gcash' | 'maya') => {
    setActiveFlow(type);
    setStep('input');
    setFlowVisible(true);
  };

  const handleNextStep = () => {
    if (activeFlow === 'gcash' || activeFlow === 'maya') {
      if (step === 'input') setStep('otp');
      else if (step === 'otp') setStep('mpin');
      else if (step === 'mpin') finalizeLinking();
    } else {
      if (step === 'input') {
        setStep('loading');
        setTimeout(() => setStep('otp'), 1500); // Simulate bank redirect
      } else if (step === 'otp') finalizeLinking();
    }
  };

  const finalizeLinking = () => {
    setStep('loading');
    setTimeout(() => {
      const newMethod: PaymentMethod = {
        id: `m_${Date.now()}`,
        type: activeFlow!,
        label: activeFlow === 'card' ? `•••• ${cardNum.slice(-4)}` : phone,
        isDefault: methods.length === 0,
        provider: activeFlow === 'card' ? (cardNum.startsWith('4') ? 'Visa' : 'Mastercard') : undefined
      };

      updateUser({ paymentMethods: [...methods, newMethod] });
      setStep('success');
      setTimeout(() => {
        closeFlow();
        showToast(`${activeFlow?.toUpperCase()} Linked!`, 'success', 'center');
      }, 1500);
    }, 1500);
  };

  const closeFlow = () => {
    setFlowVisible(false);
    setStep('selection');
    setActiveFlow(null);
    setPhone(''); setOtp(''); setMpin(''); setCardNum(''); setExpiry(''); setCvv('');
  };

  const getBrandColor = () => {
    if (activeFlow === 'gcash') return '#007dfe';
    if (activeFlow === 'maya') return '#c1ff00';
    return COLORS.navy;
  };

  const renderFlowContent = () => {
    if (step === 'loading') {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={getBrandColor()} />
          <Text style={{ marginTop: 20, color: COLORS.gray500, fontWeight: '500' }}>Processing request...</Text>
        </View>
      );
    }

    if (step === 'success') {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#16a34a20', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="checkmark-circle" size={60} color="#16a34a" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.navy }}>Successfully Linked!</Text>
          <Text style={{ marginTop: 8, color: COLORS.gray500, textAlign: 'center' }}>Your account is now ready for 1-click payments.</Text>
        </View>
      );
    }

    return (
      <View style={{ padding: 24 }}>
        <View style={{ width: 40, height: 4, backgroundColor: COLORS.gray200, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
        
        {/* Header Label */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: getBrandColor() + '15', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons 
              name={activeFlow === 'card' ? 'card' : (activeFlow === 'gcash' ? 'wallet' : 'flash')} 
              size={20} color={getBrandColor()} 
            />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.navy }}>Link {activeFlow?.toUpperCase()}</Text>
            <Text style={{ fontSize: 12, color: COLORS.gray400 }}>
              {step === 'input' ? 'Secure authentication' : (step === 'otp' ? 'OTP Verification' : 'Final Authorization')}
            </Text>
          </View>
        </View>

        {/* Dynamic Forms */}
        {activeFlow === 'card' && step === 'input' && (
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.gray400, marginBottom: 8 }}>CARD NUMBER</Text>
              <MaskedTextInput
                mask="9999 9999 9999 9999"
                style={formStyles.input}
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                value={cardNum}
                onChangeText={setCardNum}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.gray400, marginBottom: 8 }}>EXPIRY</Text>
                <MaskedTextInput mask="99/99" style={formStyles.input} placeholder="MM/YY" keyboardType="numeric" value={expiry} onChangeText={setExpiry} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.gray400, marginBottom: 8 }}>CVV</Text>
                <TextInput style={formStyles.input} placeholder="•••" keyboardType="numeric" secureTextEntry maxLength={3} value={cvv} onChangeText={setCvv} />
              </View>
            </View>
          </View>
        )}

        {(activeFlow === 'gcash' || activeFlow === 'maya') && step === 'input' && (
          <View>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.gray400, marginBottom: 8 }}>MOBILE NUMBER</Text>
            <MaskedTextInput
              mask="9999 999 9999"
              style={formStyles.input}
              placeholder="09XX XXX XXXX"
              keyboardType="numeric"
              value={phone}
              onChangeText={setPhone}
            />
            <Text style={{ marginTop: 12, fontSize: 12, color: COLORS.gray500, lineHeight: 18 }}>
              We'll send a code to this number to verify your ownership of this {activeFlow} account.
            </Text>
          </View>
        )}

        {step === 'otp' && (
          <View>
            <Text style={{ textAlign: 'center', color: COLORS.navy, fontWeight: '600', marginBottom: 16 }}>
              Enter the 6-digit code sent to your number
            </Text>
            <MaskedTextInput
              mask="999 999"
              style={[formStyles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]}
              placeholder="000 000"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
            <TouchableOpacity style={{ marginTop: 20 }}>
              <Text style={{ textAlign: 'center', color: getBrandColor(), fontWeight: 'bold' }}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'mpin' && (
          <View>
            <Text style={{ textAlign: 'center', color: COLORS.navy, fontWeight: '600', marginBottom: 16 }}>
              Enter your {activeFlow?.toUpperCase()} MPIN
            </Text>
            <TextInput
              style={[formStyles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 12 }]}
              placeholder="••••"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              value={mpin}
              onChangeText={setMpin}
              autoFocus
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
          <TouchableOpacity style={{ flex: 1, padding: 18, alignItems: 'center' }} onPress={closeFlow}>
            <Text style={{ fontWeight: 'bold', color: COLORS.gray400 }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 2, backgroundColor: getBrandColor(), padding: 18, borderRadius: 16, alignItems: 'center' }}
            onPress={handleNextStep}
          >
            <Text style={{ fontWeight: 'bold', color: activeFlow === 'maya' ? COLORS.navy : COLORS.white }}>
              {step === 'input' ? 'Continue' : 'Verify & Link'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          <View style={styles.headerCircle1} /><View style={styles.headerCircle2} />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Methods</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          {methods.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="wallet-outline" size={64} color={COLORS.gray200} />
              <Text style={styles.emptyText}>No payment methods linked yet.</Text>
            </View>
          ) : (
            methods.map(m => (
              <TouchableOpacity key={m.id} style={[styles.methodCard, m.isDefault && styles.methodCardDefault]} onPress={() => {}}>
                <View style={[styles.iconBox, m.type === 'gcash' ? styles.gcashBg : (m.type === 'maya' ? styles.mayaBg : styles.cardBg)]}>
                  <Ionicons 
                    name={m.type === 'card' ? 'card' : (m.type === 'gcash' ? 'wallet' : 'flash')} 
                    size={24} color={m.type === 'gcash' ? '#007dfe' : (m.type === 'maya' ? '#c1ff00' : COLORS.navy)} 
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodLabel}>{m.type === 'card' ? `${m.provider} ${m.label}` : m.type.toUpperCase()}</Text>
                  <Text style={styles.methodSub}>{m.type === 'card' ? 'Linked Card' : `Wallet (${m.label})`}</Text>
                </View>
                {m.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>DEFAULT</Text></View>}
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={styles.addBtn} onPress={() => startFlow('card')} activeOpacity={0.7}>
            <Ionicons name="card-outline" size={22} color={COLORS.gold} />
            <Text style={styles.addBtnText}>Link Credit/Debit Card</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <TouchableOpacity style={[styles.addBtn, { flex: 1, marginTop: 0 }]} onPress={() => startFlow('gcash')}>
              <Ionicons name="wallet-outline" size={22} color="#007dfe" />
              <Text style={[styles.addBtnText, { color: '#007dfe' }]}>GCash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { flex: 1, marginTop: 0, borderColor: '#c1ff00' }]} onPress={() => startFlow('maya')}>
              <Ionicons name="flash-outline" size={22} color="#c1ff00" />
              <Text style={[styles.addBtnText, { color: '#c1ff00' }]}>Maya</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <Modal visible={flowVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(10,30,61,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
            {renderFlowContent()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const formStyles = {
  input: {
    backgroundColor: '#f8f6f3',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: COLORS.navy,
    borderWidth: 1.5,
    borderColor: '#f0ede8',
  }
};
