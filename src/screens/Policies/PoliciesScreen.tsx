import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

const POLICIES = [
  {
    title: 'Check-in / Check-out',
    text: 'Check-in time is 2:00 PM. Check-out time is 12:00 PM. Early check-in and late check-out are subject to availability and may incur additional charges.',
  },
  {
    title: 'Cancellation Policy',
    text: 'Free cancellation up to 24 hours before check-in. Cancellations within 24 hours are subject to a one-night charge. A 15% cancellation fee applies to all cancelled bookings.',
  },
  {
    title: 'Pet Policy',
    text: 'Pets are not allowed in any of our properties unless explicitly stated in the room details.',
  },
  {
    title: 'Smoking Policy',
    text: 'All our properties are strictly non-smoking. A cleaning fee of ₱5,000 will be charged for violations.',
  },
];

export default function PoliciesScreen() {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Policies</Text>
          <Text style={styles.subtitle}>Terms and hotel policies</Text>
        </View>
      </View>
      <View style={styles.body}>
        {POLICIES.map(p => (
          <View key={p.title} style={styles.card}>
            <Text style={styles.sectionTitle}>{p.title}</Text>
            <Text style={styles.text}>{p.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
