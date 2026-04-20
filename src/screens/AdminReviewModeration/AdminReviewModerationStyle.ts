import { StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  headerStatsText: {
    fontSize: 12,
    color: '#99a1af',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 13,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Rating Distribution
  distributionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0ede8',
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  distHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  distTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  distLink: {
    fontSize: 12,
    color: COLORS.gray400,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  distLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 24,
    gap: 2,
  },
  distLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0ede8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  distCount: {
    width: 24,
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'right',
  },
  
  // Review Card
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0ede8',
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  reviewRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f6f3',
    gap: 12,
  },
  roomThumbnail: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.gray200,
  },
  roomInfo: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  roomType: {
    fontSize: 10,
    color: COLORS.gray400,
  },
  reviewBody: {
    padding: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userAvatarText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.gray400,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4a5565',
    marginBottom: 16,
  },
  
  // Admin Reply UI
  replyContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginTop: -8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  replyText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  
  // Moderation Meta
  moderationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 6,
  },
  moderationText: {
    fontSize: 11,
    color: '#c2410c',
    fontWeight: '600',
  },

  reviewActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#f0ede8',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  replyBtn: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  hideBtn: {
    backgroundColor: '#f8f6f3',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
  },
  replyBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  hideBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray500,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.red,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.gray400,
    fontSize: 14,
    marginTop: 12,
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f8f6f3',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonOptionActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#fffdf0',
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  confirmBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  replyInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
});
