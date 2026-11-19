import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PostCard } from '@/components/PostCard';
import { Txt } from '@/components/Txt';
import { Button, Card, Chip, IconButton, Screen, s } from '@/components/ui';
import { EmptyState } from '@/components/profileParts';
import { athleteById, communityPosts, inviteStatus } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { useNotifications } from '@/data/notifications';
import { activitySpec, shortSport, trainingOptions } from '@/data/activity';
import { useProfile } from '@/data/ProfileStore';
import { bestWindow, hourOf, useForecast } from '@/data/weather';
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
  const { unread } = useNotifications();
  // Clima de verdade: melhor janela de hoje (ou de amanhã, se hoje já passou) para o seu esporte principal.
  const { profile, workouts: myWorkouts } = useProfile();
  const mainSport = trainingOptions(profile?.sports ?? []).find((x) => activitySpec(x).kind !== 'multi') ?? 'Corrida de rua';
  const { data: forecast } = useForecast(profile?.region);
  const weatherBest = useMemo(() => {
    if (!forecast) return null;
    for (const day of ['hoje', 'amanha'] as const) {
      const { best } = bestWindow(forecast.hours, mainSport, day);
      if (best) return { day: day === 'hoje' ? 'hoje' : 'amanhã', start: best.start.h.time, endHour: Number(best.end.h.time.slice(11, 13)) + 1, temp: best.start.h.temp };
    }
    return null;
  }, [forecast, mainSport]);

  return (
    <Screen inTabs>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Txt style={{ fontFamily: fonts.display, fontSize: 28, letterSpacing: 3, color: colors.text }} accessibilityRole="header">MOVVA</Txt>
        <View style={s.row}>
          <IconButton icon="calendar" label="Calendário" onPress={() => router.push('/calendario')} />
          <IconButton icon="search" label="Buscar atletas, desafios e treinos" onPress={() => router.push('/buscar')} />
          <IconButton icon="bell" label={unread ? `Notificações, ${unread} novas` : 'Notificações'} badge={unread > 0} onPress={() => router.push('/notificacoes')} />
        </View>
      </View>

      <View accessibilityRole="tablist" style={[s.row, { gap: 8 }]}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} selected={f === filter} onPress={() => setFilter(f)} />
        ))}
      </View>

      {filter === 'Seguindo' && myWorkouts.length === 0 ? (
        <Card tone="surface" style={{ gap: 10, borderWidth: 1, borderColor: colors.accentSoftBorder }}>
          <Txt variant="eyebrow" tone="accent">Primeiro passo</Txt>
          <Txt variant="bodyStrong">Grave seu primeiro treino</Txt>
          <Txt variant="small" tone="soft">Ele aparece no seu perfil, vira post no feed e já começa a contar nos desafios da Arena.</Txt>
          <Button label="Registrar treino" icon="plus" size="md" onPress={() => router.push('/treino')} />
        </Card>
      ) : null}

      {filter === 'Seguindo' ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/melhor-horario')}
            style={[s.row, { gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface }]}
          >
            <Icon name="sun" size={24} color={colors.gold} />
            <Txt variant="small" style={{ flex: 1, fontSize: 14 }}>
              {weatherBest ? (
                <>
                  Melhor horário para {shortSport(mainSport).toLowerCase()} {weatherBest.day}:{' '}
                  <Txt variant="bodyStrong" style={{ fontSize: 14 }}>{hourOf(weatherBest.start)}–{weatherBest.endHour}h</Txt> · {weatherBest.temp}°
                </>
              ) : (
                'Ver o melhor horário para treinar hoje'
              )}
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
              <Icon name="chevron" size={20} color={colors.accentInk} />
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
