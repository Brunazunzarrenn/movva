import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// As chaves ficam no arquivo .env (veja .env.example). A chave "anon" é pública:
// vai dentro do app e quem protege os dados são as regras (RLS) do banco.
// NUNCA coloque a chave "service_role" aqui.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Sem as chaves, o app roda no modo de teste local (tudo salvo só no aparelho).
export const isOnline = url.startsWith('https://') && anonKey.length > 20;

export const supabase: SupabaseClient | null = isOnline
  ? createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

// Gera ids no aparelho para o mesmo treino/post ter o mesmo id aqui e no banco.
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Envia uma foto do aparelho para o Storage (pasta do usuário) e devolve o endereço público.
export async function uploadPhoto(localUri: string, userId: string, name: string) {
  if (!supabase || /^https?:\/\//.test(localUri)) return localUri;
  const res = await fetch(localUri);
  const buf = await res.arrayBuffer();
  const type = res.headers.get('content-type') ?? 'image/jpeg';
  const path = `${userId}/${name}-${Date.now()}.${type.includes('png') ? 'png' : 'jpg'}`;
  const { error } = await supabase.storage.from('fotos').upload(path, buf, { contentType: type, upsert: true });
  if (error) throw error;
  return supabase.storage.from('fotos').getPublicUrl(path).data.publicUrl;
}
