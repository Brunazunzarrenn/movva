// Dados fictícios usados enquanto o backend (Supabase) não está ligado.
// Quando o banco entrar, as telas passam a ler daqui para as funções de API,
// mantendo os mesmos formatos.

export const sportsList = [
  'Corrida', 'Ciclismo', 'Natação', 'Triathlon', 'Futebol', 'Vôlei', 'Basquete', 'Academia',
  'Funcional', 'Crossfit', 'Caminhada', 'Tênis', 'Beach tennis', 'Lutas', 'Yoga', 'Trilha',
] as const;

export const levels = ['Iniciante', 'Intermediário', 'Avançado', 'Profissional'] as const;

export const me = {
  name: 'Rafael Costa',
  initials: 'RC',
  color: '#2E5BFF',
  bio: 'Atleta · Belo Horizonte · Triathlon amador',
  sports: ['Corrida', 'Ciclismo', 'Natação'],
  pro: true,
  followers: 1248,
  following: 312,
  workouts: 186,
};

export type FeedPost =
  | {
      kind: 'treino';
      id: string;
      author: string;
      initials: string;
      color: string;
      meta: string;
      text: string;
      verified: boolean;
      stats: { label: string; value: string }[];
      likes: number;
      comments: number;
      route?: string;
    }
  | { kind: 'conquista'; id: string; author: string; initials: string; color: string; text: string; rarity: 'Rara' | 'Épica' | 'Lendária' | 'Comum' };

export const feedSeguindo: FeedPost[] = [
  {
    kind: 'treino', id: 'p1', author: 'Mariana Souza', initials: 'MS', color: '#2E5BFF',
    meta: 'Corrida · hoje, 7:12 · Pampulha', text: 'Longão de domingo com a turma. Ritmo segurou até o fim!',
    verified: true, likes: 48, comments: 6,
    stats: [{ label: 'Distância', value: '10,2 km' }, { label: 'Ritmo', value: '5′12″/km' }, { label: 'Tempo', value: '53:04' }],
  },
  { kind: 'conquista', id: 'p2', author: 'Lucas Ribeiro', initials: 'LR', color: '#E2701C', text: 'conquistou a medalha do Desafio 100 km de Novembro', rarity: 'Rara' },
  {
    kind: 'treino', id: 'p3', author: 'Bruno Teles', initials: 'BT', color: '#1F9E6E',
    meta: 'Ciclismo · ontem · Serra do Curral', text: 'Subida do Mangabeiras antes do trabalho.',
    verified: true, likes: 31, comments: 2, route: 'M30 130 C80 120 120 90 160 95 S240 40 300 35',
    stats: [{ label: 'Distância', value: '42,8 km' }, { label: 'Vel. média', value: '26,4 km/h' }, { label: 'Subida', value: '640 m' }],
  },
];

export const feedPerto: FeedPost[] = [
  {
    kind: 'treino', id: 'p4', author: 'Fernanda Lopes', initials: 'FL', color: '#8E44D9',
    meta: 'Natação · ontem · Savassi · a 2 km', text: 'Primeiros 2 km sem parar! Meta de dezembro: 3 km.',
    verified: false, likes: 31, comments: 4,
    stats: [{ label: 'Distância', value: '2,0 km' }, { label: 'Tempo', value: '42:15' }, { label: 'Ritmo', value: '2:06 /100m' }],
  },
];

export const feedClubes: FeedPost[] = [
  {
    kind: 'treino', id: 'p5', author: 'Clube Giro BH', initials: 'GB', color: '#E2701C',
    meta: 'Ciclismo · há 3 h · evento do clube', text: 'Agenda do fim de semana aberta! Pedal da Serra no sábado, saída 06:30.',
    verified: true, likes: 112, comments: 18, route: 'M20 120 C70 100 100 60 160 70 S260 110 330 50',
    stats: [{ label: 'Distância', value: '60 km' }, { label: 'Nível', value: 'Intermediário' }, { label: 'Confirmados', value: '23' }],
  },
];
