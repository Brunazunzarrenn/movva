import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Progress } from '@/components/Progress';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Button, Chip, IconButton, Screen, s } from '@/components/ui';
import { ageFrom, useProfile, type Level } from '@/data/ProfileStore';
import { levels } from '@/data/mock';
import { birthDateError, maskDate } from '@/utils/format';

export default function CadastroPerfil() {
  const { draft, completeSignup } = useProfile();
  const [level, setLevel] = useState<Level | undefined>(draft.level);
  const [region, setRegion] = useState(draft.region ?? '');
  const [birth, setBirth] = useState(draft.birthDate ?? '');
  const [tried, setTried] = useState(false);

  const levelErr = level ? null : 'Escolha seu nível.';
  const regionErr = region.trim().length < 3 ? 'Digite sua cidade ou bairro.' : null;
  const birthErr = birthDateError(birth, !tried);
  const age = birthDateError(birth, false) ? null : ageFrom(birth);

  const finish = () => {
    setTried(true);
    if (levelErr || regionErr || birthDateError(birth, false)) return;
    const p = completeSignup({ level, region: region.trim(), birthDate: birth });
    if (p) router.replace('/(tabs)/feed');
    else router.replace('/cadastro-nome'); // faltou algum passo anterior
  };

  return (
    <Screen footer={<Button label="Concluir cadastro" onPress={finish} />}>
      <View style={[s.row, { gap: 12 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} style={{ marginLeft: -12 }} />
        <Progress step={3} total={3} />
      </View>
      <Txt variant="title" accessibilityRole="header">Conte um pouco sobre você</Txt>

      <View style={{ gap: 10 }}>
        <Txt variant="bodyStrong">Seu nível</Txt>
        <View accessibilityRole="radiogroup" style={[s.wrap, { gap: 10 }]}>
          {levels.map((l) => (
            <Chip key={l} label={l} selected={l === level} onPress={() => setLevel(l)} style={{ flexGrow: 1, flexBasis: '45%', borderRadius: 14, minHeight: 52 }} />
          ))}
        </View>
        {tried && levelErr ? <Txt variant="caption" tone="danger">{levelErr}</Txt> : null}
      </View>

      <TextField
        label="Sua região"
        value={region}
        onChangeText={setRegion}
        placeholder="Ex.: Pampulha, Belo Horizonte"
        autoCapitalize="words"
        error={tried ? regionErr : null}
        help="Mostramos só a região, nunca seu endereço."
      />
      <TextField
        label="Data de nascimento"
        value={birth}
        onChangeText={(t) => setBirth(maskDate(t))}
        placeholder="dd/mm/aaaa"
        keyboardType="number-pad"
        maxLength={10}
        error={birthErr}
        help={
          age !== null && age < 18
            ? 'Menor de 18 anos: perfil privado e proteções extras ficam ativados.'
            : 'Não aparece no perfil. Menores de 18 anos têm proteções extras ativadas.'
        }
      />
    </Screen>
  );
}
