import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const HELP_CATEGORIES = [
  {
    title: 'Management Guides',
    items: [
      { id: 'manage-rooms', title: 'Managing Room Inventory', icon: 'bed-outline' },
      { id: 'cancellations', title: 'Handling Cancellations', icon: 'close-circle-outline' },
      { id: 'review-moderation', title: 'Guest Review Moderation', icon: 'star-outline' },
    ]
  },
  {
    title: 'Troubleshooting',
    items: [
      { id: 'sync-issues', title: 'Syncing Room Availability', icon: 'sync-outline' },
      { id: 'notifications', title: 'Notification Failures', icon: 'notifications-off-outline' },
    ]
  }
];

export default function AdminHelpScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6f3' }}>
      <StatusBar barStyle="light-content" />
      
      <View style={headerStyles.header}>
        <View style={headerStyles.headerDecor1} />
        <View style={headerStyles.headerContent}>
          <TouchableOpacity style={headerStyles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={headerStyles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={itemStyles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          
          <View style={itemStyles.statusCard}>
            <View style={itemStyles.statusHeader}>
              <Text style={itemStyles.statusTitle}>System Status</Text>
              <View style={itemStyles.liveBadge}>
                <View style={itemStyles.liveDot} />
                <Text style={itemStyles.liveText}>LIVE</Text>
              </View>
            </View>
            <View style={itemStyles.statusRow}>
              <Text style={itemStyles.statusLabel}>API Server</Text>
              <Text style={itemStyles.statusValue}>Operational</Text>
            </View>
            <View style={itemStyles.statusRow}>
              <Text style={itemStyles.statusLabel}>Payment Engine</Text>
              <Text style={itemStyles.statusValue}>Operational</Text>
            </View>
          </View>

          {HELP_CATEGORIES.map((cat, idx) => (
            <View key={idx} style={itemStyles.section}>
              <Text style={itemStyles.sectionTitle}>{cat.title}</Text>
              <View style={itemStyles.card}>
                {cat.items.map((item, iidx) => (
                  <TouchableOpacity 
                    key={iidx} 
                    style={[itemStyles.row, iidx === cat.items.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => navigation.navigate('AdminHelpDetail', { 
                      id: item.id, 
                      title: item.title,
                      category: cat.title
                    })}
                  >
                    <View style={itemStyles.iconBox}>
                      <Ionicons name={item.icon as any} size={18} color={COLORS.gold} />
                    </View>
                    <Text style={itemStyles.label}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#b0b8c1" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={itemStyles.supportBtn}>
            <Ionicons name="chatbubbles-outline" size={20} color={COLORS.white} />
            <Text style={itemStyles.supportBtnText}>Contact Technical Support</Text>
          </TouchableOpacity>

          <Text style={itemStyles.footerText}>LuxeStay Support v2.4.0</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
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
  statusCard: {
    backgroundColor: COLORS.navy, borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusTitle: { color: COLORS.white, fontSize: 15, fontWeight: 'bold' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  liveText: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  statusValue: { color: '#10b981', fontSize: 13, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#b0b8c1', letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: '#f0ede8' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f8f6f3' },
  iconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(212,165,116,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.navy },
  supportBtn: { backgroundColor: COLORS.gold, borderRadius: 16, height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, gap: 10 },
  supportBtnText: { fontSize: 15, fontWeight: 'bold', color: COLORS.white },
  footerText: { textAlign: 'center', color: COLORS.gray400, fontSize: 11, marginTop: 24 },
});
