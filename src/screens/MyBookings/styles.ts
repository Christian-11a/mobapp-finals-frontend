import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.navy, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  subtitle: { fontSize: 13, color: COLORS.gray400, marginTop: 4 },

  // Tabs
  tabsWrapper: { backgroundColor: COLORS.navy, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tabs: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: COLORS.gold },
  tabText: { fontSize: 13, color: COLORS.gray400, fontWeight: '500' },
  tabTextActive: { color: COLORS.white, fontWeight: 'bold' },
  tabBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBadgeText: { fontSize: 11, color: COLORS.gray400, fontWeight: 'bold' },
  tabBadgeTextActive: { color: COLORS.white },

  list: { padding: 16 },
  listEmpty: { flex: 1 },

  // Booking card
  card: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  cardImage: { width: '100%', height: 130 },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  roomName: { fontSize: 16, fontWeight: 'bold', color: COLORS.navy, flex: 1, marginRight: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  dateBlock: { flex: 1 },
  dateLabel: { fontSize: 10, fontWeight: '700', color: COLORS.gray400, letterSpacing: 0.5, marginBottom: 3 },
  dateValue: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.gray100, paddingTop: 10 },
  nights: { fontSize: 13, color: COLORS.gray500 },
  price: { fontSize: 18, fontWeight: 'bold', color: COLORS.gold },

  // Skeleton card
  skeletonCard: { backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 14, overflow: 'hidden', elevation: 2 },

  // Legacy badge styles (kept for safety — BookingStatusPill now used instead)
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  confirmed: { backgroundColor: COLORS.greenLight },
  pending: { backgroundColor: COLORS.yellowLight },
  cancelled: { backgroundColor: COLORS.redLight },
  completed: { backgroundColor: '#eff6ff' },
  confirmedText: { fontSize: 12, color: COLORS.green, fontWeight: 'bold' },
  pendingText: { fontSize: 12, color: COLORS.yellow, fontWeight: 'bold' },
  cancelledText: { fontSize: 12, color: COLORS.red, fontWeight: 'bold' },
  completedText: { fontSize: 12, color: '#2563eb', fontWeight: 'bold' },
});
