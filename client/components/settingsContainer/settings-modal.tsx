import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import AppearanceContainer from './appearance-container';
import Login from './login';

const ProfileSettings = () => (
  <BottomSheetScrollView key={1}>
    <Login />
  </BottomSheetScrollView>
);
const AppearanceSettings = () => (
  <BottomSheetScrollView key={1}>
    <AppearanceContainer />
  </BottomSheetScrollView>
);
const CalendarSettings = () => (
  <BottomSheetScrollView key={1}>
    <Text>CalendarSettings</Text>
  </BottomSheetScrollView>
);

const renderScene = SceneMap({
  profile: ProfileSettings,
  appearance: AppearanceSettings,
  calendar: CalendarSettings,
});

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isVisible, onClose }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['98%'], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'profile', title: 'Profile' },
    { key: 'appearance', title: 'Appearance' },
    { key: 'calendar', title: 'Calendar' },
  ]);

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
      {/* --- SETTINGS COMPONENT --- */}
      <View style={{ flex: 1 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          tabBarPosition="bottom"
          renderTabBar={(props) => (
            <TabBar {...props} indicatorStyle={styles.indicator} style={styles.tabBar} activeColor="#4285F4" inactiveColor="#9CA3AF" />
          )}
        />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // Shadow logic
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // Negative height pushes shadow UP
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabBar: {
    backgroundColor: 'white',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    fontSize: 12,
  },
  indicator: {
    backgroundColor: '#4285F4',
  },
});
