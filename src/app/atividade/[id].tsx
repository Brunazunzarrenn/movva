import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { LineChart, StatGrid } from '@/components/athlete';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Header, RouteMap, Screen, SectionTitle, VerifiedBadge, s } from '@/components/ui';
import { myPosts, workouts } from '@/data/profile';

export default function AtividadeDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = workouts.find((x) => x.id === id) ?? workouts[0];
  const post = myPosts.find((p) => p.workoutId === w.id);
  const elev = w.elevation;

  return (
    <Screen>
      <Header title={w.title} subtitle={`${w.sport} · ${w.when}`} right={<VerifiedBadge />} />
      <View style={{ borderRadius: 18, overflow: 'hidden', marginHorizontal: -4 }}>
        <RouteMap height={190} path={w.route} />
      </View>
      <StatGrid stats={w.stats} />

      {elev ? (
        <View style={{ gap: 6 }}>
          <SectionTitle>Altimetria</SectionTitle>
          <LineChart values={elev} height={90} label={`Altimetria de ${Math.min(...elev)} a ${Math.max(...elev)} metros`} />
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Txt variant="caption" tone="faint">início</Txt>
            <Txt variant="caption" tone="faint">pico {Math.max(...elev).toLocaleString('pt-BR')} m</Txt>
            <Txt variant="caption" tone="faint">fim</Txt>
          </View>
        </View>
      ) : null}

      {w.partners ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Treinou com</SectionTitle>
          <View style={[s.row, { gap: 8 }]}>
            {w.partners.map((p) => <Avatar key={p.initials} initials={p.initials} color={p.color} size={34} />)}
            <Txt variant="small" tone="soft">{w.partnersLabel}</Txt>
          </View>
        </View>
      ) : null}

      {post ? (
        <Button label="Ver post e comentários" onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })} />
      ) : (
        <Button label="Publicar este treino" variant="outline" icon="camera" onPress={() => router.push('/novo-post')} />
      )}
    </Screen>
  );
}
