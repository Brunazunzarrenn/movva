import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { File } from 'expo-file-system';
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

// Lê os bytes da foto escolhida. No celular a foto é um arquivo local (file://),
// que precisa do expo-file-system; no navegador é um blob/data que o fetch lê.
async function readPhoto(uri: string): Promise<{ buf: ArrayBuffer; type: string }> {
  const guess = /\.png($|\?)/i.test(uri) ? 'image/png' : /\.webp($|\?)/i.test(uri) ? 'image/webp' : 'image/jpeg';
  if (Platform.OS !== 'web' && uri.startsWith('file:')) {
    const f = new File(uri);
    return { buf: await f.arrayBuffer(), type: f.type || guess };
  }
  const res = await fetch(uri);
  return { buf: await res.arrayBuffer(), type: res.headers.get('content-type') || guess };
}

// Envia uma foto do aparelho para o Storage (pasta do usuário) e devolve o endereço público.
export async function uploadPhoto(localUri: string, userId: string, name: string) {
  if (!supabase || /^https?:\/\//.test(localUri)) return localUri;
  const { buf, type } = await readPhoto(localUri);
  if (buf.byteLength === 0) throw new Error('não foi possível ler a foto');
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  // Nome sempre novo: não precisa sobrescrever (upsert), que exigiria mais permissões.
  const path = `${userId}/${name}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('fotos').upload(path, buf, { contentType: type, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from('fotos').getPublicUrl(path).data.publicUrl;
}
