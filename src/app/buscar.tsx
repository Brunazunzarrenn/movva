import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { ChallengeCard } from '@/components/arena';
import { Icon } from '@/components/Icon';
import { InviteCard } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, Chip, IconButton, Screen, SectionTitle, VerifiedBadge, s } from '@/components/ui';
import { segments } from '@/data/arena';
import { athletes, compatibility, inviteStatus } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { initialsOf, useProfile } from '@/data/ProfileStore';
import { normalizeSport } from '@/data/sports';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const KINDS = ['Tudo', 'Pessoas', 'Desafios', 'Treinos em grupo', 'Trechos'] as const;
type Kind = (typeof KINDS)[number];

// Busca por nome, @, esporte, bairro… sem acento e sem maiúscula.
const norm = (t: string) => normalizeSport(t);
const hit = (q: string, ...fields: (string | undefined)[]) => fields.some((f) => f && norm(f).includes(q));

export default function Buscar() {
  const { colors } = useTheme();
  const { profile } = useProfile();
  const { invites, challenges, following, toggleFollow } = useCommunity();
  const [text, setText] = useState('');
  const [kind, setKind] = useState<Kind>('Tudo');
  const q = norm(text.trim());
  const searching = q.length >= 2;
  const show = (k: Kind) => kind === 'Tudo' || kind === k;

  const people = athletes
    .map((a) => ({ a, c: compatibility(profile, a) }))
    .filter(({ a }) => !searching || hit(q, a.name, a.username, a.region, a.bio, ...a.sports))
    .sort((x, y) => y.c.score - x.c.score);
  const chs = challenges.filter((c) => c.visibility === 'Público' && (!searching || hit(q, c.title, c.sport, c.description)));
  const invs = invites.filter((i) => inviteStatus(i.start) !== 'encerrado' && i.visibility !== 'Só convidados' && (!searching || hit(q, i.title, i.sport, i.place)));
  const segs = segments.filter((sg) => !searching || hit(q, sg.name, sg.sport, sg.place));
  const total = (show('Pessoas') ? people.length : 0) + (show('Desafios') ? chs.length : 0) + (show('Treinos em grupo') ? invs.length : 0) + (show('Trechos') ? segs.length : 0);
  const limit = (n: number) => (kind === 'Tudo' && !searching ? n : 50);

  return (
    <Screen>
      <View style={[s.row, { gap: 6, marginLeft: -12 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} />
        <View style={[s.row, { flex: 1, gap: 8, height: 46, paddingHorizontal: 14, borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            accessibilityLabel="Buscar no MOVVA"
            placeholder="Atletas, esportes, desafios, lugares…"
            placeholderTextColor={colors.textFaint}
            value={text}
            onChangeText={setText}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            style={[{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 }, { outlineStyle: 'none' } as object]}
          />
          {text ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setText('')} hitSlop={10}>
              <Icon name="close" size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {KINDS.map((k) => <Chip key={k} label={k} selected={k === kind} onPress={() => setKind(k)} />)}
      </ScrollView>

      {searching && total === 0 ? (
        <View style={{ alignItems: 'center', gap: 6, paddingVertical: 30 }}>
          <Icon name="search" size={32} color={colors.textFaint} />
          <Txt variant="bodyStrong">Nada encontrado para "{text.trim()}"</Txt>
          <Txt variant="small" tone="muted" style={{ textAlign: 'center' }}>Tente outro nome, um esporte (ex.: corrida) ou um bairro.</Txt>
        </View>
      ) : null}

      {show('Pessoas') && people.length ? (
        <View style={{ gap: 6 }}>
          <SectionTitle>{searching ? 'Pessoas' : 'Atletas para você'}</SectionTitle>
          {people.slice(0, limit(4)).map(({ a, c }) => {
            const on = !!following[a.id];
            return (
              <Pressable
                key={a.id}
                accessibilityRole="button"
                accessibilityLabel={`Perfil de ${a.name}`}
                onPress={() => router.push({ pathname: '/atleta/[id]', params: { id: a.id } })}
                style={[s.row, { gap: 12, padding: 10, borderRadius: 16, backgroundColor: colors.surface }]}
              >
                <Avatar initials={initialsOf(a.name)} color={a.color} size={44} square={a.club} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={[s.row, { gap: 6 }]}>
                    <Txt variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>{a.name}</Txt>
                    {a.verified ? <VerifiedBadge /> : null}
                  </View>
                  <Txt variant="caption" tone="muted" numberOfLines={1}>@{a.username} · {a.sports.slice(0, 2).join(', ')}{a.club ? '' : ` · ${c.score}%`}</Txt>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={on ? `Deixar de seguir ${a.name}` : `Seguir ${a.name}`}
                  onPress={() => toggleFollow(a.id)}
                  style={{ paddingHorizontal: 14, minHeight: 36, borderRadius: 18, justifyContent: 'center', backgroundColor: on ? colors.surfaceAlt : colors.accent }}
                >
                  <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: on ? colors.text : colors.onAccent }}>{on ? 'Seguindo' : 'Seguir'}</Txt>
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {show('Desafios') && chs.length ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Desafios</SectionTitle>
          {chs.slice(0, limit(2)).map((c) => <ChallengeCard key={c.id} c={c} />)}
        </View>
      ) : null}

      {show('Treinos em grupo') && invs.length ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Treinos em grupo</SectionTitle>
          {invs.slice(0, limit(2)).map((i) => <InviteCard key={i.id} inv={i} />)}
        </View>
      ) : null}

      {show('Trechos') && segs.length ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Trechos</SectionTitle>
          {segs.slice(0, limit(2)).map((sg) => (
            <Pressable
              key={sg.id}
              accessibilityRole="button"
              accessibilityLabel={`Trecho ${sg.name}`}
              onPress={() => router.push({ pathname: '/trecho/[id]', params: { id: sg.id } })}
              style={[s.row, { gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.surface }]}
            >
              <Icon name="pin" size={20} color={colors.accentInk} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="bodyStrong">{sg.name}</Txt>
                <Txt variant="caption" tone="muted">{sg.sport} · {sg.distance} · {sg.place}</Txt>
              </View>
              <Icon name="chevron" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
