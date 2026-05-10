import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/auth/store';
import { ThemeProvider } from '@/theme/ThemeProvider';

// Keep the OS splash up until JS-side fonts have loaded. Errors (network
// font fetch failure) shouldn't hang the app — proceed with system fallbacks.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="signin" options={{ animation: 'fade' }} />
        </Stack>
        <AuthGate />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Routes the user to /signin when unauthenticated, and back to /(tabs) once
 * authenticated. Lives inside the Stack so navigation hooks are available.
 */
function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const inAuthRoute = segments[0] === 'signin';
    if (!isAuthenticated && !inAuthRoute) {
      router.replace('/signin');
    } else if (isAuthenticated && inAuthRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, segments, router]);

  return null;
}
