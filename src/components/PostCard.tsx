import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Avatar, RouteMap, VerifiedBadge, s } from '@/components/ui';
import type { FeedPost } from '@/data/mock';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export function PostCard({ post }: { post: FeedPost }) {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(false);

  if (post.kind === 'conquista') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: colors.surface }}>
        <Avatar initials={post.initials} color={post.color} />
        <Txt variant="small" tone="soft" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
          <Txt variant="bodyStrong" style={{ fontSize: 14 }}>{post.author}</Txt> {post.text} ·{' '}
          <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.blue }}>{post.rarity}</Txt>
        </Txt>
      </View>
    );
  }

  const likes = post.likes + (liked ? 1 : 0);

  return (
    <View style={{ borderRadius: 20, backgroundColor: colors.surface, overflow: 'hidden' }}>
      <View style={[s.row, { gap: 12, padding: 14 }]}>
        <Avatar initials={post.initials} color={post.color} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="bodyStrong">{post.author}</Txt>
          <Txt variant="caption" tone="muted">{post.meta}</Txt>
        </View>
        {post.verified ? <VerifiedBadge /> : null}
      </View>
      <Txt variant="small" tone="soft" style={{ paddingHorizontal: 14, paddingBottom: 12, fontSize: 14, lineHeight: 20 }}>{post.text}</Txt>
      <RouteMap path={post.route} />
      <View style={{ flexDirection: 'row', padding: 14, gap: 8 }}>
        {post.stats.map((st) => (
          <View key={st.label} style={{ flex: 1, gap: 2 }}>
            <Txt variant="caption" tone="muted">{st.label}</Txt>
            <Txt variant="number">{st.value}</Txt>
          </View>
        ))}
      </View>
      <View style={[s.row, { borderTopWidth: 1, borderTopColor: colors.divider, paddingHorizontal: 6 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Descurtir' : 'Curtir'}
          accessibilityState={{ selected: liked }}
          onPress={() => setLiked((v) => !v)}
          style={[s.row, { minHeight: 44, paddingHorizontal: 10, gap: 6 }]}
        >
          <Icon name="heart" size={20} filled={liked} color={liked ? colors.accentInk : colors.textSoft} />
          <Txt variant="small" color={liked ? colors.accentInk : colors.textSoft}>{likes}</Txt>
        </Pressable>
        <View style={[s.row, { minHeight: 44, paddingHorizontal: 10, gap: 6 }]}>
          <Icon name="comment" size={20} color={colors.textSoft} />
          <Txt variant="small" tone="soft">{post.comments}</Txt>
        </View>
      </View>
    </View>
  );
}
