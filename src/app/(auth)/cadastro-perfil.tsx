import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Progress } from '@/components/Progress';
import { Txt } from '@/components/Txt';
import { Button, Chip, IconButton, Screen, s } from '@/components/ui';
import { levels } from '@/data/mock';
import { maskDate } from '@/utils/format';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type FieldProps = {
  label: string; help?: string; error?: string | null; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'number-pad'; maxLength?: number;
};

function Field({ label, help, error, value, onChangeText, placeholder, keyboardType = 'default', maxLength }: FieldProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Txt variant="bodyStrong">{label}</Txt>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={{
          height: 52, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.body, fontSize: 16,
        }}
      />
      {error ? <Txt variant="caption" tone="danger">{error}</Txt> : help ? <Txt variant="caption" tone="muted">{help}</Txt> : null}
    </View>
  );
}

function dateError(v: string): string | null {
  if (v.length < 10) return null; // ainda digitando
  const [dd, mm, yyyy] = v.split('/').map(Number);
  const dt = new Date(yyyy, mm - 1, dd);
  const valid = dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
  if (!valid) return 'Data inválida. Confira dia, mês e ano.';
  const year = new Date().getFullYear();
  if (yyyy < year - 100 || dt > new Date()) return 'Confira o ano de nascimento.';
  return null;
}

export default function CadastroPerfil() {
  const [level, setLevel] = useState<string>('Intermediário');
  const [region, setRegion] = useState('Belo Horizonte, MG');
  const [birth, setBirth] = useState('');
  const birthError = dateError(birth);

  return (
    <Screen footer={<Button label="Concluir cadastro" disabled={!!birthError} onPress={() => router.replace('/(tabs)/feed')} />}>
      <View style={[s.row, { gap: 12 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} style={{ marginLeft: -12 }} />
        <Progress step={2} total={2} />
      </View>
      <Txt variant="title" accessibilityRole="header">Conte um pouco sobre você</Txt>

      <View style={{ gap: 10 }}>
        <Txt variant="bodyStrong">Seu nível</Txt>
        <View accessibilityRole="radiogroup" style={[s.wrap, { gap: 10 }]}>
          {levels.map((l) => (
            <Chip key={l} label={l} selected={l === level} onPress={() => setLevel(l)} style={{ flexGrow: 1, flexBasis: '45%', borderRadius: 14, minHeight: 52 }} />
          ))}
        </View>
      </View>

      <Field label="Sua região" value={region} onChangeText={setRegion} help="Mostramos só a região, nunca seu endereço." />
      <Field
        label="Data de nascimento"
        value={birth}
        onChangeText={(t) => setBirth(maskDate(t))}
        placeholder="dd/mm/aaaa"
        keyboardType="number-pad"
        maxLength={10}
        error={birthError}
        help="Não aparece no perfil. Menores de 18 anos têm proteções extras ativadas."
      />
    </Screen>
  );
}
