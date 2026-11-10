// Paletas oficiais da MOVVA. Os nomes descrevem a função da cor, não o tom,
// para que cada tela funcione igual nos temas escuro e claro.

export type Palette = {
  bg: string; // fundo da tela
  surface: string; // cartões
  surfaceAlt: string; // mapas, áreas rebaixadas
  nav: string; // barra inferior
  border: string;
  divider: string;
  text: string; // texto principal
  textSoft: string; // texto de corpo
  textMuted: string; // legendas
  textFaint: string; // notas pequenas
  accent: string; // verde MOVVA (fundo de botões)
  onAccent: string; // texto sobre o verde
  accentInk: string; // verde usado como texto/ícone
  accentSoft: string; // fundo esverdeado
  accentSoftBorder: string;
  inverse: string; // botão de contraste (branco no escuro, preto no claro)
  onInverse: string;
  danger: string;
  dangerSoft: string;
  gold: string;
  goldSoft: string;
  blue: string;
  blueSoft: string;
  purple: string;
  purpleSoft: string;
  overlay: string; // pílulas sobre mapas
};

export const dark: Palette = {
  bg: '#0B0F0C',
  surface: '#151B17',
  surfaceAlt: '#101713',
  nav: '#0E1310',
  border: '#2C3630',
  divider: '#232B26',
  text: '#F3F5F2',
  textSoft: '#DDE5E0',
  textMuted: '#A3B1A8',
  textFaint: '#8A978F',
  accent: '#39FF14',
  onAccent: '#0B1F14',
  accentInk: '#39FF14',
  accentSoft: '#0B1F14',
  accentSoftBorder: '#1E4A2C',
  inverse: '#F3F5F2',
  onInverse: '#0B1F14',
  danger: '#FF8A7A',
  dangerSoft: '#2A1210',
  gold: '#F5C542',
  goldSoft: '#2A2410',
  blue: '#7DBBFF',
  blueSoft: '#142233',
  purple: '#CBA3FF',
  purpleSoft: '#221A2E',
  overlay: 'rgba(11,15,12,0.85)',
};

export const light: Palette = {
  bg: '#F4F6F3',
  surface: '#FFFFFF',
  surfaceAlt: '#E6ECE6',
  nav: '#FFFFFF',
  border: '#D2D9D3',
  divider: '#E3E8E3',
  text: '#121815',
  textSoft: '#2A332E',
  textMuted: '#56625C',
  textFaint: '#66726B',
  accent: '#39FF14',
  onAccent: '#0B1F14',
  accentInk: '#157F05',
  accentSoft: '#E3F6DC',
  accentSoftBorder: '#A9DD98',
  inverse: '#121815',
  onInverse: '#FFFFFF',
  danger: '#C2321F',
  dangerSoft: '#FCE3DF',
  gold: '#8A6400',
  goldSoft: '#FBF0CC',
  blue: '#1F5FB8',
  blueSoft: '#DDE9FA',
  purple: '#6B2FB8',
  purpleSoft: '#EDE3FA',
  overlay: 'rgba(255,255,255,0.92)',
};

// Cores de pessoas e clubes (avatares). Sempre com texto branco.
export const avatarColors = ['#2E5BFF', '#E2701C', '#8E44D9', '#1F9E6E', '#C2410C', '#0E7490'];

export type Rarity = 'comum' | 'rara' | 'epica' | 'lendaria';

export const rarityLabel: Record<Rarity, string> = {
  comum: 'Comum',
  rara: 'Rara',
  epica: 'Épica',
  lendaria: 'Lendária',
};

export function rarityColors(r: Rarity, p: Palette) {
  const isDark = p === dark;
  switch (r) {
    case 'lendaria':
      return { ring: isDark ? '#F5C542' : '#E0AE2E', bg: p.goldSoft, fg: p.gold };
    case 'epica':
      return { ring: '#B57BFF', bg: p.purpleSoft, fg: p.purple };
    case 'rara':
      return { ring: '#4DA3FF', bg: p.blueSoft, fg: p.blue };
    default:
      return { ring: '#9AA6A0', bg: isDark ? '#1E2420' : '#EAEEEA', fg: isDark ? '#C9D2CD' : '#4A5550' };
  }
}
