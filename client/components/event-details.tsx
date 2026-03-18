import { EventObj } from '@/utility/types';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  event: EventObj | null;
  onClose: () => void;
}

export default function EventDetails({ isVisible, event, onClose }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['35%', '92%'], []);

  useEffect(() => {
    if (isVisible && event) {
      requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
      });
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible, event]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0}
        onPress={() => {
          onClose(); // Sets state to false immediately
          bottomSheetModalRef.current?.dismiss();
        }}
      />
    ),
    [],
  );

  // We return null only if there's no event, but keep the View structure
  // so the absolute positioning works correctly.
  if (!event) return null;

  return (
    /* This View forces the sheet to occupy the full screen coordinate space */
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      topInset={0}
      //onDismiss={onClose} // Important: trigger your parent's close logic
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      animationConfigs={{
        duration: 200, // Faster exit = Backdrop unmounts faster
      }}
      handleStyle={styles.handleContainer}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.organizer}>Organized by {event.organizer}</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>{event.description}</Text>
          <View style={{ height: 100 }} />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  // This is the "magic" style that makes it overlay everything
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    elevation: 9999,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  contentContainer: {
    padding: 24,
  },
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
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  body: {
    marginTop: 8,
  },
  organizer: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    lineHeight: 28,
    color: '#374151',
  },
});
