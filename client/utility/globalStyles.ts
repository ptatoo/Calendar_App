//padding
//buttons
import { StyleSheet } from 'react-native';
import { COLORS, FONT_WEIGHTS, SIZES } from './theme';

export const globalStyles = StyleSheet.create({
  pressedButton: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  activeButton: {
    backgroundColor: '#f0f0f0',
  },  
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: SIZES.l,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  toggleButtonContainer: {
    flexDirection: 'row', 
    backgroundColor: COLORS.darkNeutral, 
    borderRadius: 10, 
    padding: 4, 
    height: 35, 
    marginBottom: 20 
  },
  toggleButtonSegment: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 8 
  },
  toggleButtonActiveSegement: {
    backgroundColor: 'white', 
    elevation: 3, 
    shadowOpacity: 0.1
  },
  smallButtonText: {
    fontSize: SIZES.s,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.light,
  },
  activeSmallButtonText: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.heavy,
  },
  bottomRightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,

  },
})