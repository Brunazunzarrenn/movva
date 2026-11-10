import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PhotoArtView } from '@/components/athlete';
import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Avatar, RouteMap, VerifiedBadge, s } from '@/components/ui';
import { agoLabel, athleteById, type CommunityPost } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { initialsOf } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { rarityColors, rarityLabel } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

// Post de um atleta da comunidade: curtir, comentar e abrir o perfil de quem postou.
export function PostCard({ post }: { post: CommunityPost }) {
  const { colors } = useTheme();
  const { likes, comments, toggleLike } = useCommunity();
  const a = athleteById(post.athleteId);
  if (!a) return null;

  const openAuthor = () => router.push({ pathname: '/atleta/[id]', params: { id: a.id } });
  const openPost = () => router.push({ pathname: '/post/[id]', params: { id: post.id } });
  const liked = !!likes[post.id];
  const likeCount = post.likes + (liked ? 1 : 0);
  const commentCount = post.comments.length + (comments[post.id]?.length ?? 0);

  if (post.kind === 'conquista' && post.medal) {
    const rc = rarityColors(post.medal.rarity, colors);
    return (
      <Pressable accessibilityRole="button" onPress={openAuthor} style={[s.row, { gap: 12, padding: 14, borderRadius: 20, backgroundColor: colors.surface }]}>
        <Avatar initials={initialsOf(a.name)} color={a.color} />
        <Txt variant="small" tone="soft" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
          <Txt variant="bodyStrong" style={{ fontSize: 14 }}>{a.name}</Txt> {post.text} {post.medal.name} ·{' '}
          <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: rc.fg }}>{rarityLabel[post.medal.rarity]}</Txt>
        </Txt>
      </Pressable>
    );
  }

  return (
    <View style={{ borderRadius: 20, backgroundColor: colors.surface, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Perfil de ${a.name}`} onPress={openAuthor} style={[s.row, { gap: 12, padding: 14 }]}>
        <Avatar initials={initialsOf(a.name)} color={a.color} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="bodyStrong">{a.name}</Txt>
          <Txt variant="caption" tone="muted">{post.sport} · {agoLabel(post.hoursAgo * 60)}{post.place ? ` · ${post.place}` : ''}</Txt>
        </View>
        {a.verified ? <VerifiedBadge /> : null}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir post: ${post.text}`} onPress={openPost}>
        <Txt variant="small" tone="soft" style={{ paddingHorizontal: 14, paddingBottom: 12, fontSize: 14, lineHeight: 20 }}>{post.text}</Txt>
        {post.route ? <RouteMap path={post.route} /> : post.photo !== undefined ? <PhotoArtView index={post.photo} style={{ height: 170 }} /> : null}
        {post.stats ? (
          <View style={{ flexDirection: 'row', padding: 14, gap: 8 }}>
            {post.stats.map((st) => (
              <View key={st.label} style={{ flex: 1, gap: 2 }}>
                <Txt variant="caption" tone="muted">{st.label}</Txt>
                <Txt variant="number">{st.value}</Txt>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
      <View style={[s.row, { borderTopWidth: 1, borderTopColor: colors.divider, paddingHorizontal: 6 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? `Descurtir post de ${a.name}` : `Curtir post de ${a.name}`}
          accessibilityState={{ selected: liked }}
          onPress={() => toggleLike(post.id)}
          style={[s.row, { minHeight: 44, paddingHorizontal: 10, gap: 6 }]}
        >
          <Icon name="heart" size={20} filled={liked} color={liked ? colors.accentInk : colors.textSoft} />
          <Txt variant="small" color={liked ? colors.accentInk : colors.textSoft}>{likeCount}</Txt>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Comentar post de ${a.name}`}
          onPress={openPost}
          style={[s.row, { minHeight: 44, paddingHorizontal: 10, gap: 6 }]}
        >
          <Icon name="comment" size={20} color={colors.textSoft} />
          <Txt variant="small" tone="soft">{commentCount}</Txt>
        </Pressable>
      </View>
    </View>
  );
}
