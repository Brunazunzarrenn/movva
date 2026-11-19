import { Platform, Share } from 'react-native';

// Abre o compartilhar do celular (WhatsApp, Instagram, etc.). No navegador usa o
// compartilhar do sistema quando existe; senão copia o texto.
export async function shareText(message: string) {
  try {
    if (Platform.OS === 'web') {
      const nav = globalThis.navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
      if (nav?.share) { await nav.share({ text: message }); return 'shared'; }
      await nav?.clipboard?.writeText(message);
      return 'copied';
    }
    await Share.share({ message });
    return 'shared';
  } catch {
    return 'cancelled';
  }
}
