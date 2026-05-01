import React, { useState, useMemo, useCallback } from 'react';
import {
  FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity,
  View, Modal, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRooms } from '../../context/RoomContext';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { formatPrice } from '../../utils/formatUtils';
import styles from './styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = ['All', 'Popular', 'Top Rated', 'Luxury', 'Standard', 'Suites', 'Family'];
const PRICE_RANGES = [
  { label: 'Any', min: 0, max: 10000 },
  { label: 'Under $300', min: 0, max: 300 },
  { label: '$300 - $600', min: 300, max: 600 },
  { label: '$600+', min: 600, max: 10000 },
];
const SORT_OPTIONS = ['Rating', 'Price', 'Name'];

import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';

const SkeletonRoomCard = () => (
  <View style={[styles.roomCard, { height: 120 }]}>
    <SkeletonLoader width={120} height="100%" borderRadius={20} />
    <View style={[styles.roomInfo, { flex: 1, padding: 12, gap: 8 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SkeletonLoader width={60} height={12} />
        <SkeletonLoader width={40} height={12} />
      </View>
      <SkeletonLoader width="100%" height={16} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <SkeletonLoader width={80} height={20} />
        <SkeletonLoader width={60} height={14} />
      </View>
    </View>
  </View>
);

const SkeletonFeaturedCard = () => (
  <View style={styles.featuredCard}>
    <SkeletonLoader width="100%" height={160} borderRadius={28} />
    <View style={{ padding: 16, gap: 8 }}>
      <SkeletonLoader width={60} height={12} />
      <SkeletonLoader width="80%" height={16} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <SkeletonLoader width={60} height={14} />
        <SkeletonLoader width={40} height={14} />
      </View>
    </View>
  </View>
);

export default function HomeScreen() {
  const { user, updateUser } = useAuth();
  const { rooms, featuredRooms, isLoading } = useRooms();
  const { unreadCount } = useNotifications();
  const { showToast } = useToast();
  const navigation = useNavigation<Nav>();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [tempPriceRange, setTempPriceRange] = useState(PRICE_RANGES[0]);
  const [tempSortBy, setTempSortBy] = useState('Rating');
  const [tempAvailableOnly, setTempAvailableOnly] = useState(false);
  
  const [activePriceRange, setActivePriceRange] = useState(PRICE_RANGES[0]);
  const [activeSortBy, setActiveSortBy] = useState('Rating');
  const [activeAvailableOnly, setActiveAvailableOnly] = useState(false);

  const savedIds = user?.savedRoomIds || [];

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Real-time subscription handles data updates, but we provide visual feedback
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const toggleSave = (roomId: string) => {
    const isSaved = savedIds.includes(roomId);
    let newIds: string[];
    if (isSaved) {
      newIds = savedIds.filter(id => id !== roomId);
      showToast('Room removed from wishlist', 'info', 'bottom');
    } else {
      newIds = [...savedIds, roomId];
      showToast('Room saved to wishlist!', 'success', 'bottom');
    }
    updateUser({ savedRoomIds: newIds });
  };

  const filteredRooms = useMemo(() => {
    let result = rooms.filter(r => {
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
      
      let matchCategory = true;
      if (selectedCategory === 'Popular') {
        matchCategory = (r.reviewCount || 0) >= 50;
      } else if (selectedCategory === 'Top Rated') {
        matchCategory = r.averageRating >= 4.7 || r.isTopRated;
      } else if (selectedCategory === 'Luxury') {
        matchCategory = r.type === 'Exclusive' || r.pricePerNight >= 400;
      } else if (selectedCategory === 'Standard') {
        matchCategory = r.type === 'Single' || r.type === 'Double';
      } else if (selectedCategory === 'Suites') {
        matchCategory = r.type === 'Suite';
      } else if (selectedCategory === 'Family') {
        matchCategory = r.type === 'Family' || r.maxPeople >= 4;
      } else if (selectedCategory !== 'All') {
        matchCategory = r.type === selectedCategory;
      }

      const matchPrice = r.pricePerNight >= activePriceRange.min && r.pricePerNight <= activePriceRange.max;
      const matchAvailable = !activeAvailableOnly || r.isAvailable;
      return matchSearch && matchCategory && matchPrice && matchAvailable;
    });

    // Sorting
    result.sort((a, b) => {
      if (activeSortBy === 'Price') return a.pricePerNight - b.pricePerNight;
      if (activeSortBy === 'Rating') return b.averageRating - a.averageRating;
      if (activeSortBy === 'Name') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [rooms, search, selectedCategory, activePriceRange, activeSortBy, activeAvailableOnly]);

  const handleApplyFilters = () => {
    setActivePriceRange(tempPriceRange);
    setActiveSortBy(tempSortBy);
    setActiveAvailableOnly(tempAvailableOnly);
    setIsFilterVisible(false);
  };

  const handleResetFilters = () => {
    setTempPriceRange(PRICE_RANGES[0]);
    setTempSortBy('Rating');
    setTempAvailableOnly(false);
    
    setActivePriceRange(PRICE_RANGES[0]);
    setActiveSortBy('Rating');
    setActiveAvailableOnly(false);
    setIsFilterVisible(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <SkeletonLoader width={120} height={14} style={{ marginBottom: 8 }} />
              <SkeletonLoader width={180} height={24} />
            </View>
          </View>
          <View style={[styles.searchSection, { marginTop: 24 }]}>
            <SkeletonLoader width="82%" height={56} borderRadius={18} />
            <SkeletonLoader width={56} height={56} borderRadius={18} />
          </View>
        </View>
        <ScrollView scrollEnabled={false}>
          <View style={styles.categoriesContainer}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} width={80} height={36} borderRadius={18} />)}
            </View>
          </View>
          <View style={styles.section}>
            <SkeletonLoader width={140} height={20} style={{ marginBottom: 16, marginLeft: 20 }} />
            <View style={{ flexDirection: 'row', gap: 20, paddingHorizontal: 20 }}>
              <SkeletonFeaturedCard />
              <SkeletonFeaturedCard />
            </View>
          </View>
          <View style={[styles.section, { paddingHorizontal: 20 }]}>
            <SkeletonLoader width={140} height={20} style={{ marginBottom: 16 }} />
            {[1, 2, 3].map(i => <SkeletonRoomCard key={i} />)}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Hub */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'Guest'} 👋</Text>
            <Text style={styles.welcomeText}>Find Your Stay</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={{ 
                position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.gold, 
                borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
                borderWidth: 1.5, borderColor: COLORS.navy
              }}>
                <Text style={{ color: COLORS.navy, fontSize: 9, fontWeight: '800' }}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={COLORS.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search rooms, types..."
              placeholderTextColor={COLORS.gray400}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterBtn}
            onPress={() => setIsFilterVisible(true)}
          >
            <Ionicons name="options-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
      >
        {/* Category Tabs */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Rooms */}
        {featuredRooms.length > 0 && selectedCategory === 'All' && !search && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Rooms</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            >
              {featuredRooms.map(room => (
                <TouchableOpacity 
                  key={room.id} 
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })}
                >
                  <Image source={{ uri: room.thumbnailPic?.url }} style={styles.featuredImage} />
                  <TouchableOpacity 
                    style={styles.heartBtn}
                    onPress={() => toggleSave(room.id)}
                  >
                    <Ionicons 
                      name={savedIds.includes(room.id) ? "heart" : "heart-outline"} 
                      size={18} 
                      color={savedIds.includes(room.id) ? COLORS.red : COLORS.gray400} 
                    />
                  </TouchableOpacity>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>${formatPrice(room.pricePerNight)}</Text>
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredType}>{room.type}</Text>
                    <Text style={styles.featuredTitle} numberOfLines={1}>{room.title}</Text>
                    <View style={styles.featuredFooter}>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color={COLORS.gold} />
                        <Text style={styles.ratingText}>{room.averageRating}</Text>
                        <Text style={styles.reviewText}>({room.reviewCount})</Text>
                      </View>
                      <View style={styles.amenityRow}>
                        <View style={styles.amenityItem}>
                          <Ionicons name="people-outline" size={14} color={COLORS.gray500} />
                          <Text style={styles.amenityText}>{room.maxPeople}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Rooms List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {search || selectedCategory !== 'All' ? 'Search Results' : `All Rooms (${filteredRooms.length})`}
            </Text>
          </View>
          {filteredRooms.map(room => (
            <TouchableOpacity 
              key={room.id} 
              style={styles.roomCard}
              onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })}
            >
              <View>
                <Image source={{ uri: room.thumbnailPic?.url }} style={styles.roomImage} />
                <TouchableOpacity 
                  style={[styles.heartBtn, { top: 6, left: 6, width: 28, height: 28 }]}
                  onPress={() => toggleSave(room.id)}
                >
                  <Ionicons 
                    name={savedIds.includes(room.id) ? "heart" : "heart-outline"} 
                    size={16} 
                    color={savedIds.includes(room.id) ? COLORS.red : COLORS.gray400} 
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomType}>{room.type}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color={COLORS.gold} />
                    <Text style={styles.ratingText}>{room.averageRating}</Text>
                  </View>
                </View>
                <Text style={styles.roomTitle} numberOfLines={1}>{room.title}</Text>
                <View style={styles.roomFooter}>
                  <Text style={styles.roomPrice}>
                    ${formatPrice(room.pricePerNight)}<Text style={styles.perNight}>/night</Text>
                  </Text>
                  <View style={styles.amenityItem}>
                    <Ionicons name="people-outline" size={14} color={COLORS.gray400} />
                    <Text style={styles.amenityText}>{room.maxPeople} Guests</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filteredRooms.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="search" size={48} color={COLORS.gray300} />
              <Text style={{ color: COLORS.gray500, marginTop: 12 }}>No rooms found matching your criteria</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={isFilterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsFilterVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.navy} />
              </TouchableOpacity>
            </View>

            {/* Price Range */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceGrid}>
                {PRICE_RANGES.map(range => (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.priceOption, tempPriceRange.label === range.label && styles.priceOptionActive]}
                    onPress={() => setTempPriceRange(range)}
                  >
                    <Text style={[styles.priceOptionText, tempPriceRange.label === range.label && styles.priceOptionTextActive]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.sortGrid}>
                {SORT_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.sortOption, tempSortBy === option && styles.sortOptionActive]}
                    onPress={() => setTempSortBy(option)}
                  >
                    <Text style={[styles.priceOptionText, tempSortBy === option && styles.priceOptionTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Available Only */}
            <View style={styles.filterGroup}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Available Only</Text>
                  <Text style={styles.toggleSublabel}>Hide unavailable rooms</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.toggleSwitch, tempAvailableOnly && styles.toggleSwitchActive]}
                  onPress={() => setTempAvailableOnly(!tempAvailableOnly)}
                >
                  <View style={[styles.toggleKnob, tempAvailableOnly && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={[styles.categoryText, { color: COLORS.navy }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
