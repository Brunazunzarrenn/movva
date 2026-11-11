import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { useProfileSports } from '@/components/profileParts';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { BigStats, EffortPicker, workoutStats } from '@/components/workout';
import { Button, Chip, Header, IconButton, RouteMap, Screen, Segmented, s } from '@/components/ui';
import {
  activitySpec, dayPeriod, estimateKcal, fieldsFor, fmtDuration, fmtKm, fmtSpeed, pathFromCoords, shortSport, speedLabel, trainingOptions,
} from '@/data/activity';
import { useProfile, type UserWorkout, type Visibility } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { maskTime, timeError } from '@/utils/format';
import { segmentsFor, useRecorder } from '@/utils/useRecorder';

type Phase = 'escolher' | 'gravando' | 'manual' | 'resumo';
type Draft = Omit<UserWorkout, 'id' | 'title' | 'rpe' | 'kcal' | 'notes' | 'visibility'>;

const POOLS = [25, 50] as const;
const VIS: readonly Visibility[] = ['Público', 'Seguidores', 'Só eu'];
const FALLBACK = ['Corrida de rua', 'Ciclismo de estrada', 'Natação', 'Musculação'];

export default function Treino() {
  const { profile } = useProfile();
  const mine = useProfileSports(profile?.sports ?? [], profile?.pendingSports ?? []).official;
  const options = useMemo(() => {
    const list = trainingOptions(mine.length ? mine : FALLBACK);
    return list.length ? list : FALLBACK;
  }, [mine]);

  const [phase, setPhase] = useState<Phase>('escolher');
  const [sport, setSport] = useState(options[0]);
  const [pool, setPool] = useState<(typeof POOLS)[number]>(25);
  const [simulate, setSimulate] = useState(Platform.OS === 'web');
  const [draft, setDraft] = useState<Draft | null>(null);

  if (phase === 'gravando') {
    return <Recording sport={sport} pool={pool} simulate={simulate} onDone={(d) => { setDraft(d); setPhase('resumo'); }} onDiscard={() => router.back()} />;
  }
  if (phase === 'manual') {
    return <Manual sport={sport} pool={pool} onBack={() => setPhase('escolher')} onDone={(d) => { setDraft(d); setPhase('resumo'); }} />;
  }
  if (phase === 'resumo' && draft) {
    return <Summary draft={draft} onDiscard={() => router.back()} />;
  }
  return (
    <Choose
      options={options}
      sport={sport}
      setSport={setSport}
      pool={pool}
      setPool={setPool}
      simulate={simulate}
      setSimulate={setSimulate}
      onStart={() => setPhase('gravando')}
      onManual={() => setPhase('manual')}
    />
  );
}

/* ---------- 1. Escolher o esporte ---------- */

function Choose(p: {
  options: string[]; sport: string; setSport: (s: string) => void; pool: 25 | 50; setPool: (v: 25 | 50) => void;
  simulate: boolean; setSimulate: (v: boolean) => void; onStart: () => void; onManual: () => void;
}) {
  const { colors } = useTheme();
  const spec = activitySpec(p.sport);
  const legs = segmentsFor(p.sport).filter((x) => !x.transition).map((x) => shortSport(x.sport));
  const info =
    spec.kind === 'gps' ? { icon: 'pin' as const, title: 'Com GPS', text: 'Grava distância, ritmo, subida e o percurso no mapa.' }
      : spec.kind === 'piscina' ? { icon: 'clock' as const, title: 'Piscina', text: 'Escolha o tamanho da piscina e toque em +1 volta a cada volta. O ritmo é por 100 m.' }
        : spec.kind === 'multi' ? { icon: 'flag' as const, title: 'Multiesporte', text: `${legs.join(' → ')}, com as transições cronometradas. Para treinar uma modalidade só, escolha ela na lista.` }
          : { icon: 'clock' as const, title: 'Sem distância', text: 'Cronômetro com pausa. No fim você marca o esforço e calculamos as calorias.' };

  return (
    <Screen footer={
      <View style={{ gap: 8 }}>
        <Button label="Começar treino" icon="pin" onPress={p.onStart} />
        <Button label="Lançar treino já feito" variant="ghost" size="md" onPress={p.onManual} />
      </View>
    }>
      <Header title="Registrar treino" />

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Qual treino?</Txt>
        <View style={s.wrap}>
          {p.options.map((o) => <Chip key={o} label={o} selected={o === p.sport} onPress={() => p.setSport(o)} />)}
        </View>
      </View>

      <View style={[s.row, { gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface }]}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={info.icon} size={20} color={colors.accentInk} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="bodyStrong">{info.title}</Txt>
          <Txt variant="caption" tone="muted">{info.text}</Txt>
        </View>
      </View>

      {spec.kind === 'piscina' ? (
        <View style={{ gap: 8 }}>
          <Txt variant="bodyStrong">Tamanho da piscina</Txt>
          <View style={[s.row, { gap: 8 }]}>
            {POOLS.map((v) => <Chip key={v} label={`${v} m`} selected={v === p.pool} onPress={() => p.setPool(v)} style={{ flex: 1 }} />)}
          </View>
        </View>
      ) : null}

      {spec.kind === 'gps' || spec.kind === 'multi' ? (
        <View style={[s.row, { gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt>Simular GPS (teste)</Txt>
            <Txt variant="caption" tone="muted">Para testar sem sair de casa: gera um percurso na Pampulha, 10× mais rápido.</Txt>
          </View>
          <Switch
            accessibilityLabel="Simular GPS"
            value={p.simulate}
            onValueChange={p.setSimulate}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={colors.border}
            {...({ activeThumbColor: '#FFFFFF' } as object)}
          />
        </View>
      ) : null}
    </Screen>
  );
}

/* ---------- 2. Gravando ---------- */

function Recording({ sport, pool, simulate, onDone, onDiscard }: { sport: string; pool: number; simulate: boolean; onDone: (d: Draft) => void; onDiscard: () => void }) {
  const { colors, isDark } = useTheme();
  // Tela não apaga enquanto grava (no celular).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    activateKeepAwakeAsync('treino').catch(() => {});
    return () => { deactivateKeepAwake('treino').catch(() => {}); };
  }, []);
  const insets = useSafeAreaInsets();
  const r = useRecorder(sport, { simulate, poolLength: pool });
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Começa assim que a tela abre.
  const { start } = r;
  useEffect(() => { start(); }, [start]);

  const isMulti = r.spec.kind === 'multi';
  const segSpec = r.currentSpec;
  const showDistance = r.spec.kind !== 'tempo' && !r.current.transition;
  const legKm = isMulti ? r.segKm : r.km;
  const legSec = isMulti ? r.segSec : r.moving;
  const path = pathFromCoords(r.coords);
  const gpsPill = {
    'sem-gps': null,
    buscando: { label: 'Procurando GPS…', color: colors.gold },
    ok: { label: 'GPS ok', color: colors.accentInk },
    fraco: { label: 'Sinal de GPS fraco', color: colors.gold },
    negado: { label: 'GPS sem permissão', color: colors.danger },
    simulado: { label: 'GPS simulado (10×)', color: colors.accentInk },
  }[r.gps];

  const finish = () => {
    const f = r.finish();
    onDone({
      sport,
      kind: r.spec.kind,
      start: f.start,
      sec: f.sec,
      elapsedSec: f.elapsedSec,
      km: f.km,
      elevation: f.elevation,
      coords: f.coords,
      legs: f.legs,
      laps: f.laps,
      poolLength: r.spec.kind === 'piscina' ? pool : undefined,
      source: simulate && r.spec.kind !== 'tempo' && r.spec.kind !== 'piscina' ? 'simulado' : r.spec.kind === 'gps' || isMulti ? 'gps' : 'cronometro',
    });
  };

  const nextSeg = r.segments[r.segIndex + 1];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <View style={{ gap: 2 }}>
            <Txt variant="eyebrow" tone="accent">{r.paused ? 'Pausado' : 'Gravando'}</Txt>
            <Txt variant="title">{isMulti ? (r.current.transition ? `Transição ${r.current.sport}` : shortSport(r.current.sport)) : shortSport(sport)}</Txt>
          </View>
          {gpsPill ? (
            <View style={[s.row, { gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface }]}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: gpsPill.color }} />
              <Txt variant="caption" style={{ color: gpsPill.color, fontFamily: fonts.bodySemi }}>{gpsPill.label}</Txt>
            </View>
          ) : null}
        </View>

        {isMulti ? (
          <View style={[s.row, { gap: 4 }]}>
            {r.segments.map((sg, i) => (
              <View
                key={i}
                style={{
                  flex: sg.transition ? 0.6 : 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center',
                  backgroundColor: i === r.segIndex ? colors.accent : i < r.segIndex ? colors.accentSoft : colors.surface,
                }}
              >
                <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: i === r.segIndex ? colors.onAccent : i < r.segIndex ? colors.accentInk : colors.textMuted }}>
                  {sg.transition ? sg.sport : shortSport(sg.sport)}
                </Txt>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Txt variant="caption" tone="muted">Tempo{isMulti ? ' total' : ''}</Txt>
          <Txt accessibilityLabel={`Tempo ${fmtDuration(r.moving)}`} style={{ fontFamily: fonts.display, fontSize: 72, lineHeight: 80, color: colors.text }}>{fmtDuration(r.moving)}</Txt>
          {isMulti ? <Txt variant="small" tone="muted">nesta etapa: {fmtDuration(legSec)}</Txt> : null}
        </View>

        <View style={[s.wrap, { gap: 8 }]}>
          {showDistance ? <Stat label={isMulti ? 'Distância da etapa' : 'Distância'} value={fmtKm(legKm)} /> : null}
          {showDistance && segSpec.speed ? <Stat label={speedLabel(segSpec.speed)} value={fmtSpeed(segSpec.speed, legKm, legSec)} /> : null}
          {r.spec.kind === 'gps' && r.elevation > 0 ? <Stat label="Subida" value={`${Math.round(r.elevation)} m`} /> : null}
          <Stat label="Calorias" value={`${estimateKcal(sport, r.moving)} kcal`} />
          {isMulti ? <Stat label="Distância total" value={fmtKm(r.km)} /> : null}
        </View>

        {r.spec.kind === 'piscina' ? (
          <View style={{ gap: 10, alignItems: 'center' }}>
            <Txt variant="small" tone="muted">{r.laps} {r.laps === 1 ? 'volta' : 'voltas'} de {pool} m</Txt>
            <View style={[s.row, { gap: 12 }]}>
              <Button label="−1" variant="secondary" size="md" onPress={r.removeLap} style={{ width: 72 }} />
              <Button label="+1 volta" size="lg" onPress={r.addLap} style={{ width: 200 }} />
            </View>
          </View>
        ) : null}

        {r.usesGps ? (
          <View style={{ borderRadius: 18, overflow: 'hidden' }}>
            {path ? (
              <Svg width="100%" height={170} viewBox="0 0 350 150" style={{ backgroundColor: colors.surfaceAlt }}>
                <Path d={path} fill="none" stroke={isDark ? colors.accent : '#189A06'} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            ) : (
              <View style={{ height: 120, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }}>
                <Txt variant="caption" tone="muted">{r.gps === 'negado' ? 'Libere a localização para gravar o percurso.' : 'O percurso aparece aqui quando o GPS fixar.'}</Txt>
              </View>
            )}
          </View>
        ) : null}

        {r.spec.kind === 'tempo' ? (
          <Txt variant="caption" tone="muted" style={{ textAlign: 'center' }}>{sport} não tem distância nem ritmo. Deixe o cronômetro rodando e pause nos intervalos.</Txt>
        ) : null}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 16, gap: 10, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.nav }}>
        {isMulti && nextSeg && !r.paused ? (
          <Button
            label={nextSeg.transition ? `Terminar ${shortSport(r.current.sport).toLowerCase()} · ${nextSeg.sport}` : `Começar ${shortSport(nextSeg.sport).toLowerCase()}`}
            variant="inverse"
            onPress={r.next}
          />
        ) : null}
        {confirmDiscard ? (
          <View style={{ gap: 8 }}>
            <Txt variant="small" style={{ textAlign: 'center' }}>Descartar este treino? Nada será salvo.</Txt>
            <View style={[s.row, { gap: 8 }]}>
              <Button label="Voltar" variant="secondary" size="md" onPress={() => setConfirmDiscard(false)} style={{ flex: 1 }} />
              <Button label="Descartar" variant="danger" size="md" onPress={onDiscard} style={{ flex: 1 }} />
            </View>
          </View>
        ) : r.paused ? (
          <>
            <View style={[s.row, { gap: 8 }]}>
              <Button label="Retomar" size="lg" onPress={r.resume} style={{ flex: 1 }} />
              <Button label="Finalizar" variant="inverse" size="lg" onPress={finish} style={{ flex: 1 }} />
            </View>
            <Button label="Descartar treino" variant="ghost" size="sm" onPress={() => setConfirmDiscard(true)} />
          </>
        ) : (
          <Button label="Pausar" variant="secondary" size="lg" onPress={r.pause} />
        )}
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexBasis: '47%', flexGrow: 1, padding: 12, borderRadius: 14, backgroundColor: colors.surface, gap: 2 }}>
      <Txt variant="caption" tone="muted">{label}</Txt>
      <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 26, color: colors.text }}>{value}</Txt>
    </View>
  );
}

/* ---------- 3. Lançar treino já feito ---------- */

const DAYS = ['Hoje', 'Ontem', 'Anteontem'] as const;

function Manual({ sport, pool, onBack, onDone }: { sport: string; pool: number; onBack: () => void; onDone: (d: Draft) => void }) {
  const { colors } = useTheme();
  const f = fieldsFor(sport);
  const [day, setDay] = useState<(typeof DAYS)[number]>('Hoje');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [tried, setTried] = useState(false);

  const startErr = timeError(startTime);
  const [dh, dm] = duration.split(':').map(Number);
  const durSec = duration.length === 5 && dm < 60 ? (dh * 60 + dm) * 60 : 0;
  const durErr = durSec > 0 ? null : 'Digite a duração (ex.: 01:15).';
  const km = Number(distance.replace(',', '.'));
  const distErr = f.hasDistance && !(km > 0) ? 'Digite a distância em km.' : null;
  const start = useMemo(() => {
    if (startErr) return null;
    const [h, m] = startTime.split(':').map(Number);
    const d = new Date(); d.setDate(d.getDate() - DAYS.indexOf(day)); d.setHours(h, m, 0, 0);
    return d;
  }, [startTime, day, startErr]);
  const futureErr = start && start.getTime() > Date.now() ? 'Esse horário ainda não chegou.' : null;

  const go = () => {
    setTried(true);
    if (startErr || durErr || distErr || futureErr || !start) return;
    onDone({
      sport, kind: f.spec.kind, start: start.toISOString(), sec: durSec, elapsedSec: durSec,
      km: f.hasDistance ? km : 0, elevation: 0, coords: [], source: 'manual',
      poolLength: f.spec.kind === 'piscina' ? pool : undefined,
    });
  };

  return (
    <Screen footer={<Button label="Continuar" onPress={go} />}>
      <View style={[s.row, { gap: 6, marginLeft: -12 }]}>
        <IconButton icon="back" label="Voltar" onPress={onBack} />
        <View style={{ flex: 1 }}>
          <Txt variant="title">Lançar treino</Txt>
          <Txt variant="small" tone="muted">{sport}</Txt>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Quando foi</Txt>
        <View style={[s.row, { gap: 8 }]}>
          {DAYS.map((d) => <Chip key={d} label={d} selected={d === day} onPress={() => setDay(d)} style={{ flex: 1 }} />)}
        </View>
      </View>
      <TextField label="Começou às" value={startTime} onChangeText={(t) => setStartTime(maskTime(t))} placeholder="06:30" keyboardType="number-pad" maxLength={5} error={tried ? startErr ?? futureErr : null} />
      <TextField label="Duração (horas:minutos)" value={duration} onChangeText={(t) => setDuration(maskTime(t))} placeholder="01:15" keyboardType="number-pad" maxLength={5} error={tried ? durErr : null} />
      {f.hasDistance ? (
        <TextField label="Distância (km)" value={distance} onChangeText={(t) => setDistance(t.replace(/[^0-9.,]/g, '').slice(0, 6))} placeholder={f.distancePlaceholder.split(' ')[0]} keyboardType="decimal-pad" error={tried ? distErr : null} />
      ) : null}

      <View style={[s.row, { gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.surface }]}>
        <Icon name="shield" size={20} color={colors.textMuted} />
        <Txt variant="caption" tone="muted" style={{ flex: 1 }}>Treino lançado à mão aparece no seu perfil, mas não conta em desafios, duelos e rankings (lá só valem treinos gravados).</Txt>
      </View>
    </Screen>
  );
}

/* ---------- 4. Resumo e salvar ---------- */

function Summary({ draft, onDiscard }: { draft: Draft; onDiscard: () => void }) {
  const { colors } = useTheme();
  const { addWorkout, addPost } = useProfile();
  const [title, setTitle] = useState(`${shortSport(draft.sport)} ${dayPeriod(new Date(draft.start))}`);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');
  const [vis, setVis] = useState<Visibility>('Público');
  const [publish, setPublish] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const kcal = estimateKcal(draft.sport, draft.sec, rpe);
  const stats = workoutStats({ ...draft, kcal, rpe });
  const path = pathFromCoords(draft.coords);

  const save = () => {
    const w = addWorkout({ ...draft, title: title.trim() || shortSport(draft.sport), rpe, kcal, notes: notes.trim() || undefined, visibility: vis });
    if (publish) addPost({ text: [w.title, w.notes].filter(Boolean).join('\n'), photoUris: [], workoutId: w.id, visibility: vis });
    router.replace({ pathname: '/atividade/[id]', params: { id: w.id } });
  };

  return (
    <Screen footer={
      confirm ? (
        <View style={{ gap: 8 }}>
          <Txt variant="small" style={{ textAlign: 'center' }}>Descartar este treino? Nada será salvo.</Txt>
          <View style={[s.row, { gap: 8 }]}>
            <Button label="Voltar" variant="secondary" size="md" onPress={() => setConfirm(false)} style={{ flex: 1 }} />
            <Button label="Descartar" variant="danger" size="md" onPress={onDiscard} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Button label="Salvar treino" icon="check" onPress={save} />
          <Button label="Descartar" variant="ghost" size="sm" onPress={() => setConfirm(true)} />
        </View>
      )
    }>
      <Header title="Treino concluído" subtitle={`${draft.sport}${draft.source === 'simulado' ? ' · GPS simulado' : draft.source === 'manual' ? ' · lançado à mão' : ''}`} />

      {path ? (
        <View style={{ borderRadius: 18, overflow: 'hidden' }}>
          <RouteMap path={path} height={160} />
        </View>
      ) : null}

      <BigStats stats={stats} />

      {draft.legs?.length ? (
        <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
          {draft.legs.map((l, i) => {
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
      ) : null}

      <TextField label="Nome do treino" value={title} onChangeText={(t) => setTitle(t.slice(0, 50))} />
      <EffortPicker value={rpe} onChange={setRpe} />
      <TextField label="Como foi? (opcional)" value={notes} onChangeText={(t) => setNotes(t.slice(0, 300))} placeholder="Ex.: Rolou bem, último km forte." multiline multilineHeight={80} />

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Quem pode ver</Txt>
        <Segmented label="Quem pode ver o treino" options={VIS} value={vis} onChange={setVis} />
      </View>

      <View style={[s.row, { gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt>Publicar no feed</Txt>
          <Txt variant="caption" tone="muted">Vira um post no seu perfil com os números do treino.</Txt>
        </View>
        <Switch
          accessibilityLabel="Publicar no feed"
          value={publish}
          onValueChange={setPublish}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.border}
          {...({ activeThumbColor: '#FFFFFF' } as object)}
        />
      </View>
    </Screen>
  );
}
