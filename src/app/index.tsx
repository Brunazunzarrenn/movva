import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useProfile } from '@/data/ProfileStore';
import { useTheme } from '@/theme/ThemeProvider';

// Quem já criou a conta entra direto no Feed; quem não criou vai para as Boas-vindas.
export default function Index() {
  const { ready, profile, online, userId } = useProfile();
  const { colors } = useTheme();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  // Entrou com e-mail mas ainda não terminou o perfil: continua o cadastro.
  if (online && userId && !profile) return <Redirect href="/cadastro-nome" />;
  return <Redirect href={profile ? '/(tabs)/feed' : '/boas-vindas'} />;
}
