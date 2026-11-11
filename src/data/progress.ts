// Calcula o seu progresso em desafios, duelos e rankings a partir dos treinos gravados.

import { activitySpec } from '@/data/activity';
import type { Challenge } from '@/data/arena';
import type { DuelMetric } from '@/data/community';
import { isVerified, type UserWorkout } from '@/data/ProfileStore';

type Part = { sport: string; km: number; sec: number };

// Partes de um treino (um multiesporte vira natação + pedal + corrida; transições não contam).
function parts(w: UserWorkout): Part[] {
  if (w.legs?.length) return w.legs.filter((l) => !l.transition).map((l) => ({ sport: l.sport, km: l.km, sec: l.sec }));
  return [{ sport: w.sport, km: w.km, sec: w.sec }];
}

const GROUP: Record<Challenge['sport'], string | null> = { Corrida: 'corrida', Pedal: 'pedal', Natação: 'natacao', 'Qualquer esporte': null };

function inRange(w: UserWorkout, start: number, end: number) {
  const t = new Date(w.start).getTime();
  return t >= start && t <= end;
}

export function challengeProgress(c: Challenge, workouts: UserWorkout[]) {
  const s = new Date(c.start).getTime();
  const e = new Date(c.end).getTime();
  const group = GROUP[c.sport];
  const match = (p: Part) => group === null || activitySpec(p.sport).group === group;
  const list = workouts.filter((w) => isVerified(w) && inRange(w, s, e));
  const matched = list.map((w) => ({ w, ps: parts(w).filter(match) })).filter((x) => x.ps.length);

  switch (c.goal) {
    case 'dist':
      return round1(matched.reduce((a, x) => a + x.ps.reduce((b, p) => b + p.km, 0), 0));
    case 'tempo':
      return round1(matched.reduce((a, x) => a + x.ps.reduce((b, p) => b + p.sec, 0), 0) / 3600);
    case 'treinos':
      return matched.length;
    case 'dias':
      return new Set(matched.map((x) => new Date(x.w.start).toDateString())).size;
    case 'alt':
      return Math.round(matched.reduce((a, x) => a + x.w.elevation, 0));
  }
}

export function totals(workouts: UserWorkout[], fromMs: number, toMs = Date.now()) {
  const list = workouts.filter((w) => isVerified(w) && inRange(w, fromMs, toMs));
  return {
    km: round1(list.reduce((a, w) => a + w.km, 0)),
    treinos: list.length,
    subida: Math.round(list.reduce((a, w) => a + w.elevation, 0)),
    horas: round1(list.reduce((a, w) => a + w.sec, 0) / 3600),
  } satisfies Record<DuelMetric, number>;
}

export function weekStart(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // segunda = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

const round1 = (n: number) => Math.round(n * 10) / 10;
