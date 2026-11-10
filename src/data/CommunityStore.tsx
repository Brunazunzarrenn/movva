import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  athleteById, autoReplies, communityPosts, seedInvites,
  type BoraInvite, type ChatMessage, type Duel, type DuelMetric,
} from '@/data/community';
import { useProfile } from '@/data/ProfileStore';

// Tudo o que você faz com a comunidade de teste: curtidas, comentários, quem você
// segue, duelos, convites do Bora Treinar?, check-ins e mensagens.
// Fica salvo no aparelho e é apagado junto com a conta ao sair.

export type UserComment = { id: string; authorId: string; text: string; at: string };

type Saved = {
  likes: Record<string, boolean>;
  comments: Record<string, UserComment[]>;
  following: Record<string, boolean>;
  duels: Duel[];
  myInvites: BoraInvite[];
  joined: Record<string, boolean>; // convites dos outros em que você entrou
  declined: Record<string, boolean>; // convites para você que você recusou
  extraParticipants: Record<string, string[]>; // atletas que confirmaram nos seus convites
  checkins: Record<string, string>;
  messages: Record<string, ChatMessage[]>;
};

const EMPTY: Saved = {
  likes: {}, comments: {}, following: { mariana: true, bruno: true, lucas: true, girobh: true },
  duels: [], myInvites: [], joined: {}, declined: {}, extraParticipants: {}, checkins: {}, messages: {},
};

const KEY = 'movva.comunidade.v1';
const REPLY_MS = 3500; // tempo até o atleta de teste responder
const DUEL_MS = 6000; // tempo até o atleta de teste aceitar o duelo

type Store = Saved & {
  invites: BoraInvite[]; // seus convites + os de teste, com participantes atualizados
  chat: (inviteId: string) => ChatMessage[];
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  toggleFollow: (athleteId: string) => void;
  createDuel: (d: { athleteId: string; metric: DuelMetric; days: number; note?: string }) => Duel;
  cancelDuel: (id: string) => void;
  createInvite: (inv: Omit<BoraInvite, 'id' | 'hostId' | 'participants'>) => BoraInvite;
  cancelInvite: (id: string) => void;
  setJoined: (id: string, v: boolean) => void;
  decline: (id: string) => void;
  checkIn: (id: string) => void;
  sendMessage: (inviteId: string, text: string) => void;
};

const Ctx = createContext<Store | null>(null);

const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { profile, ready: profileReady } = useProfile();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Saved>(EMPTY);
  const seed = useRef(seedInvites()).current;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => { if (raw) setData({ ...EMPTY, ...(JSON.parse(raw) as Partial<Saved>) }); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [ready, data]);

  // Saiu da conta: zera tudo o que era dela.
  useEffect(() => {
    if (ready && profileReady && !profile) setData(EMPTY);
  }, [ready, profileReady, profile]);

  // Duelos que ficaram esperando com o app fechado são aceitos ao abrir de novo.
  useEffect(() => {
    if (!ready) return;
    const late = data.duels.some((d) => d.status === 'aguardando' && Date.now() - new Date(d.createdAt).getTime() > DUEL_MS);
    if (late) {
      setData((s) => ({
        ...s,
        duels: s.duels.map((d) => (d.status === 'aguardando' ? { ...d, status: 'aceito', answeredAt: new Date().toISOString() } : d)),
      }));
    }
  }, [ready, data.duels]);

  const later = useCallback((ms: number, fn: (s: Saved) => Saved) => {
    setTimeout(() => setData(fn), ms);
  }, []);

  const store = useMemo<Store>(() => {
    const invites: BoraInvite[] = [
      ...data.myInvites.map((i) => ({ ...i, participants: [...i.participants, ...(data.extraParticipants[i.id] ?? [])] })),
      ...seed.invites,
    ];
    return {
      ...data,
      invites,
      chat: (id) => [...(seed.chats[id] ?? []), ...(data.messages[id] ?? [])],
      toggleLike: (postId) => setData((s) => ({ ...s, likes: { ...s.likes, [postId]: !s.likes[postId] } })),
      addComment: (postId, text) => {
        const c: UserComment = { id: uid('c'), authorId: 'me', text, at: new Date().toISOString() };
        setData((s) => ({ ...s, comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), c] } }));
        // O autor do post responde (só na primeira vez em cada post, para não virar spam).
        const post = communityPosts.find((p) => p.id === postId);
        const already = (data.comments[postId] ?? []).some((x) => x.authorId !== 'me');
        if (post && !already) {
          later(REPLY_MS, (s) => ({
            ...s,
            comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), { id: uid('r'), authorId: post.athleteId, text: pick(autoReplies), at: new Date().toISOString() }] },
          }));
        }
      },
      toggleFollow: (id) => setData((s) => ({ ...s, following: { ...s.following, [id]: !s.following[id] } })),
      createDuel: ({ athleteId, metric, days, note }) => {
        const d: Duel = { id: uid('d'), athleteId, metric, days, note, createdAt: new Date().toISOString(), status: 'aguardando' };
        setData((s) => ({ ...s, duels: [d, ...s.duels.filter((x) => !(x.athleteId === athleteId && x.status !== 'recusado'))] }));
        later(DUEL_MS, (s) => ({
          ...s,
          duels: s.duels.map((x) => (x.id === d.id && x.status === 'aguardando' ? { ...x, status: 'aceito', answeredAt: new Date().toISOString() } : x)),
        }));
        return d;
      },
      cancelDuel: (id) => setData((s) => ({ ...s, duels: s.duels.filter((d) => d.id !== id) })),
      createInvite: (inv) => {
        const created: BoraInvite = { ...inv, id: uid('i'), hostId: 'me', participants: [] };
        setData((s) => ({ ...s, myInvites: [created, ...s.myInvites] }));
        // Atletas convidados confirmam presença e mandam mensagem no chat.
        inv.invited.forEach((aid, i) => {
          const a = athleteById(aid);
          if (!a) return;
          later(REPLY_MS + i * 1500, (s) => ({
            ...s,
            extraParticipants: { ...s.extraParticipants, [created.id]: [...(s.extraParticipants[created.id] ?? []), aid] },
            messages: {
              ...s.messages,
              [created.id]: [...(s.messages[created.id] ?? []), { id: uid('m'), authorId: aid, text: 'Confirmado! Até lá.', at: new Date().toISOString() }],
            },
          }));
        });
        return created;
      },
      cancelInvite: (id) => setData((s) => ({ ...s, myInvites: s.myInvites.filter((i) => i.id !== id) })),
      setJoined: (id, v) => setData((s) => ({ ...s, joined: { ...s.joined, [id]: v }, declined: { ...s.declined, [id]: false } })),
      decline: (id) => setData((s) => ({ ...s, declined: { ...s.declined, [id]: true }, joined: { ...s.joined, [id]: false } })),
      checkIn: (id) => setData((s) => ({ ...s, checkins: { ...s.checkins, [id]: new Date().toISOString() } })),
      sendMessage: (inviteId, text) => {
        const m: ChatMessage = { id: uid('m'), authorId: 'me', text, at: new Date().toISOString() };
        setData((s) => ({ ...s, messages: { ...s.messages, [inviteId]: [...(s.messages[inviteId] ?? []), m] } }));
        // Quem organizou responde à sua primeira mensagem.
        const inv = seed.invites.find((i) => i.id === inviteId);
        const mineBefore = (data.messages[inviteId] ?? []).some((x) => x.authorId === 'me');
        if (inv && !mineBefore) {
          later(REPLY_MS, (s) => ({
            ...s,
            messages: { ...s.messages, [inviteId]: [...(s.messages[inviteId] ?? []), { id: uid('m'), authorId: inv.hostId, text: 'Fechado! Te espero lá.', at: new Date().toISOString() }] },
          }));
        }
      },
    };
  }, [data, seed, later]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useCommunity() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useCommunity precisa estar dentro de <CommunityProvider>');
  return s;
}

/* Você participa do convite? (organizou, entrou ou foi convidado e aceitou) */
export function isGoing(inv: BoraInvite, joined: Record<string, boolean>) {
  return inv.hostId === 'me' || !!joined[inv.id];
}
