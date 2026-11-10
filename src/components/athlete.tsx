import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Txt } from './Txt';
import { s } from './ui';
import { photoArts, sportColor, type Medal, type Workout } from '@/data/profile';
import { rarityColors, rarityLabel } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/* ---------- Medalha (disco) ---------- */

export function MedalDisc({ medal, size = 56 }: { medal: Pick<Medal, 'mark' | 'rarity'>; size?: number }) {
  const { colors } = useTheme();
  const c = rarityColors(medal.rarity, colors);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: Math.max(3, size / 18), borderColor: c.ring, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Txt style={{ fontFamily: fonts.displaySemi, fontSize: Math.round(size * 0.3), color: c.fg }}>{medal.mark}</Txt>
    </View>
  );
}

export function RarityLabel({ rarity }: { rarity: Medal['rarity'] }) {
  const { colors } = useTheme();
  return <Txt variant="caption" color={rarityColors(rarity, colors).fg}>{rarityLabel[rarity]}</Txt>;
}

/* ---------- Foto ilustrativa ---------- */

export function PhotoArtView({ index, style }: { index: number; style?: StyleProp<ViewStyle> }) {
  const a = photoArts[index % photoArts.length];
  return (
    <LinearGradient colors={a.sky} style={[{ overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute' }}>
        <Circle cx={a.sunX} cy={30} r={11} fill={a.sun} />
        <Path d="M0 70 L25 45 L45 62 L65 36 L100 64 V100 H0Z" fill={a.far} />
        <Path d="M0 84 Q50 70 100 86 V100 H0Z" fill={a.near} />
      </Svg>
    </LinearGradient>
  );
}

/* ---------- Linha de treino ---------- */

export function WorkoutRow({ w, onPress }: { w: Workout; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${w.title}, ${w.distance}, ${w.duration}`}
      onPress={onPress}
      style={({ pressed }) => [s.row, { gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: sportColor[w.sport], alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: '#FFFFFF' }}>{w.sport.slice(0, 3).toUpperCase()}</Txt>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodyStrong">{w.title}</Txt>
        <Txt variant="caption" tone="muted">{w.sport} · {w.when}</Txt>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Txt variant="number" style={{ fontSize: 18 }}>{w.distance}</Txt>
        <Txt variant="caption" tone="muted">{w.duration}</Txt>
      </View>
    </Pressable>
  );
}

/* ---------- Gráfico de linha simples ---------- */

export function LineChart({ values, invert, height = 120, label }: { values: number[]; invert?: boolean; height?: number; label: string }) {
  const { colors, isDark } = useTheme();
  const W = 320;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pts = values.map((v, i) => {
    let r = (v - lo) / (hi - lo || 1);
    if (invert) r = 1 - r;
    return [8 + (i * (W - 16)) / (values.length - 1), height - 14 - r * (height - 36)] as const;
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const stroke = isDark ? colors.accent : '#189A06';
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} accessibilityLabel={label}>
      {[0.25, 0.55, 0.85].map((f) => (
        <Path key={f} d={`M0 ${height * f} H${W}`} stroke={colors.divider} strokeWidth={1} />
      ))}
      <Path d={`${line} L${last[0]} ${height} L8 ${height} Z`} fill={isDark ? '#163A22' : '#CFEBC5'} />
      <Path d={line} stroke={stroke} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r={6} fill={stroke} />
    </Svg>
  );
}

/* ---------- Grade de números ---------- */

export function StatGrid({ stats, columns = 3 }: { stats: { label: string; value: string }[]; columns?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[s.wrap, { gap: 8 }]}>
      {stats.map((st) => (
        <View key={st.label} style={{ flexBasis: `${100 / columns - 3}%`, flexGrow: 1, padding: 10, borderRadius: 12, backgroundColor: colors.surface, gap: 2 }}>
          <Txt variant="caption" tone="muted">{st.label}</Txt>
          <Txt variant="number" style={{ fontSize: 18 }}>{st.value}</Txt>
        </View>
      ))}
    </View>
  );
}
