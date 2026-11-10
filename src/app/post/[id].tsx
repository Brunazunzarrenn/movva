import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PostPhoto } from '@/components/profileParts';
import { Txt } from '@/components/Txt';
import { Avatar, IconButton, s } from '@/components/ui';
import { colorOf, initialsOf, useProfile } from '@/data/ProfileStore';
import { myPosts, workouts, type Comment } from '@/data/profile';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export default function PostDetalhe() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, posts } = useProfile();

  // Post do próprio usuário (publicado no app) ou dos dados de exemplo.
  const own = posts.find((p) => p.id === id);
  const sample = myPosts.find((p) => p.id === id);
  const post = own
    ? {
        photos: own.photoUris.map((uri) => ({ uri, art: undefined as number | undefined })),
        text: own.text,
        when: new Date(own.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        workoutId: own.workoutId,
        likes: 0,
        comments: [] as Comment[],
      }
    : sample
      ? { photos: sample.photos.map((art) => ({ uri: undefined, art })), text: sample.text, when: sample.when, workoutId: sample.workoutId, likes: sample.likes, comments: sample.comments }
      : null;
  const workout = workouts.find((w) => w.id === post?.workoutId);

  const [liked, setLiked] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [comments, setComments] = useState<Comment[]>(post?.comments ?? []);
  const [draft, setDraft] = useState('');

  const authorName = profile?.name ?? 'Você';
  const authorInitials = initialsOf(authorName);
  const authorColor = colorOf(profile?.username ?? authorName);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((cur) => [...cur, { id: 'n' + Date.now(), author: authorName, initials: authorInitials, color: authorColor, time: 'agora', text }]);
    setDraft('');
  };

  if (!post) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8, paddingHorizontal: 12 }}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} />
        <Txt tone="muted" style={{ textAlign: 'center', marginTop: 40 }}>Esse post não existe mais.</Txt>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[s.row, { gap: 10, paddingTop: insets.top + 8, paddingHorizontal: 12, paddingBottom: 8 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} />
        <Avatar initials={authorInitials} color={authorColor} size={38} uri={profile?.photoUri} />
        <View style={{ gap: 2 }}>
          <Txt variant="bodyStrong">{authorName}</Txt>
          <Txt variant="caption" tone="muted">{workout ? `${workout.sport} · ` : ''}{post.when}</Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {/* Fotos: desliza para o lado quando há mais de uma */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setPhoto(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {post.photos.map((ph, i) => (
            <PostPhoto key={i} uri={ph.uri} art={ph.art} style={{ width, height: width * 0.75 }} />
          ))}
        </ScrollView>
        {post.photos.length > 1 ? (
          <View style={[s.row, { justifyContent: 'center', gap: 6, paddingTop: 8 }]}>
            {post.photos.map((_, i) => (
              <View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: i === photo ? colors.accentInk : colors.border }} />
            ))}
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
          <Txt>{post.text}</Txt>

          {workout ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/atividade/[id]', params: { id: workout.id } })}
              style={[s.row, { justifyContent: 'space-between', padding: 12, borderRadius: 12, backgroundColor: colors.surface }]}
            >
              <Txt variant="small" tone="soft">{workout.distance} · {workout.duration}</Txt>
              <Txt variant="small" tone="accent" style={{ fontFamily: fonts.bodySemi }}>Ver treino</Txt>
            </Pressable>
          ) : null}

          <View style={[s.row, { gap: 4, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: 4 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={liked ? 'Descurtir' : 'Curtir'}
              accessibilityState={{ selected: liked }}
              onPress={() => setLiked((v) => !v)}
              style={[s.row, { minHeight: 44, paddingRight: 12, gap: 6 }]}
            >
              <Icon name="heart" size={22} filled={liked} color={liked ? colors.accentInk : colors.textSoft} />
              <Txt variant="small" color={liked ? colors.accentInk : colors.textSoft}>{post.likes + (liked ? 1 : 0)}</Txt>
            </Pressable>
            <Txt variant="small" tone="soft">{comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}</Txt>
          </View>

          {comments.length === 0 ? <Txt variant="small" tone="muted">Seja o primeiro a comentar.</Txt> : null}
          {comments.map((c) => (
            <View key={c.id} style={[s.row, { gap: 10, alignItems: 'flex-start' }]}>
              <Avatar initials={c.initials} color={c.color} size={34} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="small">
                  <Txt variant="small" style={{ fontFamily: fonts.bodySemi }}>{c.author}</Txt>
                  <Txt variant="small" tone="faint">  {c.time}</Txt>
                </Txt>
                <Txt variant="small" tone="soft" style={{ fontSize: 14, lineHeight: 20 }}>{c.text}</Txt>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[s.row, { gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 10, backgroundColor: colors.nav, borderTopWidth: 1, borderTopColor: colors.divider }]}>
        <TextInput
          accessibilityLabel="Escreva um comentário"
          placeholder="Escreva um comentário"
          placeholderTextColor={colors.textFaint}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
          style={{ flex: 1, height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.body, fontSize: 14 }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar comentário"
          onPress={send}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() ? 1 : 0.5 }}
        >
          <Icon name="chevron" size={22} strokeWidth={2.5} color={colors.onAccent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
