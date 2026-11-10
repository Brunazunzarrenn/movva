import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfilePhotoPicker } from '@/components/PhotoPicker';
import { useProfileSports } from '@/components/profileParts';
import { TextField } from '@/components/TextField';
import { Txt } from '@/components/Txt';
import { Button, Chip, Header, Screen, s } from '@/components/ui';
import { levels } from '@/data/mock';
import { colorOf, initialsOf, useProfile, usernameError, type Level } from '@/data/ProfileStore';
import { useTheme } from '@/theme/ThemeProvider';
import { birthDateError, maskDate } from '@/utils/format';

const BIO_MAX = 150;

export default function EditarPerfil() {
  const { colors } = useTheme();
  const { profile, updateProfile } = useProfile();
  const [photoUri, setPhotoUri] = useState(profile?.photoUri);
  const [name, setName] = useState(profile?.name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [level, setLevel] = useState<Level>(profile?.level ?? 'Iniciante');
  const [region, setRegion] = useState(profile?.region ?? '');
  const [birth, setBirth] = useState(profile?.birthDate ?? '');
  const sports = useProfileSports(profile?.sports ?? [], profile?.pendingSports ?? []);

  if (!profile) return <Redirect href="/boas-vindas" />;

  // O próprio @ atual não conta como "já em uso".
  const userErr = username === profile.username ? null : usernameError(username);
  const nameErr = name.trim().length < 3 ? 'Digite seu nome (pelo menos 3 letras).' : null;
  const regionErr = region.trim().length < 3 ? 'Digite sua cidade ou bairro.' : null;
  const birthErr = birthDateError(birth, false);
  const valid = !userErr && !nameErr && !regionErr && !birthErr;

  const save = () => {
    if (!valid) return;
    updateProfile({ photoUri, name: name.trim(), username, bio: bio.trim() || undefined, level, region: region.trim(), birthDate: birth });
    router.back();
  };

  const sportsLabel = [...sports.official, ...sports.inReview.map((x) => `${x} (em análise)`)].join(', ') || 'Nenhum esporte escolhido';

  return (
    <Screen footer={<Button label="Salvar alterações" disabled={!valid} onPress={save} />}>
      <Header title="Editar perfil" />
      <ProfilePhotoPicker uri={photoUri} initials={initialsOf(name || '?')} color={colorOf(username || name)} onChange={setPhotoUri} />

      <TextField label="Nome" value={name} onChangeText={setName} autoCapitalize="words" error={nameErr} />
      <TextField
        label="Nome de usuário"
        value={username}
        onChangeText={(t) => setUsername(t.toLowerCase().replace(/\s/g, ''))}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={24}
        prefix={<Txt style={{ color: colors.textMuted, fontSize: 16 }}>@</Txt>}
        error={userErr}
      />
      <TextField
        label="Sobre você"
        value={bio}
        onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
        placeholder="Ex.: Triathlon amador, treinando para o primeiro Ironman."
        multiline
        multilineHeight={90}
        help={`${bio.length}/${BIO_MAX}`}
      />

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Esportes</Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar esportes"
          onPress={() => router.push({ pathname: '/cadastro-esportes', params: { modo: 'editar' } })}
          style={[s.row, { gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Txt variant="small" tone="soft" style={{ flex: 1, fontSize: 14 }}>{sportsLabel}</Txt>
          <Icon name="chevron" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        <Txt variant="bodyStrong">Nível</Txt>
        <View style={s.wrap}>
          {levels.map((l) => <Chip key={l} label={l} selected={l === level} onPress={() => setLevel(l)} />)}
        </View>
      </View>

      <TextField label="Região" value={region} onChangeText={setRegion} autoCapitalize="words" error={regionErr} />
      <TextField
        label="Data de nascimento"
        value={birth}
        onChangeText={(t) => setBirth(maskDate(t))}
        keyboardType="number-pad"
        maxLength={10}
        error={birth.length === 10 ? birthErr : null}
        help="Não aparece no perfil."
      />
    </Screen>
  );
}
