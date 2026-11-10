import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ProfilePhotoPicker } from '@/components/PhotoPicker';
import { Progress } from '@/components/Progress';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Button, IconButton, Screen, s } from '@/components/ui';
import { colorOf, initialsOf, suggestUsername, useProfile, usernameError } from '@/data/ProfileStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function CadastroNome() {
  const { colors } = useTheme();
  const { draft, updateDraft } = useProfile();
  const [name, setName] = useState(draft.name ?? '');
  const [username, setUsername] = useState(draft.username ?? '');
  const [userTouched, setUserTouched] = useState(!!draft.username);
  const [photoUri, setPhotoUri] = useState(draft.photoUri);
  const [tried, setTried] = useState(false);

  // Enquanto a pessoa não mexe no @, ele acompanha o nome.
  const onName = (t: string) => {
    setName(t);
    if (!userTouched) setUsername(suggestUsername(t));
  };
  const onUser = (t: string) => {
    setUserTouched(true);
    setUsername(t.toLowerCase().replace(/\s/g, ''));
  };

  const nameErr = name.trim().length < 3 ? 'Digite seu nome (pelo menos 3 letras).' : null;
  const userErr = usernameError(username);
  const valid = !nameErr && !userErr;

  const next = () => {
    setTried(true);
    if (!valid) return;
    updateDraft({ name: name.trim(), username, photoUri });
    router.push('/cadastro-esportes');
  };

  return (
    <Screen footer={<Button label="Continuar" onPress={next} />}>
      <View style={[s.row, { gap: 12 }]}>
        <IconButton icon="back" label="Voltar" onPress={() => router.back()} style={{ marginLeft: -12 }} />
        <Progress step={1} total={3} />
      </View>
      <View style={{ gap: 8 }}>
        <Txt variant="title" accessibilityRole="header">Crie seu perfil</Txt>
        <Txt tone="muted">É assim que os outros atletas vão te encontrar no MOVVA.</Txt>
      </View>

      <ProfilePhotoPicker uri={photoUri} initials={initialsOf(name || '?')} color={colorOf(username || name || 'movva')} onChange={setPhotoUri} />

      <TextField
        label="Nome"
        value={name}
        onChangeText={onName}
        placeholder="Seu nome e sobrenome"
        autoCapitalize="words"
        autoComplete="name"
        error={tried ? nameErr : null}
      />
      <TextField
        label="Nome de usuário"
        value={username}
        onChangeText={onUser}
        placeholder="seunome"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={24}
        prefix={<Txt style={{ color: colors.textMuted, fontSize: 16 }}>@</Txt>}
        error={(tried || userTouched) && username.length > 0 ? userErr : tried ? userErr : null}
        help="Letras minúsculas, números, ponto e _. Dá para mudar depois."
      />
    </Screen>
  );
}
