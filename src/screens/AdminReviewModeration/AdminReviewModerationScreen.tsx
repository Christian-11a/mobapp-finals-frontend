import React, { useState, useMemo } from 'react';
import {
  FlatList, ScrollView, Text, TextInput,
  TouchableOpacity, View, Image, Modal,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { useBookings } from '../../context/BookingContext';
import { useRooms } from '../../context/RoomContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../constants/colors';
import { styles } from './AdminReviewModerationStyle';
import { useNavigation } from '@react-navigation/native';
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { Review } from '../../types';

type FilterType = 'All' | 'Visible' | 'Hidden';
const MODERATION_REASONS: Review['hiddenReason'][] = ['Abusive Language', 'Spam/Fake', 'Private Information', 'Off-topic', 'Other'];

export default function AdminReviewModerationScreen() {
  const { reviews, deleteReview, toggleReviewVisibility, addReviewReply, isLoading } = useBookings();
  const { rooms } = useRooms();
  const { showToast } = useToast();
  const navigation = useNavigation();

  const [filter, setFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Moderation Reason Modal
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [selectedReviewForHide, setSelectedReviewForHide] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<Review['hiddenReason']>('Other');

  // Reply Modal
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesFilter = 
        filter === 'All' || 
        (filter === 'Visible' && !r.isHidden) || 
        (filter === 'Hidden' && r.isHidden);
      
      const room = rooms.find(rm => rm.id === r.roomId);
      const matchesSearch = 
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        
      return matchesFilter && matchesSearch;
    });
  }, [reviews, filter, searchQuery, rooms]);

  const ratingStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    let totalRating = 0;
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++;
        totalRating += r.rating;
      }
    });
    const avg = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '0.0';
    return { counts: [...counts].reverse(), avg, total: reviews.length };
  }, [reviews]);

  const filterCounts = useMemo(() => ({
    All: reviews.length,
    Visible: reviews.filter(r => !r.isHidden).length,
    Hidden: reviews.filter(r => r.isHidden).length,
  }), [reviews]);

  const handleDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteReview(deleteTarget);
        showToast('Review removed from system.', 'info');
      } catch (error) {
        showToast('Failed to delete review', 'error');
      } finally {
        setDeleteTarget(null);
      }
    }
  };

  const openHideModal = (id: string) => {
    setSelectedReviewForHide(id);
    setReasonModalVisible(true);
  };

  const handleConfirmHide = async () => {
    if (selectedReviewForHide) {
      try {
        await toggleReviewVisibility(selectedReviewForHide, true, selectedReason);
        showToast(`Review archived: ${selectedReason}`, 'success');
      } catch (error) {
        showToast('Failed to archive review', 'error');
      } finally {
        setReasonModalVisible(false);
        setSelectedReviewForHide(null);
      }
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await toggleReviewVisibility(id, false);
      showToast('Review unarchived', 'success');
    } catch (error) {
      showToast('Failed to unarchive review', 'error');
    }
  };

  const openReplyModal = (review: Review) => {
    setSelectedReviewForReply(review);
    setReplyText(review.adminReply || '');
    setReplyModalVisible(true);
  };

  const handleSendReply = async () => {
    if (selectedReviewForReply && replyText.trim()) {
      try {
        await addReviewReply(selectedReviewForReply.id, replyText.trim());
        showToast('Reply published successfully.', 'success');
      } catch (error) {
        showToast('Failed to publish reply', 'error');
      } finally {
        setReplyModalVisible(false);
        setSelectedReviewForReply(null);
        setReplyText('');
      }
    }
  };

  const renderStars = (rating: number) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(s => (
        <Ionicons key={s} name={s <= rating ? "star" : "star-outline"} size={12} color={s <= rating ? "#FFD700" : COLORS.gray300} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Guest Reviews</Text>
            <View style={styles.headerStats}>
              <Ionicons name="star" size={12} color={COLORS.gold} />
              <Text style={styles.headerStatsText}>{ratingStats.avg} avg · {ratingStats.total} total</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#99a1af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reviews, rooms, guests..."
            placeholderTextColor="#99a1af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabsContainer}>
          {(['All', 'Visible', 'Hidden'] as FilterType[]).map(f => (
            <TouchableOpacity key={f} style={[styles.tab, filter === f && styles.tabActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f}</Text>
              <View style={[styles.tabBadge, filter === f && styles.tabBadgeActive]}>
                <Text style={styles.tabBadgeText}>{filterCounts[f]}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 20 }}>
          <SkeletonLoader height={200} style={{ marginBottom: 16 }} />
          <SkeletonLoader height={200} style={{ marginBottom: 16 }} />
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={r => r.id}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.distributionCard}>
              <View style={styles.distHeader}>
                <Text style={styles.distTitle}>Rating Distribution</Text>
              </View>
              {ratingStats.counts.map((count, idx) => {
                const stars = 5 - idx;
                const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
                return (
                  <View key={stars} style={styles.distRow}>
                    <View style={styles.distLabel}><Text style={styles.distLabelText}>{stars}</Text><Ionicons name="star" size={10} color={COLORS.navy} /></View>
                    <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${percentage}%` }]} /></View>
                    <Text style={styles.distCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          }
          renderItem={({ item }) => {
            const room = rooms.find(rm => rm.id === item.roomId);
            return (
              <View style={styles.reviewCard}>
                <View style={styles.reviewRoomHeader}>
                  <Image source={{ uri: room?.thumbnailPic?.url || room?.photos?.[0]?.url || 'https://via.placeholder.com/150' }} style={styles.roomThumbnail} />
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomTitle} numberOfLines={1}>{room?.title}</Text>
                    <Text style={styles.roomType}>{room?.type}</Text>
                  </View>
                </View>

                <View style={styles.reviewBody}>
                  <View style={styles.userInfoRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.userAvatar}><Text style={styles.userAvatarText}>{item.userName.charAt(0)}</Text></View>
                      <View><Text style={styles.userName}>{item.userName}</Text><Text style={styles.reviewDate}>{item.createdAt}</Text></View>
                    </View>
                    {renderStars(item.rating)}
                  </View>

                  {item.isHidden && (
                    <View style={styles.moderationMeta}>
                      <Ionicons name="alert-circle-outline" size={14} color="#c2410c" />
                      <Text style={styles.moderationText}>Archived: {item.hiddenReason}</Text>
                    </View>
                  )}

                  <Text style={styles.reviewText}>{item.text}</Text>

                  {item.adminReply && (
                    <View style={styles.replyContainer}>
                      <View style={styles.replyHeader}>
                        <Ionicons name="return-down-forward" size={14} color={COLORS.gold} />
                        <Text style={styles.replyLabel}>Official Response</Text>
                      </View>
                      <Text style={styles.replyText}>{item.adminReply}</Text>
                    </View>
                  )}

                  <View style={styles.reviewActions}>
                    <TouchableOpacity style={[styles.actionBtn, styles.replyBtn]} onPress={() => openReplyModal(item)}>
                      <Ionicons name="chatbubble-outline" size={14} color="#0369a1" />
                      <Text style={styles.replyBtnText}>{item.adminReply ? 'Edit Reply' : 'Reply'}</Text>
                    </TouchableOpacity>
                    
                    {item.isHidden ? (
                      <TouchableOpacity style={[styles.actionBtn, styles.hideBtn]} onPress={() => handleUnarchive(item.id)}>
                        <Ionicons name="eye-outline" size={14} color={COLORS.gray500} />
                        <Text style={styles.hideBtnText}>Unarchive</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={[styles.actionBtn, styles.hideBtn]} onPress={() => openHideModal(item.id)}>
                        <Ionicons name="archive-outline" size={14} color={COLORS.gray500} />
                        <Text style={styles.hideBtnText}>Archive</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => setDeleteTarget(item.id)}>
                      <Ionicons name="trash-outline" size={14} color={COLORS.red} />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Moderation Reason Modal */}
      <Modal visible={reasonModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Archive Reason</Text>
              <TouchableOpacity onPress={() => setReasonModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.navy} /></TouchableOpacity>
            </View>
            <Text style={{ color: COLORS.gray400, marginBottom: 20, fontSize: 13 }}>Please select the policy violation reason for archiving this review.</Text>
            {MODERATION_REASONS.map(r => (
              <TouchableOpacity key={r} style={[styles.reasonOption, selectedReason === r && styles.reasonOptionActive]} onPress={() => setSelectedReason(r)}>
                <Text style={styles.reasonText}>{r}</Text>
                {selectedReason === r && <Ionicons name="checkmark-circle" size={20} color={COLORS.gold} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmHide}><Text style={styles.confirmBtnText}>Confirm Archival</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reply Modal */}
      <Modal visible={replyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Official Response</Text>
              <TouchableOpacity onPress={() => setReplyModalVisible(false)}><Ionicons name="close" size={24} color={COLORS.navy} /></TouchableOpacity>
            </View>
            <KeyboardAwareScrollView 
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={styles.replyInput}
                placeholder="Write a professional response..."
                multiline
                value={replyText}
                onChangeText={setReplyText}
                placeholderTextColor={COLORS.gray400}
              />
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSendReply}><Text style={styles.confirmBtnText}>Publish Response</Text></TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={!!deleteTarget}
        title="Delete Review?"
        message="This action is permanent and cannot be undone."
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
