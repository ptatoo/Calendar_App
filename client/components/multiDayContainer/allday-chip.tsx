import { EventObj } from '@/utility/types';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const AllDayChip = ({ event, handlePress }: { event: EventObj; handlePress: (event: EventObj) => void }) => {
  return (
    <Pressable
      onPress={() => handlePress(event)}
      style={[
        styles.allDayChip,
        {
          backgroundColor: event.calendar.calendarCustomColor || '#3B82F6',
        },
      ]}
    >
      <Text style={styles.allDayText} numberOfLines={1}>
        {event.title}
      </Text>
    </Pressable>
  );
};

export default memo(AllDayChip);

const styles = StyleSheet.create({
  allDayChip: {
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 2,
    marginHorizontal: 4,
  },
  allDayText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
});