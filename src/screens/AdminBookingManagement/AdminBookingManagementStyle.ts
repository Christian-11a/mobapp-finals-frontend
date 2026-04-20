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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#99a1af',
    marginTop: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212,165,116,0.13)',
    borderColor: 'rgba(212,165,116,0.25)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  filterButtonText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 4,
  },
  tabsContent: {
    paddingHorizontal: 0,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 60,
    alignItems: 'center',
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
  list: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0ede8',
    overflow: 'hidden',
  },
  cardBanner: {
    height: 112,
    width: '100%',
  },
  cardBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,30,61,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  bannerRoomType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  bannerRoomTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statusBadge: {
    position: 'absolute',
    top: 66,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestAvatarText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  guestEmail: {
    fontSize: 12,
    color: '#99a1af',
  },
  bookingId: {
    fontSize: 12,
    color: '#99a1af',
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8f6f3',
    borderRadius: 14,
    paddingVertical: 10,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  gridLabel: {
    fontSize: 10,
    color: '#99a1af',
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSection: {
    gap: 2,
  },
  totalLabel: {
    fontSize: 12,
    color: '#99a1af',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  updateStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,30,61,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 4,
  },
  updateStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.gray400,
    fontSize: 14,
    marginTop: 12,
  },

  // Status Modal
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.navy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentStatusText: {
    fontSize: 14,
    color: '#6a7282',
    marginBottom: 16,
  },
  statusOptions: {
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f6f3',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  statusOptionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  statusOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  statusOptionTextActive: {
    color: '#10b981',
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});
