import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { useProfileSports } from '@/components/profileParts';
import { Txt } from '@/components/Txt';
import { Button, Chip, Header, Screen, Segmented, SectionTitle, s } from '@/components/ui';
import { shortSport, trainingOptions } from '@/data/activity';
import { useProfile } from '@/data/ProfileStore';
import { bestWindow, hourOf, scoreLabel, useForecast } from '@/data/weather';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const DAYS = ['Hoje', 'Amanhã'] as const;

export default function MelhorHorario() {
  const { colors } = useTheme();
  const { profile } = useProfile();
  const mine = useProfileSports(profile?.sports ?? [], profile?.pendingSports ?? []).official;
  const sports = useMemo(() => {
    const list = trainingOptions(mine).filter((x) => x !== 'Triathlon' && x !== 'Duathlon' && x !== 'Aquathlon');
    return list.length ? list : ['Corrida de rua'];
  }, [mine]);
  const [sport, setSport] = useState(sports[0]);
  const [day, setDay] = useState<(typeof DAYS)[number]>('Hoje');
  const { data, error, loading, reload } = useForecast(profile?.region);

  // De noite não há mais horário bom hoje: mostra amanhã sem a pessoa precisar trocar.
  const autoDay = useRef(false);
  useEffect(() => {
    if (!data || autoDay.current) return;
    autoDay.current = true;
    if (!bestWindow(data.hours, sport, 'hoje').best) setDay('Amanhã');
  }, [data, sport]);

  const { list, best } = useMemo(
    () => (data ? bestWindow(data.hours, sport, day === 'Hoje' ? 'hoje' : 'amanha') : { list: [], best: null }),
    [data, sport, day],
  );
  const color = (sc: number) => (sc >= 80 ? colors.accentInk : sc >= 60 ? '#7DBB3A' : sc >= 40 ? colors.gold : colors.danger);

  return (
    <Screen>
      <Header title="Melhor horário" subtitle={data ? `Previsão para ${data.place}` : 'Clima de hora em hora'} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {sports.map((x) => <Chip key={x} label={shortSport(x)} selected={x === sport} onPress={() => setSport(x)} />)}
      </ScrollView>
      <Segmented label="Dia" options={DAYS} value={day} onChange={setDay} />

      {loading && !data ? (
        <View style={{ paddingVertical: 40, alignItems: 'center', gap: 10 }}>
          <ActivityIndicator color={colors.accentInk} />
          <Txt variant="small" tone="muted">Buscando a previsão…</Txt>
        </View>
      ) : null}

      {error && !data ? (
        <View style={{ padding: 16, borderRadius: 16, backgroundColor: colors.surface, gap: 10 }}>
          <Txt variant="bodyStrong">Sem previsão agora</Txt>
          <Txt variant="small" tone="muted">{error}</Txt>
          <Button label="Tentar de novo" size="md" onPress={reload} />
        </View>
      ) : null}

      {data && !best ? (
        <View style={{ padding: 16, borderRadius: 16, backgroundColor: colors.surface, gap: 6 }}>
          <Txt variant="bodyStrong">Hoje já passou do horário bom</Txt>
          <Txt variant="small" tone="muted">Veja a previsão de amanhã.</Txt>
          <Button label="Ver amanhã" size="md" variant="secondary" onPress={() => setDay('Amanhã')} />
        </View>
      ) : null}

      {best ? (
        <View style={{ padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accentSoftBorder, gap: 8 }}>
          <View style={[s.row, { gap: 10 }]}>
            <Icon name="sun" size={26} color={colors.gold} />
            <Txt variant="eyebrow" tone="accent">Melhor para {shortSport(sport).toLowerCase()} {day === 'Hoje' ? 'hoje' : 'amanhã'}</Txt>
          </View>
          <Txt style={{ fontFamily: fonts.display, fontSize: 40, color: colors.text }}>
            {hourOf(best.start.h.time)}–{Number(best.end.h.time.slice(11, 13)) + 1}h
          </Txt>
          <Txt variant="small" tone="soft">
            {best.start.h.feels}° de sensação · {best.start.h.rain}% de chance de chuva · vento {best.start.h.wind} km/h · UV {best.start.h.uv}
          </Txt>
          <Txt variant="caption" tone="muted">{scoreLabel(best.score)} ({best.score}/100){best.start.reasons.length ? ` · atenção: ${best.start.reasons.join(', ')}` : ''}</Txt>
        </View>
      ) : null}

      {list.length ? (
        <View style={{ gap: 6 }}>
          <SectionTitle>Hora a hora</SectionTitle>
          {list.map(({ h, score, reasons }) => {
            const inBest = best && (h.time === best.start.h.time || h.time === best.end.h.time);
            return (
              <View
                key={h.time}
                accessibilityLabel={`${hourOf(h.time)}: ${h.temp} graus, ${h.rain}% de chuva, ${scoreLabel(score)}`}
                style={[s.row, { gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: inBest ? colors.accentSoft : 'transparent' }]}
              >
                <Txt variant="small" style={{ width: 36, fontFamily: fonts.bodySemi, fontSize: 14 }}>{hourOf(h.time)}</Txt>
                <Txt variant="small" style={{ width: 40, fontSize: 14 }}>{h.temp}°</Txt>
                <View style={[s.row, { width: 52, gap: 3 }]}>
                  <Txt variant="caption" tone={h.rain >= 40 ? 'danger' : 'muted'}>{h.rain}%</Txt>
                </View>
                <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.divider, overflow: 'hidden' }}>
                  <View style={{ width: `${score}%`, height: '100%', backgroundColor: color(score) }} />
                </View>
                <Txt variant="caption" style={{ width: 70, textAlign: 'right', color: color(score), fontFamily: fonts.bodySemi }} numberOfLines={1}>
                  {reasons[0] ? reasons[0] : scoreLabel(score)}
                </Txt>
              </View>
            );
          })}
          <View style={[s.row, { gap: 14, marginTop: 4 }]}>
            <Txt variant="caption" tone="muted">Colunas: hora · temperatura · chance de chuva · nota</Txt>
          </View>
        </View>
      ) : null}

      <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
        A nota considera sensação térmica, chuva, vento, índice UV e claridade para {shortSport(sport).toLowerCase()}. Previsão: Open-Meteo.
      </Txt>
    </Screen>
  );
}
