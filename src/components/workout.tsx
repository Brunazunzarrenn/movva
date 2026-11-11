import { Pressable, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { s } from '@/components/ui';
import { activitySpec, fmtDuration, fmtKm, fmtSpeed, shortSport, speedLabel } from '@/data/activity';
import type { UserWorkout } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/* Números de um treino conforme o tipo de esporte (jiu-jitsu não tem distância nem ritmo). */
export function workoutStats(w: Pick<UserWorkout, 'sport' | 'kind' | 'sec' | 'km' | 'elevation' | 'kcal' | 'laps' | 'poolLength' | 'rpe'>) {
  const sp = activitySpec(w.sport);
  const out: { label: string; value: string }[] = [{ label: 'Tempo', value: fmtDuration(w.sec) }];
  if (w.kind === 'gps' || w.kind === 'multi' || w.kind === 'piscina') out.unshift({ label: 'Distância', value: fmtKm(w.km) });
  if (w.kind === 'gps' || w.kind === 'piscina') out.push({ label: speedLabel(sp.speed), value: fmtSpeed(sp.speed, w.km, w.sec) });
  if (w.kind === 'piscina' && w.laps) out.push({ label: 'Voltas', value: `${w.laps} × ${w.poolLength} m` });
  if (w.kind === 'gps' && w.elevation > 0) out.push({ label: 'Subida', value: `${Math.round(w.elevation)} m` });
  out.push({ label: 'Calorias', value: `${w.kcal} kcal` });
  if (w.kind === 'tempo') out.push({ label: 'Esforço', value: `${w.rpe}/10 · ${effortLabel(w.rpe).toLowerCase()}` });
  return out;
}

export function effortLabel(rpe: number) {
  return rpe <= 3 ? 'Leve' : rpe <= 6 ? 'Moderado' : rpe <= 8 ? 'Forte' : 'Máximo';
}

const SPORT_COLORS = ['#2E5BFF', '#1F9E6E', '#E2701C', '#8E44D9', '#C2410C', '#0E7490'];
export function sportTint(sport: string) {
  const g = activitySpec(sport).group;
  if (g === 'corrida') return '#2E5BFF';
  if (g === 'pedal') return '#1F9E6E';
  if (g === 'natacao') return '#0E7490';
  let h = 0;
  for (const ch of sport) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SPORT_COLORS[h % SPORT_COLORS.length];
}

export function whenText(iso: string) {
  const d = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = new Date(d); day.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / 86400000);
  const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `Hoje, ${hm}`;
  if (diff === 1) return `Ontem, ${hm}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${hm}`;
}

/* Linha de treino do perfil. */
export function UserWorkoutRow({ w, onPress }: { w: UserWorkout; onPress?: () => void }) {
  const { colors } = useTheme();
  const main = w.kind === 'tempo' ? fmtDuration(w.sec) : fmtKm(w.km);
  const sub = w.kind === 'tempo' ? `${w.kcal} kcal` : fmtDuration(w.sec);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${w.title}, ${main}`}
      onPress={onPress}
      style={({ pressed }) => [s.row, { gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: sportTint(w.sport), alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: '#FFFFFF' }}>{shortSport(w.sport).slice(0, 3).toUpperCase()}</Txt>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodyStrong" numberOfLines={1}>{w.title}</Txt>
        <Txt variant="caption" tone="muted">{w.sport} · {whenText(w.start)}{w.source === 'manual' ? ' · manual' : ''}</Txt>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Txt variant="number" style={{ fontSize: 18 }}>{main}</Txt>
        <Txt variant="caption" tone="muted">{sub}</Txt>
      </View>
    </Pressable>
  );
}

/* Escolha do esforço percebido (1 a 10). */
export function EffortPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Txt variant="bodyStrong">Esforço</Txt>
        <Txt variant="small" tone="accent" style={{ fontFamily: fonts.bodySemi }}>{value}/10 · {effortLabel(value)}</Txt>
      </View>
      <View accessibilityRole="radiogroup" accessibilityLabel="Esforço do treino" style={[s.row, { gap: 4 }]}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const on = n <= value;
          return (
            <Pressable
              key={n}
              accessibilityRole="radio"
              accessibilityLabel={`Esforço ${n}`}
              accessibilityState={{ checked: n === value }}
              onPress={() => onChange(n)}
              style={{ flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.accent : colors.surface, borderWidth: 1, borderColor: on ? colors.accent : colors.border }}
            >
              <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: on ? colors.onAccent : colors.textMuted }}>{n}</Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* Grade de números grandes. */
export function BigStats({ stats }: { stats: { label: string; value: string }[] }) {
  const { colors } = useTheme();
  return (
    <View style={[s.wrap, { gap: 8 }]}>
      {stats.map((st) => (
        <View key={st.label} style={{ flexBasis: '47%', flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: colors.surface, gap: 2 }}>
          <Txt variant="caption" tone="muted">{st.label}</Txt>
          <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 24, color: colors.text }}>{st.value}</Txt>
        </View>
      ))}
    </View>
  );
}
