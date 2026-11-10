import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/profileParts';
import { InviteCard } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Chip, Screen, Segmented, SectionTitle, s } from '@/components/ui';
import { athletes, compatibility, inviteStatus } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { initialsOf, useProfile } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const TABS = ['Convites', 'Parceiros'] as const;
type Tab = (typeof TABS)[number];

export default function Bora() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ aba?: string }>();
  const [tab, setTab] = useState<Tab>(params.aba === 'Parceiros' ? 'Parceiros' : 'Convites');
  const [sport, setSport] = useState('Todos');
  const { profile } = useProfile();
  const { invites, joined, declined } = useCommunity();

  useEffect(() => {
    if (params.aba === 'Parceiros' || params.aba === 'Convites') setTab(params.aba);
  }, [params.aba]);

  const live = invites.filter((i) => inviteStatus(i.start) !== 'encerrado').sort((a, b) => a.start.localeCompare(b.start));
  const going = (id: string, host: string) => host === 'me' || !!joined[id];
  const forMe = live.filter((i) => i.invited.includes('me') && !going(i.id, i.hostId) && !declined[i.id]);
  const agenda = live.filter((i) => going(i.id, i.hostId));
  const open = live.filter((i) => !going(i.id, i.hostId) && !forMe.includes(i));
  const sports = ['Todos', ...Array.from(new Set(open.map((i) => i.sport)))];
  const openShown = sport === 'Todos' ? open : open.filter((i) => i.sport === sport);

  const partners = useMemo(
    () => athletes.filter((a) => !a.club).map((a) => ({ a, c: compatibility(profile, a) })).sort((x, y) => y.c.score - x.c.score),
    [profile],
  );

  return (
    <Screen inTabs>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Txt variant="title" accessibilityRole="header">Bora Treinar?</Txt>
        <Button label="Criar convite" icon="plus" size="sm" onPress={() => router.push('/convite/novo')} />
      </View>

      <Segmented label="Seção" options={TABS} value={tab} onChange={setTab} />

      {tab === 'Convites' ? (
        <>
          {forMe.length ? (
            <View style={{ gap: 10 }}>
              <SectionTitle>Para você</SectionTitle>
              {forMe.map((i) => <InviteCard key={i.id} inv={i} />)}
            </View>
          ) : null}

          <View style={{ gap: 10 }}>
            <SectionTitle>Minha agenda</SectionTitle>
            {agenda.length ? (
              agenda.map((i) => <InviteCard key={i.id} inv={i} />)
            ) : (
              <Txt variant="small" tone="muted">Você ainda não confirmou nenhum treino. Entre em um convite abaixo ou crie o seu.</Txt>
            )}
          </View>

          <View style={{ gap: 10 }}>
            <SectionTitle>Perto de você</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {sports.map((sp) => <Chip key={sp} label={sp} selected={sp === sport} onPress={() => setSport(sp)} />)}
            </ScrollView>
            {openShown.map((i) => <InviteCard key={i.id} inv={i} />)}
            {openShown.length === 0 ? (
              <EmptyState icon="users" title="Nenhum convite aberto" text="Crie um convite e chame quem treina perto de você." action="Criar convite" onAction={() => router.push('/convite/novo')} />
            ) : null}
          </View>
        </>
      ) : (
        <View style={{ gap: 10 }}>
          <Txt variant="small" tone="muted">Atletas com esportes, nível e região parecidos com os seus.</Txt>
          {partners.map(({ a, c }) => (
            <View key={a.id} style={{ padding: 14, borderRadius: 18, backgroundColor: colors.surface, gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Perfil de ${a.name}`}
                onPress={() => router.push({ pathname: '/atleta/[id]', params: { id: a.id } })}
                style={[s.row, { gap: 12 }]}
              >
                <Avatar initials={initialsOf(a.name)} color={a.color} size={48} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="bodyStrong">{a.name}</Txt>
                  <Txt variant="caption" tone="muted">{a.level} · {a.region}</Txt>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Txt style={{ fontFamily: fonts.display, fontSize: 22, color: colors.accentInk }}>{c.score}%</Txt>
                  <Txt variant="caption" tone="muted">compatível</Txt>
                </View>
              </Pressable>
              <Txt variant="caption" tone="soft">{c.reasons.join(' · ')}</Txt>
              <View style={[s.row, { gap: 8 }]}>
                <Button label="Ver perfil" size="sm" variant="secondary" onPress={() => router.push({ pathname: '/atleta/[id]', params: { id: a.id } })} style={{ flex: 1 }} />
                <Button label="Convidar" size="sm" icon="users" onPress={() => router.push({ pathname: '/convite/novo', params: { com: a.id } })} style={{ flex: 1 }} />
              </View>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
