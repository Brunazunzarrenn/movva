import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Switch, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { Button, Chip, Header, Screen, Segmented, s } from '@/components/ui';
import { useProfile } from '@/data/ProfileStore';
import { workouts } from '@/data/profile';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const MAX_PHOTOS = 6;
const MAX_TEXT = 300;
const VIS = ['Público', 'Seguidores', 'Só eu'] as const;

export default function NovoPost() {
  const { colors } = useTheme();
  const { addPost, demo } = useProfile();
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [linkWorkout, setLinkWorkout] = useState(true);
  const [workoutId, setWorkoutId] = useState(workouts[0].id);
  const [vis, setVis] = useState<(typeof VIS)[number]>('Público');
  const [error, setError] = useState<string | null>(null);

  // Abre a galeria do celular (no navegador, abre o seletor de arquivos).
  const pick = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Precisamos de acesso às fotos. Libere nas configurações do celular.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
    });
    if (!res.canceled) setPhotos((cur) => [...cur, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
  };

  const canPublish = text.trim().length > 0 || photos.length > 0;
  // Só dá para vincular treino quando existe algum (por enquanto, nos dados de exemplo).
  const canLink = demo && workouts.length > 0;

  const publish = () => {
    addPost({ text: text.trim(), photoUris: photos, workoutId: canLink && linkWorkout ? workoutId : undefined, visibility: vis });
    router.back();
  };

  return (
    <Screen footer={<Button label="Publicar" disabled={!canPublish} onPress={publish} />}>
      <Header title="Novo post" />

      <View style={{ gap: 6 }}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Txt variant="bodyStrong">Legenda</Txt>
          <Txt variant="caption" tone="muted">{text.length}/{MAX_TEXT}</Txt>
        </View>
        <TextInput
          accessibilityLabel="Legenda do post"
          placeholder="Conte como foi o treino…"
          placeholderTextColor={colors.textFaint}
          multiline
          maxLength={MAX_TEXT}
          value={text}
          onChangeText={setText}
          style={{
            minHeight: 96, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
            color: colors.text, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, textAlignVertical: 'top',
          }}
        />
      </View>

      <View style={{ gap: 8 }}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <Txt variant="bodyStrong">Fotos</Txt>
          <Txt variant="caption" tone="muted">{photos.length} de {MAX_PHOTOS}</Txt>
        </View>
        <View style={[s.wrap, { gap: 8 }]}>
          {photos.map((uri, i) => (
            <View key={uri + i} style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden' }}>
              <Image source={{ uri }} style={{ width: '100%', height: '100%' }} accessibilityLabel={`Foto ${i + 1}`} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover foto ${i + 1}`}
                onPress={() => setPhotos((cur) => cur.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="close" size={14} strokeWidth={2.5} color={colors.text} />
              </Pressable>
            </View>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Adicionar fotos"
              onPress={pick}
              style={{ width: 96, height: 96, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.accentInk, alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <Icon name="camera" size={24} color={colors.accentInk} />
              <Txt variant="caption" tone="accent" style={{ fontFamily: fonts.bodySemi }}>Adicionar</Txt>
            </Pressable>
          ) : null}
        </View>
        {error ? <Txt variant="caption" tone="danger">{error}</Txt> : null}
      </View>

      {canLink ? (
      <View style={{ padding: 14, borderRadius: 16, backgroundColor: colors.surface, gap: 10 }}>
        <View style={[s.row, { gap: 12 }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt>Vincular um treino</Txt>
            <Txt variant="caption" tone="muted">Mostra mapa e números junto do post</Txt>
          </View>
          <Switch
            accessibilityLabel="Vincular um treino"
            value={linkWorkout}
            onValueChange={setLinkWorkout}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={colors.border}
            {...({ activeThumbColor: '#FFFFFF' } as object)}
          />
        </View>
        {linkWorkout ? (
          <View style={s.wrap}>
            {workouts.slice(0, 4).map((w) => (
              <Chip key={w.id} label={`${w.title} · ${w.distance}`} selected={w.id === workoutId} onPress={() => setWorkoutId(w.id)} />
            ))}
          </View>
        ) : null}
      </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Quem pode ver</Txt>
        <Segmented label="Quem pode ver" options={VIS} value={vis} onChange={setVis} />
      </View>
    </Screen>
  );
}
