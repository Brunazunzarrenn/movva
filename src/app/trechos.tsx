import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Avatar, Header, RouteMap, Screen, SectionTitle, s } from '@/components/ui';
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

function Competicoes() {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 4 }}>
        <Txt variant="bodyStrong">Competição sem inscrição</Txt>
        <Txt variant="caption" tone="soft">Passou por um trecho com o treino gravado? Seu tempo entra sozinho no ranking. O mais rápido do mês vira o dono do trecho e leva a medalha.</Txt>
      </View>
      <SectionTitle>Trechos perto de você</SectionTitle>
      {segments.map((sg) => {
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

