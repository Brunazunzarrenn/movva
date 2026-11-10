import {
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';

// Arquivos carregados no início do app (ver src/app/_layout.tsx).
export const fontAssets = {
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
};

// Oswald = títulos e números. Rubik = textos.
export const fonts = {
  display: 'Oswald_700Bold',
  displaySemi: 'Oswald_600SemiBold',
  displayMedium: 'Oswald_500Medium',
  body: 'Rubik_400Regular',
  bodyMedium: 'Rubik_500Medium',
  bodySemi: 'Rubik_600SemiBold',
  bodyBold: 'Rubik_700Bold',
} as const;
