import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ChallengeCard, RankRow } from '@/components/arena';
import { Icon, type IconName } from '@/components/Icon';
import { DuelCard } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Button, Screen, SectionTitle, s } from '@/components/ui';
import { rankingOf, segments, territories, type Challenge } from '@/data/arena';
import { athletes } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { useProfile } from '@/data/ProfileStore';
import { totals, weekStart } from '@/data/progress';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

// A Arena tem 4 jeitos de competir. Esta tela mostra primeiro o que você já está
// fazendo e depois explica cada um, com uma porta para cada.
export default function Arena() {
  const { challenges, joinedChallenges, duels, following } = useCommunity();
  const { workouts } = useProfile();

  const isJoined = (c: Challenge) => c.creatorId === 'me' || !!joinedChallenges[c.id];
  const myChallenges = challenges.filter(isJoined);
  const invites = challenges.filter((c) => c.invited.includes('me') && !isJoined(c));
  const activeDuels = duels.filter((d) => d.status !== 'recusado');
  const openChallenges = challenges.filter((c) => !isJoined(c) && c.visibility === 'Público').length;
  const nothing = !myChallenges.length && !activeDuels.length && !invites.length;

  // Ranking resumido: seu lugar entre quem você segue nesta semana.
  const myKm = totals(workouts, weekStart()).km;
  const rows = [...rankingOf(athletes.filter((a) => following[a.id]), 'km'), { id: 'me', value: myKm }].sort((a, b) => b.value - a.value);
  const myPos = rows.findIndex((r) => r.id === 'me') + 1;
  const fmt = (v: number) => `${String(v).replace('.', ',')} km`;

  return (
    <Screen inTabs>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Txt variant="title" accessibilityRole="header">Arena</Txt>
        <Button label="Criar desafio" icon="plus" size="sm" onPress={() => router.push('/desafio/novo')} />
      </View>
      <Txt variant="small" tone="muted" style={{ marginTop: -8 }}>Desafios e disputas. Tudo conta com os treinos que você grava.</Txt>

      {/* 1. O que você está fazendo */}
      <View style={{ gap: 10 }}>
        <SectionTitle>Em andamento</SectionTitle>
        {invites.map((c) => <ChallengeCard key={c.id} c={c} />)}
        {myChallenges.map((c) => <ChallengeCard key={c.id} c={c} />)}
        {activeDuels.map((d) => <DuelCard key={d.id} duel={d} compact />)}
        {nothing ? <StartHere /> : null}
      </View>

      {/* 2. Os 4 jeitos de competir */}
      <View style={{ gap: 10 }}>
        <SectionTitle>Jeitos de competir</SectionTitle>
        <View style={[s.wrap, { gap: 10 }]}>
          <Door icon="trophy" title="Desafios" text="Uma meta com prazo, tipo 100 km no mês. Bateu, ganhou a medalha." badge={openChallenges ? `${openChallenges} abertos` : undefined} href="/desafios" />
          <Door icon="bolt" title="Duelos 1×1" text="Você contra outro atleta por 3 a 14 dias. Quem fizer mais vence." badge={activeDuels.length ? `${activeDuels.length} ativo${activeDuels.length > 1 ? 's' : ''}` : undefined} href="/duelos" />
          <Door icon="pin" title="Trechos" text="O melhor tempo num percurso. Sem inscrição: passou, entrou." badge={`${segments.length} perto`} href="/trechos" />
          <Door icon="flag" title="Territórios" text="Quem mais treina numa área do mapa vira o dono dela." badge={`${territories.length} áreas`} href="/territorios" />
        </View>
      </View>

      {/* 3. Ranking resumido */}
      <View style={{ gap: 6 }}>
        <SectionTitle right={<Txt variant="small" tone="muted">{myPos}º de {rows.length}</Txt>}>Ranking da semana</SectionTitle>
        <Txt variant="caption" tone="muted">Quilômetros entre você e quem você segue.</Txt>
        {rows.slice(0, 3).map((r, i) => <RankRow key={r.id} pos={i + 1} id={r.id} value={fmt(r.value)} />)}
        {myPos > 3 ? <RankRow pos={myPos} id="me" value={fmt(myKm)} /> : null}
        <Button label="Ver ranking completo" variant="ghost" size="sm" onPress={() => router.push('/ranking')} />
      </View>
    </Screen>
  );
}

function StartHere() {
  const { colors } = useTheme();
  return (
    <View style={{ padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 8 }}>
      <Txt variant="bodyStrong">Você ainda não está competindo</Txt>
      <Txt variant="small" tone="soft">O jeito mais fácil de começar é entrar num desafio do mês. Seus treinos gravados já começam a contar.</Txt>
      <Button label="Ver desafios do mês" size="md" onPress={() => router.push('/desafios')} />
    </View>
  );
}

function Door({ icon, title, text, badge, href }: { icon: IconName; title: string; text: string; badge?: string; href: Href }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${text}`}
      onPress={() => router.push(href)}
      style={({ pressed }) => ({ flexBasis: '47%', flexGrow: 1, padding: 14, borderRadius: 18, backgroundColor: colors.surface, gap: 8, opacity: pressed ? 0.85 : 1 })}
    >
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color={colors.accentInk} />
        </View>
        {badge ? <Txt variant="caption" tone="muted">{badge}</Txt> : null}
      </View>
      <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 16, color: colors.text }}>{title}</Txt>
      <Txt variant="caption" tone="soft" style={{ lineHeight: 17 }}>{text}</Txt>
    </Pressable>
  );
}
