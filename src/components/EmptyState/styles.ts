import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.navy, marginTop: 16, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.gray500, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
