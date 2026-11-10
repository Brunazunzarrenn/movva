import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { usePerson } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Header, RouteMap, Screen, SectionTitle, VerifiedBadge, s } from '@/components/ui';
import { athleteById, inviteStatus, whenLabel } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const hm = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function ConviteDetalhe() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invites, joined, declined, checkins, setJoined, decline, checkIn, cancelInvite, chat } = useCommunity();
  const person = usePerson();
  const inv = invites.find((i) => i.id === id);

  if (!inv) {
    return (
      <Screen>
        <Header title="Convite" />
        <Txt tone="muted" style={{ textAlign: 'center', marginTop: 40 }}>Esse convite foi cancelado ou não existe mais.</Txt>
      </Screen>
    );
  }

  const host = person(inv.hostId);
  const hostAthlete = athleteById(inv.hostId);
  const isHost = inv.hostId === 'me';
  const going = isHost || !!joined[inv.id];
  const invitedMe = inv.invited.includes('me') && !going && !declined[inv.id];
  const st = inviteStatus(inv.start);
  const people = isHost ? ['me', ...inv.participants] : going ? [...inv.participants, 'me'] : inv.participants;
  const full = people.length >= inv.spots;
  const checked = checkins[inv.id];
  const opensAt = new Date(new Date(inv.start).getTime() - 30 * 60000).toISOString();
  const lastMsg = chat(inv.id).slice(-1)[0];

  const info: { icon: IconName; label: string; value: string }[] = [
    { icon: 'clock', label: 'Quando', value: whenLabel(inv.start) },
    { icon: 'pin', label: 'Onde', value: inv.place },
    { icon: 'trend', label: 'Nível', value: inv.level },
    ...(inv.distance ? [{ icon: 'flag' as IconName, label: 'Distância', value: inv.distance }] : []),
    ...(inv.pace ? [{ icon: 'bolt' as IconName, label: 'Ritmo', value: inv.pace }] : []),
    { icon: 'users', label: 'Vagas', value: `${people.length} de ${inv.spots} confirmados` },
  ];

  const footer = isHost ? (
    <View style={[s.row, { gap: 8 }]}>
      <Button label="Cancelar convite" variant="danger" size="md" onPress={() => { cancelInvite(inv.id); router.back(); }} style={{ flex: 1 }} />
      <Button label="Abrir chat" size="md" onPress={() => router.push({ pathname: '/convite/chat/[id]', params: { id: inv.id } })} style={{ flex: 1 }} />
    </View>
  ) : going ? (
    <View style={[s.row, { gap: 8 }]}>
      <Button label="Sair do treino" variant="secondary" size="md" onPress={() => setJoined(inv.id, false)} style={{ flex: 1 }} />
      <Button label="Abrir chat" size="md" onPress={() => router.push({ pathname: '/convite/chat/[id]', params: { id: inv.id } })} style={{ flex: 1 }} />
    </View>
  ) : invitedMe ? (
    <View style={[s.row, { gap: 8 }]}>
      <Button label="Recusar" variant="secondary" size="md" onPress={() => decline(inv.id)} style={{ flex: 1 }} />
      <Button label="Aceitar convite" size="md" disabled={full} onPress={() => setJoined(inv.id, true)} style={{ flex: 1 }} />
    </View>
  ) : (
    <Button
      label={st === 'encerrado' ? 'Treino encerrado' : full ? 'Lotado' : 'Quero ir'}
      icon="check"
      disabled={full || st === 'encerrado'}
      onPress={() => setJoined(inv.id, true)}
    />
  );

  return (
    <Screen footer={footer}>
      <Header title={inv.title} subtitle={inv.sport} />

      <View style={{ borderRadius: 18, overflow: 'hidden' }}>
        {inv.route ? (
          <RouteMap path={inv.route} height={150} />
        ) : (
          <View style={{ height: 110, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon name="pin" size={30} color={colors.accentInk} />
            <Txt variant="caption" tone="muted">{inv.place}</Txt>
          </View>
        )}
      </View>

      {invitedMe ? (
        <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold, gap: 4 }}>
          <Txt variant="bodyStrong">{host.short} te convidou para esse treino</Txt>
          <Txt variant="caption" tone="soft">Aceite para entrar no chat e fazer check-in no dia.</Txt>
        </View>
      ) : null}

      {/* Check-in: abre 30 min antes e vai até 2 h depois do horário. */}
      {going && st !== 'encerrado' ? (
        checked ? (
          <View style={[s.row, { gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder }]}>
            <Icon name="check" size={24} strokeWidth={3} color={colors.accentInk} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="bodyStrong" tone="accent">Check-in feito às {hm(checked)}</Txt>
              <Txt variant="caption" tone="soft">Presença confirmada. O treino conta como treino em grupo no seu perfil.</Txt>
            </View>
          </View>
        ) : st === 'check-in' ? (
          <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accentInk, gap: 10 }}>
            <Txt variant="bodyStrong">Chegou no ponto de encontro?</Txt>
            <Txt variant="caption" tone="muted">Faça o check-in para confirmar presença. No app final, ele usa sua localização para validar que você está no local.</Txt>
            <Button label="Fazer check-in" icon="pin" onPress={() => checkIn(inv.id)} />
          </View>
        ) : (
          <View style={[s.row, { gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.surface }]}>
            <Icon name="clock" size={20} color={colors.textMuted} />
            <Txt variant="small" tone="soft" style={{ flex: 1, fontSize: 14 }}>Check-in abre às {hm(opensAt)} ({whenLabel(opensAt).split(' · ')[0].toLowerCase()}).</Txt>
          </View>
        )
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!hostAthlete}
        onPress={() => hostAthlete && router.push({ pathname: '/atleta/[id]', params: { id: hostAthlete.id } })}
        style={[s.row, { gap: 12 }]}
      >
        <Avatar initials={host.initials} color={host.color} size={44} uri={host.uri} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="caption" tone="muted">Organizado por</Txt>
          <Txt variant="bodyStrong">{isHost ? 'Você' : host.name}</Txt>
        </View>
        {hostAthlete?.verified ? <VerifiedBadge /> : null}
      </Pressable>

      <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
        {info.map((it, i) => (
          <View key={it.label} style={[s.row, { gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.divider }]}>
            <Icon name={it.icon} size={18} color={colors.accentInk} />
            <Txt variant="small" tone="muted" style={{ width: 78, fontSize: 14 }}>{it.label}</Txt>
            <Txt variant="small" style={{ flex: 1, fontSize: 14, fontFamily: fonts.bodySemi }}>{it.value}</Txt>
          </View>
        ))}
      </View>

      {inv.note ? (
        <Txt variant="small" tone="soft" style={{ fontSize: 14, fontStyle: 'italic' }}>“{inv.note}”</Txt>
      ) : null}

      <View style={{ gap: 10 }}>
        <SectionTitle right={<Txt variant="small" tone="muted">{people.length}/{inv.spots}</Txt>}>Quem vai</SectionTitle>
        {people.map((pid) => {
          const p = person(pid);
          const here = (pid === 'me' && !!checked) || (pid === inv.hostId && pid !== 'me' && st === 'check-in');
          return (
            <Pressable
              key={pid}
              accessibilityRole="button"
              disabled={pid === 'me'}
              onPress={() => router.push({ pathname: '/atleta/[id]', params: { id: pid } })}
              style={[s.row, { gap: 12 }]}
            >
              <Avatar initials={p.initials} color={p.color} size={38} uri={p.uri} />
              <Txt variant="small" style={{ flex: 1, fontSize: 15 }}>{pid === 'me' ? `${p.name} (você)` : p.name}</Txt>
              {pid === inv.hostId ? <Txt variant="caption" tone="muted">organiza</Txt> : null}
              {here ? (
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: colors.accentSoft }}>
                  <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: colors.accentInk }}>no local</Txt>
                </View>
              ) : null}
            </Pressable>
          );
        })}
        {inv.invited.filter((x) => x !== 'me' && !people.includes(x)).map((pid) => {
          const p = person(pid);
          return (
            <View key={pid} style={[s.row, { gap: 12, opacity: 0.6 }]}>
              <Avatar initials={p.initials} color={p.color} size={38} />
              <Txt variant="small" style={{ flex: 1, fontSize: 15 }}>{p.name}</Txt>
              <Txt variant="caption" tone="muted">convidado</Txt>
            </View>
          );
        })}
      </View>

      {going && lastMsg ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/convite/chat/[id]', params: { id: inv.id } })}
          style={[s.row, { gap: 10, padding: 12, borderRadius: 14, backgroundColor: colors.surface }]}
        >
          <Icon name="comment" size={20} color={colors.accentInk} />
          <Txt variant="small" tone="soft" numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
            <Txt variant="small" style={{ fontFamily: fonts.bodySemi, fontSize: 14 }}>{person(lastMsg.authorId).short}: </Txt>
            {lastMsg.text}
          </Txt>
          <Icon name="chevron" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Screen>
  );
}
