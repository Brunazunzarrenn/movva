// Comunidade de TESTE: atletas, treinos e convites fictícios para você poder
// curtir, comentar, seguir, desafiar e treinar junto antes do backend existir.
// Com o Supabase isso vira as tabelas profiles, posts, comments, follows,
// duels, invites, invite_participants e invite_messages.

import type { Level, Profile } from '@/data/ProfileStore';
import { normalizeSport } from '@/data/sports';
import type { Rarity } from '@/theme/colors';

export type Athlete = {
  id: string;
  name: string;
  username: string;
  color: string;
  verified: boolean;
  club?: boolean;
  bio: string;
  region: string;
  level: Level;
  sports: string[];
  schedule: string; // horário preferido de treino
  followers: number;
  following: number;
  workouts: number;
  week: { km: number; treinos: number; subida: number; horas: number }; // usado nos duelos
};

export const athletes: Athlete[] = [
  {
    id: 'mariana', name: 'Mariana Souza', username: 'marianasouza', color: '#2E5BFF', verified: true,
    bio: 'Corredora de rua · 3 maratonas · treinando para Floripa.', region: 'Pampulha, Belo Horizonte', level: 'Avançado',
    sports: ['Corrida de rua', 'Trail running'], schedule: 'Manhã cedo', followers: 2340, following: 410, workouts: 412,
    week: { km: 46, treinos: 5, subida: 320, horas: 4.5 },
  },
  {
    id: 'bruno', name: 'Bruno Teles', username: 'brunoteles', color: '#1F9E6E', verified: true,
    bio: 'Ciclismo de estrada e MTB. Subida é comigo.', region: 'Mangabeiras, Belo Horizonte', level: 'Avançado',
    sports: ['Ciclismo de estrada', 'Mountain bike'], schedule: 'Madrugada', followers: 1280, following: 290, workouts: 305,
    week: { km: 210, treinos: 4, subida: 2600, horas: 8 },
  },
  {
    id: 'lucas', name: 'Lucas Ribeiro', username: 'lucasribeiro', color: '#E2701C', verified: false,
    bio: 'Triathlon amador. Primeiro 70.3 em março.', region: 'Lourdes, Belo Horizonte', level: 'Intermediário',
    sports: ['Triathlon', 'Corrida de rua', 'Natação'], schedule: 'Fim de tarde', followers: 640, following: 520, workouts: 198,
    week: { km: 38, treinos: 6, subida: 280, horas: 6 },
  },
  {
    id: 'fernanda', name: 'Fernanda Lopes', username: 'fernandalopes', color: '#8E44D9', verified: false,
    bio: 'Aprendendo a nadar de verdade aos 34.', region: 'Savassi, Belo Horizonte', level: 'Iniciante',
    sports: ['Natação', 'Funcional'], schedule: 'Manhã', followers: 212, following: 180, workouts: 64,
    week: { km: 6, treinos: 3, subida: 0, horas: 2.5 },
  },
  {
    id: 'paula', name: 'Paula Andrade', username: 'paulaandrade', color: '#C2410C', verified: false,
    bio: 'Vôlei de praia todo fim de tarde + funcional.', region: 'Savassi, Belo Horizonte', level: 'Intermediário',
    sports: ['Vôlei de praia', 'Funcional', 'Futevôlei'], schedule: 'Fim de tarde', followers: 530, following: 610, workouts: 140,
    week: { km: 0, treinos: 5, subida: 0, horas: 6.5 },
  },
  {
    id: 'diego', name: 'Diego Martins', username: 'diegomartins', color: '#0E7490', verified: true,
    bio: 'Trail e montanha. Se tem subida, eu vou.', region: 'Nova Lima', level: 'Avançado',
    sports: ['Trail running', 'Montanhismo', 'Mountain bike'], schedule: 'Fim de semana', followers: 1890, following: 350, workouts: 260,
    week: { km: 52, treinos: 4, subida: 1900, horas: 7 },
  },
  {
    id: 'girobh', name: 'Clube Giro BH', username: 'girobh', color: '#E2701C', verified: true, club: true,
    bio: 'Clube de ciclismo de BH. Pedais toda semana, todos os níveis.', region: 'Belo Horizonte', level: 'Intermediário',
    sports: ['Ciclismo de estrada'], schedule: 'Sábado cedo', followers: 4210, following: 12, workouts: 520,
    week: { km: 0, treinos: 0, subida: 0, horas: 0 },
  },
];

export const athleteById = (id: string) => athletes.find((a) => a.id === id);

/* ---------- Posts do feed ---------- */

export type SeedComment = { id: string; authorId: string; text: string; minutesAgo: number };

export type CommunityPost = {
  id: string;
  athleteId: string;
  kind: 'treino' | 'conquista';
  sport: string;
  place?: string;
  hoursAgo: number;
  text: string;
  stats?: { label: string; value: string }[];
  route?: string; // desenho do percurso (treinos ao ar livre)
  photo?: number; // ilustração (no app real, foto enviada)
  medal?: { name: string; rarity: Rarity };
  likes: number;
  comments: SeedComment[];
};

export const communityPosts: CommunityPost[] = [
  {
    id: 'pm1', athleteId: 'mariana', kind: 'treino', sport: 'Corrida', place: 'Pampulha', hoursAgo: 2,
    text: 'Longão com a turma. Ritmo segurou até o fim!', likes: 48,
    stats: [{ label: 'Distância', value: '10,2 km' }, { label: 'Ritmo', value: '5′12″/km' }, { label: 'Tempo', value: '53:04' }],
    route: 'M40 120 C70 60 110 50 150 70 S220 120 260 80 S300 30 320 40',
    comments: [
      { id: 'c1', authorId: 'lucas', text: 'Que ritmo! Semana que vem eu vou junto.', minutesAgo: 80 },
      { id: 'c2', authorId: 'paula', text: 'Pampulha lotada hoje, né?', minutesAgo: 45 },
    ],
  },
  {
    id: 'pg1', athleteId: 'girobh', kind: 'treino', sport: 'Ciclismo', place: 'evento do clube', hoursAgo: 3,
    text: 'Agenda do fim de semana aberta! Pedal da Serra no sábado, saída 06:30. Confirme no Bora Treinar?.', likes: 112,
    stats: [{ label: 'Distância', value: '60 km' }, { label: 'Nível', value: 'Intermediário' }, { label: 'Confirmados', value: '23' }],
    route: 'M20 120 C70 100 100 60 160 70 S260 110 330 50',
    comments: [{ id: 'c3', authorId: 'bruno', text: 'Presença confirmada.', minutesAgo: 120 }],
  },
  {
    id: 'pl1', athleteId: 'lucas', kind: 'conquista', sport: 'Corrida', hoursAgo: 5, text: 'conquistou a medalha',
    medal: { name: 'Desafio 100 km de Novembro', rarity: 'rara' }, likes: 27, comments: [],
  },
  {
    id: 'pp1', athleteId: 'paula', kind: 'treino', sport: 'Vôlei de praia', place: 'Arena Savassi', hoursAgo: 6,
    text: '3 sets com a dupla nova. Saque entrando!', likes: 36, photo: 1,
    stats: [{ label: 'Duração', value: '1:35:00' }, { label: 'Sets', value: '3' }, { label: 'Calorias', value: '640' }],
    comments: [{ id: 'c4', authorId: 'fernanda', text: 'Um dia eu aprendo esse saque.', minutesAgo: 200 }],
  },
  {
    id: 'pb1', athleteId: 'bruno', kind: 'treino', sport: 'Ciclismo', place: 'Serra do Curral', hoursAgo: 20,
    text: 'Subida do Mangabeiras antes do trabalho.', likes: 31,
    stats: [{ label: 'Distância', value: '42,8 km' }, { label: 'Vel. média', value: '26,4 km/h' }, { label: 'Subida', value: '640 m' }],
    route: 'M30 130 C80 120 120 90 160 95 S240 40 300 35',
    comments: [],
  },
  {
    id: 'pf1', athleteId: 'fernanda', kind: 'treino', sport: 'Natação', place: 'Savassi', hoursAgo: 26,
    text: 'Primeiros 2 km sem parar! Meta de dezembro: 3 km.', likes: 31, photo: 2,
    stats: [{ label: 'Distância', value: '2,0 km' }, { label: 'Tempo', value: '42:15' }, { label: 'Ritmo', value: '2:06 /100m' }],
    comments: [{ id: 'c5', authorId: 'lucas', text: 'Isso! Próximo passo: águas abertas.', minutesAgo: 900 }],
  },
  {
    id: 'pd1', athleteId: 'diego', kind: 'treino', sport: 'Trail running', place: 'Serra do Rola-Moça', hoursAgo: 30,
    text: '14 km de trilha com 900 m de subida. Pernas pedindo arrego.', likes: 54,
    stats: [{ label: 'Distância', value: '14,1 km' }, { label: 'Tempo', value: '1:58:20' }, { label: 'Subida', value: '912 m' }],
    route: 'M40 160 C70 120 90 140 120 110 S170 40 210 60 S260 140 300 110 S350 40 340 30',
    comments: [],
  },
  {
    id: 'pb2', athleteId: 'bruno', kind: 'conquista', sport: 'Ciclismo', hoursAgo: 48, text: 'conquistou a medalha',
    medal: { name: 'Pedal da Serra · 2º lugar', rarity: 'epica' }, likes: 64, comments: [],
  },
  {
    id: 'pl2', athleteId: 'lucas', kind: 'treino', sport: 'Natação', place: 'Lourdes', hoursAgo: 52,
    text: 'Piscina pensando no 70.3. Braçada mais longa hoje.', likes: 19,
    stats: [{ label: 'Distância', value: '2,5 km' }, { label: 'Tempo', value: '50:10' }, { label: 'Ritmo', value: '2:00 /100m' }],
    comments: [],
  },
  {
    id: 'pm2', athleteId: 'mariana', kind: 'treino', sport: 'Corrida', place: 'Pampulha', hoursAgo: 74,
    text: 'Intervalado 6×800. Sofrido, mas valeu.', likes: 40,
    stats: [{ label: 'Distância', value: '7,4 km' }, { label: 'Ritmo', value: '4′38″/km' }, { label: 'Tempo', value: '34:12' }],
    route: 'M50 110 C90 40 140 40 170 90 S250 130 290 60',
    comments: [],
  },
];

// Respostas automáticas dos atletas de teste quando você comenta ou manda mensagem.
export const autoReplies = [
  'Valeu demais! Bora junto na próxima?',
  'Obrigado! Foi puxado, mas deu certo.',
  'Haha, valeu! Semana que vem tem mais.',
  'Tamo junto! Se quiser, me chama no Bora Treinar?.',
];

/* ---------- Duelos 1×1 ---------- */

export type DuelMetric = 'km' | 'treinos' | 'subida' | 'horas';

export const duelMetrics: { id: DuelMetric; label: string; unit: string; help: string }[] = [
  { id: 'km', label: 'Mais quilômetros', unit: 'km', help: 'Soma a distância de corrida, pedal, natação e caminhada.' },
  { id: 'treinos', label: 'Mais treinos', unit: 'treinos', help: 'Vale qualquer esporte. Mínimo de 20 minutos por treino.' },
  { id: 'subida', label: 'Mais subida', unit: 'm', help: 'Altimetria acumulada. Bom para pedal e trilha.' },
  { id: 'horas', label: 'Mais tempo treinando', unit: 'h', help: 'Tempo em movimento somado no período.' },
];

export type Duel = {
  id: string;
  athleteId: string;
  metric: DuelMetric;
  days: number;
  note?: string;
  createdAt: string;
  status: 'aguardando' | 'aceito' | 'recusado';
  answeredAt?: string;
};

/* ---------- Bora Treinar? ---------- */

export type InviteVisibility = 'Público' | 'Seguidores' | 'Só convidados';

export type BoraInvite = {
  id: string;
  hostId: string; // id do atleta ou 'me'
  sport: string;
  title: string;
  start: string; // ISO
  place: string;
  level: Level | 'Todos os níveis';
  pace?: string;
  distance?: string;
  spots: number;
  participants: string[]; // ids (sem contar você)
  invited: string[]; // convidados ('me' = você)
  visibility: InviteVisibility;
  note?: string;
  route?: string;
};

export type ChatMessage = { id: string; authorId: string; text: string; at: string };

// Convites de teste com horários relativos a agora (o primeiro já está com check-in aberto).
export function seedInvites(now = new Date()) {
  const at = (dayOffset: number, h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const soon = new Date(now.getTime() + 20 * 60000);
  soon.setMinutes(Math.ceil(soon.getMinutes() / 5) * 5, 0, 0);
  const evening = at(0, 18, 30);
  const volei = evening.getTime() > now.getTime() + 60 * 60000 ? evening : at(1, 18, 30);
  const ago = (min: number) => new Date(now.getTime() - min * 60000).toISOString();

  const invites: BoraInvite[] = [
    {
      id: 'b1', hostId: 'mariana', sport: 'Corrida de rua', title: 'Rodagem leve na Pampulha', start: soon.toISOString(),
      place: 'Pampulha · em frente ao Mineirão', level: 'Intermediário', pace: '5′30″ a 6′00″/km', distance: '8 km', spots: 8,
      participants: ['mariana', 'lucas', 'paula'], invited: ['me'], visibility: 'Público',
      note: 'Ritmo de conversa. Ninguém fica para trás.', route: 'M40 120 C70 60 110 50 150 70 S220 120 260 80 S300 30 320 40',
    },
    {
      id: 'b2', hostId: 'paula', sport: 'Vôlei de praia', title: 'Vôlei de dupla no fim de tarde', start: volei.toISOString(),
      place: 'Arena Savassi · quadra 2', level: 'Todos os níveis', spots: 4, participants: ['paula'], invited: [], visibility: 'Público',
      note: 'Quadra já reservada. Falta completar as duplas.',
    },
    {
      id: 'b3', hostId: 'bruno', sport: 'Ciclismo de estrada', title: 'Subida do Mangabeiras', start: at(1, 5, 45).toISOString(),
      place: 'Praça do Papa', level: 'Avançado', distance: '35 km', pace: '25 a 28 km/h no plano', spots: 10,
      participants: ['bruno', 'diego'], invited: [], visibility: 'Público', note: 'Saída pontual. Traga luz traseira.',
      route: 'M30 130 C80 120 120 90 160 95 S240 40 300 35',
    },
    {
      id: 'b4', hostId: 'fernanda', sport: 'Natação', title: 'Técnica de crawl · 1,5 km', start: at(2, 7, 0).toISOString(),
      place: 'Minas Tênis Clube', level: 'Iniciante', distance: '1,5 km', spots: 6, participants: ['fernanda'], invited: [], visibility: 'Público',
      note: 'Educativos e séries curtas. Ótimo para quem está começando.',
    },
    {
      id: 'b5', hostId: 'diego', sport: 'Trail running', title: 'Trilha da Serra do Rola-Moça', start: at(3, 6, 30).toISOString(),
      place: 'Portaria do Parque do Rola-Moça', level: 'Avançado', distance: '14 km', pace: 'Sem pressa nas subidas', spots: 8,
      participants: ['diego', 'mariana'], invited: [], visibility: 'Público', note: 'Leve água (1 L) e tênis de trilha.',
      route: 'M40 160 C70 120 90 140 120 110 S170 40 210 60 S260 140 300 110 S350 40 340 30',
    },
    {
      id: 'b6', hostId: 'girobh', sport: 'Ciclismo de estrada', title: 'Pedal da Serra', start: at(4, 6, 30).toISOString(),
      place: 'Sede do clube · Av. Afonso Pena', level: 'Intermediário', distance: '60 km', spots: 40,
      participants: ['girobh', 'bruno', 'diego', 'lucas'], invited: [], visibility: 'Público', note: 'Carro de apoio e parada para café no km 30.',
      route: 'M20 120 C70 100 100 60 160 70 S260 110 330 50',
    },
  ];

  const chats: Record<string, ChatMessage[]> = {
    b1: [
      { id: 'b1m1', authorId: 'mariana', text: 'Bora, pessoal! Vou estar de camiseta verde.', at: ago(90) },
      { id: 'b1m2', authorId: 'lucas', text: 'Tô dentro. Chego 5 min antes.', at: ago(60) },
      { id: 'b1m3', authorId: 'paula', text: 'Alguém sabe se o estacionamento está aberto?', at: ago(25) },
    ],
    b2: [{ id: 'b2m1', authorId: 'paula', text: 'Quadra reservada! Quem vem?', at: ago(120) }],
    b3: [
      { id: 'b3m1', authorId: 'bruno', text: 'Saída 05:45 em ponto, ok?', at: ago(300) },
      { id: 'b3m2', authorId: 'diego', text: 'Fechado.', at: ago(280) },
    ],
    b4: [{ id: 'b4m1', authorId: 'fernanda', text: 'Primeira vez que eu organizo um treino, sejam gentis.', at: ago(400) }],
    b5: [{ id: 'b5m1', authorId: 'diego', text: 'Previsão de tempo seco. Vai ser bonito lá em cima.', at: ago(500) }],
    b6: [{ id: 'b6m1', authorId: 'girobh', text: 'Confirmem presença para a gente organizar o carro de apoio.', at: ago(700) }],
  };

  return { invites, chats };
}

/* ---------- Utilidades ---------- */

// Janela de check-in: de 30 min antes até 2 h depois do horário marcado.
export function inviteStatus(start: string, now = Date.now()) {
  const t = new Date(start).getTime();
  if (now < t - 30 * 60000) return 'em-breve' as const;
  if (now <= t + 2 * 3600000) return 'check-in' as const;
  return 'encerrado' as const;
}

const WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function whenLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const day0 = new Date(now); day0.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - day0.getTime()) / 86400000);
  if (diff === 0) return `Hoje · ${hm}`;
  if (diff === 1) return `Amanhã · ${hm}`;
  return `${WEEK[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} · ${hm}`;
}

export function agoLabel(minutes: number) {
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${Math.round(minutes)} min`;
  const h = Math.round(minutes / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'ontem' : `há ${d} dias`;
}

export const minutesSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 60000;

const LEVEL_N: Record<Level, number> = { Iniciante: 0, Intermediário: 1, Avançado: 2, Profissional: 3 };

// Compatibilidade entre você e outro atleta: esportes, nível e região.
export function compatibility(me: Pick<Profile, 'sports' | 'level' | 'region'> | null, a: Athlete) {
  if (!me) return { score: 0, reasons: [] as string[], shared: [] as string[] };
  const mine = new Set(me.sports.map(normalizeSport));
  const shared = a.sports.filter((x) => mine.has(normalizeSport(x)));
  const lv = Math.abs(LEVEL_N[me.level] - LEVEL_N[a.level]);
  const words = (t: string) => t.toLowerCase().split(/[\s,·-]+/).filter((w) => w.length > 3);
  const myWords = new Set(words(me.region));
  const sameArea = words(a.region).filter((w) => myWords.has(w));
  const nearHood = sameArea.length > 0 && !['belo', 'horizonte'].includes(sameArea[0]);

  let score = 20;
  if (shared.length >= 1) score += 40;
  if (shared.length >= 2) score += 10;
  score += lv === 0 ? 20 : lv === 1 ? 12 : 3;
  score += nearHood ? 9 : sameArea.length ? 6 : 0;
  score = Math.min(99, score);

  const reasons: string[] = [];
  if (shared.length) reasons.push(shared.length === 1 ? `Também faz ${shared[0]}` : `${shared.length} esportes em comum`);
  reasons.push(lv === 0 ? 'Mesmo nível' : lv === 1 ? 'Nível parecido' : `Nível ${a.level.toLowerCase()}`);
  if (sameArea.length) reasons.push('Treina perto de você');
  reasons.push(`Prefere ${a.schedule.toLowerCase()}`);
  return { score, reasons, shared };
}
