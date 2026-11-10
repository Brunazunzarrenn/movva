import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { ComingSoon } from '@/components/ComingSoon';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Chip, Screen, s } from '@/components/ui';
import { me } from '@/data/mock';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const fmt = (n: number) => n.toLocaleString('pt-BR');

export default function Perfil() {
  const { colors, isDark } = useTheme();
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
            <Txt variant="title" style={{ fontSize: 22, textTransform: 'none', fontFamily: fonts.bodySemi }}>{me.name}</Txt>
            {me.pro ? (
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.accent }}>
                <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.onAccent }}>PRO</Txt>
              </View>
            ) : null}
          </View>
          <Txt variant="small" tone="muted" style={{ fontSize: 14 }}>{me.bio}</Txt>
        </View>
        <View style={[s.row, { gap: 8 }]}>
          {me.sports.map((sp) => <Chip key={sp} label={sp} />)}
        </View>
        <View style={[s.row, { paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider }]}>
          {[['Seguidores', me.followers], ['Seguindo', me.following], ['Treinos', me.workouts]].map(([k, v]) => (
            <View key={k as string} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Txt variant="number" style={{ fontSize: 22 }}>{fmt(v as number)}</Txt>
              <Txt variant="caption" tone="muted">{k}</Txt>
            </View>
          ))}
        </View>
        <ComingSoon icon="trophy" title="Galeria de conquistas" text="Medalhas, treinos, posts e Minha Evolução chegam na próxima etapa." />
      </View>
    </Screen>
  );
}
