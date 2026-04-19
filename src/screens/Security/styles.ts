import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';

export default StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f6f3' 
  },

  // Unified Header Style
  header: {
    backgroundColor: COLORS.navy,
    height: 180,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  headerCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.gold,
    opacity: 0.1,
    top: -48,
    right: -20,
  },
  headerCircle2: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gold,
    opacity: 0.05,
    bottom: 20,
    left: -24,
  },
  headerContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  body: {
    padding: 20,
    marginTop: -24,
    backgroundColor: '#f8f6f3',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b0b8c1',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#f0ede8',
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  // Form styles
  fieldGroup: {
    marginBottom: 16,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.navy, 
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fcfbf9',
    borderWidth: 1.5,
    borderColor: '#f0ede8',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  input: { 
    flex: 1,
    fontSize: 15, 
    color: COLORS.navy,
  },
  icon: {
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: COLORS.white,
  },

  // Activity Row
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(212,165,116,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
  },
  deviceDetail: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#16a34a',
  },

  // Danger Zone
  dangerText: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    backgroundColor: '#fef5f5',
    borderRadius: 14,
    height: 52,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.red,
  },
});
