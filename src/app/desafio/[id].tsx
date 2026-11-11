import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Bar, ChallengeMedal, RankRow, challengeState } from '@/components/arena';
import { Txt } from '@/components/Txt';
import { Button, Header, Screen, SectionTitle, s } from '@/components/ui';
import { creatorName, fmtGoal, goalTypes } from '@/data/arena';
import { useCommunity } from '@/data/CommunityStore';
import { fonts } from '@/theme/fonts';
import { rarityLabel } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

const dm = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export default function DesafioDetalhe() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { challenges, joinedChallenges, setChallengeJoined, deleteChallenge } = useCommunity();
  const c = challenges.find((x) => x.id === id);
  const st = c ? challengeState(c, joinedChallenges) : null;

  if (!c || !st) {
    return (
      <Screen>
        <Header title="Desafio" />
        <Txt tone="muted" style={{ textAlign: 'center', marginTop: 40 }}>Esse desafio não existe mais.</Txt>
      </Screen>
    );
  }

  const goal = goalTypes.find((g) => g.id === c.goal)!;
  const mineCreator = c.creatorId === 'me';
  const rows = [...Object.entries(c.progress).map(([pid, v]) => ({ id: pid, value: v })), ...(st.joined ? [{ id: 'me', value: st.mine }] : [])]
    .sort((a, b) => b.value - a.value);

  const footer = mineCreator ? (
    <Button label="Excluir desafio" variant="danger" onPress={() => { deleteChallenge(c.id); router.back(); }} />
  ) : st.joined ? (
    <Button label="Sair do desafio" variant="secondary" onPress={() => setChallengeJoined(c.id, false)} />
  ) : (
    <Button label={st.invited ? 'Aceitar e participar' : 'Participar do desafio'} onPress={() => setChallengeJoined(c.id, true)} />
  );

  return (
    <Screen footer={footer}>
      <Header title="Desafio" />

      <View style={{ alignItems: 'center', gap: 10 }}>
        <ChallengeMedal medal={c.medal} size={104} />
        <Txt style={{ fontFamily: fonts.display, fontSize: 28, color: colors.text, textAlign: 'center' }}>{c.title}</Txt>
        <Txt variant="small" tone="muted" style={{ textAlign: 'center' }}>
          {c.creatorId === 'movva' ? 'Desafio oficial MOVVA' : c.creatorId === 'me' ? 'Criado por você' : `Criado por ${creatorName(c.creatorId)}`} · {c.visibility.toLowerCase()}
        </Txt>
      </View>

      {st.invited ? (
        <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold, gap: 4 }}>
          <Txt variant="bodyStrong">{creatorName(c.creatorId).split(' ')[0]} te convidou para esse desafio</Txt>
          <Txt variant="caption" tone="soft">É um desafio privado: só quem foi convidado vê e participa.</Txt>
        </View>
      ) : null}

      {st.joined ? (
        <View style={{ padding: 16, borderRadius: 18, backgroundColor: colors.surface, gap: 8 }}>
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <Txt variant="bodyStrong">Seu progresso</Txt>
            <Txt variant="small" tone="muted">{Math.round((st.mine / c.target) * 100)}%</Txt>
          </View>
          <Bar value={st.mine / c.target} height={10} />
          <Txt variant="small" tone="soft">
            <Txt variant="small" style={{ fontFamily: fonts.bodySemi }}>{fmtGoal(st.mine, c.goal)}</Txt> de {fmtGoal(c.target, c.goal)} · faltam {st.left} dias
          </Txt>
          <Txt variant="caption" tone="faint">Os treinos gravados no MOVVA ou no relógio conectado somam aqui sozinhos.</Txt>
        </View>
      ) : null}

      <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
        {[
          ['Esporte', c.sport],
          ['Meta', `${fmtGoal(c.target, c.goal)} · ${goal.label.toLowerCase()}`],
          ['Período', `${dm(c.start)} a ${dm(c.end)}`],
          ['Medalha', c.medal.palette !== undefined ? 'Personalizada' : rarityLabel[c.medal.rarity]],
          ['Participantes', st.people.toLocaleString('pt-BR')],
        ].map(([k, v], i) => (
          <View key={k} style={[s.row, { paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider }]}>
            <Txt variant="small" tone="muted" style={{ width: 110, fontSize: 14 }}>{k}</Txt>
            <Txt variant="small" style={{ flex: 1, fontSize: 14, fontFamily: fonts.bodySemi }}>{v}</Txt>
          </View>
        ))}
      </View>

      <Txt variant="small" tone="soft" style={{ fontSize: 14 }}>{c.description}</Txt>

      <View style={{ gap: 6 }}>
        <SectionTitle right={c.crowd ? <Txt variant="caption" tone="muted">entre quem você conhece</Txt> : undefined}>Classificação</SectionTitle>
        {rows.length ? (
          rows.map((r, i) => (
            <RankRow key={r.id} pos={i + 1} id={r.id} value={fmtGoal(r.value, c.goal)} sub={`${Math.min(100, Math.round((r.value / c.target) * 100))}% da meta`} />
          ))
        ) : (
          <Txt variant="small" tone="muted">Ninguém começou ainda.</Txt>
        )}
      </View>
    </Screen>
  );
}

