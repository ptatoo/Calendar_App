import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { UIContext } from '../contexts/ui-context';

// Time Indicator
export default function TimeIndicator({ hourHeight }: { hourHeight: number }) {
  const { now } = useContext(UIContext);

  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Logic: (Hours * height per hour) + (Minutes percentage of an hour)
  const topOffset = (hours + minutes / 60) * hourHeight;

  return (
    <View style={[styles.timeLine, { top: topOffset }]} pointerEvents="none">
      <View style={styles.timeDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  timeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2563EB',
    zIndex: 200, // higher than hourticks
    elevation: 200,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginLeft: -5,
  },
});
