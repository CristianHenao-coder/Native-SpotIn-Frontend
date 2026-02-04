import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { SessionProvider, useSession } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { user, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // wait for layout to mount
    const t = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    const segmentsList = segments as string[];
    const inAuthGroup = segmentsList.includes('(auth)');
    const inAppGroup = segmentsList.includes('(app)');
    
    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && !inAppGroup) {
      router.replace('/dashboard');
    }
  }, [user, segments, isLoading, isMounted]);

  if (!isMounted || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <NotificationProvider>
        <RootLayoutNav />
      </NotificationProvider>
    </SessionProvider>
  );
}
