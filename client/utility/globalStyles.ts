//padding
//buttons
import { StyleSheet } from 'react-native';
import { COLORS, FONT_WEIGHTS, SIZES } from './theme';

export const globalStyles = StyleSheet.create({
  pressedButton: {
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
})