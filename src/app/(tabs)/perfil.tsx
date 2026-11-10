import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MedalDisc, PhotoArtView, RarityLabel, WorkoutRow } from '@/components/athlete';
import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Chip, Screen, SectionTitle, s } from '@/components/ui';
import { me } from '@/data/mock';
import { medals, myPosts, workouts } from '@/data/profile';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { fmtInt } from '@/utils/format';

const TABS = ['Conquistas', 'Treinos', 'Posts'] as const;
type Tab = (typeof TABS)[number];

export default function Perfil() {
  const { colors, isDark } = useTheme();
  const [tab, setTab] = useState<Tab>('Conquistas');

  return (
    <Screen inTabs padded={false} style={{ paddingTop: 0 }}>
      <LinearGradient colors={isDark ? ['#12301D', '#0B1F14'] : ['#D6F0CC', '#E3F6DC']} style={{ height: 140 }} />
      <View style={{ paddingHorizontal: 20, marginTop: -44, gap: 12 }}>
        <View style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-end' }]}>
          <Avatar initials={me.initials} color={me.color} size={88} ring={colors.bg} />
          <Button label="Configurações" variant="secondary" size="sm" icon="settings" onPress={() => router.push('/configuracoes')} />
        </View>

        <View style={{ gap: 4 }}>
          <View style={[s.row, { gap: 8 }]}>
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 22, color: colors.text }}>{me.name}</Txt>
            {me.pro ? (
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.accent }}>
                <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.onAccent }}>PRO</Txt>
              </View>
            ) : null}
          </View>
          <Txt variant="small" tone="muted" style={{ fontSize: 14 }}>{me.bio}</Txt>
        </View>

        <View style={s.wrap}>{me.sports.map((sp) => <Chip key={sp} label={sp} />)}</View>

        <View style={[s.row, { paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider }]}>
          {([['Seguidores', me.followers], ['Seguindo', me.following], ['Treinos', me.workouts]] as const).map(([k, v]) => (
            <View key={k} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Txt variant="number" style={{ fontSize: 22 }}>{fmtInt(v)}</Txt>
              <Txt variant="caption" tone="muted">{k}</Txt>
            </View>
          ))}
        </View>

        {/* Abas + atalho para Minha Evolução */}
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
          <View style={{ gap: 12 }}>
            <SectionTitle right={<Txt variant="small" tone="muted">24 medalhas</Txt>}>Minha galeria</SectionTitle>
            <View style={[s.wrap, { gap: 10 }]}>
              {medals.map((m) => (
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
        ) : null}

        {tab === 'Treinos' ? (
          <View style={{ gap: 8 }}>
            {workouts.map((w) => (
              <WorkoutRow key={w.id} w={w} onPress={() => router.push({ pathname: '/atividade/[id]', params: { id: w.id } })} />
            ))}
          </View>
        ) : null}

        {tab === 'Posts' ? (
          <View style={{ gap: 10 }}>
            <Button label="Novo post" variant="outline" size="md" icon="plus" onPress={() => router.push('/novo-post')} />
            <View style={[s.wrap, { gap: 6 }]}>
              {myPosts.map((p) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Post de ${p.when}: ${p.text}`}
                  onPress={() => router.push({ pathname: '/post/[id]', params: { id: p.id } })}
                  style={{ flexBasis: '31%', flexGrow: 1, aspectRatio: 1, borderRadius: 10, overflow: 'hidden' }}
                >
                  <PhotoArtView index={p.photos[0]} style={{ flex: 1 }} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
