import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from './Icon';
import { Txt } from './Txt';
import { Avatar } from './ui';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

// Foto de perfil: mostra a foto escolhida ou as iniciais, e abre a galeria ao tocar.
export function ProfilePhotoPicker({ uri, initials, color, onChange }: { uri?: string; initials: string; color: string; onChange: (uri?: string) => void }) {
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Libere o acesso às fotos nas configurações do celular.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled) onChange(res.assets[0]?.uri);
  };

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={uri ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'} onPress={pick}>
        <Avatar initials={initials} color={color} size={104} uri={uri} />
        <View style={{ position: 'absolute', right: 0, bottom: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, borderWidth: 3, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="camera" size={18} color={colors.onAccent} />
        </View>
      </Pressable>
      {uri ? (
        <Pressable accessibilityRole="button" onPress={() => onChange(undefined)} style={{ minHeight: 32, justifyContent: 'center' }}>
          <Txt variant="small" tone="muted">Remover foto</Txt>
        </Pressable>
      ) : (
        <Txt variant="small" tone="accent" style={{ fontFamily: fonts.bodySemi }}>Adicionar foto (opcional)</Txt>
      )}
      {error ? <Txt variant="caption" tone="danger">{error}</Txt> : null}
    </View>
  );
}
