import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PostCard } from '@/components/PostCard';
import { SportTags } from '@/components/profileParts';
import { DuelCard, InviteCard } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, Button, IconButton, Screen, SectionTitle, VerifiedBadge, s } from '@/components/ui';
import { athleteById, communityPosts, compatibility, inviteStatus } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { initialsOf, useProfile } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { fmtInt } from '@/utils/format';

export default function AtletaPerfil() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useProfile();
  const { following, toggleFollow, duels, invites } = useCommunity();
  const a = athleteById(id);

  if (!a) {
    return (
      <Screen>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} style={{ marginLeft: -12 }} />
        <Txt tone="muted" style={{ textAlign: 'center', marginTop: 40 }}>Esse perfil não existe.</Txt>
      </Screen>
    );
  }

  const isFollowing = !!following[a.id];
  const comp = compatibility(profile, a);
  const duel = duels.find((d) => d.athleteId === a.id && d.status !== 'recusado');
  const theirInvites = invites.filter((i) => i.hostId === a.id && inviteStatus(i.start) !== 'encerrado');
  const posts = communityPosts.filter((p) => p.athleteId === a.id);
  const first = a.name.split(' ')[0];

  return (
    <Screen padded={false} style={{ paddingTop: 0 }}>
      <View>
        <LinearGradient colors={isDark ? ['#12301D', '#0B1F14'] : ['#D6F0CC', '#E3F6DC']} style={{ height: 130 + insets.top }} />
        <View style={{ position: 'absolute', top: insets.top + 4, left: 8 }}>
          <IconButton icon="back" label="Voltar" onPress={() => router.back()} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: -44, gap: 12 }}>
        <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
          <Avatar initials={initialsOf(a.name)} color={a.color} size={88} ring={colors.bg} square={a.club} />
          <Button
            label={isFollowing ? 'Seguindo' : 'Seguir'}
            icon={isFollowing ? 'check' : 'plus'}
            variant={isFollowing ? 'secondary' : 'primary'}
            size="sm"
            onPress={() => toggleFollow(a.id)}
            style={{ minWidth: 112 }}
          />
        </View>

        <View style={{ gap: 2 }}>
          <View style={[s.row, { gap: 8, flexWrap: 'wrap' }]}>
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 22, color: colors.text }}>{a.name}</Txt>
            {a.verified ? <VerifiedBadge /> : null}
          </View>
          <Txt variant="small" tone="muted" style={{ fontSize: 14 }}>@{a.username} · perfil de teste</Txt>
          <Txt variant="small" tone="soft" style={{ fontSize: 14, marginTop: 4 }}>{a.club ? 'Clube' : a.level} · {a.region}</Txt>
          <Txt variant="small" tone="soft" style={{ fontSize: 14 }}>{a.bio}</Txt>
        </View>

        <SportTags sports={a.sports} pending={[]} />

        <View style={[s.row, { paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider }]}>
          {([['Seguidores', a.followers + (isFollowing ? 1 : 0)], ['Seguindo', a.following], ['Treinos', a.workouts]] as const).map(([k, v]) => (
            <View key={k} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Txt variant="number" style={{ fontSize: 22 }}>{fmtInt(v)}</Txt>
              <Txt variant="caption" tone="muted">{k}</Txt>
            </View>
          ))}
        </View>

        {!a.club && profile ? (
          <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 6 }}>
            <View style={[s.row, { gap: 8 }]}>
              <Txt style={{ fontFamily: fonts.display, fontSize: 26, color: colors.accentInk }}>{comp.score}%</Txt>
              <Txt variant="bodyStrong">compatível com você</Txt>
            </View>
            <Txt variant="caption" tone="soft">{comp.reasons.join(' · ')}</Txt>
          </View>
        ) : null}

        <View style={[s.row, { gap: 8 }]}>
          {!a.club ? (
            <Button
              label={duel ? 'Em duelo' : 'Desafiar'}
              icon="bolt"
              variant="outline"
              size="md"
              disabled={!!duel}
              onPress={() => router.push({ pathname: '/desafiar/[id]', params: { id: a.id } })}
              style={{ flex: 1 }}
            />
          ) : null}
          <Button
            label="Bora treinar?"
            icon="users"
            variant="inverse"
            size="md"
            onPress={() => router.push({ pathname: '/convite/novo', params: { com: a.id } })}
            style={{ flex: 1 }}
          />
        </View>

        {duel ? <DuelCard duel={duel} compact /> : null}

        {theirInvites.length ? (
          <View style={{ gap: 10 }}>
            <SectionTitle>{a.club ? 'Próximos eventos' : `Treinos de ${first}`}</SectionTitle>
            {theirInvites.map((inv) => <InviteCard key={inv.id} inv={inv} />)}
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <SectionTitle>Atividades</SectionTitle>
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
          {posts.length === 0 ? (
            <View style={[s.row, { gap: 8 }]}>
              <Icon name="clock" size={18} color={colors.textMuted} />
              <Txt variant="small" tone="muted">Nenhuma atividade publicada.</Txt>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
