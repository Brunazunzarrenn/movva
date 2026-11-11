import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { LineChart, StatGrid } from '@/components/athlete';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Header, RouteMap, Screen, SectionTitle, VerifiedBadge, s } from '@/components/ui';
import { myPosts, workouts } from '@/data/profile';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { BigStats, whenText, workoutStats } from '@/components/workout';
import { activitySpec, fmtDuration, fmtKm, fmtSpeed, pathFromCoords, shortSport } from '@/data/activity';
import { isVerified, useProfile, type UserWorkout } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export default function AtividadeDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts: mine } = useProfile();
  const own = mine.find((x) => x.id === id);
  if (own) return <MinhaAtividade w={own} />;
  return <AtividadeExemplo id={id} />;
}

function AtividadeExemplo({ id }: { id: string }) {
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

/* Treino gravado por você. */
function MinhaAtividade({ w }: { w: UserWorkout }) {
  const { colors } = useTheme();
  const { posts, deleteWorkout } = useProfile();
  const [confirm, setConfirm] = useState(false);
  const post = posts.find((p) => p.workoutId === w.id);
  const path = pathFromCoords(w.coords);
  const sourceText =
    w.source === 'gps' ? 'Gravado com GPS' : w.source === 'cronometro' ? 'Gravado com o cronômetro' : w.source === 'simulado' ? 'GPS simulado (teste)' : 'Lançado à mão';

  return (
    <Screen footer={
      confirm ? (
        <View style={{ gap: 8 }}>
          <Txt variant="small" style={{ textAlign: 'center' }}>Excluir este treino? Ele sai do perfil, dos desafios e o post também é apagado.</Txt>
          <View style={[s.row, { gap: 8 }]}>
            <Button label="Cancelar" variant="secondary" size="md" onPress={() => setConfirm(false)} style={{ flex: 1 }} />
            <Button label="Excluir" variant="danger" size="md" onPress={() => { deleteWorkout(w.id); router.back(); }} style={{ flex: 1 }} />
          </View>
        </View>
      ) : undefined
    }>
      <Header title={w.title} subtitle={`${w.sport} · ${whenText(w.start)}`} right={isVerified(w) ? <VerifiedBadge /> : undefined} />
      {path ? (
        <View style={{ borderRadius: 18, overflow: 'hidden', marginHorizontal: -4 }}>
          <RouteMap height={190} path={path} />
        </View>
      ) : null}
      <BigStats stats={workoutStats(w)} />

      {w.legs?.length ? (
        <View style={{ gap: 8 }}>
          <SectionTitle>Etapas</SectionTitle>
          <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
            {w.legs.map((l, i) => {
              const sp = activitySpec(l.sport);
              return (
                <View key={i} style={[s.row, { paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider }]}>
                  <Txt variant="small" style={{ flex: 1, fontSize: 14, fontFamily: fonts.bodySemi }}>{l.transition ? `Transição ${l.sport}` : shortSport(l.sport)}</Txt>
                  {!l.transition ? <Txt variant="small" tone="soft" style={{ fontSize: 14 }}>{fmtKm(l.km)} · {fmtSpeed(sp.speed, l.km, l.sec)}</Txt> : null}
                  <Txt variant="small" style={{ fontSize: 14, minWidth: 56, textAlign: 'right' }}>{fmtDuration(l.sec)}</Txt>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {w.notes ? <Txt variant="small" tone="soft" style={{ fontSize: 15 }}>{w.notes}</Txt> : null}

      <View style={[s.row, { gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.surface }]}>
        <Icon name={isVerified(w) ? 'check' : 'shield'} size={18} color={isVerified(w) ? colors.accentInk : colors.textMuted} />
        <Txt variant="caption" tone="muted" style={{ flex: 1 }}>
          {sourceText} · {isVerified(w) ? 'conta em desafios, duelos e rankings.' : 'não conta em desafios e rankings.'} Visível para: {w.visibility.toLowerCase()}.
        </Txt>
      </View>

      {post ? (
        <Button label="Ver post e comentários" onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })} />
      ) : null}
      {!confirm ? <Button label="Excluir treino" variant="ghost" size="sm" onPress={() => setConfirm(true)} /> : null}
    </Screen>
  );
}
