import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { BudgetProvider } from '@/context/budget-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '../firebaseConfig';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    signOut(auth).catch(() => undefined);
  }, []);

  return (
    <BudgetProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </BudgetProvider>
  );
}
