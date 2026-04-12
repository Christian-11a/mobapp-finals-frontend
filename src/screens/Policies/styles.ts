import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 14 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  subtitle: { fontSize: 13, color: COLORS.gray400, marginTop: 2 },
  body: { padding: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  text: { fontSize: 14, color: COLORS.gray600, lineHeight: 22 },
});
