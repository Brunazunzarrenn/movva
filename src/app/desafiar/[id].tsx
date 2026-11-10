import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { usePerson } from '@/components/social';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Chip, Header, Screen, s } from '@/components/ui';
import { athleteById, duelMetrics, type DuelMetric } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const DAYS = [3, 7, 14] as const;
const NOTE_MAX = 100;

// Sugere a métrica que faz mais sentido para o esporte do adversário.
function defaultMetric(sports: string[]): DuelMetric {
  const t = sports.join(' ').toLowerCase();
  if (t.includes('ciclismo') || t.includes('trail') || t.includes('mountain')) return 'subida';
  if (t.includes('corrida') || t.includes('natação') || t.includes('triathlon')) return 'km';
  return 'treinos';
}

export default function Desafiar() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { createDuel } = useCommunity();
  const person = usePerson();
  const a = athleteById(id);
  const [metric, setMetric] = useState<DuelMetric>(defaultMetric(a?.sports ?? []));
  const [days, setDays] = useState<(typeof DAYS)[number]>(7);
  const [note, setNote] = useState('');

  if (!a) return null;
  const me = person('me');
  const first = a.name.split(' ')[0];
  const m = duelMetrics.find((x) => x.id === metric)!;

  const send = () => {
    createDuel({ athleteId: a.id, metric, days, note: note.trim() || undefined });
    router.back();
  };

  return (
    <Screen footer={<Button label={`Desafiar ${first}`} icon="bolt" onPress={send} />}>
      <Header title="Duelo 1×1" subtitle="Quem fizer mais no período vence e leva a medalha." />

      <View style={[s.row, { justifyContent: 'center', gap: 16, paddingVertical: 6 }]}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Avatar initials={me.initials} color={me.color} size={64} uri={me.uri} />
          <Txt variant="small" style={{ fontSize: 14 }}>Você</Txt>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <Txt style={{ fontFamily: fonts.display, fontSize: 16, color: colors.onAccent }}>VS</Txt>
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Avatar initials={person(a.id).initials} color={a.color} size={64} />
          <Txt variant="small" style={{ fontSize: 14 }}>{first}</Txt>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Quem vence?</Txt>
        <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
          {duelMetrics.map((x) => {
            const on = x.id === metric;
            return (
              <Pressable
                key={x.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={x.label}
                onPress={() => setMetric(x.id)}
                style={[s.row, { gap: 12, padding: 14, borderRadius: 14, borderWidth: on ? 2 : 1, borderColor: on ? colors.accentInk : colors.border, backgroundColor: on ? colors.accentSoft : colors.surface }]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="bodyStrong">{x.label}</Txt>
                  <Txt variant="caption" tone="muted">{x.help}</Txt>
                </View>
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? colors.accentInk : colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <Icon name="check" size={14} strokeWidth={3} color={colors.accentInk} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Duração</Txt>
        <View style={[s.row, { gap: 8 }]}>
          {DAYS.map((d) => <Chip key={d} label={`${d} dias`} selected={d === days} onPress={() => setDays(d)} style={{ flex: 1 }} />)}
        </View>
      </View>

      <TextField
        label="Recado (opcional)"
        value={note}
        onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))}
        placeholder={`Ex.: Bora ver quem aguenta, ${first}!`}
        help={`${note.length}/${NOTE_MAX}`}
      />

      <Txt variant="caption" tone="muted">
        {first} recebe o convite e tem 24 h para aceitar. {m.label} em {days} dias vence. Os treinos precisam ser gravados no MOVVA ou no relógio conectado.
      </Txt>
    </Screen>
  );
}
