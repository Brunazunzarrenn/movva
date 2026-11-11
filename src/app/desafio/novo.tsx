import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ChallengeMedal } from '@/components/arena';
import { Icon } from '@/components/Icon';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Chip, Header, Screen, Segmented, s } from '@/components/ui';
import { challengeSports, fmtGoal, goalTypes, medalPalettes, type ChallengeSport, type GoalType } from '@/data/arena';
import { athletes } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { initialsOf } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const DURATIONS = [7, 14, 30] as const;
const VIS = ['Público', 'Privado'] as const;

export default function NovoDesafio() {
  const { colors } = useTheme();
  const { createChallenge } = useCommunity();
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<ChallengeSport>('Corrida');
  const [goal, setGoal] = useState<GoalType>('dist');
  const [target, setTarget] = useState(goalTypes[0].def);
  const [days, setDays] = useState<(typeof DURATIONS)[number]>(30);
  const [vis, setVis] = useState<(typeof VIS)[number]>('Público');
  const [invited, setInvited] = useState<string[]>([]);
  const [mark, setMark] = useState('');
  const [palette, setPalette] = useState<number | undefined>(undefined);
  const [tried, setTried] = useState(false);

  const g = goalTypes.find((x) => x.id === goal)!;
  const titleErr = title.trim().length < 3 ? 'Dê um nome ao desafio.' : null;
  const medalMark = mark.trim() || String(target).slice(0, 3);
  const pickGoal = (id: GoalType) => {
    setGoal(id);
    setTarget(goalTypes.find((x) => x.id === id)!.def);
  };

  const create = () => {
    setTried(true);
    if (titleErr) return;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + days - 1); end.setHours(23, 59, 59, 0);
    const c = createChallenge({
      title: title.trim(),
      sport,
      goal,
      target,
      start: start.toISOString(),
      end: end.toISOString(),
      visibility: vis,
      description: `${fmtGoal(target, goal)} de ${sport.toLowerCase()} em ${days} dias.`,
      medal: { mark: medalMark, rarity: 'rara', palette },
      invited,
    });
    router.replace({ pathname: '/desafio/[id]', params: { id: c.id } });
  };

  return (
    <Screen footer={<Button label="Criar desafio" onPress={create} />}>
      <Header title="Criar desafio" subtitle="Monte o seu e chame quem quiser" />

      <TextField label="Nome do desafio" value={title} onChangeText={(t) => setTitle(t.slice(0, 40))} placeholder="Ex.: 200 km até o Natal" error={tried ? titleErr : null} />

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Esporte</Txt>
        <View style={s.wrap}>
          {challengeSports.map((sp) => <Chip key={sp} label={sp} selected={sp === sport} onPress={() => setSport(sp)} />)}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Tipo de meta</Txt>
        <View accessibilityRole="radiogroup" style={s.wrap}>
          {goalTypes.map((x) => <Chip key={x.id} label={x.label} selected={x.id === goal} onPress={() => pickGoal(x.id)} />)}
        </View>
        <Txt variant="caption" tone="muted">{g.help}</Txt>
      </View>

      <View style={[s.row, { justifyContent: 'space-between', padding: 14, borderRadius: 16, backgroundColor: colors.surface }]}>
        <Txt variant="bodyStrong">Meta</Txt>
        <View style={[s.row, { gap: 6 }]}>
          <Step label="Diminuir meta" sign="−" onPress={() => setTarget((v) => Math.max(g.step, v - g.step))} />
          <Txt variant="number" style={{ minWidth: 92, textAlign: 'center' }}>{fmtGoal(target, goal)}</Txt>
          <Step label="Aumentar meta" sign="+" onPress={() => setTarget((v) => v + g.step)} />
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Duração</Txt>
        <View style={[s.row, { gap: 8 }]}>
          {DURATIONS.map((d) => <Chip key={d} label={`${d} dias`} selected={d === days} onPress={() => setDays(d)} style={{ flex: 1 }} />)}
        </View>
        <Txt variant="caption" tone="muted">Começa hoje.</Txt>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Quem pode ver</Txt>
        <Segmented label="Quem pode ver" options={VIS} value={vis} onChange={setVis} />
        <Txt variant="caption" tone="muted">{vis === 'Público' ? 'Aparece na Arena para todo mundo entrar.' : 'Só quem você convidar vê e participa.'}</Txt>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Convidar</Txt>
        <View style={s.wrap}>
          {athletes.filter((a) => !a.club).map((a) => {
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

      <View style={{ gap: 10, padding: 14, borderRadius: 16, backgroundColor: colors.surface }}>
        <View style={[s.row, { gap: 8 }]}>
          <Txt variant="bodyStrong" style={{ flex: 1 }}>Medalha</Txt>
          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.accent }}>
            <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.onAccent }}>PRO</Txt>
          </View>
        </View>
        <View style={[s.row, { gap: 14 }]}>
          <ChallengeMedal medal={{ mark: medalMark, rarity: 'rara', palette }} size={72} />
          <View style={{ flex: 1, gap: 8 }}>
            <TextField label="Texto da medalha" value={mark} onChangeText={(t) => setMark(t.toUpperCase().slice(0, 3))} placeholder={String(target).slice(0, 3)} help="Até 3 caracteres" />
          </View>
        </View>
        <View style={s.wrap}>
          <Chip label="Padrão" selected={palette === undefined} onPress={() => setPalette(undefined)} />
          {medalPalettes.map((p, i) => <Chip key={p.name} label={p.name} selected={palette === i} onPress={() => setPalette(i)} />)}
        </View>
        <Txt variant="caption" tone="muted">Medalha personalizada é do plano Pro. Na versão de teste fica liberada.</Txt>
      </View>
    </Screen>
  );
}

function Step({ label, sign, onPress }: { label: string; sign: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 20, color: colors.text }}>{sign}</Txt>
    </Pressable>
  );
}
