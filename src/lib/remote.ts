// Conversa com o banco (Supabase): converte as linhas das tabelas para os tipos do app e vice-versa.

import type { Profile, UserPost, UserWorkout } from '@/data/ProfileStore';
import { supabase, uploadPhoto } from '@/lib/supabase';

const db = () => {
  if (!supabase) throw new Error('Supabase não configurado');
  return supabase;
};

// dd/mm/aaaa <-> aaaa-mm-dd
const toIsoDate = (br: string) => { const [d, m, y] = br.split('/'); return `${y}-${m}-${d}`; };
const toBrDate = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };

type ProfileRow = {
  id: string; name: string; username: string; photo_url: string | null; bio: string | null;
  sports: string[]; pending_sports: string[]; level: Profile['level']; region: string; is_admin: boolean; created_at: string;
};

export async function fetchMyProfile(userId: string): Promise<(Profile & { isAdmin: boolean }) | null> {
  const [{ data: p, error }, { data: priv }] = await Promise.all([
    db().from('profiles').select('*').eq('id', userId).maybeSingle<ProfileRow>(),
    db().from('profile_private').select('birth_date').eq('id', userId).maybeSingle<{ birth_date: string }>(),
  ]);
  if (error) throw error;
  if (!p) return null;
  return {
    name: p.name, username: p.username, photoUri: p.photo_url ?? undefined, bio: p.bio ?? undefined,
    sports: p.sports, pendingSports: p.pending_sports, level: p.level, region: p.region,
    birthDate: priv ? toBrDate(priv.birth_date) : '', createdAt: p.created_at, isAdmin: p.is_admin,
  };
}

export async function isUsernameFree(username: string, myId?: string) {
  const { data } = await db().from('profiles').select('id').eq('username', username).maybeSingle<{ id: string }>();
  return !data || data.id === myId;
}

// Salva o perfil. Se a foto não subir, o perfil salva assim mesmo e devolvemos o motivo.
export async function saveProfile(userId: string, p: Profile, isNew: boolean) {
  let photo = p.photoUri;
  let photoError: string | null = null;
  if (photo && !/^https?:\/\//.test(photo)) {
    try {
      photo = await uploadPhoto(photo, userId, 'avatar');
    } catch (e) {
      photoError = `A foto não foi enviada (${e instanceof Error ? e.message : 'erro desconhecido'}). Tente escolher de novo em Editar perfil.`;
    }
  }
  const remotePhoto = photo && /^https?:\/\//.test(photo) ? photo : null;
  const row = {
    id: userId, name: p.name, username: p.username, bio: p.bio ?? null,
    ...(remotePhoto || isNew || !photo ? { photo_url: remotePhoto } : {}),
    sports: p.sports, pending_sports: p.pendingSports, level: p.level, region: p.region,
  };
  const { error } = isNew ? await db().from('profiles').insert(row) : await db().from('profiles').update(row).eq('id', userId);
  if (error) {
    if (error.code === '23505') throw new Error('Esse nome de usuário já está em uso.');
    throw error;
  }
  if (p.birthDate) {
    const { error: e2 } = await db().from('profile_private').upsert({ id: userId, birth_date: toIsoDate(p.birthDate) });
    if (e2) throw e2;
  }
  return { photo, photoError };
}

type WorkoutRow = {
  id: string; sport: string; kind: UserWorkout['kind']; title: string; start_at: string; sec: number; elapsed_sec: number;
  km: number | string; elevation: number; coords: [number, number][]; legs: UserWorkout['legs'] | null; pool_length: number | null;
  laps: number | null; rpe: number; kcal: number; notes: string | null; visibility: UserWorkout['visibility']; source: UserWorkout['source'];
};

const fromWorkoutRow = (r: WorkoutRow): UserWorkout => ({
  id: r.id, sport: r.sport, kind: r.kind, title: r.title, start: r.start_at, sec: r.sec, elapsedSec: r.elapsed_sec,
  km: Number(r.km), elevation: r.elevation, coords: r.coords ?? [], legs: r.legs ?? undefined, poolLength: r.pool_length ?? undefined,
  laps: r.laps ?? undefined, rpe: r.rpe, kcal: r.kcal, notes: r.notes ?? undefined, visibility: r.visibility, source: r.source,
});

export async function fetchMyWorkouts(userId: string) {
  const { data, error } = await db().from('workouts').select('*').eq('user_id', userId).order('start_at', { ascending: false }).limit(500);
  if (error) throw error;
  return (data as WorkoutRow[]).map(fromWorkoutRow);
}

export async function insertWorkout(w: UserWorkout) {
  const { error } = await db().from('workouts').insert({
    id: w.id, sport: w.sport, kind: w.kind, title: w.title, start_at: w.start, sec: Math.round(w.sec), elapsed_sec: Math.round(w.elapsedSec),
    km: w.km, elevation: Math.round(w.elevation), coords: w.coords, legs: w.legs ?? null, pool_length: w.poolLength ?? null,
    laps: w.laps ?? null, rpe: w.rpe, kcal: w.kcal, notes: w.notes ?? null, visibility: w.visibility, source: w.source,
  });
  if (error) throw error;
}

export async function deleteWorkoutRemote(id: string) {
  const { error } = await db().from('workouts').delete().eq('id', id);
  if (error) throw error;
}

type PostRow = { id: string; text: string; photo_urls: string[]; workout_id: string | null; visibility: UserPost['visibility']; created_at: string };

export async function fetchMyPosts(userId: string) {
  const { data, error } = await db().from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(300);
  if (error) throw error;
  return (data as PostRow[]).map<UserPost>((r) => ({
    id: r.id, text: r.text, photoUris: r.photo_urls, workoutId: r.workout_id ?? undefined, visibility: r.visibility, createdAt: r.created_at,
  }));
}

export async function insertPost(userId: string, p: UserPost) {
  const urls: string[] = [];
  for (const [i, uri] of p.photoUris.entries()) {
    try { urls.push(await uploadPhoto(uri, userId, `post-${p.id}-${i}`)); } catch { /* foto que falhou fica de fora */ }
  }
  const { error } = await db().from('posts').insert({
    id: p.id, text: p.text, photo_urls: urls, workout_id: p.workoutId ?? null, visibility: p.visibility, created_at: p.createdAt,
  });
  if (error) throw error;
  return urls;
}

export async function suggestSportRemote(name: string) {
  const { error } = await db().rpc('suggest_sport', { sport_name: name });
  if (error) throw error;
}
