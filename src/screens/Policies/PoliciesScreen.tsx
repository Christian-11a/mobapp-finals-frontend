import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import styles from './styles';

const POLICIES = [
  {
    title: 'Check-in / Check-out',
    icon: 'time-outline' as const,
    text: 'Check-in time is 2:00 PM. Check-out time is 12:00 PM. Early check-in and late check-out are subject to availability and may incur additional charges.',
  },
  {
    title: 'Cancellation Policy',
    icon: 'calendar-outline' as const,
    text: 'Free cancellation up to 24 hours before check-in. Cancellations within 24 hours are subject to a one-night charge. A 15% cancellation fee applies to all cancelled bookings.',
  },
  {
    title: 'Pet Policy',
    icon: 'paw-outline' as const,
    text: 'Pets are not allowed in any of our properties unless explicitly stated in the room details.',
  },
  {
    title: 'Smoking Policy',
    icon: 'remove-circle-outline' as const,
    text: 'All our properties are strictly non-smoking. A cleaning fee of ₱5,000 will be charged for violations.',
  },
];

export default function PoliciesScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header with Decorative Circles */}
        <View style={styles.header}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Policies</Text>
              <Text style={styles.headerSubtitle}>Terms and hotel policies</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {POLICIES.map(p => (
            <View key={p.title} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Ionicons name={p.icon} size={18} color={COLORS.gold} />
                </View>
                <Text style={styles.sectionTitle}>{p.title}</Text>
              </View>
              <Text style={styles.text}>{p.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}