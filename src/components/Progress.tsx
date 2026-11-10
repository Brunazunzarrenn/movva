import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export function Progress({ step, total }: { step: number; total: number }) {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel={`Etapa ${step} de ${total}`} style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 4, backgroundColor: i < step ? colors.accent : colors.divider }} />
      ))}
    </View>
  );
}
