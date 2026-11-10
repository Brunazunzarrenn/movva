import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { RarityLabel } from '@/components/athlete';
import { Txt } from '@/components/Txt';
import { Button, Header, Screen, s } from '@/components/ui';
import { medals } from '@/data/profile';
import { rarityColors, rarityLabel } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

export default function MedalhaDetalhe() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const medal = medals.find((m) => m.id === id) ?? medals[0];
  const c = rarityColors(medal.rarity, colors);
  const [pinned, setPinned] = useState(false);

  const info = [
    { label: 'Modalidade', value: medal.sport },
    { label: 'Conquistada', value: medal.date },
    ...(medal.highlight ? [medal.highlight] : []),
  ];

  return (
    <Screen
      footer={
        <>
          <Button label="Quero a medalha física" variant="secondary" size="md" onPress={() => router.push('/em-breve')} />
          <View style={[s.row, { gap: 10 }]}>
            <Button label={pinned ? 'Fixada no perfil' : 'Fixar no perfil'} variant="outline" onPress={() => setPinned((v) => !v)} style={{ flex: 1 }} />
            <Button label="Compartilhar" onPress={() => router.push('/em-breve')} style={{ flex: 1 }} />
          </View>
        </>
      }
    >
      <Header title="Medalha" />
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 8 }}>
        <Svg width={180} height={212} viewBox="0 0 200 236" accessibilityLabel={`Medalha ${rarityLabel[medal.rarity]}: ${medal.name}`}>
          <Path d="M62 0 H92 L110 70 H80 Z" fill={colors.accent} />
          <Path d="M138 0 H108 L90 70 H120 Z" fill="#1E8A0A" />
          <Circle cx={100} cy={146} r={86} fill={c.ring} />
          <Circle cx={100} cy={146} r={70} fill={c.bg} />
          <Path d="M64 176 L82 122 L100 158 L118 122 L136 176" fill="none" stroke={c.fg} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: c.ring, backgroundColor: c.bg }}>
          <RarityLabel rarity={medal.rarity} />
        </View>
        <Txt variant="title" style={{ textAlign: 'center' }}>{medal.name}</Txt>
        <Txt tone="soft" style={{ textAlign: 'center' }}>{medal.description}</Txt>
      </View>
      <View style={[s.row, { gap: 8 }]}>
        {info.map((it) => (
          <View key={it.label} style={{ flex: 1, alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: colors.surface, gap: 2 }}>
            <Txt variant="caption" tone="muted">{it.label}</Txt>
            <Txt variant="bodyStrong" style={{ fontSize: 14, textAlign: 'center' }}>{it.value}</Txt>
          </View>
        ))}
      </View>
    </Screen>
  );
}
