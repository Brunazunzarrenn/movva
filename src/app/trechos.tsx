import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { matches, SearchBar } from '@/components/SearchBar';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Avatar, Chip, Header, RouteMap, Screen, SectionTitle, s } from '@/components/ui';
import { segments } from '@/data/arena';
import { athleteById } from '@/data/community';
import { initialsOf } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export default function Trechos() {
  return (
    <Screen>
      <Header title="Trechos" subtitle="Quem faz o melhor tempo no mês vira o dono" />
      <Competicoes />
    </Screen>
  );
}

const SPORTS = ['Todos', 'Corrida', 'Pedal', 'Trilha'] as const;

function Competicoes() {
  const { colors } = useTheme();
  const [q, setQ] = useState('');
  const [sport, setSport] = useState<(typeof SPORTS)[number]>('Todos');
  const list = segments.filter((sg) => (sport === 'Todos' || sg.sport === sport) && matches(q, sg.name, sg.place, sg.sport));
  return (
    <View style={{ gap: 10 }}>
      <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 4 }}>
        <Txt variant="bodyStrong">Competição sem inscrição</Txt>
        <Txt variant="caption" tone="soft">Passou por um trecho com o treino gravado? Seu tempo entra sozinho no ranking. O mais rápido do mês vira o dono do trecho e leva a medalha.</Txt>
      </View>
      <SearchBar value={q} onChangeText={setQ} label="Buscar trecho" placeholder="Nome do trecho, rua ou parque" />
      <View style={[s.row, { gap: 8 }]}>
        {SPORTS.map((x) => <Chip key={x} label={x} selected={x === sport} onPress={() => setSport(x)} />)}
      </View>
      <SectionTitle right={<Txt variant="small" tone="muted">{list.length}</Txt>}>{q || sport !== 'Todos' ? 'Resultados' : 'Trechos perto de você'}</SectionTitle>
      {list.length === 0 ? (
        <Txt variant="small" tone="muted">Nenhum trecho encontrado. Tente outro nome ou bairro.</Txt>
      ) : null}
      {list.map((sg) => {
        const lead = athleteById(sg.efforts[0]?.athleteId ?? '');
        return (
          <Pressable
            key={sg.id}
            accessibilityRole="button"
            accessibilityLabel={`Trecho ${sg.name}`}
            onPress={() => router.push({ pathname: '/trecho/[id]', params: { id: sg.id } })}
            style={({ pressed }) => ({ borderRadius: 18, backgroundColor: colors.surface, overflow: 'hidden', opacity: pressed ? 0.9 : 1 })}
          >
            <RouteMap path={sg.route} height={90} />
            <View style={{ padding: 14, gap: 8 }}>
              <View style={[s.row, { justifyContent: 'space-between', gap: 8 }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="bodyStrong">{sg.name}</Txt>
                  <Txt variant="caption" tone="muted">{sg.sport} · {sg.distance} · {sg.grade}</Txt>
                </View>
                <Icon name="chevron" size={18} color={colors.textMuted} />
              </View>
              {lead ? (
                <View style={[s.row, { gap: 8 }]}>
                  <Avatar initials={initialsOf(lead.name)} color={lead.color} size={26} />
                  <Txt variant="caption" tone="soft" style={{ flex: 1 }}>
                    <Txt variant="caption" style={{ fontFamily: fonts.bodySemi }}>{lead.name}</Txt> é dono do trecho
                  </Txt>
                  <Txt variant="small" style={{ fontFamily: fonts.bodySemi, color: colors.gold }}>{sg.efforts[0].time}</Txt>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

