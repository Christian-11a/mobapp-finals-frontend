import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Platform, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';

type ContentSection = {
  subtitle?: string;
  text: string;
  bullets?: string[];
};

const HELP_CONTENT: Record<string, ContentSection[]> = {
  'manage-rooms': [
    {
      subtitle: 'Configuring Inventory',
      text: 'As an administrator, you define the structural setup of the property. Ensure each room class (Suite, Deluxe, etc.) has accurate amenities mapping.',
    },
    {
      subtitle: 'Out-of-Order (OOO) Status',
      text: 'Rooms undergoing major repairs should be marked as OOO. This automatically removes them from your occupancy statistics and prevents bookings.',
    },
    {
      subtitle: 'Amenities Mapping',
      text: 'Always link specific features to room IDs:',
      bullets: ['High Floor / Accessibility', 'Sea View / Balcony', 'Mini-bar / Kitchenette']
    }
  ],
  'cancellations': [
    {
      subtitle: 'Policy Configuration',
      text: 'Define rules based on rate plans. Standard policies typically include a 24-hour notice window.',
    },
    {
      subtitle: 'Auto-Release Inventory',
      text: 'Our system is set to instantly return cancelled rooms to the available pool across all connected channels to maximize revenue.',
    },
    {
      subtitle: 'No-Show Fees',
      text: 'Administrators must authorize no-show fees during the Night Audit if a guaranteed reservation fails to arrive.',
    }
  ],
  'sync-issues': [
    {
      subtitle: 'Force Refresh',
      text: 'If availability doesn\'t match the guest view, use the "Force Sync" option in System Settings to pull fresh data from the server.',
    },
    {
      subtitle: 'Mapping Validation',
      text: 'Ensure room names and rate codes match exactly between the Mobile Middleware and the core PMS.',
    }
  ],
  'notifications': [
    {
      subtitle: 'Permissions Check',
      text: 'Ensure staff devices have "Allow Notifications" toggled ON in their OS settings.',
    },
    {
      subtitle: 'Role-Based Routing',
      text: 'Verify that the staff member is assigned the correct role. Supervisors receive operational alerts, while Front Desk receives check-in alerts.',
    }
  ]
};

export default function AdminHelpDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AdminHelpDetail'>>();
  const navigation = useNavigation();
  const { id, title, category } = route.params;

  const content = HELP_CONTENT[id] || [{ text: 'Documentation for this section is currently being updated.' }];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6f3' }}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerDecor} />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.categoryText}>{category}</Text>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {content.map((item, idx) => (
            <View key={idx} style={styles.section}>
              {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
              <Text style={styles.text}>{item.text}</Text>
              {item.bullets && item.bullets.map((b, bidx) => (
                <View key={bidx} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.footerInfo}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.gray400} />
            <Text style={styles.footerText}>Last updated: April 2026 · Staff Only</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.navy,
    height: 160,
    width: '100%',
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerDecor: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.gold, opacity: 0.1, top: -40, right: -30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  categoryText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginTop: 2 },
  scroll: { flex: 1, backgroundColor: '#f8f6f3' },
  body: { padding: 24 },
  section: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#f0ede8',
  },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.navy, marginBottom: 8 },
  text: { fontSize: 14, color: '#4a5565', lineHeight: 22 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8, paddingLeft: 4 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.gold },
  bulletText: { fontSize: 14, color: '#4a5565' },
  footerInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  footerText: { fontSize: 12, color: COLORS.gray400 },
});
