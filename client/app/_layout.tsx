import { DateProvider } from '@/components/calendar-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Drawer } from 'expo-router/drawer';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalendarHeader from '../components/calendar-header';
import CustomDrawerContent from '../components/custom-drawer-content';
import { AuthProvider } from './context';

export default function RootLayout() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <DateProvider>
            <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
              <Drawer.Screen
                name="index"
                options={{
                  header: ({ options }) => <CalendarHeader />,

                  headerTitle: 'Calender',
                  drawerLabel: 'Calendar',
                  drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
                }}
              />
              <Drawer.Screen
                name="login"
                options={{
                  headerShown: false,
                  headerTitle: 'Login',
                  drawerLabel: 'Login',
                  drawerIcon: ({ size, color }) => <Ionicons name="person-outline" size={size} color={color} />,
                }}
              />
              <Drawer.Screen
                name="backend_console"
                options={{
                  headerTitle: 'Backend Console',
                  drawerLabel: 'Backend Console',
                  drawerIcon: ({ size, color }) => <Ionicons size={size} color={color} />,
                }}
              />
            </Drawer>
          </DateProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
