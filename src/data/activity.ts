// O que cada esporte registra num treino.
// - gps: distância, ritmo/velocidade e percurso (corrida, pedal, águas abertas…)
// - piscina: distância contando voltas, ritmo por 100 m (natação em piscina)
// - tempo: só tempo, intensidade e calorias (jiu-jitsu, musculação, vôlei…)
// - multi: várias modalidades em sequência com transições (triathlon, duathlon…)

import { normalizeSport } from '@/data/sports';

export type ActivityKind = 'gps' | 'piscina' | 'tempo' | 'multi';
export type SpeedUnit = 'pace' | 'speed' | 'pace100' | null; // min/km, km/h, min/100 m

export type ActivitySpec = {
  sport: string;
  kind: ActivityKind;
  speed: SpeedUnit;
  group: 'corrida' | 'pedal' | 'natacao' | 'outro'; // usado para desafios (Corrida / Pedal / Natação)
  legs?: string[]; // modalidades do multiesporte, na ordem
};

const RUN = ['Corrida de rua', 'Trail running', 'Atletismo', 'Caminhada', 'Trekking', 'Marcha atlética', 'Orientação', 'Corrida de aventura', 'Montanhismo'];
const RIDE = ['Ciclismo de estrada', 'Mountain bike', 'Gravel', 'BMX', 'Cicloturismo', 'Patins'];
const PADDLE = ['Stand up paddle', 'Remo', 'Canoagem', 'Caiaque'];
const OPEN_WATER = ['Águas abertas'];
const POOL = ['Natação'];

const MULTI: Record<string, string[]> = {
  Triathlon: ['Natação', 'Ciclismo de estrada', 'Corrida de rua'],
  Duathlon: ['Corrida de rua', 'Ciclismo de estrada', 'Corrida de rua'],
  Aquathlon: ['Natação', 'Corrida de rua'],
};

const has = (list: string[], sport: string) => list.some((x) => normalizeSport(x) === normalizeSport(sport));

export function activitySpec(sport: string): ActivitySpec {
  const multi = Object.keys(MULTI).find((k) => normalizeSport(k) === normalizeSport(sport));
  if (multi) return { sport, kind: 'multi', speed: null, group: 'outro', legs: MULTI[multi] };
  if (has(RUN, sport)) return { sport, kind: 'gps', speed: 'pace', group: sport === 'Montanhismo' ? 'outro' : 'corrida' };
  if (has(RIDE, sport)) return { sport, kind: 'gps', speed: 'speed', group: sport === 'Patins' ? 'outro' : 'pedal' };
  if (has(PADDLE, sport)) return { sport, kind: 'gps', speed: 'speed', group: 'outro' };
  if (has(OPEN_WATER, sport)) return { sport, kind: 'gps', speed: 'pace100', group: 'natacao' };
  if (has(POOL, sport)) return { sport, kind: 'piscina', speed: 'pace100', group: 'natacao' };
  if (normalizeSport(sport) === normalizeSport('Ciclismo indoor')) return { sport, kind: 'tempo', speed: null, group: 'pedal' };
  return { sport, kind: 'tempo', speed: null, group: 'outro' };
}

/* Esportes que dá para treinar: os seus, e as modalidades separadas dos multiesportes
   (quem faz triathlon pode registrar só natação, só pedal ou só corrida). */
export function trainingOptions(mySports: string[]) {
  const out: string[] = [];
  const add = (s: string) => { if (!out.some((x) => normalizeSport(x) === normalizeSport(s))) out.push(s); };
  for (const s of mySports) {
    add(s);
    activitySpec(s).legs?.forEach(add);
  }
  return out;
}

/* Campos que fazem sentido num convite ou num lançamento manual. */
export function fieldsFor(sport: string) {
  const sp = activitySpec(sport);
  const hasDistance = sp.kind !== 'tempo';
  const paceLabel = sp.kind === 'multi' ? null : sp.speed === 'pace' ? 'Ritmo' : sp.speed === 'speed' ? 'Velocidade' : sp.speed === 'pace100' ? 'Ritmo por 100 m' : null;
  const pacePlaceholder = sp.speed === 'pace' ? '6′00″/km' : sp.speed === 'speed' ? '25 km/h' : sp.speed === 'pace100' ? '2:10 /100 m' : '';
  const distancePlaceholder = sp.kind === 'piscina' || sp.speed === 'pace100' ? '1,5 km' : sp.kind === 'multi' ? '750 m · 20 km · 5 km' : sp.speed === 'speed' ? '40 km' : '8 km';
  return { spec: sp, hasDistance, paceLabel, pacePlaceholder, distancePlaceholder };
}

/* Nome curto para telas de treino. */
export function shortSport(sport: string) {
  const map: Record<string, string> = { 'Corrida de rua': 'Corrida', 'Ciclismo de estrada': 'Pedal', 'Mountain bike': 'MTB', 'Trail running': 'Trail' };
  return map[sport] ?? sport;
}

/* ---------- Formatação ---------- */

export function fmtDuration(sec: number) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return h ? `${h}:${mm}:${String(r).padStart(2, '0')}` : `${mm}:${String(r).padStart(2, '0')}`;
}

export function fmtKm(km: number) {
  return km < 1 && km > 0 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2).replace('.', ',')} km`;
}

export function fmtSpeed(unit: SpeedUnit, km: number, sec: number) {
  if (!unit || km <= 0.01 || sec <= 0) return '–';
  if (unit === 'speed') return `${((km / sec) * 3600).toFixed(1).replace('.', ',')} km/h`;
  const per = unit === 'pace' ? sec / km : sec / (km * 10); // segundos por km ou por 100 m
  if (!isFinite(per) || per > 3600) return '–';
  const m = Math.floor(per / 60);
  const s = Math.round(per % 60);
  return unit === 'pace' ? `${m}′${String(s).padStart(2, '0')}″/km` : `${m}:${String(s).padStart(2, '0')} /100 m`;
}

export const speedLabel = (u: SpeedUnit) => (u === 'speed' ? 'Velocidade' : u === 'pace100' ? 'Ritmo /100 m' : 'Ritmo');

/* Calorias estimadas pelo MET do esporte (peso padrão de 70 kg até termos o peso no perfil). */
export function estimateKcal(sport: string, sec: number, rpe = 5) {
  const sp = activitySpec(sport);
  const base = sp.group === 'corrida' ? 9.5 : sp.group === 'pedal' ? 8 : sp.group === 'natacao' ? 8.3 : 7;
  const met = base * (0.75 + rpe / 20);
  return Math.round(met * 70 * (sec / 3600));
}

export function dayPeriod(d = new Date()) {
  const h = d.getHours();
  return h < 5 ? 'da madrugada' : h < 12 ? 'da manhã' : h < 18 ? 'da tarde' : 'da noite';
}

/* Distância entre dois pontos (fórmula de haversine), em km. */
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* Converte coordenadas em um desenho SVG (viewBox 350×150) para o mapa do treino. */
export function pathFromCoords(coords: [number, number][], w = 350, h = 150, pad = 14) {
  if (coords.length < 2) return '';
  const lats = coords.map((c) => c[0]);
  const lons = coords.map((c) => c[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanX = (maxLon - minLon) * kx || 1e-6;
  const spanY = maxLat - minLat || 1e-6;
  const scale = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY);
  const ox = (w - spanX * scale) / 2;
  const oy = (h - spanY * scale) / 2;
  return coords
    .map(([la, lo], i) => `${i ? 'L' : 'M'}${(ox + (lo - minLon) * kx * scale).toFixed(1)} ${(h - oy - (la - minLat) * scale).toFixed(1)}`)
    .join(' ');
}
