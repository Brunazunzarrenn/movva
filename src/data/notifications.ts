// Notificações montadas a partir do que acontece no app (respostas, duelos, convites…).
// Com o banco, viram uma tabela "notifications" preenchida por gatilhos no servidor.

import type { Href } from 'expo-router';

import type { IconName } from '@/components/Icon';
import { athleteById, communityPosts, inviteStatus } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { useProfile } from '@/data/ProfileStore';

export type Notif = {
  id: string;
  at: string; // ISO
  actorId?: string; // atleta que fez a ação (mostra o avatar)
  icon: IconName;
  text: string;
  href: Href;
};

const plus = (iso: string, min: number) => new Date(new Date(iso).getTime() + min * 60000).toISOString();
const first = (id: string) => athleteById(id)?.name.split(' ')[0] ?? 'Alguém';

export function useNotifications() {
  const { profile } = useProfile();
  const c = useCommunity();
  const now = Date.now();
  const base = profile?.createdAt ?? new Date().toISOString();
  const list: Notif[] = [];

  // Boas-vindas da comunidade de teste (aparecem pouco depois de criar a conta).
  list.push({ id: 'f-mariana', at: plus(base, 1), actorId: 'mariana', icon: 'users', text: 'Mariana Souza começou a seguir você.', href: { pathname: '/atleta/[id]', params: { id: 'mariana' } } });
  list.push({ id: 'f-lucas', at: plus(base, 10), actorId: 'lucas', icon: 'users', text: 'Lucas Ribeiro começou a seguir você.', href: { pathname: '/atleta/[id]', params: { id: 'lucas' } } });

  // Convites para você (treino e desafio).
  for (const inv of c.invites) {
    if (inv.invited.includes('me') && inv.hostId !== 'me') {
      list.push({ id: `inv-${inv.id}`, at: base, actorId: inv.hostId, icon: 'calendar', text: `${first(inv.hostId)} te convidou para treinar: ${inv.title}.`, href: { pathname: '/convite/[id]', params: { id: inv.id } } });
    }
    const going = inv.hostId === 'me' || c.joined[inv.id];
    if (going && !c.checkins[inv.id] && inviteStatus(inv.start) === 'check-in') {
      list.push({ id: `chk-${inv.id}`, at: plus(inv.start, -30), icon: 'pin', text: `Check-in aberto: ${inv.title}. Chegou? Confirme sua presença.`, href: { pathname: '/convite/[id]', params: { id: inv.id } } });
    }
  }
  for (const ch of c.challenges) {
    if (ch.invited.includes('me') && ch.creatorId !== 'me') {
      list.push({ id: `chi-${ch.id}`, at: base, actorId: ch.creatorId, icon: 'trophy', text: `${first(ch.creatorId)} te convidou para o desafio ${ch.title}.`, href: { pathname: '/desafio/[id]', params: { id: ch.id } } });
    }
  }

  // Duelos respondidos.
  for (const d of c.duels) {
    if (d.status === 'aceito' && d.answeredAt) {
      list.push({ id: `duel-${d.id}`, at: d.answeredAt, actorId: d.athleteId, icon: 'bolt', text: `${first(d.athleteId)} aceitou seu duelo. A contagem começou!`, href: '/duelos' });
    }
  }

  // Respostas nos posts que você comentou.
  for (const [postId, comments] of Object.entries(c.comments)) {
    const post = communityPosts.find((p) => p.id === postId);
    for (const cm of comments) {
      if (cm.authorId === 'me') continue;
      list.push({
        id: `cm-${cm.id}`, at: cm.at, actorId: cm.authorId, icon: 'comment',
        text: `${first(cm.authorId)} respondeu no post${post ? ` "${post.text.slice(0, 40)}${post.text.length > 40 ? '…' : ''}"` : ''}: ${cm.text}`,
        href: { pathname: '/post/[id]', params: { id: postId } },
      });
    }
  }

  // Confirmações e mensagens nos convites.
  for (const [invId, msgs] of Object.entries(c.messages)) {
    const inv = c.invites.find((i) => i.id === invId);
    if (!inv) continue;
    for (const m of msgs) {
      if (m.authorId === 'me') continue;
      const confirm = m.text.startsWith('Confirmado');
      list.push({
        id: `msg-${m.id}`, at: m.at, actorId: m.authorId, icon: confirm ? 'check' : 'comment',
        text: confirm ? `${first(m.authorId)} confirmou presença em ${inv.title}.` : `${first(m.authorId)} no chat de ${inv.title}: ${m.text}`,
        href: confirm ? { pathname: '/convite/[id]', params: { id: invId } } : { pathname: '/convite/chat/[id]', params: { id: invId } },
      });
    }
  }

  const items = list.filter((n) => new Date(n.at).getTime() <= now).sort((a, b) => b.at.localeCompare(a.at));
  const seen = c.notifSeenAt ? new Date(c.notifSeenAt).getTime() : 0;
  const unread = items.filter((n) => new Date(n.at).getTime() > seen).length;
  return { items, unread, seenAt: seen, markSeen: c.markNotifSeen };
}
