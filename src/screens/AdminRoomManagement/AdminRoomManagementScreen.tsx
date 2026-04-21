import React, { useState, useMemo, useEffect } from 'react';
import {
  FlatList, Modal, ScrollView, Switch, Text, TextInput,
  TouchableOpacity, View, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRooms } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { Room, AdminTabParamList } from '../../types';
import { COLORS } from '../../constants/colors';
import { validateRoomTitle, validateRoomPrice } from '../../utils/validation';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { styles } from './AdminRoomManagementStyle';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

const ROOM_TYPES = ['Single', 'Double', 'Suite', 'Family', 'Exclusive'] as const;
const AMENITY_OPTIONS = ['Free WiFi', 'TV', 'Breakfast', 'Balcony', 'Parking', 'Kitchen', 'Gym', 'Pool'];

const emptyForm = () => ({
  title: '',
  type: 'Double' as Room['type'],
  pricePerNight: '',
  maxPeople: '',
  description: '',
  isAvailable: true,
  selectedAmenities: [] as string[],
});

type FormState = ReturnType<typeof emptyForm>;
type FormErrors = Partial<Record<keyof FormState, string>>;

const generateId = () => `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export default function AdminRoomManagementScreen() {
  const { rooms, addRoom, updateRoom, deleteRoom, uploadRoomPhoto, isLoading } = useRooms();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AdminTabParamList, 'AdminRooms'>>();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomPhoto, setRoomPhoto] = useState<string | null>(null);

  // Handle direct navigation to "Add Room" modal
  useEffect(() => {
    if (route.params?.openAdd) {
      openAdd();
      // Clear the parameter so it doesn't reopen on every focus
      navigation.setParams({ openAdd: undefined } as any);
    }
  }, [route.params?.openAdd]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  const availableRoomsCount = rooms.filter(r => r.isAvailable).length;

  const openAdd = () => {
    setEditingRoom(null);
    setForm(emptyForm());
    setRoomPhoto(null);
    setErrors({});
    setModalVisible(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      title: room.title,
      type: room.type,
      pricePerNight: String(room.pricePerNight),
      maxPeople: String(room.maxPeople),
      description: room.description,
      isAvailable: room.isAvailable,
      selectedAmenities: [...room.amenities],
    });
    setRoomPhoto(room.thumbnailPic?.url || null);
    setErrors({});
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setRoomPhoto(result.assets[0].uri);
    }
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const toggleAmenity = (a: string) => {
    setForm(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(a)
        ? prev.selectedAmenities.filter(x => x !== a)
        : [...prev.selectedAmenities, a],
    }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    const titleErr = validateRoomTitle(form.title);
    if (titleErr) errs.title = titleErr;
    const priceErr = validateRoomPrice(Number(form.pricePerNight));
    if (priceErr) errs.pricePerNight = priceErr;
    if (!form.maxPeople || Number(form.maxPeople) < 1) errs.maxPeople = 'Max people must be at least 1.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const roomData = {
        title: form.title.trim(),
        type: form.type,
        pricePerNight: Number(form.pricePerNight),
        maxPeople: Number(form.maxPeople),
        description: form.description.trim(),
        isAvailable: form.isAvailable,
        amenities: form.selectedAmenities,
        photos: editingRoom?.photos ?? [],
        thumbnailPic: editingRoom?.thumbnailPic,
      };

      let roomId = editingRoom?.id;
      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData);
      } else {
        roomId = await addRoom(roomData);
      }

      // Handle photo upload if a new local photo was picked
      if (roomId && roomPhoto && !roomPhoto.startsWith('http')) {
        const photoUrl = await uploadRoomPhoto(roomId, roomPhoto);
        await updateRoom(roomId, { 
          thumbnailPic: { url: photoUrl },
          photos: [{ url: photoUrl }] 
        });
      }

      showToast(editingRoom ? 'Room updated successfully.' : 'Room added successfully.', 'success');
      setModalVisible(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to save room.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteRoom(deleteTarget);
      setDeleteTarget(null);
      showToast('Room deleted.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete room.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Room Management</Text>
            <Text style={styles.headerSubtitle}>{rooms.length} rooms · {availableRoomsCount} available</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAdd}>
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.4)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rooms..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bed-outline" size={64} color={COLORS.gray200} />
            <Text style={styles.emptyText}>No rooms found.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image 
              source={{ uri: item.thumbnailPic?.url || item.photos?.[0]?.url || 'https://via.placeholder.com/150' }} 
              style={styles.roomImage} 
            />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>{item.type}</Text>
                  </View>
                  <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionIconBtn} onPress={() => openEdit(item)}>
                    <Ionicons name="pencil" size={16} color={COLORS.navy} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIconBtn} onPress={() => setDeleteTarget(item.id)}>
                    <Ionicons name="trash" size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceSymbol}>$</Text>
                <Text style={styles.priceValue}>{item.pricePerNight}</Text>
                <Text style={styles.priceUnit}>/night</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color={COLORS.gray400} />
                  <Text style={styles.metaText}>{item.maxPeople} guests</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.metaText}>{item.averageRating.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={10} color={COLORS.gold} />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
                <View style={styles.statusIndicator}>
                  <Ionicons 
                    name="radio-button-on" 
                    size={14} 
                    color={item.isAvailable ? COLORS.green : COLORS.red} 
                  />
                  <Text style={[styles.statusText, { color: item.isAvailable ? COLORS.green : COLORS.red }]}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingRoom ? 'Edit Room' : 'Add Room'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {/* Photo Upload */}
              <Text style={styles.label}>Room Photo</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                {roomPhoto ? (
                  <Image source={{ uri: roomPhoto }} style={styles.pickerPreview} />
                ) : (
                  <View style={styles.pickerPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={COLORS.gray400} />
                    <Text style={styles.pickerText}>Select Photo</Text>
                  </View>
                )}
                {loading && (
                  <View style={styles.pickerOverlay}>
                    <ActivityIndicator color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Title */}
              <Text style={styles.label}>Room Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={form.title}
                onChangeText={v => setField('title', v)}
                placeholder="e.g. Deluxe Ocean Suite"
                placeholderTextColor={COLORS.gray400}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

              {/* Type */}
              <Text style={styles.label}>Room Type *</Text>
              <View style={styles.chipRow}>
                {ROOM_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, form.type === t && styles.chipActive]}
                    onPress={() => setField('type', t)}
                  >
                    <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Price */}
              <Text style={styles.label}>Price Per Night ($) *</Text>
              <TextInput
                style={[styles.input, errors.pricePerNight && styles.inputError]}
                value={form.pricePerNight}
                onChangeText={v => setField('pricePerNight', v)}
                keyboardType="numeric"
                placeholder="e.g. 250"
                placeholderTextColor={COLORS.gray400}
              />
              {errors.pricePerNight && <Text style={styles.errorText}>{errors.pricePerNight}</Text>}

              {/* Max People */}
              <Text style={styles.label}>Max Guests *</Text>
              <TextInput
                style={[styles.input, errors.maxPeople && styles.inputError]}
                value={form.maxPeople}
                onChangeText={v => setField('maxPeople', v)}
                keyboardType="numeric"
                placeholder="e.g. 2"
                placeholderTextColor={COLORS.gray400}
              />
              {errors.maxPeople && <Text style={styles.errorText}>{errors.maxPeople}</Text>}

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                value={form.description}
                onChangeText={v => setField('description', v)}
                multiline
                numberOfLines={4}
                placeholder="Room description..."
                placeholderTextColor={COLORS.gray400}
              />

              {/* Amenities */}
              <Text style={styles.label}>Amenities</Text>
              <View style={styles.chipRow}>
                {AMENITY_OPTIONS.map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chip, form.selectedAmenities.includes(a) && styles.chipActive]}
                    onPress={() => toggleAmenity(a)}
                  >
                    <Text style={[styles.chipText, form.selectedAmenities.includes(a) && styles.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Availability */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.navy }}>Room Availability</Text>
                  <Text style={{ fontSize: 12, color: COLORS.gray400 }}>Toggle room status</Text>
                </View>
                <Switch
                  value={form.isAvailable}
                  onValueChange={v => setField('isAvailable', v)}
                  trackColor={{ false: COLORS.gray200, true: COLORS.green + '60' }}
                  thumbColor={form.isAvailable ? COLORS.green : COLORS.white}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{editingRoom ? 'Update Room' : 'Create Room'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmationModal
        visible={!!deleteTarget}
        title="Delete Room?"
        message="This will permanently remove the room. Existing bookings for this room will remain."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor={COLORS.red}
        icon="trash-outline"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
