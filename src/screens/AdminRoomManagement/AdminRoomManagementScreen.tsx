import React, { useState } from 'react';
import {
  FlatList, Modal, ScrollView, Switch, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRooms } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { Room } from '../../types';
import { COLORS } from '../../constants/colors';
import { validateRoomTitle, validateRoomPrice } from '../../utils/validation';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import { styles } from './AdminRoomManagementStyle';

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
  const { rooms, addRoom, updateRoom, deleteRoom } = useRooms();
  const { showToast } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const openAdd = () => {
    setEditingRoom(null);
    setForm(emptyForm());
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
    setErrors({});
    setModalVisible(true);
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

  const handleSave = () => {
    if (!validate()) {
      showToast('Please fix the errors before saving.', 'error');
      return;
    }
    const room: Room = {
      id: editingRoom?.id ?? generateId(),
      title: form.title.trim(),
      type: form.type,
      pricePerNight: Number(form.pricePerNight),
      maxPeople: Number(form.maxPeople),
      description: form.description.trim(),
      isAvailable: form.isAvailable,
      amenities: form.selectedAmenities,
      photos: editingRoom?.photos ?? [],
      thumbnailPic: editingRoom?.thumbnailPic,
      averageRating: editingRoom?.averageRating ?? 0,
      reviewCount: editingRoom?.reviewCount ?? 0,
    };
    if (editingRoom) {
      updateRoom(room);
      showToast('Room updated successfully.', 'success');
    } else {
      addRoom(room);
      showToast('Room added successfully.', 'success');
    }
    setModalVisible(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteRoom(deleteTarget);
    setDeleteTarget(null);
    showToast('Room deleted.', 'info');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Room Management</Text>
        <Text style={styles.subtitle}>{rooms.length} room{rooms.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No rooms yet. Tap + to add one.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.type} · ${item.pricePerNight}/night · max {item.maxPeople}</Text>
              <View style={[styles.availBadge, item.isAvailable ? styles.availOn : styles.availOff]}>
                <Text style={[styles.availText, { color: item.isAvailable ? COLORS.green : COLORS.red }]}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="pencil-outline" size={18} color={COLORS.gold} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item.id)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.red} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color={COLORS.navy} />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingRoom ? 'Edit Room' : 'Add Room'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              {/* Title */}
              <Text style={styles.label}>Room Title *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={form.title}
                onChangeText={v => setField('title', v)}
                placeholder="e.g. Deluxe Ocean Suite"
                placeholderTextColor={COLORS.gray400}
              />
              {errors.title && <Text style={styles.error}>{errors.title}</Text>}

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
              {errors.pricePerNight && <Text style={styles.error}>{errors.pricePerNight}</Text>}

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
              {errors.maxPeople && <Text style={styles.error}>{errors.maxPeople}</Text>}

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                value={form.description}
                onChangeText={v => setField('description', v)}
                multiline
                numberOfLines={3}
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
                <Text style={styles.label}>Available</Text>
                <Switch
                  value={form.isAvailable}
                  onValueChange={v => setField('isAvailable', v)}
                  trackColor={{ false: COLORS.red + '60', true: COLORS.green + '60' }}
                  thumbColor={form.isAvailable ? COLORS.green : COLORS.red}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editingRoom ? 'Update Room' : 'Add Room'}</Text>
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
