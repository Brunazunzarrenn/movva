import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Button, IconButton, Screen, s } from '@/components/ui';
import { useProfile } from '@/data/ProfileStore';

// Entrar (ou criar conta) com e-mail: mandamos um código e a pessoa digita aqui.
// Não tem senha para esquecer.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_SEC = 60;

export default function Entrar() {
  const { sendCode, verifyCode } = useProfile();
  const [step, setStep] = useState<'email' | 'codigo'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const emailErr = EMAIL_RE.test(email.trim()) ? null : 'Digite um e-mail válido.';

  const send = async () => {
    setError(null);
    if (emailErr) { setError(emailErr); return; }
    setBusy(true);
    const err = await sendCode(email);
    setBusy(false);
    if (err) { setError(err); return; }
    setStep('codigo');
    setCode('');
    setWait(RESEND_SEC);
  };

  const verify = async () => {
    setError(null);
    if (code.length < 6) { setError('Digite o código que chegou no e-mail.'); return; }
    setBusy(true);
    const err = await verifyCode(email, code);
    setBusy(false);
    if (err) { setError(err); return; }
    // O index decide: perfil pronto → feed; conta nova → cadastro.
    router.replace('/');
  };

  return (
    <Screen
      footer={
        step === 'email'
          ? <Button label={busy ? 'Enviando…' : 'Receber código'} disabled={busy} onPress={send} />
          : <Button label={busy ? 'Conferindo…' : 'Entrar'} disabled={busy} onPress={verify} />
      }
    >
      <View style={[s.row, { gap: 12 }]}>
        <IconButton
          icon="back"
          label="Voltar"
          onPress={() => (step === 'codigo' ? setStep('email') : router.back())}
          style={{ marginLeft: -12 }}
        />
      </View>

      {step === 'email' ? (
        <>
          <View style={{ gap: 8 }}>
            <Txt variant="title" accessibilityRole="header">Entrar com e-mail</Txt>
            <Txt tone="muted">Vale para entrar ou criar sua conta. Mandamos um código, sem senha.</Txt>
          </View>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={(t) => setEmail(t.trim())}
            placeholder="voce@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            onSubmitEditing={send}
            error={error}
          />
        </>
      ) : (
        <>
          <View style={{ gap: 8 }}>
            <Txt variant="title" accessibilityRole="header">Digite o código</Txt>
            <Txt tone="muted">Enviamos para {email}. Pode levar até 1 minuto. Olhe também o spam.</Txt>
          </View>
          <TextField
            label="Código"
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 8))}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={8}
            onSubmitEditing={verify}
            error={error}
          />
          <Button
            label={wait > 0 ? `Reenviar código em ${wait}s` : 'Reenviar código'}
            variant="ghost"
            size="sm"
            disabled={wait > 0 || busy}
            onPress={send}
          />
        </>
      )}
    </Screen>
  );
}
