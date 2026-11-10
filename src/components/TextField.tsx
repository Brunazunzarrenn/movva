import type { ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Txt } from './Txt';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  help?: string;
  error?: string | null;
  prefix?: ReactNode; // ex.: "@" antes do nome de usuário
  multilineHeight?: number;
};

export function TextField({ label, help, error, prefix, multilineHeight, ...input }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Txt variant="bodyStrong">{label}</Txt>
      <View
        style={{
          flexDirection: 'row', alignItems: multilineHeight ? 'flex-start' : 'center', minHeight: multilineHeight ?? 52,
          paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.surface, gap: 2,
        }}
      >
        {prefix}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textFaint}
          {...input}
          style={{
            flex: 1, minHeight: multilineHeight ?? 50, paddingVertical: multilineHeight ? 12 : 0, color: colors.text,
            fontFamily: fonts.body, fontSize: 16, textAlignVertical: multilineHeight ? 'top' : 'center',
          }}
        />
      </View>
      {error ? <Txt variant="caption" tone="danger">{error}</Txt> : help ? <Txt variant="caption" tone="muted">{help}</Txt> : null}
    </View>
  );
}
