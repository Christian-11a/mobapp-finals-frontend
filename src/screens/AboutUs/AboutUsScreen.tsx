import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import styles from './styles';

const OFFERS = [
  { icon: 'wifi-outline' as const, title: 'Free Wi-Fi', desc: 'High-speed internet throughout the property.' },
  { icon: 'restaurant-outline' as const, title: 'Breakfast', desc: 'Complimentary breakfast every morning.' },
  { icon: 'tv-outline' as const, title: 'Entertainment', desc: 'Smart TV and streaming in every room.' },
  { icon: 'people-outline' as const, title: 'Spacious Rooms', desc: 'Designed for comfort and families.' },
];

const REVIEWS = [
  { text: '"Amazing stay! The staff were so friendly and the rooms were immaculate."', author: '— Jane Doe' },
  { text: '"Breathtaking views and top-tier service. We will definitely be coming back."', author: '— Mark Santos' },
  { text: '"The best hotel experience I have had. Luxury redefined — every detail was perfect."', author: '— Ana Reyes' },
];

const STATS = [
  { value: '500+', label: 'Happy Guests' },
  { value: '50+', label: 'Room Types' },
  { value: '4.9', label: 'Avg Rating' },
];

export default function AboutUsScreen() {
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
            <Text style={styles.headerTitle}>About Us</Text>
          </View>
        </View>

        {/* Hero Section with New Logo Layout */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="business" size={18} color={COLORS.white} />
            </View>
            <Text style={styles.logoText}>LuxeStay</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome to LuxeStay</Text>
          <Text style={styles.heroSub}>
            Experience luxury, comfort, and impeccable service. Our curated accommodations are designed for relaxation and unforgettable memories.
          </Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < STATS.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* What We Offer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.offersGrid}>
            {OFFERS.map(o => (
              <View key={o.title} style={styles.offerCard}>
                <View style={styles.offerIconWrap}>
                  <Ionicons name={o.icon} size={22} color={COLORS.gold} />
                </View>
                <Text style={styles.offerTitle}>{o.title}</Text>
                <Text style={styles.offerDesc}>{o.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Experience section */}
        <View style={styles.section}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' }}
            style={styles.experienceImg}
            resizeMode="cover"
          />
          <Text style={styles.experienceTitle}>Your Comfort, Our Priority</Text>
          <Text style={styles.experienceText}>
            At LuxeStay, we pride ourselves on delivering an unforgettable experience. From meticulously designed rooms to personalised service, every detail is crafted for your satisfaction.
          </Text>
          <Text style={styles.experienceText}>
            Relax, recharge, and create memories in an environment that blends elegance with convenience.
          </Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Our Guests Say</Text>
          {REVIEWS.map(r => (
            <View key={r.author} style={styles.reviewCard}>
              <View style={styles.starsRow}>
                {Array(5).fill(0).map((_, i) => (
                  <Ionicons key={i} name="star" size={13} color={COLORS.gold} />
                ))}
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
              <Text style={styles.reviewAuthor}>{r.author}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}