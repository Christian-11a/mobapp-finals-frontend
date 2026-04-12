import React from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../context/BookingContext';
import { useRooms } from '../../context/RoomContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import styles from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { rooms } = useRooms();
  const navigation = useNavigation<Nav>();
  const topRated = rooms.filter(r => r.isTopRated && r.isAvailable);
  const myBookings = bookings.filter(b => b.userId === user?.id);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{rooms.filter(r => r.isAvailable).length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{myBookings.length}</Text>
          <Text style={styles.statLabel}>My Bookings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{rooms.length}</Text>
          <Text style={styles.statLabel}>Total Rooms</Text>
        </View>
      </View>

      {/* Top Rated */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs' as any)}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={topRated}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })} activeOpacity={0.85}>
              <Image source={{ uri: item.thumbnailPic?.url }} style={styles.cardImage} />
              <View style={styles.topBadge}><Text style={styles.topBadgeText}>★ TOP</Text></View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardType}>{item.type} · {item.maxPeople} guests</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardPrice}>${item.pricePerNight}<Text style={styles.perNight}>/night</Text></Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color={COLORS.gold} />
                    <Text style={styles.ratingText}> {item.averageRating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Recent bookings if any */}
      {myBookings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Booking</Text>
          </View>
          <View style={styles.recentCard}>
            <View style={styles.recentLeft}>
              <Text style={styles.recentRoom} numberOfLines={1}>{myBookings[0].room.title}</Text>
              <Text style={styles.recentDate}>
                {new Date(myBookings[0].checkInDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} →{' '}
                {new Date(myBookings[0].checkOutDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.recentBadge}>
              <Text style={styles.recentBadgeText}>{myBookings[0].status}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}