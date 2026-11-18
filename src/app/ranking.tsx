import { useState } from 'react';
import { View } from 'react-native';

import { RankRow } from '@/components/arena';
import { Txt } from '@/components/Txt';
import { Chip, Header, Screen, Segmented, s } from '@/components/ui';
import { rankingOf, rankMetrics, type RankMetric } from '@/data/arena';
import { athletes } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { useProfile } from '@/data/ProfileStore';
import { totals, weekStart } from '@/data/progress';

const SCOPES = ['Seguindo', 'Perto', 'Todos'] as const;

export default function Ranking() {
  return (
    <Screen>
      <Header title="Ranking da semana" subtitle="Zera toda segunda-feira" />
      <Rankings />
      <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>Só treinos gravados (GPS, cronômetro ou relógio) contam.</Txt>
    </Screen>
  );
}

function Rankings() {
  const { profile, workouts } = useProfile();
  const { following } = useCommunity();
  const [metric, setMetric] = useState<RankMetric>('km');
  const [scope, setScope] = useState<(typeof SCOPES)[number]>('Seguindo');
  const unit = rankMetrics.find((m) => m.id === metric)!.unit;
  const city = (profile?.region ?? '').toLowerCase();

  const pool = athletes.filter((a) =>
    scope === 'Seguindo' ? following[a.id] : scope === 'Perto' ? city.split(/[\s,]+/).some((w) => w.length > 3 && a.region.toLowerCase().includes(w)) : true,
  );
  const mine = totals(workouts, weekStart())[metric === 'km' ? 'km' : metric === 'treinos' ? 'treinos' : 'horas'];
  const rows = [...rankingOf(pool, metric), { id: 'me', value: mine }].sort((x, y) => y.value - x.value);
  const fmt = (v: number) => `${String(v).replace('.', ',')} ${unit}`;

  return (
    <View style={{ gap: 10 }}>
      <Segmented label="Quem entra no ranking" options={SCOPES} value={scope} onChange={setScope} />
      <View style={[s.row, { gap: 8 }]}>
        {rankMetrics.map((m) => <Chip key={m.id} label={m.label} selected={m.id === metric} onPress={() => setMetric(m.id)} />)}
      </View>
      <Txt variant="caption" tone="muted">Esta semana · {rows.length} {rows.length === 1 ? 'atleta' : 'atletas'}</Txt>
      <View style={{ gap: 2 }}>
        {rows.map((r, i) => <RankRow key={r.id} pos={i + 1} id={r.id} value={fmt(r.value)} />)}
      </View>
      {rows.length === 1 ? <Txt variant="small" tone="muted">Ninguém por aqui ainda. Siga atletas para montar seu ranking.</Txt> : null}
    </View>
  );
}