import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Button, Chip, Header, Screen, s } from '@/components/ui';
import { records } from '@/data/profile';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const GROUPS = ['Todos', 'Corrida', 'Pedal', 'Natação', 'Geral'] as const;

export default function Recordes() {
  const { colors } = useTheme();
  const [group, setGroup] = useState<(typeof GROUPS)[number]>('Todos');
  const latest = records.find((r) => r.isNew);
  const list = group === 'Todos' ? records : records.filter((r) => r.group === group);

  return (
    <Screen>
      <Header title="Recordes pessoais" />

      {latest ? (
        <View style={{ padding: 16, borderRadius: 18, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold, gap: 6 }}>
          <Txt variant="eyebrow" tone="gold">Novo recorde · 02/11</Txt>
          <Txt style={{ fontFamily: fonts.display, fontSize: 32, color: colors.text }}>5 km em {latest.value}</Txt>
          <Txt variant="small" tone="soft">41 segundos mais rápido que seu recorde anterior (25:19).</Txt>
          <Button label="Compartilhar recorde" size="sm" variant="inverse" onPress={() => router.push('/em-breve')} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
        </View>
      ) : null}

      <View style={[s.wrap, { gap: 6 }]}>
        {GROUPS.map((g) => <Chip key={g} label={g} selected={g === group} onPress={() => setGroup(g)} />)}
      </View>

      <View style={{ gap: 8 }}>
        {list.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            accessibilityLabel={`${r.label}: ${r.value}${r.isNew ? ', recorde novo' : ''}`}
            disabled={!r.workoutId}
            onPress={() => r.workoutId && router.push({ pathname: '/atividade/[id]', params: { id: r.workoutId } })}
            style={[s.row, { gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.surface }]}
          >
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="trophy" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="small" tone="soft" style={{ fontSize: 14 }}>{r.label}</Txt>
              <Txt variant="caption" tone="faint">{r.date}</Txt>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Txt variant="number">{r.value}</Txt>
              {r.isNew ? (
                <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, backgroundColor: colors.gold }}>
                  <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: colors.goldSoft }}>NOVO</Txt>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
