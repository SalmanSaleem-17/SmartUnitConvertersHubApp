import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tokens = isDark ? Colors.dark : Colors.light;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: tokens.background,
      card: tokens.backgroundElevated,
      text: tokens.text,
      border: tokens.border,
      primary: tokens.primary,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: tokens.background },
              headerTintColor: tokens.text,
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: tokens.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="calc/[slug]" options={{ headerShown: true, headerBackTitle: 'Back', title: '' }} />
            <Stack.Screen name="category/[name]" options={{ headerShown: true, headerBackTitle: 'Back', title: '' }} />
            <Stack.Screen name="about" options={{ headerShown: true, headerBackTitle: 'Back', title: 'About' }} />
            <Stack.Screen name="privacy" options={{ headerShown: true, headerBackTitle: 'Back', title: 'Privacy' }} />
            <Stack.Screen name="terms" options={{ headerShown: true, headerBackTitle: 'Back', title: 'Terms' }} />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
