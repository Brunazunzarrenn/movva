// Previsão do tempo para sugerir o melhor horário de treino.
// Fonte: Open-Meteo (grátis, sem chave). Guarda no aparelho por 30 min para não buscar toda hora.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { activitySpec } from '@/data/activity';

export type HourWeather = {
  time: string; // ISO local (ex.: 2026-11-18T06:00)
  temp: number;
  feels: number;
  rain: number; // chance de chuva %
  wind: number; // km/h
  uv: number;
  humidity: number;
};

export type Forecast = { place: string; hours: HourWeather[]; fetchedAt: number };

const CACHE_KEY = 'movva.clima.v1';
const CACHE_MS = 30 * 60 * 1000;
const BH = { lat: -19.9191, lon: -43.9386, name: 'Belo Horizonte' };

async function findPlace(region?: string) {
  // 1) localização do celular (só se a pessoa já deixou ou deixar agora)
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    const ok = perm.granted || (perm.canAskAgain && (await Location.requestForegroundPermissionsAsync()).granted);
    if (ok) {
      const pos = await Location.getLastKnownPositionAsync() ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (pos) return { lat: pos.coords.latitude, lon: pos.coords.longitude, name: region?.split(',').pop()?.trim() || 'Sua localização' };
    }
  } catch { /* sem GPS: tenta pela região do perfil */ }
  // 2) região do perfil (ex.: "Savassi, Belo Horizonte" → procura "Belo Horizonte")
  const parts = (region ?? '').split(',').map((x) => x.trim()).filter(Boolean).reverse();
  for (const name of parts) {
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=pt&countryCode=BR`);
      const j = (await r.json()) as { results?: { latitude: number; longitude: number; name: string }[] };
      const hit = j.results?.[0];
      if (hit) return { lat: hit.latitude, lon: hit.longitude, name: hit.name };
    } catch { /* tenta o próximo pedaço */ }
  }
  return BH;
}

async function fetchForecast(region?: string): Promise<Forecast> {
  const place = await findPlace(region);
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat.toFixed(3)}&longitude=${place.lon.toFixed(3)}` +
    '&hourly=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,uv_index,relative_humidity_2m' +
    '&timezone=auto&forecast_days=2';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`clima ${r.status}`);
  const j = (await r.json()) as {
    hourly: { time: string[]; temperature_2m: number[]; apparent_temperature: number[]; precipitation_probability: (number | null)[]; wind_speed_10m: number[]; uv_index: number[]; relative_humidity_2m: number[] };
  };
  const h = j.hourly;
  return {
    place: place.name,
    fetchedAt: Date.now(),
    hours: h.time.map((time, i) => ({
      time,
      temp: Math.round(h.temperature_2m[i]),
      feels: Math.round(h.apparent_temperature[i]),
      rain: h.precipitation_probability[i] ?? 0,
      wind: Math.round(h.wind_speed_10m[i]),
      uv: Math.round(h.uv_index[i] ?? 0),
      humidity: h.relative_humidity_2m[i] ?? 0,
    })),
  };
}

export function useForecast(region?: string) {
  const [data, setData] = useState<Forecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      if (!force) {
        const raw = await AsyncStorage.getItem(CACHE_KEY).catch(() => null);
        const cached = raw ? (JSON.parse(raw) as Forecast) : null;
        if (cached && Date.now() - cached.fetchedAt < CACHE_MS) { setData(cached); setLoading(false); return; }
      }
      const f = await fetchForecast(region);
      setData(f);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(f)).catch(() => {});
    } catch {
      setError('Não foi possível buscar a previsão. Confira a internet e tente de novo.');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: () => load(true) };
}

/* ---------- Nota de cada hora para treinar ---------- */

// Faixa de temperatura confortável por tipo de esporte (sensação térmica).
function idealRange(sport: string): [number, number] {
  const g = activitySpec(sport).group;
  if (g === 'corrida') return [10, 20];
  if (g === 'pedal') return [14, 24];
  if (g === 'natacao') return [22, 31];
  return [15, 25];
}

export function scoreHour(h: HourWeather, sport: string) {
  const [lo, hi] = idealRange(sport);
  const hour = Number(h.time.slice(11, 13));
  let score = 100;
  const reasons: string[] = [];
  if (h.feels > hi) { score -= (h.feels - hi) * 6; if (h.feels - hi >= 4) reasons.push('calor'); }
  if (h.feels < lo) { score -= (lo - h.feels) * 4; if (lo - h.feels >= 4) reasons.push('frio'); }
  if (h.rain > 20) { score -= (h.rain - 20) * 0.9; if (h.rain >= 40) reasons.push('chuva'); }
  if (h.wind > 20) { score -= (h.wind - 20) * 1.5; if (h.wind >= 28) reasons.push('vento'); }
  if (h.uv >= 6) { score -= (h.uv - 5) * 5; reasons.push('sol forte'); }
  if (hour < 5 || hour >= 21) { score -= 30; reasons.push('escuro'); }
  else if (hour < 6 || hour >= 19) { score -= 8; }
  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

export function scoreLabel(score: number) {
  return score >= 80 ? 'Ótimo' : score >= 60 ? 'Bom' : score >= 40 ? 'Ok' : 'Evite';
}

// Melhor janela de 2 horas seguidas entre 5h e 21h, a partir da hora atual (hoje) ou no dia todo (amanhã).
export function bestWindow(hours: HourWeather[], sport: string, day: 'hoje' | 'amanha', now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = new Date(now);
  if (day === 'amanha') d.setDate(d.getDate() + 1);
  const dayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const minHour = day === 'hoje' ? now.getHours() + (now.getMinutes() > 30 ? 1 : 0) : 5;
  const list = hours
    .filter((h) => h.time.startsWith(dayKey))
    .filter((h) => { const hr = Number(h.time.slice(11, 13)); return hr >= Math.max(5, minHour) && hr <= 20; })
    .map((h) => ({ h, ...scoreHour(h, sport) }));
  let best: { start: (typeof list)[number]; end: (typeof list)[number]; score: number } | null = null;
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    const b = list[i + 1];
    const score = b ? Math.round((a.score + b.score) / 2) : a.score;
    if (!best || score > best.score) best = { start: a, end: b ?? a, score };
  }
  return { list, best };
}

export const hourOf = (iso: string) => `${Number(iso.slice(11, 13))}h`;
