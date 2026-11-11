import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { usePerson } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, s } from '@/components/ui';
import { creatorName, daysLeft, fmtGoal, goalTypes, medalPalettes, type Challenge, type MedalStyle } from '@/data/arena';
import { useCommunity } from '@/data/CommunityStore';
import { useProfile, type UserWorkout } from '@/data/ProfileStore';
import { challengeProgress } from '@/data/progress';
import { fonts } from '@/theme/fonts';
import { rarityColors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

/* Medalha do desafio: cor da raridade ou cor escolhida (medalha personalizada Pro). */
export function ChallengeMedal({ medal, size = 52 }: { medal: MedalStyle; size?: number }) {
  const { colors } = useTheme();
  const c = medal.palette !== undefined ? medalPalettes[medal.palette] : rarityColors(medal.rarity, colors);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: Math.max(3, size / 16), borderColor: c.ring, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Txt style={{ fontFamily: fonts.displaySemi, fontSize: Math.round(size * (medal.mark.length > 2 ? 0.26 : 0.32)), color: c.fg }}>{medal.mark}</Txt>
    </View>
  );
}

export function Bar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.divider, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.max(0, value * 100))}%`, height: '100%', backgroundColor: color ?? colors.accent }} />
    </View>
  );
}

export function challengeState(c: Challenge, joinedChallenges: Record<string, boolean>, workouts: UserWorkout[]) {
  const joined = c.creatorId === 'me' || !!joinedChallenges[c.id];
  const invited = c.invited.includes('me') && !joined;
  const people = Object.keys(c.progress).length + c.crowd + (joined ? 1 : 0);
  return { joined, invited, people, left: daysLeft(c.end), mine: challengeProgress(c, workouts) };
}

export function useChallengeState(c: Challenge) {
  const { joinedChallenges } = useCommunity();
  const { workouts } = useProfile();
  return challengeState(c, joinedChallenges, workouts);
}

/* Cartão de desafio para as listas da Arena. */
export function ChallengeCard({ c }: { c: Challenge }) {
  const { colors } = useTheme();
  const st = useChallengeState(c);
  const goal = goalTypes.find((g) => g.id === c.goal)!;
  const badge = st.invited
    ? { label: `${creatorName(c.creatorId).split(' ')[0]} te convidou`, bg: colors.goldSoft, fg: colors.gold }
    : st.joined
      ? { label: 'Participando', bg: colors.accentSoft, fg: colors.accentInk }
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Desafio ${c.title}`}
      onPress={() => router.push({ pathname: '/desafio/[id]', params: { id: c.id } })}
      style={({ pressed }) => [s.row, { gap: 12, padding: 14, borderRadius: 18, backgroundColor: colors.surface, opacity: pressed ? 0.9 : 1 }]}
    >
      <ChallengeMedal medal={c.medal} />
      <View style={{ flex: 1, gap: 4 }}>
        {badge ? (
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: badge.bg }}>
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: badge.fg }}>{badge.label}</Txt>
          </View>
        ) : null}
        <View style={[s.row, { gap: 6, flexWrap: 'wrap' }]}>
          <Txt variant="bodyStrong" style={{ flexShrink: 1 }}>{c.title}</Txt>
          {c.visibility === 'Privado' ? <Txt variant="caption" tone="muted">· privado</Txt> : null}
        </View>
        <Txt variant="caption" tone="muted">
          {c.sport} · {fmtGoal(c.target, c.goal)} · {st.left} {st.left === 1 ? 'dia' : 'dias'}
        </Txt>
        {st.joined ? (
          <View style={{ gap: 4, marginTop: 2 }}>
            <Bar value={st.mine / c.target} height={6} />
            <Txt variant="caption" tone="soft">{fmtGoal(st.mine, c.goal)} de {fmtGoal(c.target, c.goal)}</Txt>
          </View>
        ) : (
          <Txt variant="caption" tone="faint">{c.creatorId === 'movva' ? 'Oficial MOVVA' : c.creatorId === 'me' ? 'Criado por você' : `Criado por ${creatorName(c.creatorId)}`} · {st.people.toLocaleString('pt-BR')} {st.people === 1 ? 'pessoa' : 'pessoas'} · {goal.label.toLowerCase()}</Txt>
        )}
      </View>
    </Pressable>
  );
}

/* Linha de ranking (com ouro, prata e bronze no pódio). */
export function RankRow({ pos, id, value, sub }: { pos: number; id: string; value: string; sub?: string }) {
  const { colors } = useTheme();
  const person = usePerson();
  const p = person(id);
  const me = id === 'me';
  const podium = ['#F5C542', '#C9D2CD', '#C98A4B'][pos - 1];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pos}º ${me ? 'você' : p.name}, ${value}`}
      disabled={me}
      onPress={() => router.push({ pathname: '/atleta/[id]', params: { id } })}
      style={[s.row, { gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14, backgroundColor: me ? colors.accentSoft : 'transparent', borderWidth: me ? 1 : 0, borderColor: colors.accentSoftBorder }]}
    >
      <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: podium ?? 'transparent' }}>
        <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: podium ? '#14110A' : colors.textMuted }}>{pos}</Txt>
      </View>
      <Avatar initials={p.initials} color={p.color} size={36} uri={p.uri} />
      <View style={{ flex: 1, gap: 1 }}>
        <Txt variant="small" style={{ fontSize: 15, fontFamily: me ? fonts.bodySemi : fonts.body }}>{me ? `${p.name} (você)` : p.name}</Txt>
        {sub ? <Txt variant="caption" tone="muted">{sub}</Txt> : null}
      </View>
      <Txt variant="small" style={{ fontFamily: fonts.bodySemi, fontSize: 15 }}>{value}</Txt>
    </Pressable>
  );
}
