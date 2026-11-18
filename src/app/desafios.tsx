import { router } from 'expo-router';
import { View } from 'react-native';

import { ChallengeCard } from '@/components/arena';
import { Txt } from '@/components/Txt';
import { Button, Header, Screen, SectionTitle } from '@/components/ui';
import type { Challenge } from '@/data/arena';
import { useCommunity } from '@/data/CommunityStore';

export default function Desafios() {
  const { challenges, joinedChallenges } = useCommunity();
  const isJoined = (c: Challenge) => c.creatorId === 'me' || !!joinedChallenges[c.id];
  const invites = challenges.filter((c) => c.invited.includes('me') && !isJoined(c));
  const mine = challenges.filter(isJoined);
  const rest = challenges.filter((c) => !isJoined(c) && !invites.includes(c) && c.visibility === 'Público');
  const official = rest.filter((c) => c.creatorId === 'movva');
  const community = rest.filter((c) => c.creatorId !== 'movva');

  return (
    <Screen footer={<Button label="Criar meu desafio" icon="plus" onPress={() => router.push('/desafio/novo')} />}>
      <Header title="Desafios" subtitle="Bata a meta no prazo e ganhe a medalha" />

      {invites.length ? (
        <View style={{ gap: 10 }}>
          <SectionTitle>Convites para você</SectionTitle>
          {invites.map((c) => <ChallengeCard key={c.id} c={c} />)}
        </View>
      ) : null}

      {mine.length ? (
        <View style={{ gap: 10 }}>
          <SectionTitle>Participando</SectionTitle>
          {mine.map((c) => <ChallengeCard key={c.id} c={c} />)}
        </View>
      ) : null}

      {official.length ? (
        <View style={{ gap: 10 }}>
          <SectionTitle>Oficiais do mês</SectionTitle>
          <Txt variant="caption" tone="muted">Criados pelo MOVVA. Todo mundo pode entrar.</Txt>
          {official.map((c) => <ChallengeCard key={c.id} c={c} />)}
        </View>
      ) : null}

      {community.length ? (
        <View style={{ gap: 10 }}>
          <SectionTitle>Da comunidade</SectionTitle>
          <Txt variant="caption" tone="muted">Criados por outros atletas.</Txt>
          {community.map((c) => <ChallengeCard key={c.id} c={c} />)}
        </View>
      ) : null}
    </Screen>
  );
}
