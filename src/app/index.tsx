import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useProfile } from '@/data/ProfileStore';
import { useTheme } from '@/theme/ThemeProvider';

// Quem já criou a conta entra direto no Feed; quem não criou vai para as Boas-vindas.
export default function Index() {
  const { ready, profile } = useProfile();
  const { colors } = useTheme();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <Redirect href={profile ? '/(tabs)/feed' : '/boas-vindas'} />;
}
