import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  
  // Position Variants
  top: {
    top: Platform.OS === 'ios' ? 50 : 30,
  },
  bottom: {
    bottom: Platform.OS === 'ios' ? 100 : 80,
  },
  center: {
    top: height / 2 - 60,
    left: (width - width * 0.8) / 2,
    right: undefined,
    alignSelf: 'center',
    backgroundColor: 'rgba(10, 30, 61, 0.95)',
    flexDirection: 'column',
    padding: 24,
    width: width * 0.8,
    borderRadius: 24,
  },

  // Type Colors
  success: { backgroundColor: COLORS.green },
  error: { backgroundColor: COLORS.red },
  info: { backgroundColor: COLORS.navy },

  icon: { marginRight: 10 },
  
  centerIcon: { 
    marginBottom: 12, 
    marginRight: 0 
  },

  text: { 
    color: COLORS.white, 
    fontSize: 14, 
    flex: 1, 
    fontWeight: '600',
    lineHeight: 20,
  },
  
  centerText: {
    textAlign: 'center',
    fontSize: 16,
    flex: 0,
  }
});
