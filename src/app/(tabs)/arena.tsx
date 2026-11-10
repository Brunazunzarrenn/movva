import { router } from 'expo-router';
import { View } from 'react-native';

import { ComingSoon } from '@/components/ComingSoon';
import { EmptyState } from '@/components/profileParts';
import { DuelCard } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Screen, SectionTitle } from '@/components/ui';
import { useCommunity } from '@/data/CommunityStore';

export default function Arena() {
  const { duels } = useCommunity();
  const active = duels.filter((d) => d.status !== 'recusado');

  return (
    <Screen inTabs>
      <Txt variant="title" accessibilityRole="header">Arena</Txt>

      <View style={{ gap: 10 }}>
        <SectionTitle right={active.length ? <Txt variant="small" tone="muted">{active.length}</Txt> : undefined}>Meus duelos</SectionTitle>
        {active.length === 0 ? (
          <EmptyState
            icon="bolt"
            title="Nenhum duelo ainda"
            text="Abra o perfil de um atleta e toque em Desafiar. Quem fizer mais no período vence."
            action="Encontrar adversário"
            onAction={() => router.push({ pathname: '/(tabs)/bora', params: { aba: 'Parceiros' } })}
          />
        ) : (
          active.map((d) => <DuelCard key={d.id} duel={d} />)
        )}
      </View>

      <ComingSoon icon="trophy" title="Mais na Arena em breve" text="Desafios do mês, territórios, competições e rankings." />
    </Screen>
  );
}
