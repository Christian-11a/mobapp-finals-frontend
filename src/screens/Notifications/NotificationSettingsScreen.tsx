import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Platform, Switch, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { settings, updateSettings } = useNotifications();
  const { showToast } = useToast();

  const togglePush = (key: keyof typeof settings.push) => {
    updateSettings({ push: { ...settings.push, [key]: !settings.push[key] } });
  };

  const toggleEmail = (key: keyof typeof settings.email) => {
    updateSettings({ email: { ...settings.email, [key]: !settings.email[key] } });
  };

  const handleSave = () => {
    showToast('Notification preferences updated!', 'success', 'top');
    navigation.goBack();
  };

  const renderSwitch = (value: boolean, onValueChange: () => void) => (
    <Switch 
      value={value} 
      onValueChange={onValueChange} 
      trackColor={{ false: '#e5e7eb', true: COLORS.navy }}
      thumbColor={Platform.OS === 'android' ? (value ? COLORS.gold : '#f3f4f6') : (value ? COLORS.white : '')}
      ios_backgroundColor="#e5e7eb"
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6f3' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={headerStyles.header}>
        <View style={headerStyles.headerDecor1} />
        <View style={headerStyles.headerDecor2} />
        <View style={headerStyles.headerContent}>
          <TouchableOpacity style={headerStyles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={headerStyles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={itemStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20, paddingTop: 30 }}>
          <Text style={itemStyles.sectionTitle}>Push Notifications</Text>
          <View style={itemStyles.card}>
            <View style={itemStyles.row}>
              <View style={itemStyles.info}>
                <Text style={itemStyles.label}>Booking Updates</Text>
                <Text style={itemStyles.sub}>Get notified about your reservations</Text>
              </View>
              {renderSwitch(settings.push.bookings, () => togglePush('bookings'))}
            </View>
            <View style={itemStyles.divider} />
            <View style={itemStyles.row}>
              <View style={itemStyles.info}>
                <Text style={itemStyles.label}>Promotions & Offers</Text>
                <Text style={itemStyles.sub}>Never miss a special luxury deal</Text>
              </View>
              {renderSwitch(settings.push.promos, () => togglePush('promos'))}
            </View>
            <View style={itemStyles.divider} />
            <View style={itemStyles.row}>
              <View style={itemStyles.info}>
                <Text style={itemStyles.label}>Security Alerts</Text>
                <Text style={itemStyles.sub}>Login attempts and password changes</Text>
              </View>
              {renderSwitch(settings.push.account, () => togglePush('account'))}
            </View>
          </View>

          <Text style={itemStyles.sectionTitle}>Email Preferences</Text>
          <View style={itemStyles.card}>
            <View style={itemStyles.row}>
              <View style={itemStyles.info}>
                <Text style={itemStyles.label}>Monthly Newsletter</Text>
                <Text style={itemStyles.sub}>Travel inspiration and hotel news</Text>
              </View>
              {renderSwitch(settings.email.newsletters, () => toggleEmail('newsletters'))}
            </View>
            <View style={itemStyles.divider} />
            <View style={itemStyles.row}>
              <View style={itemStyles.info}>
                <Text style={itemStyles.label}>Billing & Invoices</Text>
                <Text style={itemStyles.sub}>Receive receipts and payment logs</Text>
              </View>
              {renderSwitch(settings.email.billing, () => toggleEmail('billing'))}
            </View>
          </View>

          <TouchableOpacity style={itemStyles.saveBtn} onPress={handleSave}>
            <Text style={itemStyles.saveBtnText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.navy,
    height: 160,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerDecor1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.gold, opacity: 0.1, top: -40, right: -30,
  },
  headerDecor2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.gold, opacity: 0.05, bottom: 20, left: -20,
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
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
});

const itemStyles = StyleSheet.create({
  scroll: { flex: 1, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#f8f6f3' },
  sectionTitle: {
    fontSize: 12, fontWeight: 'bold', color: '#b0b8c1', letterSpacing: 1.1,
    textTransform: 'uppercase', marginBottom: 16, marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 20,
    marginBottom: 24, borderWidth: 1.5, borderColor: '#f0ede8',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 18,
  },
  info: { flex: 1, marginRight: 16 },
  label: { fontSize: 15, fontWeight: 'bold', color: COLORS.navy },
  sub: { fontSize: 12, color: COLORS.gray400, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0ede8' },
  saveBtn: {
    backgroundColor: COLORS.navy, borderRadius: 16, height: 56,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
});
