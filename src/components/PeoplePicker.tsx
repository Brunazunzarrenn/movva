import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { matches, SearchBar } from '@/components/SearchBar';
import { Txt } from '@/components/Txt';
import { Avatar, s } from '@/components/ui';
import { athleteById, athletes, compatibility } from '@/data/community';
import { initialsOf, useProfile } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const SUGGESTIONS = 4;
const MAX_RESULTS = 8;

// Escolher pessoas para convidar: os escolhidos ficam em cima e o resto se acha pela busca,
// para a lista não ficar enorme quando o app tiver muita gente.
export function PeoplePicker({ selected, onChange, title = 'Convidar' }: { selected: string[]; onChange: (ids: string[]) => void; title?: string }) {
  const { colors } = useTheme();
  const { profile } = useProfile();
  const [q, setQ] = useState('');
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const pool = athletes.filter((a) => !a.club);
  const searching = q.trim().length > 0;
  const results = searching
    ? pool.filter((a) => matches(q, a.name, a.username, a.region, ...a.sports)).slice(0, MAX_RESULTS)
    : pool
        .filter((a) => !selected.includes(a.id))
        .map((a) => ({ a, score: compatibility(profile, a).score }))
        .sort((x, y) => y.score - x.score)
        .slice(0, SUGGESTIONS)
        .map((x) => x.a);

  return (
    <View style={{ gap: 10 }}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Txt variant="bodyStrong">{title}</Txt>
        {selected.length ? <Txt variant="small" tone="accent" style={{ fontFamily: fonts.bodySemi }}>{selected.length} {selected.length === 1 ? 'pessoa' : 'pessoas'}</Txt> : null}
      </View>

      {selected.length ? (
        <View style={s.wrap}>
          {selected.map((id) => {
            const a = athleteById(id);
            if (!a) return null;
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityLabel={`Remover ${a.name} dos convidados`}
                onPress={() => toggle(id)}
                style={[s.row, { gap: 6, paddingLeft: 4, paddingRight: 10, minHeight: 36, borderRadius: 999, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentInk }]}
              >
                <Avatar initials={initialsOf(a.name)} color={a.color} size={26} />
                <Txt variant="small" style={{ fontSize: 14, color: colors.accentInk }}>{a.name.split(' ')[0]}</Txt>
                <Icon name="close" size={14} strokeWidth={2.5} color={colors.accentInk} />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <SearchBar value={q} onChangeText={setQ} label="Buscar pessoa para convidar" placeholder="Nome, @ ou esporte" />

      <View style={{ gap: 2 }}>
        {!searching ? <Txt variant="caption" tone="muted">Sugestões para você</Txt> : null}
        {results.map((a) => {
          const on = selected.includes(a.id);
          return (
            <Pressable
              key={a.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`Convidar ${a.name}`}
              onPress={() => toggle(a.id)}
              style={[s.row, { gap: 12, paddingVertical: 8 }]}
            >
              <Avatar initials={initialsOf(a.name)} color={a.color} size={38} />
              <View style={{ flex: 1, gap: 1 }}>
                <Txt variant="small" style={{ fontSize: 15 }}>{a.name}</Txt>
                <Txt variant="caption" tone="muted" numberOfLines={1}>@{a.username} · {a.sports.slice(0, 2).join(', ')}</Txt>
              </View>
              <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: on ? colors.accentInk : colors.border, backgroundColor: on ? colors.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {on ? <Icon name="check" size={14} strokeWidth={3} color={colors.onAccent} /> : null}
              </View>
            </Pressable>
          );
        })}
        {searching && results.length === 0 ? <Txt variant="small" tone="muted">Ninguém encontrado com "{q.trim()}".</Txt> : null}
      </View>
    </View>
  );
}
