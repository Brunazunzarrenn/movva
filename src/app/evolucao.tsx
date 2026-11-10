import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { LineChart } from '@/components/athlete';
import { Icon } from '@/components/Icon';
import { EmptyState } from '@/components/profileParts';
import { Txt } from '@/components/Txt';
import { Card, Chip, Header, Screen, SectionTitle, s } from '@/components/ui';
import { useProfile } from '@/data/ProfileStore';
import { evolution, monthCompare } from '@/data/profile';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export default function Evolucao() {
  const { colors } = useTheme();
  const [key, setKey] = useState(evolution[0].key);
  const m = evolution.find((e) => e.key === key) ?? evolution[0];
  const { demo } = useProfile();

  if (!demo) {
    return (
      <Screen>
        <Header title="Minha Evolução" />
        <EmptyState
          icon="trend"
          title="Sua evolução começa no primeiro treino"
          text="Com alguns treinos registrados, mostramos aqui seu pace, velocidade, volume, altimetria e a comparação entre os meses."
          action="Registrar treino"
          onAction={() => router.push('/treino')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Minha Evolução" />

      {/* Mensagem automática: no app real é gerada comparando os meses */}
      <Card tone="accent" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Icon name="trend" size={28} color={colors.accentInk} />
        <Txt variant="small" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
          <Txt variant="small" tone="accent" style={{ fontFamily: fonts.bodyBold, fontSize: 14 }}>
            Você aumentou sua distância de corrida em 48% neste mês!
          </Txt>{' '}
          51,8 km em novembro contra 35 km em outubro.
        </Txt>
      </Card>

      <View accessibilityRole="tablist" style={[s.row, { gap: 6 }]}>
        {evolution.map((e) => (
          <Chip key={e.key} label={e.label} selected={e.key === key} onPress={() => setKey(e.key)} style={{ flex: 1, paddingHorizontal: 4 }} />
        ))}
      </View>

      <Card>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Txt variant="small" tone="muted">{m.title}</Txt>
          <Txt variant="caption" tone="accent" style={{ fontFamily: fonts.bodySemi }}>{m.delta}</Txt>
        </View>
        <Txt style={{ fontFamily: fonts.display, fontSize: 30, color: colors.text }}>{m.current}</Txt>
        <LineChart values={m.values} invert={m.invert} label={`${m.title}: ${m.current}, ${m.delta}`} />
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          {m.xLabels.map((x) => <Txt key={x} variant="caption" tone="faint">{x}</Txt>)}
        </View>
        <Txt variant="caption" tone="faint">{m.note}</Txt>
      </Card>

      <View style={{ gap: 8 }}>
        <SectionTitle>Outubro × Novembro</SectionTitle>
        <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
          <View style={[s.row, { paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
            {['Indicador', 'Out', 'Nov', 'Var.'].map((h, i) => (
              <Txt key={h} variant="caption" tone="muted" style={{ flex: i === 0 ? 1.3 : 1, textAlign: i === 3 ? 'right' : 'left' }}>{h}</Txt>
            ))}
          </View>
          {monthCompare.map((r) => (
            <View key={r.label} style={[s.row, { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
              <Txt variant="small" style={{ flex: 1.3, fontSize: 14 }}>{r.label}</Txt>
              <Txt variant="small" tone="soft" style={{ flex: 1, fontSize: 14 }}>{r.before}</Txt>
              <Txt variant="small" style={{ flex: 1, fontSize: 14, fontFamily: fonts.bodySemi }}>{r.after}</Txt>
              <Txt variant="small" tone="accent" style={{ flex: 1, fontSize: 14, fontFamily: fonts.bodySemi, textAlign: 'right' }}>{r.change}</Txt>
            </View>
          ))}
        </View>
      </View>

      <View style={[s.row, { gap: 8 }]}>
        <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: colors.surface, gap: 2 }}>
          <Txt variant="caption" tone="muted">Frequência</Txt>
          <Txt variant="small" style={{ fontSize: 14 }}>
            <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 18, color: colors.text }}>4,5</Txt> treinos/semana
          </Txt>
          <Txt variant="caption" tone="faint">era 3,0 em outubro</Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/recordes')}
          style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold, gap: 2 }}
        >
          <Txt variant="eyebrow" tone="gold">Recordes</Txt>
          <Txt variant="small" style={{ fontSize: 14 }}>2 novos em novembro</Txt>
          <Txt variant="caption" tone="soft">Ver todos ›</Txt>
        </Pressable>
      </View>
    </Screen>
  );
}
