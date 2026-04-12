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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: COLORS.goldDark },
  userName: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  deleteBtn: { padding: 8, borderRadius: 10, backgroundColor: COLORS.redLight },

  reviewText: { fontSize: 13, color: COLORS.gray600, lineHeight: 20, marginBottom: 12 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 10,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  roomName: { fontSize: 12, color: COLORS.gray500, flex: 1 },
  date: { fontSize: 11, color: COLORS.gray400 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.gray400, fontSize: 15 },
});
