import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { activitySpec, haversineKm, type ActivitySpec } from '@/data/activity';
import type { WorkoutLeg } from '@/data/ProfileStore';

// Grava o treino: cronômetro com pausa, GPS (ou simulação para testar parado),
// voltas na piscina e etapas do multiesporte com transições.

export type GpsStatus = 'sem-gps' | 'buscando' | 'ok' | 'fraco' | 'negado' | 'simulado';

export type Segment = { sport: string; transition: boolean };

const SIM_SPEED = 10; // simulação 10× mais rápida (1 s real = 10 s de treino)
const SIM_CENTER = { lat: -19.8516, lon: -43.9735 }; // orla da Pampulha
const MAX_ACCURACY_M = 35;

// Velocidade usada na simulação (m/s) para cada tipo de esporte.
function simSpeed(sp: ActivitySpec) {
  if (sp.group === 'pedal' || sp.speed === 'speed') return 7.2;
  if (sp.group === 'natacao') return 0.8;
  return 3.0;
}

export function segmentsFor(sport: string): Segment[] {
  const sp = activitySpec(sport);
  if (sp.kind !== 'multi' || !sp.legs) return [{ sport, transition: false }];
  const out: Segment[] = [];
  sp.legs.forEach((leg, i) => {
    if (i > 0) out.push({ sport: `T${i}`, transition: true });
    out.push({ sport: leg, transition: false });
  });
  return out;
}

export function useRecorder(sport: string, opts: { simulate: boolean; poolLength: number }) {
  const spec = activitySpec(sport);
  const segments = segmentsFor(sport);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // segundos, com pausas
  const [moving, setMoving] = useState(0); // segundos em movimento
  const [km, setKm] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [laps, setLaps] = useState(0);
  const [gps, setGps] = useState<GpsStatus>('sem-gps');
  const [segIndex, setSegIndex] = useState(0);
  const [legs, setLegs] = useState<WorkoutLeg[]>([]);
  const startAt = useRef<string>(new Date().toISOString());

  const current = segments[segIndex];
  const segSport = current.transition ? sport : current.sport;
  const currentSpec = activitySpec(segSport);
  const usesGps = !current.transition && (spec.kind === 'gps' || (spec.kind === 'multi' && currentSpec.kind !== 'tempo'));
  // Simulação acelera o relógio só em esportes com GPS (jiu-jitsu e piscina rodam no tempo real).
  const fast = opts.simulate && (spec.kind === 'gps' || spec.kind === 'multi');

  // Refs para os callbacks do GPS e do relógio enxergarem o estado atual.
  const live = useRef({ paused, km, moving, segStartKm: 0, segStartSec: 0, last: null as null | { lat: number; lon: number; alt?: number }, simAngle: 0 });
  live.current.paused = paused;
  live.current.km = km;
  live.current.moving = moving;

  const addPoint = useCallback((lat: number, lon: number, alt?: number | null) => {
    const L = live.current;
    const prev = L.last;
    L.last = { lat, lon, alt: alt ?? undefined };
    if (L.paused) return;
    if (prev) {
      const d = haversineKm(prev, { lat, lon });
      if (d > 0.25) return; // salto de GPS: ignora
      setKm((k) => k + d);
      if (alt != null && prev.alt != null) {
        const up = alt - prev.alt;
        if (up > 0.6 && up < 15) setElevation((e) => e + up);
      }
    }
    setCoords((c) => {
      const next = [...c, [lat, lon] as [number, number]];
      return next.length > 1500 ? next.filter((_, i) => i % 2 === 0) : next;
    });
  }, []);

  // Relógio (na simulação, cada segundo real vale SIM_SPEED segundos).
  useEffect(() => {
    if (!started) return;
    const step = fast ? SIM_SPEED : 1;
    const id = setInterval(() => {
      setElapsed((e) => e + step);
      if (!live.current.paused) setMoving((m) => m + step);
    }, 1000);
    return () => clearInterval(id);
  }, [started, fast]);

  // GPS real ou simulado.
  useEffect(() => {
    if (!started || !usesGps) {
      setGps('sem-gps');
      return;
    }
    if (opts.simulate) {
      setGps('simulado');
      const v = simSpeed(activitySpec(segSport)) * SIM_SPEED; // metros por segundo real
      const id = setInterval(() => {
        if (live.current.paused) return;
        const L = live.current;
        L.simAngle += (v / 1000 / 2.2) * (2 * Math.PI) / 3; // volta de ~6,6 km
        const r = 0.0105;
        addPoint(SIM_CENTER.lat + r * Math.sin(L.simAngle), SIM_CENTER.lon + r * 1.3 * Math.cos(L.simAngle), 800 + 12 * Math.sin(L.simAngle * 3));
      }, 1000);
      return () => clearInterval(id);
    }
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    setGps('buscando');
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { setGps('negado'); return; }
      if (cancelled) return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 3 },
        (loc) => {
          const acc = loc.coords.accuracy ?? 99;
          if (acc > MAX_ACCURACY_M) { setGps('fraco'); return; }
          setGps('ok');
          addPoint(loc.coords.latitude, loc.coords.longitude, loc.coords.altitude);
        },
      );
      if (cancelled) sub.remove();
    })().catch(() => setGps('negado'));
    return () => { cancelled = true; sub?.remove(); };
  }, [started, usesGps, opts.simulate, addPoint, segSport]);

  // Natação em piscina: distância pelas voltas.
  useEffect(() => {
    if (spec.kind === 'piscina') setKm((laps * opts.poolLength) / 1000);
  }, [laps, opts.poolLength, spec.kind]);

  const closeSegment = useCallback((): WorkoutLeg => {
    const L = live.current;
    return { sport: current.sport, sec: L.moving - L.segStartSec, km: Math.max(0, L.km - L.segStartKm), transition: current.transition };
  }, [current]);

  const next = useCallback(() => {
    if (segIndex >= segments.length - 1) return;
    const leg = closeSegment();
    setLegs((l) => [...l, leg]);
    live.current.segStartKm = live.current.km;
    live.current.segStartSec = live.current.moving;
    live.current.last = null; // não liga o fim de uma modalidade ao começo da outra
    setSegIndex((i) => i + 1);
  }, [segIndex, segments.length, closeSegment]);

  const start = useCallback(() => {
    startAt.current = new Date().toISOString();
    setStarted(true);
  }, []);

  // Encerra e devolve os números do treino.
  const finish = useCallback(() => {
    const allLegs = spec.kind === 'multi' ? [...legs, closeSegment()] : undefined;
    setStarted(false);
    return {
      start: startAt.current,
      sec: live.current.moving,
      elapsedSec: elapsed,
      km: Math.round(live.current.km * 1000) / 1000,
      elevation: Math.round(elevation),
      coords,
      legs: allLegs,
      laps: spec.kind === 'piscina' ? laps : undefined,
    };
  }, [spec.kind, legs, closeSegment, elapsed, elevation, coords, laps]);

  return {
    spec, segments, segIndex, current, currentSpec, usesGps,
    started, paused, elapsed, moving, km, elevation, coords, laps, gps,
    start, finish, next,
    pause: () => setPaused(true),
    resume: () => { live.current.last = null; setPaused(false); },
    addLap: () => setLaps((n) => n + 1),
    removeLap: () => setLaps((n) => Math.max(0, n - 1)),
    segKm: km - live.current.segStartKm,
    segSec: moving - live.current.segStartSec,
  };
}
