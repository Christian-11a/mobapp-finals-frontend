import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Platform, Switch, StyleSheet, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../context/ToastContext';
import { useSystem } from '../../context/SystemContext';
import { COLORS } from '../../constants/colors';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

export default function SystemSettingsScreen() {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { config, updateConfig } = useSystem();

  const [hotelName, setHotelName] = useState(config.hotelName);
  const [currency, setCurrency] = useState(config.currency);
  const [autoConfirm, setAutoConfirm] = useState(config.autoConfirmBookings);
  const [taxRate, setTaxRate] = useState(String(config.taxRate));
  
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const handleSave = () => {
    updateConfig({
      hotelName,
      currency,
      autoConfirmBookings: autoConfirm,
      taxRate: Number(taxRate) || 0,
    });
    showToast('System configuration saved successfully.', 'success');
    navigation.goBack();
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={itemStyles.section}>
      <Text style={itemStyles.sectionTitle}>{title}</Text>
      <View style={itemStyles.card}>{children}</View>
    </View>
  );

  const renderSwitch = (label: string, sub: string, value: boolean, onValueChange: () => void) => (
    <View style={itemStyles.row}>
      <View style={itemStyles.info}>
        <Text style={itemStyles.label}>{label}</Text>
        <Text style={itemStyles.sub}>{sub}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: '#e5e7eb', true: COLORS.navy }}
        thumbColor={Platform.OS === 'android' ? (value ? COLORS.gold : '#f3f4f6') : (value ? COLORS.white : '')}
      />
    </View>
  );

  const renderInput = (label: string, value: string, onChange: (t: string) => void, placeholder: string) => (
    <View style={itemStyles.inputGroup}>
      <Text style={itemStyles.inputLabel}>{label}</Text>
      <TextInput
        style={itemStyles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6f3' }}>
      <StatusBar barStyle="light-content" />
      
      <View style={headerStyles.header}>
        <View style={headerStyles.headerDecor1} />
        <View style={headerStyles.headerContent}>
          <TouchableOpacity style={headerStyles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={headerStyles.headerTitle}>System Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={itemStyles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          
          {renderSection('Property Configuration', (
            <>
              {renderInput('Hotel Name', hotelName, setHotelName, 'Enter hotel name')}
              <View style={itemStyles.divider} />
              <View style={itemStyles.row}>
                <View style={itemStyles.info}>
                  <Text style={itemStyles.label}>Check-in Time</Text>
                  <Text style={itemStyles.sub}>Standard arrival time</Text>
                </View>
                <Text style={itemStyles.valueText}>{config.checkInTime}</Text>
              </View>
              <View style={itemStyles.divider} />
              <View style={itemStyles.row}>
                <View style={itemStyles.info}>
                  <Text style={itemStyles.label}>Check-out Time</Text>
                  <Text style={itemStyles.sub}>Standard departure time</Text>
                </View>
                <Text style={itemStyles.valueText}>{config.checkOutTime}</Text>
              </View>
            </>
          ))}

          {renderSection('Localization & Finance', (
            <>
              <View style={itemStyles.row}>
                <View style={itemStyles.info}>
                  <Text style={itemStyles.label}>Base Currency</Text>
                  <Text style={itemStyles.sub}>Primary currency for billing</Text>
                </View>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  onPress={() => setCurrencyModalVisible(true)}
                >
                  <Text style={itemStyles.valueText}>{currency}</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
                </TouchableOpacity>
              </View>
              <View style={itemStyles.divider} />
              {renderInput('Tax Rate (%)', taxRate, setTaxRate, '12')}
            </>
          ))}

          {renderSection('Operational Rules', (
            <>
              {renderSwitch(
                'Auto-Confirm Bookings',
                'Instantly approve new reservations',
                autoConfirm,
                () => setAutoConfirm(!autoConfirm)
              )}
              <View style={itemStyles.divider} />
              <View style={itemStyles.row}>
                <View style={itemStyles.info}>
                  <Text style={itemStyles.label}>Cancellation Grace Period</Text>
                  <Text style={itemStyles.sub}>Hours for free cancellation</Text>
                </View>
                <Text style={itemStyles.valueText}>24h</Text>
              </View>
            </>
          ))}

          <TouchableOpacity style={itemStyles.saveBtn} onPress={handleSave}>
            <Text style={itemStyles.saveBtnText}>Apply Global Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal visible={currencyModalVisible} transparent animationType="slide">
        <View style={itemStyles.modalOverlay}>
          <View style={itemStyles.modalSheet}>
            <View style={itemStyles.modalHeader}>
              <Text style={itemStyles.modalTitle}>Select Base Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.navy} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity 
                  key={cur.code} 
                  style={[itemStyles.curOption, currency === cur.code && itemStyles.curOptionActive]}
                  onPress={() => {
                    setCurrency(cur.code);
                    setCurrencyModalVisible(false);
                  }}
                >
                  <View style={itemStyles.curSymbol}>
                    <Text style={itemStyles.curSymbolText}>{cur.symbol}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={itemStyles.curCode}>{cur.code}</Text>
                    <Text style={itemStyles.curLabel}>{cur.label}</Text>
                  </View>
                  {currency === cur.code && <Ionicons name="checkmark-circle" size={24} color={COLORS.gold} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.navy,
    height: 140,
    width: '100%',
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerDecor1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.gold, opacity: 0.1, top: -40, right: -30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
});

const itemStyles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8f6f3' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12, fontWeight: 'bold', color: '#b0b8c1', letterSpacing: 1.1,
    textTransform: 'uppercase', marginBottom: 12, marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#f0ede8',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 18,
  },
  info: { flex: 1, marginRight: 16 },
  label: { fontSize: 15, fontWeight: 'bold', color: COLORS.navy },
  sub: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  valueText: { fontSize: 14, fontWeight: '600', color: COLORS.gold },
  divider: { height: 1, backgroundColor: '#f0ede8' },
  inputGroup: { paddingVertical: 16 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.navy, marginBottom: 8 },
  input: {
    backgroundColor: '#f8f9fa', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#eee', fontSize: 14, color: COLORS.navy,
  },
  saveBtn: {
    backgroundColor: COLORS.navy, borderRadius: 16, height: 56,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0ede8' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.navy },
  curOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  curOptionActive: { borderColor: COLORS.gold, backgroundColor: 'rgba(212,165,116,0.05)' },
  curSymbol: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  curSymbolText: { fontSize: 18, fontWeight: 'bold', color: COLORS.gold },
  curCode: { fontSize: 15, fontWeight: 'bold', color: COLORS.navy },
  curLabel: { fontSize: 12, color: COLORS.gray400 },
});
