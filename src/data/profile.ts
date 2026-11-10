// Dados fictícios do perfil do atleta. Cada tipo aqui vira uma tabela no Supabase:
// medals, workouts, posts, comments e personal_records.

import type { Rarity } from '@/theme/colors';

export type Medal = {
  id: string;
  mark: string; // texto curto dentro da medalha
  name: string;
  rarity: Rarity;
  sport: string;
  date: string;
  description: string;
  highlight?: { label: string; value: string };
};

export const medals: Medal[] = [
  { id: 'm1', mark: '1º', name: 'Campeão · Meia de BH', rarity: 'lendaria', sport: 'Corrida', date: '14/09/2026', description: '1º lugar na categoria 30 a 39 anos da Meia Maratona de BH, com treino verificado.', highlight: { label: 'Tempo', value: '1:31:47' } },
  { id: 'm2', mark: '2º', name: 'Pedal da Serra', rarity: 'epica', sport: 'Ciclismo', date: '01/11/2026', description: '2º lugar no desafio de subida do Clube Giro BH.', highlight: { label: 'Subida', value: '1.120 m' } },
  { id: 'm3', mark: '100', name: '100 km de Outubro', rarity: 'rara', sport: 'Corrida', date: '31/10/2026', description: 'Completou 100 km de corrida em outubro.', highlight: { label: 'Total', value: '104 km' } },
  { id: 'm4', mark: '5K', name: 'Sub 25 nos 5 km', rarity: 'rara', sport: 'Corrida', date: '02/11/2026', description: 'Correu 5 km em menos de 25 minutos.', highlight: { label: 'Tempo', value: '24:38' } },
  { id: 'm5', mark: '7d', name: '7 dias seguidos', rarity: 'comum', sport: 'Qualquer esporte', date: '20/10/2026', description: 'Treinou 7 dias seguidos.' },
  { id: 'm6', mark: '1º', name: 'Primeiro treino', rarity: 'comum', sport: 'Qualquer esporte', date: '03/02/2026', description: 'Registrou o primeiro treino no MOVVA.' },
];

export type WorkoutSport = 'Corrida' | 'Ciclismo' | 'Natação';

export type Workout = {
  id: string;
  sport: WorkoutSport;
  title: string;
  when: string;
  distance: string;
  duration: string;
  stats: { label: string; value: string }[];
  route: string;
  elevation?: number[]; // perfil de altimetria (metros)
  partners?: { initials: string; color: string }[];
  partnersLabel?: string;
};

export const sportColor: Record<WorkoutSport, string> = { Corrida: '#2E5BFF', Ciclismo: '#E2701C', Natação: '#0E7490' };

export const workouts: Workout[] = [
  {
    id: 'w1', sport: 'Ciclismo', title: 'Pedal da Serra', when: 'sáb, 01/11 · 06:34', distance: '62,4 km', duration: '2:18:40',
    route: 'M40 160 C70 120 90 140 120 110 S170 40 210 60 S260 140 300 110 S350 40 340 30',
    stats: [
      { label: 'Distância', value: '62,4 km' }, { label: 'Tempo', value: '2:18:40' }, { label: 'Vel. média', value: '27,0 km/h' },
      { label: 'Subida', value: '1.120 m' }, { label: 'FC média', value: '148 bpm' }, { label: 'Calorias', value: '1.540' },
    ],
    elevation: [880, 920, 980, 1080, 1180, 1320, 1420, 1360, 1240, 1260, 1120, 980, 900],
    partners: [{ initials: 'GB', color: '#E2701C' }, { initials: 'BT', color: '#1F9E6E' }, { initials: 'RN', color: '#0E7490' }],
    partnersLabel: 'Clube Giro BH e mais 21',
  },
  {
    id: 'w2', sport: 'Corrida', title: 'Regenerativo na Pampulha', when: 'qui, 30/10 · 06:10', distance: '8,1 km', duration: '45:02',
    route: 'M40 120 C70 60 110 50 150 70 S220 120 260 80 S300 30 320 40',
    stats: [
      { label: 'Distância', value: '8,1 km' }, { label: 'Tempo', value: '45:02' }, { label: 'Ritmo', value: '5′33″/km' },
      { label: 'Subida', value: '42 m' }, { label: 'FC média', value: '138 bpm' }, { label: 'Calorias', value: '540' },
    ],
    elevation: [800, 805, 812, 808, 815, 820, 812, 806, 802],
  },
  {
    id: 'w3', sport: 'Natação', title: 'Piscina · técnica', when: 'qua, 29/10 · 19:00', distance: '2,0 km', duration: '42:15',
    route: 'M60 40 H290 V60 H60 V80 H290 V100 H60 V120 H290',
    stats: [
      { label: 'Distância', value: '2,0 km' }, { label: 'Tempo', value: '42:15' }, { label: 'Ritmo', value: '2:06 /100m' },
      { label: 'Piscinas', value: '80' }, { label: 'FC média', value: '132 bpm' }, { label: 'Calorias', value: '410' },
    ],
  },
  {
    id: 'w4', sport: 'Corrida', title: 'Intervalado 6×800 m', when: 'ter, 28/10 · 06:00', distance: '9,6 km', duration: '48:30',
    route: 'M50 110 C90 40 140 40 170 90 S250 130 290 60',
    stats: [
      { label: 'Distância', value: '9,6 km' }, { label: 'Tempo', value: '48:30' }, { label: 'Ritmo', value: '5′03″/km' },
      { label: 'Subida', value: '38 m' }, { label: 'FC média', value: '156 bpm' }, { label: 'Calorias', value: '690' },
    ],
  },
  {
    id: 'w5', sport: 'Ciclismo', title: 'Rolo · Z2', when: 'seg, 27/10 · 20:00', distance: '30,0 km', duration: '1:00:00',
    route: 'M40 75 H310',
    stats: [
      { label: 'Distância', value: '30,0 km' }, { label: 'Tempo', value: '1:00:00' }, { label: 'Vel. média', value: '30,0 km/h' },
      { label: 'Potência', value: '182 W' }, { label: 'FC média', value: '128 bpm' }, { label: 'Calorias', value: '620' },
    ],
  },
];

// Fotos ilustrativas: céu (gradiente), sol, morro ao fundo e chão.
export type PhotoArt = { sky: [string, string, ...string[]]; sun: string; far: string; near: string; sunX: number };

export const photoArts: PhotoArt[] = [
  { sky: ['#2B1B4A', '#E2701C', '#F5C542'], sun: '#FFE08A', far: '#3A2440', near: '#1A1220', sunX: 70 },
  { sky: ['#4DA3FF', '#BFE3FF'], sun: '#FFF4C2', far: '#2E6B45', near: '#1B3D28', sunX: 25 },
  { sky: ['#0E7490', '#7DD3C0'], sun: '#F3F5F2', far: '#36505A', near: '#1F2D33', sunX: 80 },
  { sky: ['#8E44D9', '#F59EBB'], sun: '#FFE08A', far: '#4A2B5E', near: '#2A1838', sunX: 40 },
  { sky: ['#7A3A0C', '#E2A35C'], sun: '#FFE8C2', far: '#5A3214', near: '#2A1608', sunX: 60 },
  { sky: ['#5F6B66', '#C9D2CD'], sun: '#F3F5F2', far: '#46524C', near: '#2C3630', sunX: 30 },
  { sky: ['#12301D', '#7BC46A'], sun: '#F3F5F2', far: '#1E4A2C', near: '#0B1F14', sunX: 55 },
  { sky: ['#1E3A8A', '#93C5FD'], sun: '#FFF4C2', far: '#1F3F66', near: '#0F2440', sunX: 20 },
  { sky: ['#9A3412', '#FDBA74'], sun: '#FFE8C2', far: '#6B2A10', near: '#3A1608', sunX: 75 },
];

export type Comment = { id: string; author: string; initials: string; color: string; time: string; text: string };

export type Post = {
  id: string;
  photos: number[]; // índices em photoArts
  text: string;
  when: string;
  workoutId?: string;
  likes: number;
  comments: Comment[];
};

export const myPosts: Post[] = [
  {
    id: 'mp1', photos: [0, 1], workoutId: 'w1', when: 'sáb, 01/11', likes: 92,
    text: 'Subida da serra ao amanhecer com o pessoal do Giro. 62 km e 1.120 m de altimetria. Valeu cada pedalada!',
    comments: [
      { id: 'c1', author: 'Bruno Teles', initials: 'BT', color: '#1F9E6E', time: '2 h', text: 'Que vista! Sábado que vem tô junto.' },
      { id: 'c2', author: 'Clube Giro BH', initials: 'GB', color: '#E2701C', time: '2 h', text: 'Pedal top! Já tem foto do grupo no nosso perfil.' },
      { id: 'c3', author: 'Camila Duarte', initials: 'CD', color: '#C2410C', time: '1 h', text: '27 de média com essa subida? Absurdo!' },
    ],
  },
  { id: 'mp2', photos: [2], workoutId: 'w3', when: 'qua, 29/10', likes: 40, text: 'Dia de técnica na piscina.', comments: [] },
  { id: 'mp3', photos: [3], when: 'dom, 26/10', likes: 55, text: 'Fim de tarde na lagoa.', comments: [] },
  { id: 'mp4', photos: [4], when: 'sáb, 25/10', likes: 61, text: 'Café pós-pedal é sagrado.', comments: [] },
  { id: 'mp5', photos: [5], when: 'qui, 23/10', likes: 33, text: 'Serra com neblina.', comments: [] },
  { id: 'mp6', photos: [6], workoutId: 'w2', when: 'ter, 21/10', likes: 48, text: 'Regenerativo.', comments: [] },
  { id: 'mp7', photos: [7], when: 'dom, 19/10', likes: 70, text: 'Corrida da Liberdade 10K: 51:20!', comments: [] },
  { id: 'mp8', photos: [8], when: 'sáb, 18/10', likes: 39, text: 'Por do sol no pedal.', comments: [] },
  { id: 'mp9', photos: [1], when: 'qua, 15/10', likes: 27, text: 'Treino com a turma.', comments: [] },
];

// Minha Evolução
export type EvolutionMetric = {
  key: string;
  label: string;
  title: string;
  values: number[];
  xLabels: string[];
  current: string;
  delta: string;
  note: string;
  invert?: boolean; // menor é melhor (pace)
};

const months = ['jun', 'jul', 'ago', 'set', 'out', 'nov'];

export const evolution: EvolutionMetric[] = [
  { key: 'corrida', label: 'Corrida', title: 'Pace médio na corrida', values: [385, 378, 370, 362, 365, 341], xLabels: months, current: '5′41″/km', delta: '24 s/km mais rápido', note: 'Quanto mais alto no gráfico, mais rápido.', invert: true },
  { key: 'ciclismo', label: 'Ciclismo', title: 'Velocidade média no pedal', values: [24.1, 24.8, 25.6, 25.2, 26.1, 27.0], xLabels: months, current: '27,0 km/h', delta: '+3% sobre outubro', note: 'Média dos pedais ao ar livre.' },
  { key: 'natacao', label: 'Natação', title: 'Volume semanal de natação', values: [1.0, 1.5, 1.0, 2.0, 1.5, 2.0, 2.5, 2.0], xLabels: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'], current: '2,0 km nesta semana', delta: '+75% no mês', note: 'Últimas 8 semanas.' },
  { key: 'altimetria', label: 'Altimetria', title: 'Subida acumulada por mês', values: [2100, 2600, 3400, 3900, 3500, 4800], xLabels: months, current: '4.800 m', delta: '+37% sobre outubro', note: 'Soma de corrida e pedal.' },
];

export const monthCompare = [
  { label: 'Corrida', before: '35 km', after: '51,8 km', change: '+48%' },
  { label: 'Ciclismo', before: '120 km', after: '180 km', change: '+50%' },
  { label: 'Natação', before: '4 km', after: '7 km', change: '+75%' },
  { label: 'Treinos', before: '12', after: '18', change: '+50%' },
];

export type RecordItem = { id: string; group: 'Corrida' | 'Pedal' | 'Natação' | 'Geral'; label: string; value: string; date: string; isNew?: boolean; workoutId?: string };

export const records: RecordItem[] = [
  { id: 'r1', group: 'Corrida', label: '5 km mais rápido', value: '24:38', date: '02/11/2026 · Pampulha', isNew: true, workoutId: 'w4' },
  { id: 'r2', group: 'Corrida', label: '10 km mais rápido', value: '51:20', date: '19/10/2026 · Lagoa' },
  { id: 'r3', group: 'Corrida', label: 'Maior distância correndo', value: '21,1 km', date: '14/09/2026 · Meia de BH' },
  { id: 'r4', group: 'Pedal', label: 'Maior distância de pedal', value: '104 km', date: '17/08/2026 · Estrada Real' },
  { id: 'r5', group: 'Pedal', label: 'Maior altimetria em um treino', value: '1.120 m', date: '01/11/2026 · Pedal da Serra', isNew: true, workoutId: 'w1' },
  { id: 'r6', group: 'Natação', label: 'Maior distância nadando', value: '2,5 km', date: '22/10/2026 · piscina' },
  { id: 'r7', group: 'Geral', label: 'Maior sequência de treinos', value: '12 semanas', date: 'em andamento' },
];
