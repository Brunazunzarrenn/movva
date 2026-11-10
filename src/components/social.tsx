import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Avatar, Button, s } from '@/components/ui';
import { athleteById, duelMetrics, inviteStatus, whenLabel, type BoraInvite, type Duel } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { colorOf, initialsOf, useProfile } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/* Pessoa (atleta de teste ou você) com nome, iniciais e cor. */
export function usePerson() {
  const { profile } = useProfile();
  return (id: string) => {
    if (id === 'me') {
      const name = profile?.name ?? 'Você';
      return { id, name, short: 'Você', initials: initialsOf(name), color: colorOf(profile?.username ?? 'voce'), uri: profile?.photoUri };
    }
    const a = athleteById(id);
    const name = a?.name ?? 'Atleta';
    return { id, name, short: name.split(' ')[0], initials: initialsOf(name), color: a?.color ?? '#888888', uri: undefined as string | undefined };
  };
}

/* Fileira de avatares sobrepostos. */
export function AvatarStack({ ids, max = 5, size = 30 }: { ids: string[]; max?: number; size?: number }) {
  const { colors } = useTheme();
  const person = usePerson();
  const shown = ids.slice(0, max);
  return (
    <View style={[s.row]}>
      {shown.map((id, i) => {
        const p = person(id);
        return (
          <View key={id} style={{ marginLeft: i === 0 ? 0 : -size * 0.3 }}>
            <Avatar initials={p.initials} color={p.color} size={size} ring={colors.surface} uri={p.uri} />
          </View>
        );
      })}
      {ids.length > max ? <Txt variant="caption" tone="muted" style={{ marginLeft: 6 }}>+{ids.length - max}</Txt> : null}
    </View>
  );
}

/* Cartão de convite do Bora Treinar? */
export function InviteCard({ inv }: { inv: BoraInvite }) {
  const { colors } = useTheme();
  const { joined, declined, checkins } = useCommunity();
  const person = usePerson();
  const host = person(inv.hostId);
  const going = inv.hostId === 'me' || !!joined[inv.id];
  const people = going && inv.hostId !== 'me' ? [...inv.participants, 'me'] : inv.hostId === 'me' ? ['me', ...inv.participants] : inv.participants;
  const st = inviteStatus(inv.start);
  const full = people.length >= inv.spots;

  const badge = checkins[inv.id]
    ? { label: 'Check-in feito', bg: colors.accent, fg: colors.onAccent }
    : st === 'check-in' && going
      ? { label: 'Check-in aberto', bg: colors.accent, fg: colors.onAccent }
      : inv.hostId === 'me'
        ? { label: 'Seu convite', bg: colors.accentSoft, fg: colors.accentInk }
        : going
          ? { label: 'Você vai', bg: colors.accentSoft, fg: colors.accentInk }
          : inv.invited.includes('me') && !declined[inv.id]
            ? { label: `${host.short} te convidou`, bg: colors.goldSoft, fg: colors.gold }
            : full
              ? { label: 'Lotado', bg: colors.surfaceAlt, fg: colors.textMuted }
              : st === 'encerrado'
                ? { label: 'Encerrado', bg: colors.surfaceAlt, fg: colors.textMuted }
                : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${inv.title}, ${whenLabel(inv.start)}, ${inv.place}`}
      onPress={() => router.push({ pathname: '/convite/[id]', params: { id: inv.id } })}
      style={({ pressed }) => ({ padding: 14, borderRadius: 18, backgroundColor: colors.surface, gap: 10, opacity: pressed ? 0.9 : 1 })}
    >
      <View style={[s.row, { justifyContent: 'space-between', gap: 8 }]}>
        <Txt variant="caption" tone="accent" style={{ fontFamily: fonts.bodySemi }}>{inv.sport.toUpperCase()}</Txt>
        {badge ? (
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: badge.bg }}>
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: badge.fg }}>{badge.label}</Txt>
          </View>
        ) : null}
      </View>
      <Txt variant="bodyStrong" style={{ fontSize: 17 }}>{inv.title}</Txt>
      <View style={{ gap: 4 }}>
        <View style={[s.row, { gap: 6 }]}>
          <Icon name="clock" size={15} color={colors.textMuted} />
          <Txt variant="small" tone="soft" style={{ fontSize: 14 }}>{whenLabel(inv.start)}</Txt>
        </View>
        <View style={[s.row, { gap: 6 }]}>
          <Icon name="pin" size={15} color={colors.textMuted} />
          <Txt variant="small" tone="soft" style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>{inv.place}</Txt>
        </View>
      </View>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <AvatarStack ids={people} />
        <Txt variant="caption" tone="muted">
          {inv.level}{inv.distance ? ` · ${inv.distance}` : ''} · {people.length}/{inv.spots}
        </Txt>
      </View>
    </Pressable>
  );
}

/* Duelo 1×1: placar parcial e situação. */
export function DuelCard({ duel, compact }: { duel: Duel; compact?: boolean }) {
  const { colors } = useTheme();
  const { cancelDuel } = useCommunity();
  const person = usePerson();
  const a = athleteById(duel.athleteId);
  const me = person('me');
  const metric = duelMetrics.find((m) => m.id === duel.metric) ?? duelMetrics[0];
  if (!a) return null;

  const startedAt = new Date(duel.answeredAt ?? duel.createdAt).getTime();
  const endsAt = startedAt + duel.days * 86400000;
  const daysLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 86400000));
  const elapsed = Math.min(1, Math.max(0.08, (Date.now() - startedAt) / (duel.days * 86400000)));
  // Seus treinos reais entram quando o GPS estiver pronto; por enquanto você começa do zero.
  const mine = 0;
  const raw = ((a.week[duel.metric] * duel.days) / 7) * elapsed;
  const theirs = duel.status !== 'aceito' ? 0 : duel.metric === 'treinos' || duel.metric === 'subida' ? Math.floor(raw) : Math.round(raw * 10) / 10;
  const top = Math.max(mine, theirs, 1);
  const fmt = (v: number) => `${String(v).replace('.', ',')} ${metric.unit}`;

  return (
    <View style={{ padding: 14, borderRadius: 18, backgroundColor: colors.surface, gap: 12, borderWidth: duel.status === 'aceito' ? 1 : 0, borderColor: colors.accentSoftBorder }}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <View style={[s.row, { gap: 6 }]}>
          <Icon name="bolt" size={16} color={colors.accentInk} />
          <Txt variant="caption" tone="accent" style={{ fontFamily: fonts.bodySemi }}>DUELO 1×1 · {duel.days} DIAS</Txt>
        </View>
        <Txt variant="caption" tone={duel.status === 'aceito' ? 'accent' : 'muted'} style={{ fontFamily: fonts.bodySemi }}>
          {duel.status === 'aguardando' ? 'Aguardando resposta' : duel.status === 'aceito' ? (daysLeft > 0 ? `Termina em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}` : 'Encerrado') : 'Recusado'}
        </Txt>
      </View>
      <Txt variant="bodyStrong">{metric.label}</Txt>
      {[{ p: me, v: mine }, { p: { ...person(a.id), short: a.name.split(' ')[0] }, v: theirs }].map(({ p, v }) => (
        <View key={p.id} style={[s.row, { gap: 10 }]}>
          <Avatar initials={p.initials} color={p.color} size={30} uri={p.uri} />
          <View style={{ flex: 1, gap: 4 }}>
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <Txt variant="small" style={{ fontSize: 14 }}>{p.short}</Txt>
              <Txt variant="small" style={{ fontSize: 14, fontFamily: fonts.bodySemi }}>{duel.status === 'aceito' ? fmt(v) : '–'}</Txt>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.divider, overflow: 'hidden' }}>
              <View style={{ width: `${(v / top) * 100}%`, height: '100%', backgroundColor: p.id === 'me' ? colors.accent : a.color }} />
            </View>
          </View>
        </View>
      ))}
      {duel.status === 'aguardando' ? (
        <Txt variant="caption" tone="muted">{a.name.split(' ')[0]} recebeu seu desafio. Quando aceitar, a contagem começa.</Txt>
      ) : duel.status === 'aceito' ? (
        <Txt variant="caption" tone="muted">Registre treinos para pontuar. O placar atualiza sozinho.</Txt>
      ) : null}
      {!compact ? (
        <View style={[s.row, { gap: 8 }]}>
          <Button label="Ver perfil" size="sm" variant="secondary" onPress={() => router.push({ pathname: '/atleta/[id]', params: { id: a.id } })} style={{ flex: 1 }} />
          {duel.status === 'aguardando' ? <Button label="Cancelar desafio" size="sm" variant="danger" onPress={() => cancelDuel(duel.id)} style={{ flex: 1 }} /> : null}
        </View>
      ) : null}
    </View>
  );
}
