import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { RankRow } from '@/components/arena';
import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Header, RouteMap, Screen, SectionTitle, s } from '@/components/ui';
import { segments } from '@/data/arena';
import { athleteById } from '@/data/community';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export default function Trecho() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sg = segments.find((x) => x.id === id);

  if (!sg) {
    return (
      <Screen>
        <Header title="Trecho" />
        <Txt tone="muted" style={{ textAlign: 'center', marginTop: 40 }}>Trecho não encontrado.</Txt>
      </Screen>
    );
  }
  const owner = athleteById(sg.efforts[0]?.athleteId ?? '');

  return (
    <Screen>
      <Header title={sg.name} subtitle={`${sg.sport} · ${sg.distance}`} />
      <View style={{ borderRadius: 18, overflow: 'hidden' }}>
        <RouteMap path={sg.route} height={170} />
      </View>

      <View style={[s.row, { gap: 8 }]}>
        {[['Distância', sg.distance], ['Perfil', sg.grade], ['Tentativas', String(sg.efforts.length)]].map(([k, v]) => (
          <View key={k} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: colors.surface, gap: 2 }}>
            <Txt variant="caption" tone="muted">{k}</Txt>
            <Txt variant="small" style={{ fontFamily: fonts.bodySemi, fontSize: 14 }}>{v}</Txt>
          </View>
        ))}
      </View>

      {owner ? (
        <View style={[s.row, { gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold }]}>
          <Icon name="trophy" size={26} color={colors.gold} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="eyebrow" tone="gold">Dono do trecho no mês</Txt>
            <Txt variant="bodyStrong">{owner.name} · {sg.efforts[0].time}</Txt>
          </View>
        </View>
      ) : null}

      <View style={{ gap: 6 }}>
        <SectionTitle>Ranking do mês</SectionTitle>
        {sg.efforts.map((e, i) => <RankRow key={e.athleteId} pos={i + 1} id={e.athleteId} value={e.time} sub={`em ${e.date}`} />)}
      </View>

      <View style={[s.row, { gap: 10, padding: 14, borderRadius: 16, backgroundColor: colors.surface }]}>
        <Icon name="pin" size={20} color={colors.accentInk} />
        <Txt variant="small" tone="soft" style={{ flex: 1, fontSize: 14 }}>
          Você ainda não tem tempo aqui. Passe por {sg.place} com o treino gravado e seu tempo entra sozinho, sem inscrição.
        </Txt>
      </View>
    </Screen>
  );
}
