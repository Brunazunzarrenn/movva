// Filtro dos pontos de GPS para a distância e a subida ficarem certas.
//
// Problemas que ele resolve:
// - GPS parado "anda" alguns metros para lá e para cá (ruído) → somava distância sem você sair do lugar.
// - Pontos com precisão ruim ou saltos impossíveis → somavam quilômetros a mais.
// - Altitude do GPS oscila muito → a subida ficava inflada.
//
// Como: cada ponto passa por um filtro de Kalman (suaviza usando a precisão que o próprio
// celular informa), saltos impossíveis para o esporte são descartados, e só conta distância
// quando a posição suavizada se afastou de verdade do último ponto contado.

export type GpsPoint = { lat: number; lon: number; alt?: number | null; acc?: number | null; t: number };

export type FilterState = {
  origin: { lat: number; lon: number } | null; // referência para trabalhar em metros
  x: number; y: number; p: number; t: number; // posição suavizada (m) e incerteza (m²)
  counted: { x: number; y: number } | null; // último ponto que entrou na distância
  alt: number | null; altBase: number | null;
};

export const newFilter = (): FilterState => ({ origin: null, x: 0, y: 0, p: 0, t: 0, counted: null, alt: null, altBase: null });

const MAX_ACCURACY_M = 30;
const MIN_STEP_M = 8; // só soma depois de se afastar 8 m do último ponto contado
const CLIMB_STEP_M = 3;
const M_PER_DEG = 111320;

export function metersBetween(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type StepResult =
  | { kind: 'ignorado'; reason: 'precisao' | 'parado' | 'salto' }
  | { kind: 'inicio'; lat: number; lon: number }
  | { kind: 'aceito'; meters: number; climb: number; lat: number; lon: number };

// maxSpeed em m/s (corrida ~10, pedal ~25, natação ~4).
export function stepGps(s: FilterState, p: GpsPoint, maxSpeed: number): StepResult {
  const acc = Math.max(3, p.acc ?? 10);
  if (acc > MAX_ACCURACY_M) return { kind: 'ignorado', reason: 'precisao' };

  if (!s.origin) {
    s.origin = { lat: p.lat, lon: p.lon };
    s.x = 0; s.y = 0; s.p = acc * acc; s.t = p.t;
    s.counted = { x: 0, y: 0 };
    s.alt = p.alt ?? null; s.altBase = s.alt;
    return { kind: 'inicio', lat: p.lat, lon: p.lon };
  }

  const kx = M_PER_DEG * Math.cos((s.origin.lat * Math.PI) / 180);
  const zx = (p.lon - s.origin.lon) * kx;
  const zy = (p.lat - s.origin.lat) * M_PER_DEG;
  const dt = Math.max(1, (p.t - s.t) / 1000);

  // Salto impossível em relação à posição suavizada: descarta.
  const jump = Math.hypot(zx - s.x, zy - s.y);
  if (jump - acc > maxSpeed * dt * 1.5 && jump > 50) return { kind: 'ignorado', reason: 'salto' };

  // Kalman: a incerteza cresce com o tempo (a pessoa pode ter andado) e diminui com cada medida.
  s.p += dt * maxSpeed * maxSpeed * 0.1;
  const k = s.p / (s.p + acc * acc);
  s.x += k * (zx - s.x);
  s.y += k * (zy - s.y);
  s.p *= 1 - k;
  s.t = p.t;

  // Subida: altitude suavizada e contada de 3 em 3 m.
  let climb = 0;
  if (p.alt != null) {
    s.alt = s.alt == null ? p.alt : s.alt + 0.1 * (p.alt - s.alt);
    if (s.altBase == null) s.altBase = s.alt;
    else if (s.alt - s.altBase >= CLIMB_STEP_M) { climb = s.alt - s.altBase; s.altBase = s.alt; }
    else if (s.alt < s.altBase) s.altBase = s.alt;
  }

  const c = s.counted ?? { x: s.x, y: s.y };
  const meters = Math.hypot(s.x - c.x, s.y - c.y);
  const lat = s.origin.lat + s.y / M_PER_DEG;
  const lon = s.origin.lon + s.x / kx;
  if (meters < MIN_STEP_M) return climb > 0 ? { kind: 'aceito', meters: 0, climb, lat, lon } : { kind: 'ignorado', reason: 'parado' };
  s.counted = { x: s.x, y: s.y };
  return { kind: 'aceito', meters, climb, lat, lon };
}

export function maxSpeedFor(group: 'corrida' | 'pedal' | 'natacao' | 'outro') {
  return group === 'pedal' ? 25 : group === 'natacao' ? 4 : group === 'corrida' ? 10 : 15;
}
