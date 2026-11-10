import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { normalizeSport, sportCategories, tidySportName, type SportCategory } from './sports';

// Guarda a base de esportes e as sugestões feitas pelos usuários.
// Hoje fica salvo no aparelho (para testar o fluxo). Quando o Supabase entrar,
// estas funções passam a ler e gravar nas tabelas `sports` e `sport_suggestions`,
// e só usuários com papel de administrador poderão aprovar.

export type SuggestionStatus = 'pendente' | 'aprovado' | 'recusado' | 'juntado';

export type SportSuggestion = {
  id: string;
  name: string;
  count: number; // quantas pessoas sugeriram
  firstAt: string; // data da primeira sugestão (dd/mm)
  status: SuggestionStatus;
  categoryId?: string; // categoria escolhida ao aprovar
  mergedInto?: string; // esporte da base ao juntar
};

type Store = {
  categories: SportCategory[]; // base oficial + aprovados
  suggestions: SportSuggestion[];
  totalSports: number;
  findSport: (name: string) => string | undefined; // esporte da base com esse nome
  suggest: (name: string) => { kind: 'existente'; sport: string } | { kind: 'sugerido'; name: string };
  approve: (id: string, categoryId: string) => void;
  reject: (id: string) => void;
  merge: (id: string, into: string) => void;
  reopen: (id: string) => void;
  // Situação de um esporte que o usuário digitou em "Outro".
  resolvePending: (name: string) => { status: SuggestionStatus; sport: string };
};

const KEY = 'movva.esportes.v1';

const today = () => {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
};

// Sugestões de exemplo para o painel não começar vazio.
const SEED: SportSuggestion[] = [
  { id: 's1', name: 'Canoa havaiana', count: 5, firstAt: '28/10', status: 'pendente' },
  { id: 's2', name: 'Corrida com obstáculos', count: 4, firstAt: '30/10', status: 'pendente' },
  { id: 's3', name: 'Teqball', count: 3, firstAt: '02/11', status: 'pendente' },
  { id: 's4', name: 'Bocha', count: 2, firstAt: '05/11', status: 'pendente' },
  { id: 's5', name: 'Jiu jitsu brasileiro', count: 1, firstAt: '06/11', status: 'pendente' },
];

const Ctx = createContext<Store | null>(null);

export function SportsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<SportSuggestion[]>(SEED);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setSuggestions(JSON.parse(raw) as SportSuggestion[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(suggestions)).catch(() => {});
  }, [suggestions, loaded]);

  const store = useMemo<Store>(() => {
    // Base oficial + esportes aprovados em suas categorias.
    const categories = sportCategories.map((c) => ({
      ...c,
      sports: [
        ...c.sports,
        ...suggestions.filter((s) => s.status === 'aprovado' && s.categoryId === c.id).map((s) => s.name),
      ],
    }));
    const all = categories.flatMap((c) => c.sports);
    const index = new Map(all.map((s) => [normalizeSport(s), s]));

    const findSport = (name: string) => index.get(normalizeSport(name));

    const update = (id: string, patch: Partial<SportSuggestion>) =>
      setSuggestions((cur) => cur.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    return {
      categories,
      suggestions,
      totalSports: all.length,
      findSport,
      suggest: (raw) => {
        const name = tidySportName(raw);
        const existing = findSport(name);
        if (existing) return { kind: 'existente', sport: existing };
        const key = normalizeSport(name);
        setSuggestions((cur) => {
          const same = cur.find((s) => normalizeSport(s.name) === key);
          if (same) return cur.map((s) => (s === same ? { ...s, count: s.count + 1 } : s));
          return [{ id: 's' + Date.now(), name, count: 1, firstAt: today(), status: 'pendente' }, ...cur];
        });
        return { kind: 'sugerido', name };
      },
      approve: (id, categoryId) => update(id, { status: 'aprovado', categoryId, mergedInto: undefined }),
      reject: (id) => update(id, { status: 'recusado' }),
      merge: (id, into) => update(id, { status: 'juntado', mergedInto: into }),
      reopen: (id) => update(id, { status: 'pendente', categoryId: undefined, mergedInto: undefined }),
      resolvePending: (name) => {
        const sug = suggestions.find((x) => normalizeSport(x.name) === normalizeSport(name));
        if (!sug) return { status: 'pendente', sport: name };
        if (sug.status === 'juntado' && sug.mergedInto) return { status: 'juntado', sport: sug.mergedInto };
        return { status: sug.status, sport: sug.name };
      },
    };
  }, [suggestions]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useSports() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useSports precisa estar dentro de <SportsProvider>');
  return s;
}

// Sugere um esporte da base parecido com o nome digitado (para o botão "Juntar com…").
export function similarSport(name: string, all: string[]): string | undefined {
  const words = normalizeSport(name).split(' ').filter((w) => w.length >= 4);
  let best: string | undefined;
  let bestScore = 0;
  for (const s of all) {
    const n = normalizeSport(s);
    const score = words.filter((w) => n.includes(w) || w.includes(n)).length;
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}
