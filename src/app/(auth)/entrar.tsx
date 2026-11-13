import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Button, IconButton, Screen, Segmented, s } from '@/components/ui';
import { useProfile } from '@/data/ProfileStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

// Entrar ou criar conta com e-mail e senha.
// (O código por e-mail volta quando tivermos um e-mail próprio configurado no Supabase.)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MODES = ['Criar conta', 'Já tenho conta'] as const;
const MIN_PASS = 8;

export default function Entrar() {
  const { colors } = useTheme();
  const { signUpEmail, signInEmail } = useProfile();
  const [mode, setMode] = useState<(typeof MODES)[number]>('Criar conta');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creating = mode === 'Criar conta';
  const emailErr = EMAIL_RE.test(email) ? null : 'Digite um e-mail válido.';
  const passErr = password.length >= MIN_PASS ? null : `A senha precisa ter pelo menos ${MIN_PASS} caracteres.`;
  const confirmErr = !creating || confirm === password ? null : 'As senhas não são iguais.';

  const submit = async () => {
    setTried(true);
    setError(null);
    if (emailErr || passErr || confirmErr) return;
    setBusy(true);
    const err = creating ? await signUpEmail(email, password) : await signInEmail(email, password);
    setBusy(false);
    if (err) { setError(err); return; }
    // O index decide: perfil pronto → feed; conta nova → cadastro do perfil.
    router.replace('/');
  };

  return (
    <Screen
      footer={
        <View style={{ gap: 8 }}>
          {error ? <Txt variant="small" tone="danger" style={{ textAlign: 'center' }}>{error}</Txt> : null}
          <Button label={busy ? 'Aguarde…' : creating ? 'Criar conta' : 'Entrar'} disabled={busy} onPress={submit} />
        </View>
      }
    >
      <View style={[s.row, { gap: 12 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} style={{ marginLeft: -12 }} />
      </View>
      <View style={{ gap: 8 }}>
        <Txt variant="title" accessibilityRole="header">{creating ? 'Criar sua conta' : 'Entrar'}</Txt>
        <Txt tone="muted">{creating ? 'Use seu e-mail e escolha uma senha. Depois você monta o perfil.' : 'Entre com o e-mail e a senha da sua conta.'}</Txt>
      </View>

      <Segmented label="Criar conta ou entrar" options={MODES} value={mode} onChange={(m) => { setMode(m); setError(null); setTried(false); }} />

      <TextField
        label="E-mail"
        value={email}
        onChangeText={(t) => setEmail(t.trim())}
        placeholder="voce@email.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        error={tried ? emailErr : null}
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        placeholder={creating ? `Pelo menos ${MIN_PASS} caracteres` : 'Sua senha'}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={creating ? 'new-password' : 'current-password'}
        textContentType={creating ? 'newPassword' : 'password'}
        error={tried ? passErr : null}
      />
      {creating ? (
        <TextField
          label="Repita a senha"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={submit}
          error={tried ? confirmErr : null}
        />
      ) : null}
      <Pressable accessibilityRole="button" onPress={() => setShow((v) => !v)} style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}>
        <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.accentInk }}>{show ? 'Esconder senha' : 'Mostrar senha'}</Txt>
      </Pressable>
    </Screen>
  );
}
