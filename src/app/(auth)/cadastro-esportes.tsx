import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Txt } from '@/components/Txt';
import { Progress } from '@/components/Progress';
import { Button, Chip, IconButton, Screen, s } from '@/components/ui';
import { sportsList } from '@/data/mock';

export default function CadastroEsportes() {
  const [picked, setPicked] = useState<string[]>(['Corrida', 'Ciclismo']);
  const toggle = (sp: string) => setPicked((cur) => (cur.includes(sp) ? cur.filter((x) => x !== sp) : [...cur, sp]));
  const n = picked.length;

  return (
    <Screen
      footer={
        <>
          <Txt variant="small" tone="muted" style={{ textAlign: 'center' }}>
            {n} {n === 1 ? 'esporte escolhido' : 'esportes escolhidos'}
          </Txt>
          <Button label="Continuar" disabled={n === 0} onPress={() => router.push('/cadastro-perfil')} />
        </>
      }
    >
      <View style={[s.row, { gap: 12 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} style={{ marginLeft: -12 }} />
        <Progress step={1} total={2} />
      </View>
      <View style={{ gap: 8 }}>
        <Txt variant="title" accessibilityRole="header">Quais esportes você pratica?</Txt>
        <Txt tone="muted">Escolha quantos quiser. Isso ajuda a montar seu feed e sugerir desafios.</Txt>
      </View>
      <View style={[s.wrap, { gap: 10 }]}>
        {sportsList.map((sp) => (
          <Chip key={sp} label={sp} selected={picked.includes(sp)} onPress={() => toggle(sp)} />
        ))}
      </View>
    </Screen>
  );
}
