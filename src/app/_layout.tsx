import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { SportsProvider } from '@/data/SportsStore';
import { fontAssets } from '@/theme/fonts';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

function RootStack() {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="configuracoes" />
        <Stack.Screen name="em-breve" />
        <Stack.Screen name="admin/esportes" />
        <Stack.Screen name="treino" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#0B0F0C' }} />;
  return (
    <ThemeProvider>
      <SportsProvider>
        <RootStack />
      </SportsProvider>
    </ThemeProvider>
  );
}
