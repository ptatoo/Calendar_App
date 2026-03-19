import { getEventTimeDisplay } from '@/utility/eventUtils';
import { EventObj } from '@/utility/types';

import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import { EventExpandedView } from './event-details-expanded-view';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  event: EventObj | null;
  onClose: () => void;
}

export default function EventDetails({ isVisible, event, onClose }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['20%', '92%'], []);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Use a ref to track if the sheet is actually "presented" to avoid double-calls
  useEffect(() => {
    if (isVisible && event) {
      bottomSheetModalRef.current?.present();
    } else if (!isVisible) {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible, event]);

  if (!event) return null;
  const { primary, secondary } = getEventTimeDisplay(event);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      // This allows touches to pass through the container to the buttons behind it
      containerStyle={{ pointerEvents: 'box-none' }}
      animationConfigs={{
        duration: 250,
      }}
      handleStyle={styles.handleContainer}
      onChange={(index) => {
        setCurrentIndex(index);
        console.log('Current Sheet Index:', index); // This should be 0 or 1
        if (index === -1) {
          onClose();
        }
      }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {/* --- TITLE --- */}
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        {/* --- HOURS --- */}
        <Text style={styles.timeRow}>{primary}</Text>
        {/* --- DATE --- */}
        <Text style={styles.dateRow}>{secondary}</Text>
        {/* --- EXPANDED CONTENT --- */}
        {currentIndex > 0 && <EventExpandedView event={event} />}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleContainer: {
    backgroundColor: 'white', // Matches your sheet color
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Shadow logic
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // Negative height pushes shadow UP
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  timeRow: {
    fontSize: 18,
    color: '#374151', // Darker gray for the "Actionable" time
    fontWeight: '500',
    lineHeight: 24,
  },
  dateRow: {
    fontSize: 16,
    color: '#6B7280', // Lighter gray for the date
    marginTop: 2,
  },
});
