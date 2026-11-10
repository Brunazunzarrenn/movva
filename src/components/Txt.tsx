import { Text, type TextProps, type TextStyle } from 'react-native';

import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'hero' | 'title' | 'heading' | 'number' | 'body' | 'bodyStrong' | 'small' | 'caption' | 'eyebrow';
type Tone = 'default' | 'soft' | 'muted' | 'faint' | 'accent' | 'onAccent' | 'danger' | 'gold' | 'inverse';

const variants: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 64, lineHeight: 68, letterSpacing: 4 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, textTransform: 'uppercase' },
  heading: { fontFamily: fonts.displaySemi, fontSize: 18, lineHeight: 24, textTransform: 'uppercase', letterSpacing: 1 },
  number: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 16, letterSpacing: 1, textTransform: 'uppercase' },
};

export type TxtProps = TextProps & { variant?: Variant; tone?: Tone; color?: string };

export function Txt({ variant = 'body', tone = 'default', color, style, ...rest }: TxtProps) {
  const { colors } = useTheme();
  const toneColor: Record<Tone, string> = {
    default: colors.text,
    soft: colors.textSoft,
    muted: colors.textMuted,
    faint: colors.textFaint,
    accent: colors.accentInk,
    onAccent: colors.onAccent,
    danger: colors.danger,
    gold: colors.gold,
    inverse: colors.onInverse,
  };
  return <Text {...rest} style={[variants[variant], { color: color ?? toneColor[tone] }, style]} />;
}
