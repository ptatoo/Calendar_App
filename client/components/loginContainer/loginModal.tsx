import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import LoginButton from './login';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function LoginModal({ isVisible, onClose }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['98%'], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      animationConfigs={{
        duration: 500,
      }}
      onDismiss={onClose}
      handleStyle={styles.handleContainer}
    >
      {/* --- LOGIN COMPONENT --- */}
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <LoginButton />
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
});
