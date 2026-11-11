import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ActivityKind } from '@/data/activity';
import { avatarColors } from '@/theme/colors';

// Perfil do usuário criado no cadastro e os posts que ele publica.
// Hoje fica salvo no aparelho. Com o Supabase, `completeSignup`, `updateProfile`
// e `addPost` passam a gravar nas tabelas `profiles` e `posts`.

export type Level = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Profissional';

export type Profile = {
  name: string;
  username: string; // sem o @
  photoUri?: string;
  bio?: string;
  sports: string[]; // esportes da base
  pendingSports: string[]; // esportes digitados em "Outro", em análise
  level: Level;
  region: string;
  birthDate: string; // dd/mm/aaaa
  createdAt: string; // ISO
};

export type Visibility = 'Público' | 'Seguidores' | 'Só eu';

export type UserPost = {
  id: string;
  text: string;
  photoUris: string[];
  workoutId?: string;
  visibility: Visibility;
  createdAt: string;
};

export type WorkoutLeg = { sport: string; sec: number; km: number; transition?: boolean };

// Treino registrado no app. `source` diz como foi medido: só 'gps' e 'cronometro'
// (gravados ao vivo) e 'simulado' (versão de teste) contam em desafios e rankings.
export type UserWorkout = {
  id: string;
  sport: string;
  kind: ActivityKind;
  title: string;
  start: string; // ISO
  sec: number; // tempo em movimento
  elapsedSec: number; // tempo total, com pausas
  km: number;
  elevation: number; // metros de subida
  coords: [number, number][]; // percurso (lat, lon), reduzido
  legs?: WorkoutLeg[];
  poolLength?: number;
  laps?: number;
  rpe: number; // esforço percebido 1 a 10
  kcal: number;
  notes?: string;
  visibility: Visibility;
  source: 'gps' | 'cronometro' | 'manual' | 'simulado';
};

export const isVerified = (w: UserWorkout) => w.source !== 'manual';

export type SignupDraft = Partial<Omit<Profile, 'createdAt'>>;

type Store = {
  ready: boolean; // terminou de ler o que estava salvo
  profile: Profile | null;
  posts: UserPost[];
  demo: boolean; // mostra dados de exemplo (medalhas, treinos, evolução)
  draft: SignupDraft;
  updateDraft: (patch: SignupDraft) => void;
  completeSignup: (last: SignupDraft) => Profile | null; // junta o último passo ao rascunho e cria o perfil
  updateProfile: (patch: Partial<Profile>) => void;
  addPost: (p: Omit<UserPost, 'id' | 'createdAt'>) => void;
  workouts: UserWorkout[];
  addWorkout: (w: Omit<UserWorkout, 'id'>) => UserWorkout;
  deleteWorkout: (id: string) => void;
  setDemo: (v: boolean) => void;
  signOut: () => void;
};

const KEY = 'movva.perfil.v1';

type Saved = { profile: Profile | null; posts: UserPost[]; demo: boolean; workouts?: UserWorkout[] };

const Ctx = createContext<Store | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [demo, setDemo] = useState(false);
  const [workouts, setWorkouts] = useState<UserWorkout[]>([]);
  const [draft, setDraft] = useState<SignupDraft>({});

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const s = JSON.parse(raw) as Saved;
        setProfile(s.profile);
        setPosts(s.posts ?? []);
        setDemo(!!s.demo);
        setWorkouts(s.workouts ?? []);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: Saved = { profile, posts, demo, workouts };
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, profile, posts, demo, workouts]);

  const store = useMemo<Store>(
    () => ({
      ready,
      profile,
      posts,
      demo,
      draft,
      updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
      completeSignup: (last) => {
        const d = { ...draft, ...last };
        if (!d.name || !d.username || !d.level || !d.region || !d.birthDate) return null;
        const p: Profile = {
          name: d.name.trim(),
          username: d.username,
          photoUri: d.photoUri,
          bio: d.bio,
          sports: d.sports ?? [],
          pendingSports: d.pendingSports ?? [],
          level: d.level,
          region: d.region.trim(),
          birthDate: d.birthDate,
          createdAt: new Date().toISOString(),
        };
        setProfile(p);
        setPosts([]);
        setWorkouts([]);
        setDraft({});
        return p;
      },
      updateProfile: (patch) => setProfile((p) => (p ? { ...p, ...patch } : p)),
      addPost: (p) => setPosts((cur) => [{ ...p, id: 'u' + Date.now(), createdAt: new Date().toISOString() }, ...cur]),
      workouts,
      addWorkout: (w) => {
        const created = { ...w, id: 'w' + Date.now().toString(36) };
        setWorkouts((cur) => [created, ...cur]);
        return created;
      },
      deleteWorkout: (id) => {
        setWorkouts((cur) => cur.filter((w) => w.id !== id));
        setPosts((cur) => cur.filter((p) => p.workoutId !== id));
      },
      setDemo,
      signOut: () => {
        setWorkouts([]);
        setProfile(null);
        setPosts([]);
        setDemo(false);
        setDraft({});
      },
    }),
    [ready, profile, posts, demo, draft, workouts],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useProfile() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useProfile precisa estar dentro de <ProfileProvider>');
  return s;
}

/* ---------- Utilidades de perfil ---------- */

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : parts[0][1] ?? '';
  return (first + last).toUpperCase();
}

export function colorOf(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return avatarColors[h % avatarColors.length];
}

export function ageFrom(birth: string) {
  const [dd, mm, yyyy] = birth.split('/').map(Number);
  if (!dd || !mm || !yyyy) return null;
  const now = new Date();
  let age = now.getFullYear() - yyyy;
  if (now.getMonth() + 1 < mm || (now.getMonth() + 1 === mm && now.getDate() < dd)) age--;
  return age;
}

// Sugere um @usuário a partir do nome: "Igor Costa" -> "igorcosta".
const ACC: Record<string, string> = { á: 'a', à: 'a', â: 'a', ã: 'a', é: 'e', ê: 'e', í: 'i', ó: 'o', ô: 'o', õ: 'o', ú: 'u', ü: 'u', ç: 'c' };
export function suggestUsername(name: string) {
  return name
    .toLowerCase()
    .replace(/[áàâãéêíóôõúüç]/g, (c) => ACC[c] ?? c)
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
}

// Nomes já usados (no backend isso será uma consulta ao banco).
const TAKEN = ['movva', 'admin', 'suporte', 'rafaelcosta', 'marianasouza', 'brunoteles'];

export function usernameError(u: string): string | null {
  if (u.length === 0) return 'Escolha um nome de usuário.';
  if (u.length < 3) return 'Use pelo menos 3 caracteres.';
  if (!/^[a-z0-9._]+$/.test(u)) return 'Use só letras minúsculas, números, ponto e _.';
  if (TAKEN.includes(u)) return 'Esse nome de usuário já está em uso.';
  return null;
}
