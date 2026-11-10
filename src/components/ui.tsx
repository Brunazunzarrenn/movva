import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

/* ---------- Tela ---------- */

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  bottomInset?: number; // espaço extra no fim
  inTabs?: boolean; // tela dentro das abas: a barra inferior já cuida da área segura
  footer?: ReactNode; // área fixa no rodapé (botões)
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, scroll = true, padded = true, bottomInset = 0, inTabs = false, footer, style }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pad = padded ? 20 : 0;
  const content = [{ paddingTop: insets.top + 8, paddingHorizontal: pad, gap: 14 }, style];
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[content, { paddingBottom: (footer || inTabs ? 16 : insets.bottom + 24) + bottomInset }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content]}>{children}</View>
      )}
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 12, gap: 10, backgroundColor: colors.bg }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/* ---------- Cabeçalho com voltar ---------- */

export function Header({ title, subtitle, right, onBack }: { title: string; subtitle?: string; right?: ReactNode; onBack?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <IconButton icon="back" label="Voltar" onPress={onBack ?? (() => router.back())} style={{ marginLeft: -12 }} color={colors.text} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="title" style={{ fontSize: 24, lineHeight: 30 }}>{title}</Txt>
        {subtitle ? <Txt variant="caption" tone="muted">{subtitle}</Txt> : null}
      </View>
      {right}
    </View>
  );
}

/* ---------- Botões ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'inverse' | 'ghost' | 'danger';

export function Button({
  label, onPress, variant = 'primary', size = 'lg', icon, disabled, style,
}: {
  label: string; onPress?: () => void; variant?: ButtonVariant; size?: 'lg' | 'md' | 'sm';
  icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const v = {
    primary: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    outline: { bg: 'transparent', fg: colors.accentInk, border: colors.accentInk },
    inverse: { bg: colors.inverse, fg: colors.onInverse, border: colors.inverse },
    ghost: { bg: 'transparent', fg: colors.textMuted, border: 'transparent' },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  }[variant];
  const h = size === 'lg' ? 56 : size === 'md' ? 46 : 38;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: h, paddingHorizontal: 16, borderRadius: size === 'sm' ? 10 : 16,
          backgroundColor: v.bg, borderWidth: 1, borderColor: v.border,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={v.fg} /> : null}
      <Txt style={{ fontFamily: fonts.bodyBold, fontSize: size === 'sm' ? 13 : 16, color: v.fg }}>{label}</Txt>
    </Pressable>
  );
}

export function IconButton({
  icon, label, onPress, color, style, badge,
}: { icon: IconName; label: string; onPress?: () => void; color?: string; style?: StyleProp<ViewStyle>; badge?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 }, style]}
    >
      <Icon name={icon} color={color ?? colors.text} />
      {badge ? <View style={{ position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent }} /> : null}
    </Pressable>
  );
}

/* ---------- Chips e seletores ---------- */

export function Chip({ label, selected, onPress, style }: { label: string; selected?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[
        {
          minHeight: 38, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
          backgroundColor: selected ? colors.accent : colors.surface,
          borderWidth: 1, borderColor: selected ? colors.accent : colors.border,
        },
        style,
      ]}
    >
      <Txt style={{ fontFamily: selected ? fonts.bodySemi : fonts.body, fontSize: 14, color: selected ? colors.onAccent : colors.textSoft }}>{label}</Txt>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', padding: 4, borderRadius: 12, backgroundColor: colors.surface, gap: 4 }}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o)}
            style={{ flex: 1, minHeight: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.accent : 'transparent' }}
          >
            <Txt style={{ fontFamily: on ? fonts.bodySemi : fonts.body, fontSize: 14, color: on ? colors.onAccent : colors.textMuted }}>{o}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Cartões ---------- */

export function Card({ children, style, tone = 'surface', onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'surface' | 'accent' | 'gold'; onPress?: () => void }) {
  const { colors } = useTheme();
  const t = {
    surface: { backgroundColor: colors.surface, borderColor: colors.surface },
    accent: { backgroundColor: colors.accentSoft, borderColor: colors.accentSoftBorder },
    gold: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  }[tone];
  const base = [{ borderRadius: 20, padding: 16, borderWidth: 1, gap: 10 }, t, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1 }]}>
      {children}
    </Pressable>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({ initials, color, size = 40, ring, square, uri }: { initials: string; color: string; size?: number; ring?: string; square?: boolean; uri?: string }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityIgnoresInvertColors
        style={{ width: size, height: size, borderRadius: square ? size * 0.28 : size / 2, borderWidth: ring ? 3 : 0, borderColor: ring }}
      />
    );
  }
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size, height: size, borderRadius: square ? size * 0.28 : size / 2, backgroundColor: color,
        alignItems: 'center', justifyContent: 'center', borderWidth: ring ? 3 : 0, borderColor: ring,
      }}
    >
      <Txt style={{ fontFamily: fonts.bodySemi, fontSize: Math.round(size * 0.34), color: '#FFFFFF' }}>{initials}</Txt>
    </View>
  );
}

/* ---------- Selo verificado ---------- */

export function VerifiedBadge() {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.accentSoft }}>
      <Icon name="check" size={12} strokeWidth={3} color={colors.accentInk} />
      <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: colors.accentInk }}>Verificado</Txt>
    </View>
  );
}

/* ---------- Logo ---------- */

export function LogoMark({ size = 88, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size * 0.84} viewBox="0 0 240 200" accessibilityLabel="Símbolo MOVVA">
      <Path d="M20 180 L70 30 L120 130 L170 30 L220 180" fill="none" stroke={color ?? colors.accentInk} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ---------- Mapa ilustrativo de percurso ---------- */

export function RouteMap({ height = 150, path = 'M40 120 C70 60 110 50 150 70 S220 120 260 80 S300 30 320 40' }: { height?: number; path?: string }) {
  const { colors, isDark } = useTheme();
  const street = isDark ? '#1C2620' : '#FFFFFF';
  const route = isDark ? colors.accent : '#189A06';
  return (
    <Svg width="100%" height={height} viewBox="0 0 350 150" preserveAspectRatio="xMidYMid slice" style={{ backgroundColor: colors.surfaceAlt }}>
      <Path d="M0 40 H350 M0 95 H350 M90 0 V150 M230 0 V150" stroke={street} strokeWidth={10} />
      <Path d={path} fill="none" stroke={route} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}

/* ---------- Linha de seção ---------- */

export function SectionTitle({ children, right }: { children: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <Txt variant="heading">{children}</Txt>
      {right}
    </View>
  );
}

export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
