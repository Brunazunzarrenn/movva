// Arena de TESTE: desafios, trechos (competições sem inscrição), rankings e
// territórios. Com o Supabase isso vira challenges, challenge_members,
// segments, segment_efforts e territory_scores, calculados a partir dos treinos.

import { activitySpec } from '@/data/activity';
import { athletes, type Athlete } from '@/data/community';
import type { Rarity } from '@/theme/colors';

/* ---------- Desafios ---------- */

export type GoalType = 'dist' | 'dias' | 'tempo' | 'treinos' | 'alt';

export const goalTypes: { id: GoalType; label: string; unit: string; step: number; def: number; help: string }[] = [
  { id: 'dist', label: 'Distância', unit: 'km', step: 10, def: 100, help: 'Soma os km dos treinos.' },
  { id: 'dias', label: 'Dias de treino', unit: 'dias', step: 1, def: 20, help: 'Dias com pelo menos 1 treino.' },
  { id: 'tempo', label: 'Tempo total', unit: 'h', step: 1, def: 15, help: 'Horas treinadas somadas.' },
  { id: 'treinos', label: 'Nº de treinos', unit: 'treinos', step: 1, def: 16, help: 'Quantidade de treinos feitos.' },
  { id: 'alt', label: 'Altimetria', unit: 'm', step: 500, def: 5000, help: 'Metros de subida acumulados.' },
];

// Desafio pode ser de qualquer esporte da base. 'Corrida', 'Pedal' e 'Natação' são grupos
// (valem todas as variações: corrida de rua, trail, estrada, MTB…) e 'Qualquer esporte' vale tudo.
export const ANY_SPORT = 'Qualquer esporte';
export const sportGroups: Record<string, 'corrida' | 'pedal' | 'natacao'> = { Corrida: 'corrida', Pedal: 'pedal', Natação: 'natacao' };
export type ChallengeSport = string;

// Metas que fazem sentido para cada esporte: musculação não tem distância,
// natação em piscina não tem subida, corrida tem tudo.
export function goalsFor(sport: string): GoalType[] {
  if (sport === ANY_SPORT) return ['dias', 'treinos', 'tempo'];
  if (sportGroups[sport]) return sport === 'Natação' ? ['dist', 'dias', 'treinos', 'tempo'] : ['dist', 'dias', 'treinos', 'tempo', 'alt'];
  const sp = activitySpec(sport);
  if (sp.kind === 'tempo') return ['dias', 'treinos', 'tempo'];
  if (sp.kind === 'piscina' || sp.kind === 'multi' || sp.speed === 'pace100') return ['dist', 'dias', 'treinos', 'tempo'];
  return sp.group === 'corrida' || sp.group === 'pedal' || sport === 'Montanhismo'
    ? ['dist', 'dias', 'treinos', 'tempo', 'alt']
    : ['dist', 'dias', 'treinos', 'tempo'];
}

// Meta inicial sugerida conforme o esporte.
export function defaultTarget(sport: string, goal: GoalType) {
  const g = goalTypes.find((x) => x.id === goal)!;
  if (goal !== 'dist') return g.def;
  const sp = sportGroups[sport] ?? activitySpec(sport).group;
  return sp === 'pedal' ? 300 : sp === 'natacao' ? 10 : g.def;
}

export type MedalStyle = { mark: string; rarity: Rarity; palette?: number }; // palette = medalha personalizada (Pro)

export const medalPalettes = [
  { name: 'Ouro', ring: '#F5C542', bg: '#2A2410', fg: '#F5C542' },
  { name: 'Verde', ring: '#39FF14', bg: '#0B1F14', fg: '#7BFF5E' },
  { name: 'Azul', ring: '#4DA3FF', bg: '#142233', fg: '#7DBBFF' },
  { name: 'Roxo', ring: '#B57BFF', bg: '#221A2E', fg: '#CBA3FF' },
];

export type Challenge = {
  id: string;
  title: string;
  sport: ChallengeSport;
  goal: GoalType;
  target: number;
  start: string; // ISO
  end: string; // ISO
  visibility: 'Público' | 'Privado';
  creatorId: string; // 'movva' (oficial), id do atleta ou 'me'
  description: string;
  medal: MedalStyle;
  progress: Record<string, number>; // progresso dos atletas de teste
  crowd: number; // participantes além dos atletas de teste (desafios oficiais)
  invited: string[];
};

function monthRange(now = new Date()) {
  const s = new Date(now.getFullYear(), now.getMonth(), 1);
  const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start: s.toISOString(), end: e.toISOString() };
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function seedChallenges(now = new Date()): Challenge[] {
  const month = monthRange(now);
  const mName = MONTHS[now.getMonth()];
  const daysFrom = (a: number, b: number) => {
    const s = new Date(now); s.setDate(s.getDate() + a); s.setHours(0, 0, 0, 0);
    const e = new Date(now); e.setDate(e.getDate() + b); e.setHours(23, 59, 59, 0);
    return { start: s.toISOString(), end: e.toISOString() };
  };
  return [
    {
      id: 'c100km', title: `100 km de ${mName}`, sport: 'Corrida', goal: 'dist', target: 100, ...month, visibility: 'Público', creatorId: 'movva',
      description: 'Desafio oficial do mês. Some 100 km de corrida até o último dia e ganhe a medalha rara.',
      medal: { mark: '100', rarity: 'rara' }, progress: { mariana: 87, diego: 71, lucas: 62 }, crowd: 1284, invited: [],
    },
    {
      id: 'c20dias', title: '20 dias ativos', sport: 'Qualquer esporte', goal: 'dias', target: 20, ...month, visibility: 'Público', creatorId: 'movva',
      description: 'Treine em 20 dias diferentes no mês. Vale qualquer esporte, mínimo de 20 minutos.',
      medal: { mark: '20d', rarity: 'comum' }, progress: { paula: 9, lucas: 10, fernanda: 6, mariana: 9 }, crowd: 3410, invited: [],
    },
    {
      id: 'c5000m', title: 'Escalador do mês', sport: 'Pedal', goal: 'alt', target: 5000, ...month, visibility: 'Público', creatorId: 'movva',
      description: 'Acumule 5.000 m de subida pedalando. As serras de BH ajudam.',
      medal: { mark: '5K', rarity: 'epica' }, progress: { bruno: 4120, diego: 2650 }, crowd: 612, invited: [],
    },
    {
      id: 'cnat10', title: 'Natação 10 km', sport: 'Natação', goal: 'dist', target: 10, ...month, visibility: 'Público', creatorId: 'movva',
      description: 'Nade 10 km no mês, em piscina ou águas abertas.',
      medal: { mark: '10', rarity: 'rara' }, progress: { fernanda: 4.5, lucas: 7.5 }, crowd: 388, invited: [],
    },
    {
      id: 'cmadrugada', title: 'Pedal da Madrugada', sport: 'Pedal', goal: 'treinos', target: 12, ...daysFrom(-6, 23), visibility: 'Público', creatorId: 'bruno',
      description: '12 pedais antes das 7h em um mês. Quem completa ganha a medalha da madrugada.',
      medal: { mark: '5h', rarity: 'rara', palette: 2 }, progress: { bruno: 5, diego: 3 }, crowd: 18, invited: [],
    },
    {
      id: 'crumo42', title: 'Rumo aos 42 km', sport: 'Corrida', goal: 'dist', target: 160, ...daysFrom(-3, 26), visibility: 'Privado', creatorId: 'mariana',
      description: 'Grupo fechado de quem vai correr a maratona de Floripa. 160 km em 30 dias.',
      medal: { mark: '42', rarity: 'epica', palette: 0 }, progress: { mariana: 28, lucas: 19 }, crowd: 0, invited: ['me'],
    },
  ];
}

export const creatorName = (id: string) => (id === 'movva' ? 'MOVVA' : id === 'me' ? 'Você' : athletes.find((a) => a.id === id)?.name ?? 'Atleta');

export function fmtGoal(v: number, goal: GoalType) {
  let unit = goalTypes.find((g) => g.id === goal)?.unit ?? '';
  if (v === 1 && unit === 'treinos') unit = 'treino';
  if (v === 1 && unit === 'dias') unit = 'dia';
  const n = goal === 'alt' ? Math.round(v).toLocaleString('pt-BR') : String(Math.round(v * 10) / 10).replace('.', ',');
  return `${n} ${unit}`;
}

export function daysLeft(end: string) {
  return Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86400000));
}

/* ---------- Trechos e competições (sem inscrição) ---------- */

export type Effort = { athleteId: string; time: string; date: string };

export type Segment = {
  id: string;
  name: string;
  sport: 'Corrida' | 'Pedal' | 'Trilha';
  distance: string;
  grade: string;
  place: string;
  route: string;
  efforts: Effort[]; // ordenado do mais rápido para o mais lento
};

export const segments: Segment[] = [
  {
    id: 'mangabeiras', name: 'Subida do Mangabeiras', sport: 'Pedal', distance: '4,2 km', grade: '6,1% de média', place: 'Av. José do Patrocínio Pontes',
    route: 'M30 130 C80 120 120 90 160 95 S240 40 300 35',
    efforts: [
      { athleteId: 'bruno', time: '12:48', date: '08/11' },
      { athleteId: 'diego', time: '13:55', date: '02/11' },
      { athleteId: 'lucas', time: '17:20', date: '30/10' },
    ],
  },
  {
    id: 'lagoa', name: 'Volta da Lagoa da Pampulha', sport: 'Corrida', distance: '17,5 km', grade: 'plano', place: 'Orla da Lagoa da Pampulha',
    route: 'M60 75 C60 20 290 20 290 75 S60 130 60 75',
    efforts: [
      { athleteId: 'mariana', time: '1:24:10', date: '09/11' },
      { athleteId: 'diego', time: '1:26:42', date: '25/10' },
      { athleteId: 'lucas', time: '1:38:05', date: '03/11' },
    ],
  },
  {
    id: 'mineirao', name: 'Reta do Mineirão', sport: 'Corrida', distance: '1 km', grade: 'plano', place: 'Av. Antônio Abrahão Caram',
    route: 'M40 100 L310 60',
    efforts: [
      { athleteId: 'lucas', time: '3:21', date: '05/11' },
      { athleteId: 'mariana', time: '3:29', date: '09/11' },
      { athleteId: 'paula', time: '4:52', date: '01/11' },
    ],
  },
  {
    id: 'rolamoca', name: 'Subida do Rola-Moça', sport: 'Trilha', distance: '3,1 km', grade: '+420 m', place: 'Parque Estadual da Serra do Rola-Moça',
    route: 'M40 140 C70 120 90 130 120 100 S170 40 210 50 S290 30 320 20',
    efforts: [
      { athleteId: 'diego', time: '24:15', date: '07/11' },
      { athleteId: 'mariana', time: '27:40', date: '18/10' },
    ],
  },
];

/* ---------- Ranking semanal ---------- */

export type RankMetric = 'km' | 'treinos' | 'horas';

export const rankMetrics: { id: RankMetric; label: string; unit: string }[] = [
  { id: 'km', label: 'Distância', unit: 'km' },
  { id: 'treinos', label: 'Treinos', unit: 'treinos' },
  { id: 'horas', label: 'Tempo', unit: 'h' },
];

export function rankingOf(list: Athlete[], metric: RankMetric) {
  return list
    .filter((a) => !a.club)
    .map((a) => ({ id: a.id, value: a.week[metric] }))
    .sort((x, y) => y.value - x.value);
}

/* ---------- Territórios ---------- */

export type Territory = { id: string; name: string; color: string; board: { athleteId: string; workouts: number }[] };

// Quem mais treina numa área no mês vira o dono dela.
export const territories: Territory[] = [
  { id: 'P', name: 'Pampulha', color: '#2E5BFF', board: [{ athleteId: 'mariana', workouts: 14 }, { athleteId: 'lucas', workouts: 6 }, { athleteId: 'paula', workouts: 2 }] },
  { id: 'S', name: 'Savassi', color: '#C2410C', board: [{ athleteId: 'paula', workouts: 12 }, { athleteId: 'fernanda', workouts: 9 }] },
  { id: 'M', name: 'Mangabeiras', color: '#1F9E6E', board: [{ athleteId: 'bruno', workouts: 15 }, { athleteId: 'diego', workouts: 4 }] },
  { id: 'C', name: 'Centro', color: '#8E44D9', board: [{ athleteId: 'fernanda', workouts: 5 }, { athleteId: 'lucas', workouts: 3 }] },
  { id: 'L', name: 'Lourdes', color: '#E2701C', board: [{ athleteId: 'lucas', workouts: 11 }, { athleteId: 'paula', workouts: 3 }] },
  { id: 'B', name: 'Barreiro', color: '#64748B', board: [] },
  { id: 'V', name: 'Nova Lima', color: '#0E7490', board: [{ athleteId: 'diego', workouts: 17 }, { athleteId: 'bruno', workouts: 5 }] },
];

// Mapa simplificado de BH em blocos (cada letra é uma área).
export const territoryMap = ['PPSSMM', 'PPSSMM', 'PPCCML', 'BPCCLL', 'BBCCLL', 'BBVVVL', 'BVVVVV'];
