import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },

  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  subtitle: { fontSize: 13, color: COLORS.gray400, marginTop: 2 },

  tabsContainer: { backgroundColor: COLORS.navy, maxHeight: 52 },
  tabs: { paddingHorizontal: 14, paddingVertical: 8, gap: 8, alignItems: 'center' },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: { backgroundColor: COLORS.gold },
  tabText: { fontSize: 13, color: COLORS.gray400 },
  tabTextActive: { color: COLORS.white, fontWeight: '700' },

  list: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomTitle: { fontSize: 15, fontWeight: '600', color: COLORS.navy, flex: 1, marginRight: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  infoText: { fontSize: 12, color: COLORS.gray500 },
  price: { fontSize: 13, color: COLORS.gold, fontWeight: '600' },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.greenLight,
  },
  approveBtnText: { fontSize: 13, color: COLORS.green, fontWeight: '600' },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.redLight,
  },
  cancelBtnText: { fontSize: 13, color: COLORS.red, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.gray400, fontSize: 15 },
});
