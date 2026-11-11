import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Bar, ChallengeCard, ChallengeMedal, RankRow, useChallengeState } from '@/components/arena';
import { Icon, type IconName } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Chip, RouteMap, Screen, Segmented, SectionTitle, s } from '@/components/ui';
import { fmtGoal, rankingOf, rankMetrics, segments, type Challenge, type RankMetric } from '@/data/arena';
import { athleteById, athletes } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { initialsOf, useProfile } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const TABS = ['Desafios', 'Competições', 'Rankings'] as const;
type Tab = (typeof TABS)[number];
const SCOPES = ['Seguindo', 'Perto', 'Todos'] as const;

export default function Arena() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ aba?: string }>();
  const [tab, setTab] = useState<Tab>('Desafios');
  const { challenges, joinedChallenges, duels } = useCommunity();

  useEffect(() => {
    if (params.aba && (TABS as readonly string[]).includes(params.aba)) setTab(params.aba as Tab);
  }, [params.aba]);

  const isJoined = (c: Challenge) => c.creatorId === 'me' || !!joinedChallenges[c.id];
  const mine = challenges.filter(isJoined);
  const invites = challenges.filter((c) => c.invited.includes('me') && !isJoined(c));
  const others = challenges.filter((c) => !isJoined(c) && !invites.includes(c) && c.visibility === 'Público');
  const featured = mine[0] ?? challenges.find((c) => c.creatorId === 'movva');
  const activeDuels = duels.filter((d) => d.status !== 'recusado').length;

  return (
    <Screen inTabs>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Txt variant="title" accessibilityRole="header">Arena</Txt>
        <Button label="Criar desafio" icon="plus" size="sm" onPress={() => router.push('/desafio/novo')} />
      </View>

      {featured ? <Featured c={featured} /> : null}

      <View style={[s.row, { gap: 8 }]}>
        <Tile icon="bolt" title="Duelos" sub={activeDuels ? `${activeDuels} ${activeDuels === 1 ? 'ativo' : 'ativos'}` : 'Desafie alguém'} onPress={() => router.push('/duelos')} />
        <Tile icon="flag" title="Territórios" sub="Você domina 0" onPress={() => router.push('/territorios')} />
        <Tile icon="pin" title="Trechos" sub={`${segments.length} perto`} onPress={() => setTab('Competições')} />
      </View>

      <Segmented label="Seção da Arena" options={TABS} value={tab} onChange={setTab} />

      {tab === 'Desafios' ? (
        <>
          {invites.length ? (
            <View style={{ gap: 10 }}>
              <SectionTitle>Convites</SectionTitle>
              {invites.map((c) => <ChallengeCard key={c.id} c={c} />)}
            </View>
          ) : null}
          <View style={{ gap: 10 }}>
            <SectionTitle>Meus desafios</SectionTitle>
            {mine.length ? (
              mine.map((c) => <ChallengeCard key={c.id} c={c} />)
            ) : (
              <Txt variant="small" tone="muted">Você ainda não entrou em nenhum desafio. Escolha um abaixo ou crie o seu.</Txt>
            )}
          </View>
          <View style={{ gap: 10 }}>
            <SectionTitle>Outros desafios</SectionTitle>
            {others.map((c) => <ChallengeCard key={c.id} c={c} />)}
          </View>
        </>
      ) : null}

      {tab === 'Competições' ? <Competicoes /> : null}
      {tab === 'Rankings' ? <Rankings /> : null}

      <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>Só treinos verificados (GPS ou relógio) contam nos desafios e rankings.</Txt>
    </Screen>
  );
}

function Featured({ c }: { c: Challenge }) {
  const { colors } = useTheme();
  const st = useChallengeState(c);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Desafio em destaque: ${c.title}`}
      onPress={() => router.push({ pathname: '/desafio/[id]', params: { id: c.id } })}
      style={{ padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 12 }}
    >
      <View style={[s.row, { gap: 14 }]}>
        <ChallengeMedal medal={c.medal} size={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="eyebrow" tone="accent">{st.joined ? 'Em andamento' : 'Desafio do mês'} · {c.sport}</Txt>
          <Txt style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>{c.title}</Txt>
          <Txt variant="caption" tone="muted">{st.left} dias restantes · {st.people.toLocaleString('pt-BR')} participantes</Txt>
        </View>
      </View>
      {st.joined ? (
        <View style={{ gap: 6 }}>
          <Bar value={st.mine / c.target} />
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Txt variant="small" style={{ fontFamily: fonts.bodySemi }}>{fmtGoal(st.mine, c.goal)}</Txt>
            <Txt variant="small" tone="muted">de {fmtGoal(c.target, c.goal)}</Txt>
          </View>
        </View>
      ) : (
        <Txt variant="small" tone="soft">{c.description}</Txt>
      )}
    </Pressable>
  );
}

function Tile({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${sub}`}
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, padding: 12, borderRadius: 16, backgroundColor: colors.surface, gap: 6, opacity: pressed ? 0.85 : 1 })}
    >
      <Icon name={icon} size={20} color={colors.accentInk} />
      <Txt variant="bodyStrong" style={{ fontSize: 14 }}>{title}</Txt>
      <Txt variant="caption" tone="muted" numberOfLines={1}>{sub}</Txt>
    </Pressable>
  );
}

function Competicoes() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 4 }}>
        <Txt variant="bodyStrong">Competição sem inscrição</Txt>
        <Txt variant="caption" tone="soft">Passou por um trecho com o treino gravado? Seu tempo entra sozinho no ranking. O mais rápido do mês vira o dono do trecho e leva a medalha.</Txt>
      </View>
      <SectionTitle>Trechos perto de você</SectionTitle>
      {segments.map((sg) => {
        const lead = athleteById(sg.efforts[0]?.athleteId ?? '');
        return (
          <Pressable
            key={sg.id}
            accessibilityRole="button"
            accessibilityLabel={`Trecho ${sg.name}`}
            onPress={() => router.push({ pathname: '/trecho/[id]', params: { id: sg.id } })}
            style={({ pressed }) => ({ borderRadius: 18, backgroundColor: colors.surface, overflow: 'hidden', opacity: pressed ? 0.9 : 1 })}
          >
            <RouteMap path={sg.route} height={90} />
            <View style={{ padding: 14, gap: 8 }}>
              <View style={[s.row, { justifyContent: 'space-between', gap: 8 }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="bodyStrong">{sg.name}</Txt>
                  <Txt variant="caption" tone="muted">{sg.sport} · {sg.distance} · {sg.grade}</Txt>
                </View>
                <Icon name="chevron" size={18} color={colors.textMuted} />
              </View>
              {lead ? (
                <View style={[s.row, { gap: 8 }]}>
                  <Avatar initials={initialsOf(lead.name)} color={lead.color} size={26} />
                  <Txt variant="caption" tone="soft" style={{ flex: 1 }}>
                    <Txt variant="caption" style={{ fontFamily: fonts.bodySemi }}>{lead.name}</Txt> é dono do trecho
                  </Txt>
                  <Txt variant="small" style={{ fontFamily: fonts.bodySemi, color: colors.gold }}>{sg.efforts[0].time}</Txt>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function Rankings() {
  const { profile } = useProfile();
  const { following } = useCommunity();
  const [metric, setMetric] = useState<RankMetric>('km');
  const [scope, setScope] = useState<(typeof SCOPES)[number]>('Seguindo');
  const unit = rankMetrics.find((m) => m.id === metric)!.unit;
  const city = (profile?.region ?? '').toLowerCase();

  const pool = athletes.filter((a) =>
    scope === 'Seguindo' ? following[a.id] : scope === 'Perto' ? city.split(/[\s,]+/).some((w) => w.length > 3 && a.region.toLowerCase().includes(w)) : true,
  );
  const rows = [...rankingOf(pool, metric), { id: 'me', value: 0 }].sort((x, y) => y.value - x.value);
  const fmt = (v: number) => `${String(v).replace('.', ',')} ${unit}`;

  return (
    <View style={{ gap: 10 }}>
      <Segmented label="Quem entra no ranking" options={SCOPES} value={scope} onChange={setScope} />
      <View style={[s.row, { gap: 8 }]}>
        {rankMetrics.map((m) => <Chip key={m.id} label={m.label} selected={m.id === metric} onPress={() => setMetric(m.id)} />)}
      </View>
      <Txt variant="caption" tone="muted">Esta semana · {rows.length} {rows.length === 1 ? 'atleta' : 'atletas'}</Txt>
      <View style={{ gap: 2 }}>
        {rows.map((r, i) => <RankRow key={r.id} pos={i + 1} id={r.id} value={fmt(r.value)} />)}
      </View>
      {rows.length === 1 ? <Txt variant="small" tone="muted">Ninguém por aqui ainda. Siga atletas para montar seu ranking.</Txt> : null}
    </View>
  );
}

