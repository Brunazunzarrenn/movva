import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { Button, Chip, Header, Screen, Segmented, s } from '@/components/ui';
import { similarSport, useSports, type SportSuggestion } from '@/data/SportsStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const VIEWS = ['Pendentes', 'Aprovados', 'Recusados'] as const;
type View_ = (typeof VIEWS)[number];

function SuggestionCard({ sug }: { sug: SportSuggestion }) {
  const { colors } = useTheme();
  const { categories, approve, reject, merge, reopen } = useSports();
  const [picking, setPicking] = useState(false);
  const all = categories.flatMap((c) => c.sports);
  const similar = similarSport(sug.name, all);
  const catName = categories.find((c) => c.id === sug.categoryId)?.name;

  return (
    <View style={{ padding: 14, borderRadius: 18, backgroundColor: colors.surface, gap: 10 }}>
      <View style={[s.row, { gap: 12 }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="bodyStrong" style={{ fontSize: 17 }}>{sug.name}</Txt>
          <Txt variant="caption" tone="muted">
            {sug.count} {sug.count === 1 ? 'pessoa sugeriu' : 'pessoas sugeriram'} · desde {sug.firstAt}
          </Txt>
        </View>
        <View style={{ minWidth: 44, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center' }}>
          <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 18, color: colors.accentInk }}>{sug.count}</Txt>
        </View>
      </View>

      {sug.status === 'pendente' ? (
        <>
          {similar ? (
            <Txt variant="small" tone="soft">
              Parecido com <Txt variant="small" style={{ fontFamily: fonts.bodySemi }}>{similar}</Txt>, que já está na base.
            </Txt>
          ) : null}

          {picking ? (
            <View style={{ gap: 8 }}>
              <Txt variant="small" tone="muted">Em qual categoria ele entra?</Txt>
              <View style={s.wrap}>
                {categories.map((c) => (
                  <Chip key={c.id} label={c.name} onPress={() => { approve(sug.id, c.id); setPicking(false); }} />
                ))}
              </View>
              <Button label="Cancelar" variant="ghost" size="sm" onPress={() => setPicking(false)} />
            </View>
          ) : (
            <View style={[s.row, { gap: 8, flexWrap: 'wrap' }]}>
              <Button label="Aprovar" size="sm" icon="check" onPress={() => setPicking(true)} style={{ flexGrow: 1 }} />
              {similar ? (
                <Button label={`Juntar com ${similar}`} variant="secondary" size="sm" onPress={() => merge(sug.id, similar)} style={{ flexGrow: 1 }} />
              ) : null}
              <Button label="Recusar" variant="danger" size="sm" onPress={() => reject(sug.id)} style={{ flexGrow: 1 }} />
            </View>
          )}
        </>
      ) : (
        <View style={[s.row, { justifyContent: 'space-between', gap: 8 }]}>
          <Txt variant="small" tone="soft" style={{ flex: 1 }}>
            {sug.status === 'aprovado'
              ? `Na base, em ${catName ?? 'uma categoria'}.`
              : sug.status === 'juntado'
                ? `Juntado com ${sug.mergedInto}. Quem sugeriu passa a ter esse esporte.`
                : 'Recusado. Some do perfil de quem sugeriu.'}
          </Txt>
          <Pressable accessibilityRole="button" onPress={() => reopen(sug.id)} style={{ minHeight: 40, justifyContent: 'center' }}>
            <Txt variant="small" tone="accent" style={{ fontFamily: fonts.bodySemi }}>Desfazer</Txt>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function AdminEsportes() {
  const { colors } = useTheme();
  const { suggestions, totalSports } = useSports();
  const [view, setView] = useState<View_>('Pendentes');

  const pend = suggestions.filter((x) => x.status === 'pendente').sort((a, b) => b.count - a.count);
  const done = suggestions.filter((x) => x.status === 'aprovado' || x.status === 'juntado');
  const rej = suggestions.filter((x) => x.status === 'recusado');
  const list = view === 'Pendentes' ? pend : view === 'Aprovados' ? done : rej;

  return (
    <Screen>
      <Header title="Esportes sugeridos" subtitle="Administração · só a equipe MOVVA vê esta tela" />

      <View style={[s.row, { gap: 10 }]}>
        {[
          { k: 'pendentes', v: pend.length },
          { k: 'esportes na base', v: totalSports },
          { k: 'aprovados', v: done.length },
        ].map((it) => (
          <View key={it.k} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: colors.surface, gap: 2 }}>
            <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 24, color: colors.text }}>{it.v}</Txt>
            <Txt variant="caption" tone="muted">{it.k}</Txt>
          </View>
        ))}
      </View>

      <Segmented label="Situação" options={VIEWS} value={view} onChange={setView} />

      {list.length === 0 ? (
        <Txt tone="muted" style={{ textAlign: 'center', paddingVertical: 32 }}>
          {view === 'Pendentes' ? 'Nenhuma sugestão esperando análise.' : 'Nada por aqui ainda.'}
        </Txt>
      ) : (
        list.map((sug) => <SuggestionCard key={sug.id} sug={sug} />)
      )}

      <Txt variant="caption" tone="faint">
        Aprovar coloca o esporte na lista de todo mundo. Juntar transforma a sugestão no esporte parecido que já existe.
      </Txt>
    </Screen>
  );
}
