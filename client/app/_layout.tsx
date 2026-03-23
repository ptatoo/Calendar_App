import Ionicons from '@expo/vector-icons/Ionicons';
import { Drawer } from 'expo-router/drawer';

import CalendarHeader from '../components/calendar-header';
import CustomDrawerContent from '../components/custom-drawer/custom-drawer-content';

//Proivders
import { DateProvider } from '@/components/calendar-context';
import { EventsProvider } from '@/components/calendar-events-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <DateProvider>
            <EventsProvider>
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
            </EventsProvider>
          </DateProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
