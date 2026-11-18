import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { sportTint, UserWorkoutRow } from '@/components/workout';
import { Button, Header, Screen, SectionTitle, s } from '@/components/ui';
import { fmtDuration, fmtKm } from '@/data/activity';
import { useCommunity } from '@/data/CommunityStore';
import { useProfile } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const hm = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

type Item =
  | { kind: 'treino'; id: string; at: string; color: string }
  | { kind: 'convite'; id: string; at: string; title: string; place: string }
  | { kind: 'desafio'; id: string; at: string; title: string };

export default function Calendario() {
  const { colors } = useTheme();
  const { workouts } = useProfile();
  const { invites, joined, challenges, joinedChallenges } = useCommunity();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(key(today));

  // Tudo o que cai em cada dia: seus treinos, treinos marcados no Bora e fim dos seus desafios.
  const byDay = useMemo(() => {
    const map = new Map<string, Item[]>();
    const add = (iso: string, it: Item) => {
      const k = key(new Date(iso));
      map.set(k, [...(map.get(k) ?? []), it]);
    };
    workouts.forEach((w) => add(w.start, { kind: 'treino', id: w.id, at: w.start, color: sportTint(w.sport) }));
    invites
      .filter((i) => i.hostId === 'me' || joined[i.id])
      .forEach((i) => add(i.start, { kind: 'convite', id: i.id, at: i.start, title: i.title, place: i.place }));
    challenges
      .filter((c) => c.creatorId === 'me' || joinedChallenges[c.id])
      .forEach((c) => add(c.end, { kind: 'desafio', id: c.id, at: c.end, title: c.title }));
    return map;
  }, [workouts, invites, joined, challenges, joinedChallenges]);

  // Grade do mês começando na segunda-feira.
  const cells = useMemo(() => {
    const offset = (month.getDay() + 6) % 7;
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, i) => {
      const n = i - offset + 1;
      return n >= 1 && n <= days ? new Date(month.getFullYear(), month.getMonth(), n) : null;
    });
  }, [month]);

  const monthWorkouts = workouts.filter((w) => {
    const d = new Date(w.start);
    return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
  });
  const activeDays = new Set(monthWorkouts.map((w) => key(new Date(w.start)))).size;
  const dayItems = (byDay.get(selected) ?? []).sort((a, b) => a.at.localeCompare(b.at));
  const selDate = (() => { const [y, m, d] = selected.split('-').map(Number); return new Date(y, m, d); })();
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  const isCurrent = month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear();

  return (
    <Screen>
      <Header title="Calendário" />

      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => shift(-1)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ transform: [{ rotate: '180deg' }] }}><Icon name="chevron" size={22} color={colors.text} /></View>
        </Pressable>
        <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 22, color: colors.text }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</Txt>
        <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={() => shift(1)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={{ gap: 4 }}>
        <View style={s.row}>
          {WEEK.map((w, i) => <Txt key={i} variant="caption" tone="muted" style={{ flex: 1, textAlign: 'center' }}>{w}</Txt>)}
        </View>
        {Array.from({ length: cells.length / 7 }, (_, r) => (
          <View key={r} style={s.row}>
            {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
              if (!d) return <View key={i} style={{ flex: 1, height: 52 }} />;
              const k = key(d);
              const items = byDay.get(k) ?? [];
              const isToday = k === key(today);
              const isSel = k === selected;
              const trained = items.some((x) => x.kind === 'treino');
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.getDate()} de ${MONTHS[d.getMonth()]}${items.length ? `, ${items.length} ${items.length === 1 ? 'item' : 'itens'}` : ''}`}
                  accessibilityState={{ selected: isSel }}
                  onPress={() => setSelected(k)}
                  style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 12, backgroundColor: isSel ? colors.accent : trained ? colors.accentSoft : 'transparent' }}
                >
                  <Txt style={{ fontFamily: isToday || isSel ? fonts.bodyBold : fonts.body, fontSize: 15, color: isSel ? colors.onAccent : isToday ? colors.accentInk : colors.text }}>{d.getDate()}</Txt>
                  <View style={[s.row, { gap: 2, height: 6 }]}>
                    {items.slice(0, 3).map((x, j) => (
                      <View key={j} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isSel ? colors.onAccent : x.kind === 'treino' ? x.color : x.kind === 'convite' ? colors.accentInk : colors.gold }} />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <View style={[s.row, { gap: 14, flexWrap: 'wrap' }]}>
        {[[colors.accentInk, 'Bora Treinar?'], [colors.gold, 'Fim de desafio'], ['#2E5BFF', 'Treino (cor do esporte)']].map(([c, l]) => (
          <View key={l} style={[s.row, { gap: 6 }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
            <Txt variant="caption" tone="muted">{l}</Txt>
          </View>
        ))}
      </View>

      <View style={[s.row, { gap: 8 }]}>
        {[['Treinos', String(monthWorkouts.length)], ['Dias ativos', String(activeDays)], ['Distância', fmtKm(monthWorkouts.reduce((a, w) => a + w.km, 0))], ['Tempo', fmtDuration(monthWorkouts.reduce((a, w) => a + w.sec, 0))]].map(([l, v]) => (
          <View key={l} style={{ flex: 1, padding: 10, borderRadius: 14, backgroundColor: colors.surface, gap: 2 }}>
            <Txt variant="caption" tone="muted" numberOfLines={1}>{l}</Txt>
            <Txt style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: colors.text }} numberOfLines={1}>{v}</Txt>
          </View>
        ))}
      </View>
      {!isCurrent ? <Button label="Voltar para hoje" variant="ghost" size="sm" onPress={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(key(today)); }} /> : null}

      <View style={{ gap: 8 }}>
        <SectionTitle>{selDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</SectionTitle>
        {dayItems.length === 0 ? (
          <Txt variant="small" tone="muted">Nada neste dia.</Txt>
        ) : (
          dayItems.map((it) => {
            if (it.kind === 'treino') {
              const w = workouts.find((x) => x.id === it.id)!;
              return <UserWorkoutRow key={it.id} w={w} onPress={() => router.push({ pathname: '/atividade/[id]', params: { id: w.id } })} />;
            }
            const isInvite = it.kind === 'convite';
            return (
              <Pressable
                key={it.kind + it.id}
                accessibilityRole="button"
                onPress={() => router.push(isInvite ? { pathname: '/convite/[id]', params: { id: it.id } } : { pathname: '/desafio/[id]', params: { id: it.id } })}
                style={[s.row, { gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.surface }]}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isInvite ? colors.accentSoft : colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={isInvite ? 'users' : 'trophy'} size={20} color={isInvite ? colors.accentInk : colors.gold} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="bodyStrong" numberOfLines={1}>{it.title}</Txt>
                  <Txt variant="caption" tone="muted" numberOfLines={1}>{isInvite ? `${hm(it.at)} · ${it.place}` : 'Último dia do desafio'}</Txt>
                </View>
                <Icon name="chevron" size={18} color={colors.textMuted} />
              </Pressable>
            );
          })
        )}
      </View>
    </Screen>
  );
}
