import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { DuelCard } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, Header, Screen, SectionTitle, s } from '@/components/ui';
import { athletes, compatibility } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { initialsOf, useProfile } from '@/data/ProfileStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function Duelos() {
  const { colors } = useTheme();
  const { profile } = useProfile();
  const { duels } = useCommunity();
  const active = duels.filter((d) => d.status !== 'recusado');
  const busy = new Set(active.map((d) => d.athleteId));
  const rivals = athletes
    .filter((a) => !a.club && !busy.has(a.id))
    .map((a) => ({ a, c: compatibility(profile, a) }))
    .sort((x, y) => y.c.score - x.c.score);

  return (
    <Screen>
      <Header title="Duelos 1×1" subtitle="Você contra outro atleta. Quem fizer mais no período vence." />

      <View style={{ gap: 10 }}>
        <SectionTitle>Em andamento</SectionTitle>
        {active.length ? active.map((d) => <DuelCard key={d.id} duel={d} />) : <Txt variant="small" tone="muted">Nenhum duelo ainda. Escolha um adversário abaixo.</Txt>}
      </View>

      <View style={{ gap: 8 }}>
        <SectionTitle>Desafiar alguém</SectionTitle>
        {rivals.map(({ a, c }) => (
          <Pressable
            key={a.id}
            accessibilityRole="button"
            accessibilityLabel={`Desafiar ${a.name}`}
            onPress={() => router.push({ pathname: '/desafiar/[id]', params: { id: a.id } })}
            style={[s.row, { gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.surface }]}
          >
            <Avatar initials={initialsOf(a.name)} color={a.color} size={42} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="bodyStrong">{a.name}</Txt>
              <Txt variant="caption" tone="muted">{a.sports.slice(0, 2).join(', ')} · {c.score}% compatível</Txt>
            </View>
            <Icon name="bolt" size={20} color={colors.accentInk} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
