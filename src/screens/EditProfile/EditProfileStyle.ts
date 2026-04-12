import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    backgroundColor: COLORS.navy,
    padding: 20,
    paddingTop: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  body: { padding: 20 },
  label: { fontSize: 13, color: COLORS.gray500, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.navy,
  },
  inputError: { borderColor: COLORS.red },
  error: { color: COLORS.red, fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: COLORS.gray200, marginVertical: 24 },
  noteText: { fontSize: 13, color: COLORS.gray500, marginBottom: 6 },
  saveBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});
