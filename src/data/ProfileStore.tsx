import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ActivityKind } from '@/data/activity';
import {
  deleteWorkoutRemote, fetchMyPosts, fetchMyProfile, fetchMyWorkouts, insertPost, insertWorkout, saveProfile,
} from '@/lib/remote';
import { isOnline, supabase, uuid } from '@/lib/supabase';
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
  // junta o último passo ao rascunho e cria o perfil (no banco, quando online)
  completeSignup: (last: SignupDraft) => Promise<{ profile?: Profile; error?: string }>;
  updateProfile: (patch: Partial<Profile>) => void;
  addPost: (p: Omit<UserPost, 'id' | 'createdAt'>) => void;
  workouts: UserWorkout[];
  addWorkout: (w: Omit<UserWorkout, 'id'>) => UserWorkout;
  deleteWorkout: (id: string) => void;
  setDemo: (v: boolean) => void;
  signOut: () => void;
  // Conta de verdade (Supabase). Sem as chaves, online = false e tudo fica só no aparelho.
  online: boolean;
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
  syncError: string | null;
  sendCode: (email: string) => Promise<string | null>; // devolve a mensagem de erro, se houver
  verifyCode: (email: string, code: string) => Promise<string | null>;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fail = (e: unknown) => setSyncError(e instanceof Error ? e.message : 'Não foi possível salvar no servidor.');

  // Carrega a conta do banco (perfil, treinos e posts). Se a internet falhar, fica o que estava salvo no aparelho.
  const loadAccount = async (uid: string) => {
    try {
      const [p, ws, ps] = await Promise.all([fetchMyProfile(uid), fetchMyWorkouts(uid), fetchMyPosts(uid)]);
      if (p) {
        const { isAdmin: admin, ...rest } = p;
        setProfile(rest);
        setIsAdmin(admin);
      } else {
        setProfile(null);
      }
      setWorkouts(ws);
      setPosts(ps);
      setSyncError(null);
    } catch (e) {
      fail(e);
    }
  };

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
      .then(async () => {
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user;
        if (u) {
          setUserId(u.id);
          setEmail(u.email ?? null);
          await loadAccount(u.id);
        } else {
          setProfile(null); // sem sessão não há conta, mesmo que algo antigo tenha ficado salvo
        }
      })
      .finally(() => setReady(true));
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { setUserId(null); setEmail(null); setIsAdmin(false); }
      if (event === 'SIGNED_IN' && session?.user) { setUserId(session.user.id); setEmail(session.user.email ?? null); }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      completeSignup: async (last) => {
        const d = { ...draft, ...last };
        if (!d.name || !d.username || !d.level || !d.region || !d.birthDate) return { error: 'Faltou algum passo do cadastro.' };
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
        if (isOnline) {
          if (!userId) return { error: 'Entre com seu e-mail antes de criar o perfil.' };
          try {
            const photo = await saveProfile(userId, p, true);
            p.photoUri = photo;
          } catch (e) {
            return { error: e instanceof Error ? e.message : 'Não foi possível criar o perfil.' };
          }
        }
        setProfile(p);
        setPosts([]);
        setWorkouts([]);
        setDraft({});
        return { profile: p };
      },
      updateProfile: (patch) => {
        if (!profile) return;
        const next = { ...profile, ...patch };
        setProfile(next);
        if (isOnline && userId) {
          saveProfile(userId, next, false)
            .then((photo) => { if (photo !== next.photoUri) setProfile((cur) => (cur ? { ...cur, photoUri: photo } : cur)); setSyncError(null); })
            .catch(fail);
        }
      },
      addPost: (p) => {
        const created: UserPost = { ...p, id: uuid(), createdAt: new Date().toISOString() };
        setPosts((cur) => [created, ...cur]);
        if (isOnline && userId) {
          insertPost(userId, created)
            .then((urls) => setPosts((cur) => cur.map((x) => (x.id === created.id ? { ...x, photoUris: urls } : x))))
            .catch(fail);
        }
      },
      workouts,
      addWorkout: (w) => {
        const created = { ...w, id: uuid() };
        setWorkouts((cur) => [created, ...cur]);
        if (isOnline && userId) insertWorkout(created).catch(fail);
        return created;
      },
      deleteWorkout: (id) => {
        setWorkouts((cur) => cur.filter((w) => w.id !== id));
        setPosts((cur) => cur.filter((p) => p.workoutId !== id));
        if (isOnline && userId) deleteWorkoutRemote(id).catch(fail);
      },
      setDemo,
      online: isOnline,
      userId,
      email,
      isAdmin,
      syncError,
      sendCode: async (mail) => {
        if (!supabase) return 'Login ainda não configurado.';
        const { error } = await supabase.auth.signInWithOtp({ email: mail.trim().toLowerCase(), options: { shouldCreateUser: true } });
        if (!error) return null;
        if (error.status === 429) return 'Muitas tentativas. Espere alguns minutos e peça outro código.';
        if (/fetch|network/i.test(error.message)) return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
        return 'Não foi possível enviar o código. Tente de novo em instantes.';
      },
      verifyCode: async (mail, code) => {
        if (!supabase) return 'Login ainda não configurado.';
        const { data, error } = await supabase.auth.verifyOtp({ email: mail.trim().toLowerCase(), token: code, type: 'email' });
        if (error || !data.user) return 'Código errado ou vencido. Confira o e-mail ou peça outro.';
        setUserId(data.user.id);
        setEmail(data.user.email ?? null);
        await loadAccount(data.user.id);
        return null;
      },
      signOut: () => {
        supabase?.auth.signOut().catch(() => {});
        setUserId(null);
        setIsAdmin(false);
        setWorkouts([]);
        setProfile(null);
        setPosts([]);
        setDemo(false);
        setDraft({});
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, profile, posts, demo, draft, workouts, userId, email, isAdmin, syncError],
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
