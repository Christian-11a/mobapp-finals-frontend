import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';
import { styles } from './styles';
import { COLORS } from '../../constants/colors';
import { useSystem } from '../../context/SystemContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
    title: "Luxury\nRedefined",
    subtitle: "Handpicked rooms and suites crafted for an unforgettable experience."
  },
  {
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
    title: "Modern\nComfort",
    subtitle: "Experience contemporary living with world-class amenities at your fingertips."
  },
  {
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
    title: "Unmatched\nService",
    subtitle: "Our 24/7 concierge ensures your stay is nothing short of perfect."
  }
];

export default function LandingScreen({ navigation }: Props) {
  const { config } = useSystem();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Carousel */}
      <View style={styles.carouselContainer}>
        <Image 
          source={{ uri: SLIDES[currentIndex].image }} 
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.navy, opacity: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0]
        }) }]} />
      </View>
      
      <LinearGradient
        colors={[
          'rgba(10, 30, 61, 0.4)', 
          'rgba(10, 30, 61, 0.6)', 
          'rgba(10, 30, 61, 0.85)', 
          'rgb(10, 30, 61)'
        ]}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.gradientOverlay}
      />
      
      <View style={[
        styles.contentContainer, 
        { 
          paddingTop: insets.top > 0 ? insets.top : 20, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20 
        }
      ]}>
        {/* Header Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={24} color={COLORS.white} />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoTitle}>{config.hotelName.split(' ')[0]}</Text>
            <Text style={styles.logoSubtitle}>{config.hotelName.split(' ').slice(1).join(' ') || 'Premium Hotels'}</Text>
          </View>
        </View>

        {/* Main Content Carousel */}
        <View style={styles.mainContent}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>
              {SLIDES[currentIndex].title}
            </Text>
            <Text style={styles.subtitle}>
              {SLIDES[currentIndex].subtitle}
            </Text>
          </Animated.View>

          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {SLIDES.map((_, index) => (
              <View 
                key={index} 
                style={index === currentIndex ? styles.paginationDotActive : styles.paginationDot} 
              />
            ))}
          </View>

          {/* Feature Pills */}
          <View style={styles.featuresContainer}>
            {['Free Cancellation', 'Best Rate', '24/7 Concierge', 'Secure Booking'].map((feature) => (
              <View key={feature} style={styles.featurePill}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}