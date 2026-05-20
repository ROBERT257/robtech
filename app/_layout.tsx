import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppShell />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const { sessionNotice } = useAuth();

  return (
    <>
      {sessionNotice ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{sessionNotice}</Text>
        </View>
      ) : null}
      <Stack>
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: 'rgba(18, 28, 44, 0.96)',
    borderColor: 'rgba(126, 217, 87, 0.22)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bannerText: {
    color: '#EAF3E4',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
