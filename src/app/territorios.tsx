import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { RankRow } from '@/components/arena';
import { Txt } from '@/components/Txt';
import { Header, Screen, SectionTitle, s } from '@/components/ui';
import { territories, territoryMap } from '@/data/arena';
import { athleteById } from '@/data/community';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const MONTH = new Date().toLocaleDateString('pt-BR', { month: 'long' });

// A primeira célula de cada área mostra a letra dela (P = Pampulha, S = Savassi…).
const LABEL_AT = new Set(territories.map((t) => {
  const r = territoryMap.findIndex((row) => row.includes(t.id));
  return `${r}-${territoryMap[r].indexOf(t.id)}`;
}));

export default function Territorios() {
  const { colors, isDark } = useTheme();
  const [sel, setSel] = useState('P');
  const area = territories.find((t) => t.id === sel)!;
  const owner = athleteById(area.board[0]?.athleteId ?? '');
  const ownerColor = (id: string) => {
    const t = territories.find((x) => x.id === id);
    const o = athleteById(t?.board[0]?.athleteId ?? '');
    return o?.color ?? (isDark ? '#2A332D' : '#D5DDD7');
  };

  return (
    <Screen>
      <Header title="Territórios" subtitle={`Belo Horizonte · ${MONTH}`} />

      <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 4 }}>
        <Txt variant="bodyStrong">Você domina 0 áreas</Txt>
        <Txt variant="caption" tone="soft">Quem mais treina numa área no mês vira o dono dela. Toque numa área para ver a disputa.</Txt>
      </View>

      {/* Mapa em blocos: cada área tem a cor de quem domina */}
      <View accessibilityLabel="Mapa de territórios" style={{ borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surfaceAlt, padding: 6, gap: 4 }}>
        {territoryMap.map((row, r) => (
          <View key={r} style={[s.row, { gap: 4 }]}>
            {row.split('').map((id, c) => {
              const on = id === sel;
              return (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityLabel={territories.find((t) => t.id === id)?.name}
                  onPress={() => setSel(id)}
                  style={{
                    flex: 1, aspectRatio: 1.15, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: ownerColor(id), opacity: on ? 1 : 0.42, borderWidth: on ? 2 : 0, borderColor: colors.text,
                  }}
                >
                  {LABEL_AT.has(`${r}-${c}`) ? (
                    <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: '#FFFFFF' }}>{id}</Txt>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legenda: letra do mapa, nome da área e quem domina */}
      <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
        {territories.map((t, i) => {
          const o = athleteById(t.board[0]?.athleteId ?? '');
          const on = t.id === sel;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${t.name}: ${o ? `domínio de ${o.name}` : 'área livre'}`}
              onPress={() => setSel(t.id)}
              style={[s.row, { gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider, backgroundColor: on ? colors.accentSoft : 'transparent' }]}
            >
              <View style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: ownerColor(t.id), alignItems: 'center', justifyContent: 'center' }}>
                <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: '#FFFFFF' }}>{t.id}</Txt>
              </View>
              <Txt variant="small" style={{ flex: 1, fontSize: 15, fontFamily: on ? fonts.bodySemi : fonts.body }}>{t.name}</Txt>
              <Txt variant="caption" tone={o ? 'soft' : 'muted'}>{o ? o.name.split(' ')[0] : 'livre'}</Txt>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 8, padding: 14, borderRadius: 18, backgroundColor: colors.surface }}>
        <Txt style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>{area.name}</Txt>
        <Txt variant="small" tone="soft">
          {owner ? `Domínio de ${owner.name} com ${area.board[0].workouts} treinos no mês.` : 'Área livre: ninguém treinou aqui ainda este mês.'}
        </Txt>
        <Txt variant="caption" tone="muted">
          {owner ? `Faça ${area.board[0].workouts + 1} treinos em ${area.name} para tomar a área.` : 'Um treino aqui já te dá o domínio.'}
        </Txt>
      </View>

      <View style={{ gap: 6 }}>
        <SectionTitle>{`Disputa em ${area.name}`}</SectionTitle>
        {[...area.board, { athleteId: 'me', workouts: 0 }].map((b, i) => (
          <RankRow key={b.athleteId} pos={i + 1} id={b.athleteId} value={`${b.workouts} treinos`} />
        ))}
      </View>
    </Screen>
  );
}
