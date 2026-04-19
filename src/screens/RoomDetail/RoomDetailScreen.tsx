import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { useRooms } from '../../context/RoomContext';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import styles from './styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;
  route: RouteProp<RootStackParamList, 'RoomDetail'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const fmtStr = (d: string) =>
  new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

export default function RoomDetailScreen({ navigation, route }: Props) {
  const { roomId } = route.params;
  const { rooms } = useRooms();
  const room = rooms.find(r => r.id === roomId);
  const { reviews } = useBookings();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const savedIds = user?.savedRoomIds || [];
  const isSaved = savedIds.includes(roomId);

  const toggleSave = () => {
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

  const scrollViewRef = useRef<ScrollView>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (!room) return null;

  const allPhotos = room.photos && room.photos.length > 0
    ? room.photos
    : room.thumbnailPic
      ? [{ url: room.thumbnailPic.url }]
      : [];

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setGalleryIndex(idx);
  };

  const roomReviews = reviews.filter(r => r.roomId === roomId);

  return (
    <View style={styles.mainContainer}>
      <ScrollView ref={scrollViewRef} style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            data={allPhotos}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onGalleryScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={[styles.image, { width: SCREEN_WIDTH }]} />
            )}
          />
          <View style={styles.imageOverlay} pointerEvents="none" />
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
          </TouchableOpacity>

          <View style={styles.topRightBtns}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => showToast('Sharing feature coming soon!', 'info', 'bottom')}>
              <Ionicons name="share-social-outline" size={22} color={COLORS.navy} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleSave}>
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={22} 
                color={isSaved ? COLORS.red : COLORS.navy} 
              />
            </TouchableOpacity>
          </View>

          {allPhotos.length > 1 && (
            <View style={styles.dotsRow}>
              {allPhotos.map((_, i) => (
                <View key={i} style={[styles.dot, i === galleryIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* Room Header Info */}
        <View style={styles.block}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{room.type.toUpperCase()}</Text>
          </View>
          
          <View style={styles.titleRow}>
            <Text style={styles.title}>{room.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>${room.pricePerNight}</Text>
              <Text style={styles.perNightText}>per night</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons key={i} name={i <= Math.round(room.averageRating) ? 'star' : 'star-outline'} size={14} color={COLORS.gold} />
              ))}
            </View>
            <Text style={styles.ratingScore}>{room.averageRating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({room.reviewCount} reviews)</Text>
          </View>

          <View style={styles.divider} />

          {/* Quick Specs */}
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Floor</Text>
              <Text style={styles.specValue}>High</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Guests</Text>
              <Text style={styles.specValue}>{room.maxPeople} max</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Size</Text>
              <Text style={styles.specValue}>Spacious</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Bed</Text>
              <Text style={styles.specValue}>Premium</Text>
            </View>
          </View>
        </View>

        {/* About this room */}
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>About this room</Text>
          <Text style={styles.description}>{room.description}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesWrap}>
            {room.amenities.map(a => (
              <View key={a} style={styles.amenityTag}>
                <Text style={styles.amenityTagText}>✦ {a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.block}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews ({roomReviews.length})</Text>
            <View style={styles.reviewScoreBadge}>
              <Ionicons name="star" size={14} color={COLORS.gold} />
              <Text style={styles.reviewScoreText}>{room.averageRating.toFixed(1)}</Text>
            </View>
          </View>

          {roomReviews.length === 0 ? (
            <Text style={styles.reviewEmpty}>No reviews yet for this room.</Text>
          ) : (
            roomReviews.map((r, index) => (
              <View key={r.id} style={[styles.reviewItem, index === roomReviews.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.reviewUserRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{r.userName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.reviewUserName}>{r.userName}</Text>
                    <Text style={styles.reviewDate}>{fmtStr(r.createdAt)}</Text>
                  </View>
                  <View style={styles.reviewItemStars}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Ionicons key={i} name={i <= r.rating ? 'star' : 'star-outline'} size={12} color={COLORS.gold} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Fixed Bottom Nav */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>Starting from</Text>
          <Text style={styles.bottomBarPrice}>${room.pricePerNight}<Text style={styles.bottomBarPerNight}>/night</Text></Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookBtn, (!room.isAvailable) && styles.bookBtnDisabled]} 
          onPress={() => navigation.navigate('BookingStep1', { roomId: room.id })}
          disabled={!room.isAvailable}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
