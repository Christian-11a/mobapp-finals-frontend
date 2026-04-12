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

  list: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.navy, marginBottom: 3 },
  cardMeta: { fontSize: 12, color: COLORS.gray500, marginBottom: 8 },
  availBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  availOn: { backgroundColor: COLORS.greenLight },
  availOff: { backgroundColor: COLORS.redLight },
  availText: { fontSize: 11, fontWeight: '700' },

  actions: { flexDirection: 'row', gap: 8 },
  editBtn: { padding: 10, borderRadius: 10, backgroundColor: COLORS.goldLight },
  deleteBtn: { padding: 10, borderRadius: 10, backgroundColor: COLORS.redLight },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.gray400, fontSize: 15 },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modal — keep dark theme for form sheets
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  modalBody: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },

  label: { fontSize: 13, color: COLORS.gray500, marginTop: 14, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.navy,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
  },
  inputError: { borderColor: COLORS.red },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  error: { color: COLORS.red, fontSize: 12, marginTop: 4 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray100,
  },
  chipActive: { backgroundColor: COLORS.goldLight, borderColor: COLORS.gold },
  chipText: { fontSize: 12, color: COLORS.gray500 },
  chipTextActive: { color: COLORS.goldDark, fontWeight: '700' },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },

  saveBtn: { marginTop: 24, backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
