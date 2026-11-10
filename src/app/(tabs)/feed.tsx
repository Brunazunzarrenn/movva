import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PostCard } from '@/components/PostCard';
import { Txt } from '@/components/Txt';
import { Card, Chip, IconButton, Screen, s } from '@/components/ui';
import { EmptyState } from '@/components/profileParts';
import { athleteById, communityPosts, inviteStatus } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const FILTERS = ['Seguindo', 'Perto de você', 'Clubes'] as const;
type Filter = (typeof FILTERS)[number];

export default function Feed() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('Seguindo');
  const { following, invites, joined, declined } = useCommunity();
  const isClub = (id: string) => !!athleteById(id)?.club;
  const posts = communityPosts.filter((p) =>
    filter === 'Clubes' ? isClub(p.athleteId) : filter === 'Seguindo' ? !!following[p.athleteId] : !following[p.athleteId] && !isClub(p.athleteId),
  );
  const openInvites = invites.filter((i) => i.hostId !== 'me' && !joined[i.id] && inviteStatus(i.start) !== 'encerrado');
  const forMe = invites.filter((i) => i.invited.includes('me') && !joined[i.id] && !declined[i.id]).length;
  const soon = () => router.push('/em-breve');

  return (
    <Screen inTabs>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Txt style={{ fontFamily: fonts.display, fontSize: 28, letterSpacing: 3, color: colors.text }} accessibilityRole="header">MOVVA</Txt>
        <View style={s.row}>
          <IconButton icon="coach" label="MOVVA Coach" color={colors.accentInk} onPress={soon} />
          <IconButton icon="calendar" label="Calendário" onPress={soon} />
          <IconButton icon="search" label="Buscar atletas, clubes e treinadores" onPress={soon} />
          <IconButton icon="bell" label="Notificações" badge onPress={soon} />
        </View>
      </View>

      <View accessibilityRole="tablist" style={[s.row, { gap: 8 }]}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />
        ))}
      </View>

      {filter === 'Seguindo' ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={soon}
            style={[s.row, { gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface }]}
          >
            <Icon name="sun" size={24} color={colors.gold} />
            <Txt variant="small" style={{ flex: 1, fontSize: 14 }}>
              Melhor horário para correr hoje: <Txt variant="bodyStrong" style={{ fontSize: 14 }}>6h–8h</Txt> · 18°
            </Txt>
            <Icon name="chevron" size={18} color={colors.textMuted} />
          </Pressable>
          <Card tone="accent" onPress={() => router.push('/(tabs)/bora')} style={{ paddingVertical: 14 }}>
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <View style={{ gap: 2, flex: 1 }}>
                <Txt variant="bodyStrong" tone="accent">Bora Treinar?</Txt>
                <Txt variant="small" tone="soft">
                  {forMe > 0 ? `${forMe} convite para você · ` : ''}{openInvites.length} convites abertos perto de você
                </Txt>
              </View>
              <Txt variant="bodyStrong" style={{ fontSize: 13 }}>Ver</Txt>
            </View>
          </Card>
        </>
      ) : null}

      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
      {posts.length === 0 ? (
        <EmptyState
          icon="users"
          title={filter === 'Seguindo' ? 'Você ainda não segue ninguém' : 'Nada por aqui ainda'}
          text="Encontre atletas compatíveis com você no Bora Treinar? e siga quem treina perto."
          action="Ver parceiros"
          onAction={() => router.push({ pathname: '/(tabs)/bora', params: { aba: 'Parceiros' } })}
        />
      ) : null}
    </Screen>
  );
}
