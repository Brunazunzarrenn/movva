import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { EmptyState } from '@/components/profileParts';
import { usePerson } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, Header, Screen, SectionTitle, s } from '@/components/ui';
import { agoLabel, minutesSince } from '@/data/community';
import { useNotifications, type Notif } from '@/data/notifications';
import { useTheme } from '@/theme/ThemeProvider';

export default function Notificacoes() {
  const { items, seenAt, markSeen } = useNotifications();
  // Guarda o "visto até" de quando a tela abriu, para as novas continuarem destacadas.
  const openedSeen = useRef(seenAt).current;
  // Marca como vistas uma vez ao abrir (a função muda a cada atualização da loja).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { markSeen(); }, []);

  const fresh = items.filter((n) => new Date(n.at).getTime() > openedSeen);
  const old = items.filter((n) => new Date(n.at).getTime() <= openedSeen);

  return (
    <Screen>
      <Header title="Notificações" />
      {items.length === 0 ? (
        <EmptyState icon="bell" title="Nada por aqui ainda" text="Quando alguém seguir você, responder, aceitar um duelo ou te convidar para treinar, aparece aqui." />
      ) : null}
      {fresh.length ? (
        <View style={{ gap: 4 }}>
          <SectionTitle>Novas</SectionTitle>
          {fresh.map((n) => <Row key={n.id} n={n} fresh />)}
        </View>
      ) : null}
      {old.length ? (
        <View style={{ gap: 4 }}>
          <SectionTitle>Anteriores</SectionTitle>
          {old.map((n) => <Row key={n.id} n={n} />)}
        </View>
      ) : null}
    </Screen>
  );
}

function Row({ n, fresh }: { n: Notif; fresh?: boolean }) {
  const { colors } = useTheme();
  const person = usePerson();
  const p = n.actorId ? person(n.actorId) : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${n.text} ${agoLabel(minutesSince(n.at))}`}
      onPress={() => router.push(n.href)}
      style={({ pressed }) => [s.row, { gap: 12, padding: 12, borderRadius: 16, alignItems: 'flex-start', backgroundColor: fresh ? colors.accentSoft : 'transparent', opacity: pressed ? 0.8 : 1 }]}
    >
      <View>
        {p ? (
          <Avatar initials={p.initials} color={p.color} size={42} uri={p.uri} />
        ) : (
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={n.icon} size={20} color={colors.accentInk} />
          </View>
        )}
        {p ? (
          <View style={{ position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={n.icon} size={11} strokeWidth={2.5} color={colors.onAccent} />
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="small" style={{ fontSize: 14, lineHeight: 20 }}>{n.text}</Txt>
        <Txt variant="caption" tone="muted">{agoLabel(minutesSince(n.at))}</Txt>
      </View>
      {fresh ? <View accessibilityLabel="nova" style={{ width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: colors.accentInk }} /> : null}
    </Pressable>
  );
}
