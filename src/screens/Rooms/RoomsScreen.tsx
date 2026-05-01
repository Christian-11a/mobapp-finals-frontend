import React, { useState, useMemo, useCallback } from 'react';
import {
  FlatList, Image, RefreshControl, Text, TextInput, TouchableOpacity,
  View, ScrollView, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useRooms } from '../../context/RoomContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { formatPrice } from '../../utils/formatUtils';
import styles from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRICE_STEPS = [0, 100, 200, 300, 500, 700, 1000];
const TYPES = ['All', 'Single', 'Double', 'Suite', 'Family', 'Exclusive'];

export default function RoomsScreen() {
  const navigation = useNavigation<Nav>();
  const { rooms, isLoading } = useRooms();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [maxPriceIndex, setMaxPriceIndex] = useState(PRICE_STEPS.length - 1);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const maxPrice = PRICE_STEPS[maxPriceIndex];
  const isFilterActive = selectedType !== 'All' || maxPriceIndex !== PRICE_STEPS.length - 1;

  const filtered = useMemo(() => {
    return rooms.filter(r => {
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedType === 'All' || r.type === selectedType;
      const matchPrice = r.pricePerNight <= maxPrice;
      return matchSearch && matchType && matchPrice;
    });
  }, [rooms, search, selectedType, maxPrice]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={{ color: COLORS.gray400, marginTop: 12 }}>Finding rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Our Rooms</Text>
        <Text style={styles.subtitle}>{filtered.length} room{filtered.length !== 1 ? 's' : ''} found</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rooms..."
            placeholderTextColor={COLORS.gray400}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowFilters(p => !p)} style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={showFilters ? COLORS.gold : COLORS.white} />
            {isFilterActive && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filters}>
            <Text style={styles.filterLabel}>Room Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, selectedType === t && styles.typeChipActive]}
                  onPress={() => setSelectedType(t)}
                >
                  <Text style={[styles.typeChipText, selectedType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>
              Max Price: <Text style={styles.filterValue}>${formatPrice(maxPrice)}/night</Text>
            </Text>
            <View style={styles.sliderRow}>
              {PRICE_STEPS.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.sliderStep, i <= maxPriceIndex && styles.sliderStepActive]}
                  onPress={() => setMaxPriceIndex(i)}
                />
              ))}
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>$0</Text>
              <Text style={styles.sliderLabelText}>$1000</Text>
            </View>
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} colors={[COLORS.gold]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={COLORS.gray300} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No rooms found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })}
            activeOpacity={0.9}
          >
            <View>
              <Image source={{ uri: item.thumbnailPic?.url }} style={styles.image} />
              {!item.isAvailable && (
                <View style={styles.unavailableOverlay}>
                  <Text style={styles.unavailableText}>UNAVAILABLE</Text>
                </View>
              )}
              {item.isTopRated && (
                <View style={styles.topBadge}>
                  <Text style={styles.topBadgeText}>★ TOP RATED</Text>
                </View>
              )}
            </View>
            <View style={styles.body}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.title}</Text>
                <View>
                  <Text style={styles.price}>${formatPrice(item.pricePerNight)}</Text>
                  <Text style={styles.perNight}>/night</Text>
                </View>
              </View>
              <Text style={styles.type}>{item.type} · Up to {item.maxPeople} guests</Text>
              <View style={styles.amenities}>
                {item.amenities.slice(0, 4).map(a => (
                  <View key={a} style={styles.amenity}>
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.footer}>
                <Text style={styles.rating}>★ {item.averageRating} ({item.reviewCount})</Text>
                <View style={[styles.badge, item.isAvailable ? styles.available : styles.unavailable]}>
                  <Text style={item.isAvailable ? styles.availableText : styles.unavailableTextBadge}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
