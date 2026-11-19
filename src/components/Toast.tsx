import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { useTheme } from '@/theme/ThemeProvider';

// Aviso rápido no rodapé ("Presença confirmada!", "Desafio enviado…") para a pessoa
// saber que o toque funcionou. Some sozinho depois de alguns segundos.
type ShowToast = (message: string) => void;
const Ctx = createContext<ShowToast>(() => {});
const DURATION_MS = 2600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback<ShowToast>((message) => {
    setMsg(message);
    AccessibilityInfo.announceForAccessibility?.(message);
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMsg(null));
    }, DURATION_MS);
  }, [opacity]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {msg ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 96, opacity }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.inverse }}>
            <Icon name="check" size={18} strokeWidth={3} color={colors.accent} />
            <Txt variant="small" style={{ flex: 1, fontSize: 14, color: colors.bg }}>{msg}</Txt>
          </View>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
