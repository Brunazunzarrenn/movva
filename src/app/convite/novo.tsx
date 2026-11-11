import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { useProfileSports } from '@/components/profileParts';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Chip, Header, Screen, Segmented, s } from '@/components/ui';
import { fieldsFor, trainingOptions } from '@/data/activity';
import { athleteById, athletes, compatibility, type InviteVisibility } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { levels } from '@/data/mock';
import { initialsOf, useProfile, type Level } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { maskTime, timeError } from '@/utils/format';

const WEEK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const VIS: readonly InviteVisibility[] = ['Público', 'Seguidores', 'Só convidados'];
const LEVELS = ['Todos os níveis', ...levels] as const;
const FALLBACK_SPORTS = ['Corrida de rua', 'Ciclismo de estrada', 'Natação', 'Funcional'];

export default function NovoConvite() {
  const { colors } = useTheme();
  const { com } = useLocalSearchParams<{ com?: string }>();
  const { profile } = useProfile();
  const { createInvite } = useCommunity();
  const guest = com ? athleteById(com) : undefined;
  const mySports = useProfileSports(profile?.sports ?? [], profile?.pendingSports ?? []).official;

  // Esportes: os seus primeiro; se veio convidar alguém, os em comum aparecem antes.
  const sportOptions = useMemo(() => {
    const list = trainingOptions(mySports);
    for (const sp of guest?.sports ?? []) if (!list.includes(sp)) list.push(sp);
    return list.length ? list : FALLBACK_SPORTS;
  }, [mySports, guest]);
  const shared = guest ? compatibility(profile, guest).shared : [];

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
    const label = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `${WEEK[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { d, label };
  }), []);

  const [sport, setSport] = useState(shared[0] ?? guest?.sports[0] ?? sportOptions[0]);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [level, setLevel] = useState<Level | 'Todos os níveis'>(profile?.level ?? 'Todos os níveis');
  const [distance, setDistance] = useState('');
  const [pace, setPace] = useState('');
  const [duration, setDuration] = useState('');
  const [spots, setSpots] = useState(6);
  const [vis, setVis] = useState<InviteVisibility>(guest ? 'Só convidados' : 'Público');
  const [invited, setInvited] = useState<string[]>(guest ? [guest.id] : []);
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const f = fieldsFor(sport);

  const partners = athletes
    .filter((a) => !a.club)
    .map((a) => ({ a, score: compatibility(profile, a).score }))
    .sort((x, y) => (x.a.id === com ? -1 : y.a.id === com ? 1 : y.score - x.score))
    .slice(0, 5);

  const start = useMemo(() => {
    if (timeError(time)) return null;
    const [h, m] = time.split(':').map(Number);
    const d = new Date(days[day].d); d.setHours(h, m, 0, 0);
    return d;
  }, [time, day, days]);

  const tErr = timeError(time) ?? (start && start.getTime() < Date.now() ? 'Esse horário já passou. Escolha outro.' : null);
  const pErr = place.trim().length < 3 ? 'Diga onde vai ser o encontro.' : null;
  const valid = !tErr && !pErr && !!start;

  const publish = () => {
    setTried(true);
    if (!valid || !start) return;
    const inv = createInvite({
      sport,
      title: title.trim() || `${sport} em grupo`,
      start: start.toISOString(),
      place: place.trim(),
      level,
      distance: f.hasDistance ? distance.trim() || undefined : duration.trim() || undefined,
      pace: f.hasDistance && f.paceLabel ? pace.trim() || undefined : undefined,
      spots,
      invited,
      visibility: vis,
      note: note.trim() || undefined,
    });
    router.replace({ pathname: '/convite/[id]', params: { id: inv.id } });
  };

  return (
    <Screen footer={<Button label="Publicar convite" onPress={publish} />}>
      <Header title="Novo convite" subtitle={guest ? `Treino com ${guest.name}` : 'Chame a galera para treinar junto'} />

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Esporte</Txt>
        <View style={s.wrap}>
          {sportOptions.map((sp) => <Chip key={sp} label={sp} selected={sp === sport} onPress={() => setSport(sp)} />)}
        </View>
      </View>

      <TextField label="Nome do treino (opcional)" value={title} onChangeText={(t) => setTitle(t.slice(0, 50))} placeholder={`${sport} em grupo`} />

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Dia</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {days.map((d, i) => <Chip key={d.label} label={d.label} selected={i === day} onPress={() => setDay(i)} />)}
        </ScrollView>
      </View>

      <TextField
        label="Horário"
        value={time}
        onChangeText={(t) => setTime(maskTime(t))}
        placeholder="06:30"
        keyboardType="number-pad"
        maxLength={5}
        error={tried || time.length === 5 ? tErr : null}
      />
      <TextField
        label="Ponto de encontro"
        value={place}
        onChangeText={setPlace}
        placeholder="Ex.: Pampulha, em frente ao Mineirão"
        error={tried ? pErr : null}
        help="Use um lugar público. O endereço aparece só para quem confirmar."
      />

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Nível</Txt>
        <View style={s.wrap}>
          {LEVELS.map((l) => <Chip key={l} label={l} selected={l === level} onPress={() => setLevel(l)} />)}
        </View>
      </View>

      {/* Distância e ritmo só para esportes que têm (jiu-jitsu, vôlei, musculação não têm). */}
      {f.hasDistance ? (
        <View style={[s.row, { gap: 10, alignItems: 'flex-start' }]}>
          <View style={{ flex: 1 }}>
            <TextField label="Distância" value={distance} onChangeText={setDistance} placeholder={f.distancePlaceholder} />
          </View>
          {f.paceLabel ? (
            <View style={{ flex: 1 }}>
              <TextField label={f.paceLabel} value={pace} onChangeText={setPace} placeholder={f.pacePlaceholder} />
            </View>
          ) : null}
        </View>
      ) : (
        <TextField label="Duração (opcional)" value={duration} onChangeText={setDuration} placeholder="Ex.: 1h30, 4 rounds de 6 min" />
      )}

      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <View style={{ gap: 2 }}>
          <Txt variant="bodyStrong">Vagas</Txt>
          <Txt variant="caption" tone="muted">Contando com você</Txt>
        </View>
        <View style={[s.row, { gap: 6 }]}>
          <Stepper label="Menos uma vaga" sign="−" onPress={() => setSpots((v) => Math.max(2, v - 1))} />
          <Txt variant="number" style={{ minWidth: 36, textAlign: 'center' }}>{spots}</Txt>
          <Stepper label="Mais uma vaga" sign="+" onPress={() => setSpots((v) => Math.min(40, v + 1))} />
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Convidar</Txt>
        <View style={s.wrap}>
          {partners.map(({ a }) => {
            const on = invited.includes(a.id);
            return (
              <Pressable
                key={a.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`Convidar ${a.name}`}
                onPress={() => setInvited((cur) => (on ? cur.filter((x) => x !== a.id) : [...cur, a.id]))}
                style={[s.row, { gap: 8, paddingLeft: 4, paddingRight: 12, minHeight: 40, borderRadius: 999, borderWidth: 1, borderColor: on ? colors.accentInk : colors.border, backgroundColor: on ? colors.accentSoft : colors.surface }]}
              >
                <Avatar initials={initialsOf(a.name)} color={a.color} size={30} />
                <Txt variant="small" style={{ fontSize: 14, color: on ? colors.accentInk : colors.text }}>{a.name.split(' ')[0]}</Txt>
                {on ? <Icon name="check" size={14} strokeWidth={3} color={colors.accentInk} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Quem pode ver</Txt>
        <Segmented label="Quem pode ver" options={VIS} value={vis} onChange={setVis} />
      </View>

      <TextField label="Recado (opcional)" value={note} onChangeText={(t) => setNote(t.slice(0, 140))} placeholder="Ex.: Ritmo de conversa, ninguém fica para trás." multiline multilineHeight={80} />
    </Screen>
  );
}

function Stepper({ label, sign, onPress }: { label: string; sign: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
    >
      <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 20, color: colors.text }}>{sign}</Txt>
    </Pressable>
  );
}
