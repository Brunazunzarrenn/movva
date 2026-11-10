import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { Button, LogoMark } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function BoasVindas() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const start = () => router.push('/cadastro-esportes');

  return (
    <LinearGradient
      colors={isDark ? ['#12301D', colors.bg] : ['#D6F0CC', colors.bg]}
      start={{ x: 0.9, y: 0 }}
      end={{ x: 0.3, y: 0.7 }}
      style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 64, paddingBottom: insets.bottom + 28, justifyContent: 'space-between' }}
    >
      <View style={{ gap: 20 }}>
        <LogoMark />
        <Txt variant="hero" accessibilityRole="header">MOVVA</Txt>
        <Txt variant="body" tone="accent" style={{ fontSize: 22, lineHeight: 30 }}>
          Conectando atletas.{'\n'}Transformando histórias.
        </Txt>
      </View>

      <View style={{ gap: 12 }}>
        <Txt tone="muted" style={{ marginBottom: 6 }}>
          Treine, compartilhe, dispute desafios e colecione suas conquistas em qualquer esporte.
        </Txt>
        <Button label="Continuar com a Apple" variant="inverse" onPress={start} />
        <Button label="Continuar com o Google" variant="secondary" onPress={start} />
        <Button label="Entrar com e-mail" variant="ghost" onPress={start} />
        <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
          Ao continuar, você aceita os Termos de Uso e a Política de Privacidade.
        </Txt>
      </View>
    </LinearGradient>
  );
}
