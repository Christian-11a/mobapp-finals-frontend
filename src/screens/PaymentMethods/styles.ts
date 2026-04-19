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
    marginBottom: 16,
    marginLeft: 4,
  },

  // Method Card
  methodCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f0ede8',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  methodCardDefault: {
    borderColor: COLORS.gold,
    backgroundColor: '#fffcf9',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 2,
  },
  methodSub: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  defaultBadge: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.gold,
  },

  // Brand Colors
  gcashBg: { backgroundColor: '#007dfe15' },
  mayaBg: { backgroundColor: '#c1ff0015' },
  cardBg: { backgroundColor: '#f3f4f6' },

  // Empty State
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.gray400,
    textAlign: 'center',
  },

  // Add Button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.gold,
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
  },
});
