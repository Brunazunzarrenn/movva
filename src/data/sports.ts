// Base oficial de esportes do MOVVA, separada por categoria.
// Esportes sugeridos pelos usuários (opção "Outro") entram aqui depois de aprovados
// no painel de administração (ver SportsStore).

export type SportCategory = { id: string; name: string; sports: string[] };

export const sportCategories: SportCategory[] = [
  {
    id: 'corrida',
    name: 'Corrida e caminhada',
    sports: ['Corrida de rua', 'Trail running', 'Atletismo', 'Caminhada', 'Trekking', 'Marcha atlética', 'Orientação'],
  },
  {
    id: 'ciclismo',
    name: 'Ciclismo',
    sports: ['Ciclismo de estrada', 'Mountain bike', 'Gravel', 'Ciclismo indoor', 'BMX', 'Cicloturismo'],
  },
  {
    id: 'aquaticos',
    name: 'Esportes aquáticos',
    sports: [
      'Natação', 'Águas abertas', 'Polo aquático', 'Saltos ornamentais', 'Nado artístico', 'Surfe', 'Bodyboard',
      'Stand up paddle', 'Remo', 'Canoagem', 'Caiaque', 'Vela', 'Kitesurf', 'Windsurf', 'Wakeboard', 'Mergulho', 'Hidroginástica',
    ],
  },
  {
    id: 'multi',
    name: 'Multiesportes',
    sports: ['Triathlon', 'Duathlon', 'Aquathlon', 'Corrida de aventura', 'Pentatlo moderno'],
  },
  {
    id: 'coletivos',
    name: 'Esportes coletivos',
    sports: [
      'Futebol', 'Futsal', 'Futebol society', 'Futevôlei', 'Beach soccer', 'Vôlei', 'Vôlei de praia', 'Basquete',
      'Basquete 3x3', 'Handebol', 'Rugby', 'Futebol americano', 'Flag football', 'Beisebol', 'Softbol', 'Hóquei',
      'Ultimate frisbee', 'Peteca',
    ],
  },
  {
    id: 'raquete',
    name: 'Raquete',
    sports: ['Tênis', 'Beach tennis', 'Padel', 'Squash', 'Badminton', 'Tênis de mesa', 'Pickleball', 'Frescobol'],
  },
  {
    id: 'lutas',
    name: 'Lutas e artes marciais',
    sports: [
      'Jiu-jítsu', 'Judô', 'Karatê', 'Taekwondo', 'Boxe', 'Muay thai', 'Kickboxing', 'MMA', 'Capoeira',
      'Luta olímpica', 'Kung fu', 'Esgrima',
    ],
  },
  {
    id: 'fitness',
    name: 'Academia e fitness',
    sports: [
      'Musculação', 'Crossfit', 'Funcional', 'Calistenia', 'HIIT', 'Pilates', 'Yoga', 'Dança', 'Ginástica',
      'Levantamento olímpico', 'Powerlifting',
    ],
  },
  {
    id: 'aventura',
    name: 'Aventura e radicais',
    sports: ['Escalada', 'Boulder', 'Montanhismo', 'Skate', 'Patins', 'Parkour', 'Rapel', 'Paraquedismo', 'Esqui', 'Snowboard'],
  },
  {
    id: 'outros',
    name: 'Outras modalidades',
    sports: ['Golfe', 'Hipismo', 'Ginástica artística', 'Ginástica rítmica', 'Tiro com arco'],
  },
];

// Compara nomes ignorando maiúsculas, acentos e espaços extras ("Jiu Jitsu" = "jiu-jítsu").
const ACCENTS: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a', é: 'e', ê: 'e', è: 'e', ë: 'e', í: 'i', î: 'i', ì: 'i', ï: 'i',
  ó: 'o', ô: 'o', õ: 'o', ò: 'o', ö: 'o', ú: 'u', û: 'u', ù: 'u', ü: 'u', ç: 'c', ñ: 'n',
};

export function normalizeSport(name: string) {
  return name
    .toLowerCase()
    .replace(/[áàâãäéêèëíîìïóôõòöúûùüçñ]/g, (c) => ACCENTS[c] ?? c)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Primeira letra maiúscula, resto como a pessoa digitou ("teqball" -> "Teqball").
export function tidySportName(name: string) {
  const t = name.trim().replace(/\s+/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}
