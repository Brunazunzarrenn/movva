import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { s } from '@/components/ui';
import { normalizeSport } from '@/data/sports';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

// Campo de busca com lupa e botão de limpar.
export function SearchBar({ value, onChangeText, placeholder, label, autoFocus, style }: {
  value: string; onChangeText: (t: string) => void; placeholder: string; label: string; autoFocus?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[s.row, { gap: 8, height: 46, paddingHorizontal: 14, borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, style]}>
      <Icon name="search" size={18} color={colors.textMuted} />
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        style={[{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 }, { outlineStyle: 'none' } as object]}
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => onChangeText('')} hitSlop={10}>
          <Icon name="close" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

// Busca sem acento e sem diferenciar maiúscula.
export const matches = (query: string, ...fields: (string | undefined)[]) => {
  const q = normalizeSport(query.trim());
  return q.length === 0 || fields.some((f) => f && normalizeSport(f).includes(q));
};
