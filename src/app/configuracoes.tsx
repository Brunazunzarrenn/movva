import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { Txt } from '@/components/Txt';
import { Header, Screen, Segmented, s } from '@/components/ui';
import { useSports } from '@/data/SportsStore';
import { me } from '@/data/mock';
import { fonts } from '@/theme/fonts';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

const THEME_LABEL = { Escuro: 'escuro', Claro: 'claro', Auto: 'auto' } as const;
type ThemeLabel = keyof typeof THEME_LABEL;
const LABEL_OF: Record<ThemePreference, ThemeLabel> = { escuro: 'Escuro', claro: 'Claro', auto: 'Auto' };

const PRIVACY = [
  { id: 'priv', label: 'Perfil privado', help: 'Só seguidores aprovados veem seus posts.' },
  { id: 'zone', label: 'Esconder início e fim do percurso', help: 'Protege sua casa e trabalho nos mapas.' },
  { id: 'invites', label: 'Convites só de seguidores', help: 'Bora Treinar? de desconhecidos não chega.' },
  { id: 'terr', label: 'Participar dos Territórios', help: 'Seus treinos contam para as áreas do mapa.' },
] as const;

export default function Configuracoes() {
  const { colors, preference, setPreference } = useTheme();
  const { suggestions } = useSports();
  const pending = suggestions.filter((x) => x.status === 'pendente').length;
  const [sw, setSw] = useState<Record<string, boolean>>({ priv: false, zone: true, invites: true, terr: true });

  const Row = ({ label, danger, onPress }: { label: string; danger?: boolean; onPress?: () => void }) => (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 50, paddingHorizontal: 16, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.divider }}>
      <Txt color={danger ? colors.danger : colors.text}>{label}</Txt>
    </Pressable>
  );

  return (
    <Screen>
      <Header title="Configurações" />

      <View style={{ gap: 8 }}>
        <Txt variant="eyebrow" tone="muted">Aparência</Txt>
        <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.surface, gap: 10 }}>
          <Txt variant="bodyStrong">Tema do app</Txt>
          <Segmented
            label="Tema do app"
            options={['Escuro', 'Claro', 'Auto'] as const}
            value={LABEL_OF[preference]}
            onChange={(v) => setPreference(THEME_LABEL[v])}
          />
          <Txt variant="caption" tone="muted">
            {preference === 'auto' ? 'Segue o tema do celular.' : 'Sua escolha fica salva neste aparelho.'}
          </Txt>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="eyebrow" tone="muted">Privacidade</Txt>
        <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
          {PRIVACY.map((it) => (
            <View key={it.id} style={[s.row, { gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt>{it.label}</Txt>
                <Txt variant="caption" tone="muted">{it.help}</Txt>
              </View>
              <Switch
                accessibilityLabel={it.label}
                value={sw[it.id]}
                onValueChange={(v) => setSw((cur) => ({ ...cur, [it.id]: v }))}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
                // no web o RN usa um verde-azulado padrão; mantém a bolinha branca
                {...({ activeThumbColor: '#FFFFFF' } as object)}
                ios_backgroundColor={colors.border}
              />
            </View>
          ))}
        </View>
      </View>

      {me.isAdmin ? (
        <View style={{ gap: 8 }}>
          <Txt variant="eyebrow" tone="muted">Administração</Txt>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/admin/esportes')}
            style={[s.row, { gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentSoftBorder }]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="bodyStrong" tone="accent">Esportes sugeridos</Txt>
              <Txt variant="caption" tone="soft">Aprovar, juntar ou recusar esportes enviados pelos usuários</Txt>
            </View>
            {pending > 0 ? (
              <View style={{ minWidth: 28, height: 28, paddingHorizontal: 8, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Txt style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: colors.onAccent }}>{pending}</Txt>
              </View>
            ) : null}
          </Pressable>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <Txt variant="eyebrow" tone="muted">Conta e dados</Txt>
        <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: 'hidden' }}>
          <Row label="Exportar meus dados" />
          <Row label="Contas bloqueadas e denúncias" />
          <Row label="Excluir minha conta" danger />
          <Row label="Sair" onPress={() => router.replace('/boas-vindas')} />
        </View>
      </View>
    </Screen>
  );
}
