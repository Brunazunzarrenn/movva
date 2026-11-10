import { View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';
import { useTheme } from '@/theme/ThemeProvider';

// Marcador para telas que ainda serão construídas nas próximas etapas.
export function ComingSoon({ title, text, icon = 'clock' }: { title: string; text: string; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 48, paddingHorizontal: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} color={colors.accentInk} />
      </View>
      <Txt variant="title" style={{ textAlign: 'center' }}>{title}</Txt>
      <Txt tone="muted" style={{ textAlign: 'center' }}>{text}</Txt>
    </View>
  );
}
