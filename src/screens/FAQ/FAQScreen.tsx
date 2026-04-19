import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import styles from './styles';

const FAQS = [
  { q: 'What are the check-in and check-out times?', a: 'Check-in starts at 2:00 PM and check-out is by 12:00 PM. Early check-in or late check-out may be available upon request.' },
  { q: 'Do you offer free Wi-Fi?', a: 'Yes! Complimentary high-speed Wi-Fi is available throughout the hotel, including rooms and common areas.' },
  { q: 'Is parking available at the hotel?', a: 'Yes, we offer free on-site parking for all guests. Valet service is also available for a small fee.' },
  { q: 'Can I bring my pet?', a: 'Pets are welcome at LuxeStay in designated pet-friendly rooms. Please inform us in advance to ensure availability.' },
  { q: 'What is your cancellation policy?', a: 'Free cancellation is available up to 24 hours before check-in. Cancellations within this period incur a 15% fee of the total booking amount.' },
  { q: 'Do you provide airport shuttle service?', a: 'Yes, we offer airport pick-up and drop-off service. Advance booking is required. Charges may apply.' },
  { q: 'Are meals included with the stay?', a: 'Breakfast is complimentary for room bookings that include it. Additional meals and in-room dining are available at extra cost.' },
  { q: 'Can I host events or meetings at the hotel?', a: 'Yes! We have fully equipped event spaces for meetings, conferences, and special occasions. Contact our events team for booking and pricing.' },
];

export default function FAQScreen() {
  const navigation = useNavigation();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

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
              <Text style={styles.headerTitle}>FAQ</Text>
              <Text style={styles.headerSubtitle}>Frequently asked questions</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.intro}>
            Can't find what you're looking for? Contact us at{' '}
            <Text 
              style={styles.introLink} 
              onPress={() => Linking.openURL('mailto:support@luxestay.com')}
            >
              support@luxestay.com
            </Text>
          </Text>

          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <View key={idx} style={[styles.item, isOpen && styles.itemOpen]}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => setOpenIdx(isOpen ? null : idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.questionLeft}>
                    <View style={styles.qNumber}>
                      <Text style={styles.qNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.questionText}>{faq.q}</Text>
                  </View>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isOpen ? COLORS.gold : COLORS.gray400}
                  />
                </TouchableOpacity>
                {isOpen && (
                  <View style={styles.answerWrap}>
                    <Text style={styles.answerText}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}