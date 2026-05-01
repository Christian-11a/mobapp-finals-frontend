import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, Image, Platform, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRooms } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../types';
import { formatPrice } from '../../utils/formatUtils';

export default function SavedRoomsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { rooms } = useRooms();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const savedIds = user?.savedRoomIds || [];
  const savedRooms = rooms.filter(r => savedIds.includes(r.id));

  const toggleSave = async (roomId: string) => {
    if (!user) return;
    const isSaved = savedIds.includes(roomId);
    
    if (isSaved) {
      Alert.alert(
        'Remove from Wishlist',
        'Do you want to remove this from your wishlist?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive', 
            onPress: async () => {
              setLoading(roomId);
              try {
                await userService.unsaveRoom(user.id, roomId);
                showToast('Room removed from wishlist', 'info', 'bottom');
              } catch (error) {
                showToast('Action failed. Please try again.', 'error');
              } finally {
                setLoading(null);
              }
            }
          }
        ]
      );
    } else {
      setLoading(roomId);
      try {
        await userService.saveRoom(user.id, roomId);
        showToast('Room saved to wishlist!', 'success', 'bottom');
      } catch (error) {
        showToast('Action failed. Please try again.', 'error');
      } finally {
        setLoading(null);
      }
    }
  };

  const handleClearAll = async () => {
    if (savedIds.length === 0 || !user) return;
    
    setLoading('all');
    try {
      await userService.clearWishlist(user.id);
      showToast('Wishlist cleared', 'info', 'bottom');
    } catch (error) {
      showToast('Failed to clear wishlist', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f6f3' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={headerStyles.header}>
        <View style={headerStyles.headerDecor1} />
        <View style={headerStyles.headerDecor2} />
        <View style={headerStyles.headerContent}>
          <TouchableOpacity style={headerStyles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={headerStyles.headerTitle}>Saved Rooms</Text>
          <TouchableOpacity onPress={handleClearAll} disabled={loading === 'all'}>
            {loading === 'all' ? (
              <ActivityIndicator size="small" color={COLORS.gold} />
            ) : (
              <Text style={headerStyles.clearText}>Clear all</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={bodyStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20, paddingTop: 30 }}>
          {savedRooms.length === 0 ? (
            <View style={bodyStyles.emptyBox}>
              <View style={bodyStyles.emptyIconWrap}>
                <Ionicons name="heart-outline" size={40} color={COLORS.gold} />
              </View>
              <Text style={bodyStyles.emptyTitle}>No saved rooms yet</Text>
              <Text style={bodyStyles.emptySub}>
                Tap the heart icon on any room to add it to your wishlist.
              </Text>
              <TouchableOpacity 
                style={bodyStyles.exploreBtn}
                onPress={() => navigation.navigate('MainTabs')}
              >
                <Text style={bodyStyles.exploreBtnText}>Explore Rooms</Text>
              </TouchableOpacity>
            </View>
          ) : (
            savedRooms.map(room => (
              <TouchableOpacity 
                key={room.id} 
                style={roomStyles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })}
              >
                <View>
                  <Image source={{ uri: room.thumbnailPic?.url || room.photos?.[0]?.url }} style={roomStyles.image} />
                  <TouchableOpacity 
                    style={[roomStyles.heartBtn, { top: 8, left: 8 }]}
                    onPress={() => toggleSave(room.id)}
                    disabled={loading === room.id}
                  >
                    {loading === room.id ? (
                      <ActivityIndicator size="small" color={COLORS.red} />
                    ) : (
                      <Ionicons name="heart" size={18} color={COLORS.red} />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={roomStyles.info}>
                  <View style={roomStyles.row}>
                    <Text style={roomStyles.type}>{room.type}</Text>
                    <View style={roomStyles.rating}>
                      <Ionicons name="star" size={12} color={COLORS.gold} />
                      <Text style={roomStyles.ratingText}>{room.averageRating}</Text>
                    </View>
                  </View>
                  <Text style={roomStyles.title}>{room.title}</Text>
                  <View style={roomStyles.footer}>
                    <Text style={roomStyles.price}>${formatPrice(room.pricePerNight)}<Text style={roomStyles.perNight}>/night</Text></Text>
                    <View style={roomStyles.amenity}>
                      <Ionicons name="people-outline" size={14} color={COLORS.gray400} />
                      <Text style={roomStyles.amenityText}>{room.maxPeople} Guests</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.navy,
    height: 160,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerDecor1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: COLORS.gold, opacity: 0.1, top: -40, right: -30,
  },
  headerDecor2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.gold, opacity: 0.05, bottom: 20, left: -20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  clearText: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },
});

const bodyStyles = StyleSheet.create({
  scroll: { flex: 1, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#f8f6f3' },
  emptyBox: { padding: 60, alignItems: 'center' },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(212, 165, 116, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.navy },
  emptySub: { marginTop: 8, color: COLORS.gray400, textAlign: 'center', lineHeight: 20 },
  exploreBtn: { marginTop: 24, backgroundColor: COLORS.navy, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  exploreBtnText: { color: COLORS.white, fontWeight: 'bold' },
});

const roomStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, borderRadius: 20, marginBottom: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: '#f0ede8',
  },
  image: { width: '100%', height: 180 },
  heartBtn: {
    position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  info: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  type: { fontSize: 12, color: COLORS.gold, fontWeight: 'bold', textTransform: 'uppercase' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: COLORS.navy, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.navy, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold', color: COLORS.navy },
  perNight: { fontSize: 12, color: COLORS.gray400, fontWeight: 'normal' },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontSize: 12, color: COLORS.gray400 },
});
