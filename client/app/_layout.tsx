import Ionicons from '@expo/vector-icons/Ionicons';
import { Drawer } from 'expo-router/drawer';

import CalendarHeader from '../components/calendar-header';
import CustomDrawerContent from '../components/custom-drawer/custom-drawer-content';

//Proivders
import { EventsProvider } from '@/components/contexts/calendar-events-context';
import { DateProvider } from '@/components/contexts/calendar-index-context';
import { UIProvider } from '@/components/contexts/ui-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../components/contexts/auth-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <BottomSheetModalProvider>
          <DateProvider>
            <EventsProvider>
              <UIProvider>
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
                    name="backend_console"
                    options={{
                      headerTitle: 'Backend Console',
                      drawerLabel: 'Backend Console',
                      drawerIcon: ({ size, color }) => <Ionicons size={size} color={color} />,
                    }}
                  />
                </Drawer>
              </UIProvider>
            </EventsProvider>
          </DateProvider>
        </BottomSheetModalProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
