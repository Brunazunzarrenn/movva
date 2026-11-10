// Dados fictícios usados enquanto o backend (Supabase) não está ligado.
// Quando o banco entrar, as telas passam a ler daqui para as funções de API,
// mantendo os mesmos formatos.

export const levels = ['Iniciante', 'Intermediário', 'Avançado', 'Profissional'] as const;

export const me = {
  name: 'Rafael Costa',
  initials: 'RC',
  color: '#2E5BFF',
  bio: 'Atleta · Belo Horizonte · Triathlon amador',
  sports: ['Corrida de rua', 'Ciclismo de estrada', 'Natação'],
  pro: true,
  // Papel de administrador: libera o painel de esportes sugeridos.
  // No backend isso vira uma coluna `role` protegida por regras de acesso.
  isAdmin: true,
  followers: 1248,
  following: 312,
  workouts: 186,
};

// Posts, atletas e convites da comunidade de teste ficam em ./community.ts.
