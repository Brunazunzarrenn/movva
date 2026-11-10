import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Progress } from '@/components/Progress';
import { Txt } from '@/components/Txt';
import { Button, Chip, IconButton, Screen, s } from '@/components/ui';
import { useProfile } from '@/data/ProfileStore';
import { useSports } from '@/data/SportsStore';
import { normalizeSport } from '@/data/sports';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export default function CadastroEsportes() {
  const { colors } = useTheme();
  const { categories, suggest } = useSports();
  const { draft, updateDraft, profile, updateProfile } = useProfile();
  // modo=editar: aberto pelo "Editar perfil"; salva direto no perfil e volta.
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const editing = modo === 'editar' && !!profile;
  const start = editing ? profile : draft;
  const [picked, setPicked] = useState<string[]>(start?.sports ?? []);
  const [custom, setCustom] = useState<string[]>(start?.pendingSports ?? []); // esportes digitados em "Outro", em análise
  const [query, setQuery] = useState('');
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const toggle = (sp: string) => setPicked((cur) => (cur.includes(sp) ? cur.filter((x) => x !== sp) : [...cur, sp]));

  const q = normalizeSport(query);
  const visible = useMemo(
    () =>
      categories
        .map((c) => ({ ...c, sports: q ? c.sports.filter((sp) => normalizeSport(sp).includes(q)) : c.sports }))
        .filter((c) => c.sports.length > 0),
    [categories, q],
  );
  const noResults = q.length > 0 && visible.length === 0;

  const addOther = (raw: string) => {
    const text = raw.trim();
    if (text.length < 3) return;
    const r = suggest(text);
    if (r.kind === 'existente') {
      if (!picked.includes(r.sport)) setPicked((cur) => [...cur, r.sport]);
      setNotice(`“${r.sport}” já está na lista e foi marcado para você.`);
    } else {
      if (!custom.includes(r.name)) setCustom((cur) => [...cur, r.name]);
      setNotice(`“${r.name}” foi enviado para análise. Ele já aparece no seu perfil.`);
    }
    setOtherText('');
    setQuery('');
    setOtherOpen(false);
  };

  const n = picked.length + custom.length;

  const inputStyle = {
    height: 48, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.body, fontSize: 15, flex: 1,
  } as const;

  return (
    <Screen
      footer={
        <>
          <Txt variant="small" tone="muted" style={{ textAlign: 'center' }}>
            {n} {n === 1 ? 'esporte escolhido' : 'esportes escolhidos'}
          </Txt>
          <Button
            label={editing ? 'Salvar esportes' : 'Continuar'}
            disabled={n === 0}
            onPress={() => {
              if (editing) {
                updateProfile({ sports: picked, pendingSports: custom });
                router.back();
              } else {
                updateDraft({ sports: picked, pendingSports: custom });
                router.push('/cadastro-perfil');
              }
            }}
          />
        </>
      }
    >
      <View style={[s.row, { gap: 12 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} style={{ marginLeft: -12 }} />
        {editing ? <Txt variant="bodyStrong">Seus esportes</Txt> : <Progress step={2} total={3} />}
      </View>
      <View style={{ gap: 8 }}>
        <Txt variant="title" accessibilityRole="header">Quais esportes você pratica?</Txt>
        <Txt tone="muted">Escolha quantos quiser. Não achou o seu? Use “Outro esporte” no fim da lista.</Txt>
      </View>

      <View style={[s.row, { gap: 8 }]}>
        <View style={[s.row, { flex: 1, gap: 8, paddingLeft: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            accessibilityLabel="Buscar esporte"
            placeholder="Buscar esporte"
            placeholderTextColor={colors.textFaint}
            value={query}
            onChangeText={setQuery}
            style={[inputStyle, { borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' }]}
          />
        </View>
      </View>

      {notice ? (
        <View style={{ padding: 12, borderRadius: 14, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder }}>
          <Txt variant="small" tone="accent" style={{ fontFamily: fonts.bodySemi }}>{notice}</Txt>
        </View>
      ) : null}

      {custom.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Txt variant="eyebrow" tone="muted">Seus esportes em análise</Txt>
          <View style={s.wrap}>
            {custom.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`Remover ${c}`}
                onPress={() => setCustom((cur) => cur.filter((x) => x !== c))}
                style={[s.row, { gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accentInk, backgroundColor: colors.accentSoft }]}
              >
                <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.accentInk }}>{c}</Txt>
                <Txt variant="caption" tone="muted">em análise</Txt>
                <Icon name="close" size={14} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {visible.map((c) => (
        <View key={c.id} style={{ gap: 8 }}>
          <Txt variant="eyebrow" tone="muted">{c.name}</Txt>
          <View style={s.wrap}>
            {c.sports.map((sp) => (
              <Chip key={sp} label={sp} selected={picked.includes(sp)} onPress={() => toggle(sp)} />
            ))}
          </View>
        </View>
      ))}

      {noResults ? (
        <View style={{ gap: 10, padding: 14, borderRadius: 16, backgroundColor: colors.surface }}>
          <Txt variant="bodyStrong">Não encontramos “{query.trim()}”.</Txt>
          <Txt variant="small" tone="muted">Quer adicionar como um esporte novo? A equipe MOVVA analisa e inclui na lista.</Txt>
          <Button label={`Adicionar “${query.trim()}”`} variant="outline" size="md" icon="plus" onPress={() => addOther(query)} />
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        {otherOpen ? (
          <View style={{ gap: 10, padding: 14, borderRadius: 16, backgroundColor: colors.surface }}>
            <Txt variant="bodyStrong">Qual esporte você pratica?</Txt>
            <View style={[s.row, { gap: 8 }]}>
              <TextInput
                autoFocus
                accessibilityLabel="Nome do esporte"
                placeholder="Ex.: Canoa havaiana"
                placeholderTextColor={colors.textFaint}
                value={otherText}
                onChangeText={setOtherText}
                onSubmitEditing={() => addOther(otherText)}
                returnKeyType="done"
                style={inputStyle}
              />
              <Button label="Adicionar" size="md" disabled={otherText.trim().length < 3} onPress={() => addOther(otherText)} />
            </View>
            <Txt variant="caption" tone="muted">Se ele já existir na lista, a gente marca para você.</Txt>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => { setOtherOpen(true); setNotice(null); }}
            style={[s.row, { alignSelf: 'flex-start', gap: 6, minHeight: 40, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accentInk }]}
          >
            <Icon name="plus" size={16} color={colors.accentInk} />
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.accentInk }}>Outro esporte</Txt>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
