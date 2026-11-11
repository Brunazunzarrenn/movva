import { Redirect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MedalDisc, RarityLabel, WorkoutRow } from '@/components/athlete';
import { Icon } from '@/components/Icon';
import { EmptyState, PostPhoto, SportTags } from '@/components/profileParts';
import { Txt } from '@/components/Txt';
import { Avatar, Button, IconButton, Screen, SectionTitle, s } from '@/components/ui';
import { me } from '@/data/mock';
import { colorOf, initialsOf, useProfile } from '@/data/ProfileStore';
import { medals, myPosts, workouts } from '@/data/profile';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { fmtInt } from '@/utils/format';
import { UserWorkoutRow } from '@/components/workout';

const TABS = ['Conquistas', 'Treinos', 'Posts'] as const;
type Tab = (typeof TABS)[number];

export default function Perfil() {
  const { colors, isDark } = useTheme();
  const { profile, posts, demo, workouts: myWorkouts } = useProfile();
  const [tab, setTab] = useState<Tab>('Conquistas');

  if (!profile) return <Redirect href="/boas-vindas" />;

  // Conta nova começa zerada; os dados de exemplo só aparecem se ligados nas Configurações.
  const stats = demo
    ? { followers: me.followers, following: me.following, workouts: me.workouts }
    : { followers: 0, following: 0, workouts: myWorkouts.length };
  const shownMedals = demo ? medals : [];
  const shownWorkouts = demo ? workouts : [];
  const gridPosts = [
    ...posts.map((p) => ({ id: p.id, uri: p.photoUris[0], art: undefined as number | undefined, text: p.text })),
    ...(demo ? myPosts.map((p) => ({ id: p.id, uri: undefined, art: p.photos[0], text: p.text })) : []),
  ];

  return (
    <Screen inTabs padded={false} style={{ paddingTop: 0 }}>
      <LinearGradient colors={isDark ? ['#12301D', '#0B1F14'] : ['#D6F0CC', '#E3F6DC']} style={{ height: 140 }} />
      <View style={{ paddingHorizontal: 20, marginTop: -44, gap: 12 }}>
        <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
          <Avatar initials={initialsOf(profile.name)} color={colorOf(profile.username)} size={88} ring={colors.bg} uri={profile.photoUri} />
          <View style={[s.row, { gap: 4 }]}>
            <Button label="Editar perfil" variant="secondary" size="sm" onPress={() => router.push('/editar-perfil')} />
            <IconButton icon="settings" label="Configurações" onPress={() => router.push('/configuracoes')} />
          </View>
        </View>

        <View style={{ gap: 2 }}>
          <View style={[s.row, { gap: 8 }]}>
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 22, color: colors.text, flexShrink: 1 }}>{profile.name}</Txt>
            {demo ? (
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.accent }}>
                <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.onAccent }}>PRO</Txt>
              </View>
            ) : null}
          </View>
          <Txt variant="small" tone="muted" style={{ fontSize: 14 }}>@{profile.username}</Txt>
          <Txt variant="small" tone="soft" style={{ fontSize: 14, marginTop: 4 }}>
            {profile.level} · {profile.region}
          </Txt>
          {profile.bio ? <Txt variant="small" tone="soft" style={{ fontSize: 14 }}>{profile.bio}</Txt> : null}
        </View>

        <SportTags sports={profile.sports} pending={profile.pendingSports} />

        <View style={[s.row, { paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider }]}>
          {([['Seguidores', stats.followers], ['Seguindo', stats.following], ['Treinos', stats.workouts]] as const).map(([k, v]) => (
            <View key={k} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Txt variant="number" style={{ fontSize: 22 }}>{fmtInt(v)}</Txt>
              <Txt variant="caption" tone="muted">{k}</Txt>
            </View>
          ))}
        </View>

        <View accessibilityRole="tablist" style={[s.row, { gap: 20, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
          {TABS.map((t) => {
            const on = t === tab;
            return (
              <Pressable
                key={t}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setTab(t)}
                style={{ minHeight: 44, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: on ? colors.accent : 'transparent' }}
              >
                <Txt style={{ fontFamily: on ? fonts.bodySemi : fonts.body, fontSize: 15, color: on ? colors.text : colors.textMuted }}>{t}</Txt>
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="link" onPress={() => router.push('/evolucao')} style={[s.row, { marginLeft: 'auto', minHeight: 44, gap: 2 }]}>
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.accentInk }}>Evolução</Txt>
            <Icon name="chevron" size={16} color={colors.accentInk} />
          </Pressable>
        </View>

        {tab === 'Conquistas' ? (
          shownMedals.length === 0 ? (
            <EmptyState
              icon="trophy"
              title="Sua galeria está vazia"
              text="Complete desafios, duelos e treinos para ganhar medalhas. Elas ficam aqui para sempre."
              action="Ver desafios"
              onAction={() => router.push('/(tabs)/arena')}
            />
          ) : (
            <View style={{ gap: 12 }}>
              <SectionTitle right={<Txt variant="small" tone="muted">24 medalhas</Txt>}>Minha galeria</SectionTitle>
              <View style={[s.wrap, { gap: 10 }]}>
                {shownMedals.map((m) => (
                  <Pressable
                    key={m.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${m.name}, medalha ${m.rarity}`}
                    onPress={() => router.push({ pathname: '/medalha/[id]', params: { id: m.id } })}
                    style={{ flexBasis: '30%', flexGrow: 1, alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 16, backgroundColor: colors.surface }}
                  >
                    <MedalDisc medal={m} />
                    <Txt variant="caption" numberOfLines={2} style={{ fontFamily: fonts.bodySemi, textAlign: 'center' }}>{m.name}</Txt>
                    <RarityLabel rarity={m.rarity} />
                  </Pressable>
                ))}
              </View>
              <Button label="Ver recordes pessoais" variant="outline" size="md" icon="trophy" onPress={() => router.push('/recordes')} />
            </View>
          )
        ) : null}

        {tab === 'Treinos' ? (
          shownWorkouts.length === 0 && myWorkouts.length === 0 ? (
            <EmptyState
              icon="pin"
              title="Nenhum treino ainda"
              text="Grave seu primeiro treino com o GPS ou lance um treino que você já fez. Ele aparece aqui com mapa e números."
              action="Registrar treino"
              onAction={() => router.push('/treino')}
            />
          ) : (
            <View style={{ gap: 8 }}>
              <Button label="Registrar treino" variant="outline" size="md" icon="plus" onPress={() => router.push('/treino')} />
              {myWorkouts.map((w) => (
                <UserWorkoutRow key={w.id} w={w} onPress={() => router.push({ pathname: '/atividade/[id]', params: { id: w.id } })} />
              ))}
              {shownWorkouts.map((w) => (
                <WorkoutRow key={w.id} w={w} onPress={() => router.push({ pathname: '/atividade/[id]', params: { id: w.id } })} />
              ))}
            </View>
          )
        ) : null}

        {tab === 'Posts' ? (
          gridPosts.length === 0 ? (
            <EmptyState
              icon="camera"
              title="Nenhum post ainda"
              text="Compartilhe fotos dos seus treinos com quem te segue."
              action="Fazer o primeiro post"
              onAction={() => router.push('/novo-post')}
            />
          ) : (
            <View style={{ gap: 10 }}>
              <Button label="Novo post" variant="outline" size="md" icon="plus" onPress={() => router.push('/novo-post')} />
              <View style={[s.wrap, { gap: 6 }]}>
                {gridPosts.map((p) => (
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Post: ${p.text || 'foto'}`}
                    onPress={() => router.push({ pathname: '/post/[id]', params: { id: p.id } })}
                    style={{ flexBasis: '31%', flexGrow: 0, width: '31.5%', aspectRatio: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surface }}
                  >
                    {p.uri || p.art !== undefined ? (
                      <PostPhoto uri={p.uri} art={p.art} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <View style={{ flex: 1, padding: 8, justifyContent: 'center' }}>
                        <Txt variant="caption" tone="soft" numberOfLines={5}>{p.text}</Txt>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          )
        ) : null}
      </View>
    </Screen>
  );
}
