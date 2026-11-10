import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { usePerson } from '@/components/social';
import { Txt } from '@/components/Txt';
import { Avatar, IconButton, s } from '@/components/ui';
import { whenLabel } from '@/data/community';
import { useCommunity } from '@/data/CommunityStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const hm = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function ChatTreino() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invites, chat, sendMessage, joined } = useCommunity();
  const person = usePerson();
  const [draft, setDraft] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);
  const inv = invites.find((i) => i.id === id);
  const going = !!inv && (inv.hostId === 'me' || !!joined[inv.id]);
  const msgs = chat(id);

  const send = () => {
    const t = draft.trim();
    if (!t || !going) return;
    sendMessage(id, t);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[s.row, { gap: 6, paddingTop: insets.top + 8, paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="bodyStrong" numberOfLines={1}>{inv?.title ?? 'Chat do treino'}</Txt>
          {inv ? <Txt variant="caption" tone="muted">{whenLabel(inv.start)} · {inv.place}</Txt> : null}
        </View>
      </View>

      <ScrollView
        ref={scroll}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>Só quem confirmou presença vê e escreve aqui.</Txt>
        {msgs.map((m) => {
          const mine = m.authorId === 'me';
          const p = person(m.authorId);
          return (
            <View key={m.id} style={[s.row, { gap: 8, alignItems: 'flex-end', justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
              {!mine ? <Avatar initials={p.initials} color={p.color} size={30} /> : null}
              <View
                style={{
                  maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, gap: 2, borderRadius: 16,
                  borderBottomLeftRadius: mine ? 16 : 4, borderBottomRightRadius: mine ? 4 : 16,
                  backgroundColor: mine ? colors.accent : colors.surface,
                }}
              >
                {!mine ? <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: p.color }}>{p.short}</Txt> : null}
                <Txt style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 20, color: mine ? colors.onAccent : colors.text }}>{m.text}</Txt>
                <Txt style={{ fontFamily: fonts.body, fontSize: 10, alignSelf: 'flex-end', color: mine ? colors.onAccent : colors.textFaint, opacity: 0.8 }}>{hm(m.at)}</Txt>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {going ? (
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 10, backgroundColor: colors.nav, borderTopWidth: 1, borderTopColor: colors.divider }]}>
          <TextInput
            accessibilityLabel="Escreva uma mensagem"
            placeholder="Mensagem para o grupo"
            placeholderTextColor={colors.textFaint}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            returnKeyType="send"
            style={{ flex: 1, height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.body, fontSize: 14 }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            onPress={send}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() ? 1 : 0.5 }}
          >
            <Icon name="send" size={20} color={colors.onAccent} />
          </Pressable>
        </View>
      ) : (
        <View style={{ padding: 16, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: colors.divider }}>
          <Txt variant="small" tone="muted" style={{ textAlign: 'center' }}>Confirme presença no treino para participar do chat.</Txt>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
