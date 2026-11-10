import { Link } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

// O `ref` do TabTrigger não é necessário aqui e tem um tipo incompatível com o Pressable do RN 0.88.
function TabButton({ icon, label, isFocused, ref: _ref, ...props }: TabTriggerSlotProps & { icon: IconName; label: string }) {
  const { colors } = useTheme();
  const color = isFocused ? colors.accentInk : colors.textMuted;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      accessibilityLabel={label}
      style={{ minWidth: 60, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 4 }}
    >
      <Icon name={icon} color={color} />
      <Txt style={{ fontSize: 11, fontFamily: isFocused ? fonts.bodySemi : fonts.body, color }}>{label}</Txt>
    </Pressable>
  );
}

function TrainButton() {
  const { colors } = useTheme();
  return (
    <Link href="/treino" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Registrar treino"
        style={{
          width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name="plus" size={28} strokeWidth={2.5} color={colors.onAccent} />
      </Pressable>
    </Link>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs style={{ flex: 1, minHeight: 0 }}>
      <TabSlot style={{ flex: 1, minHeight: 0 }} />

      {/* Barra inferior: Início, Bora, +, Arena, Perfil */}
      <View
        style={{
          flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
          paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 8,
          backgroundColor: colors.nav, borderTopWidth: 1, borderTopColor: colors.divider,
        }}
      >
        <TabTrigger name="feed" asChild>
          <TabButton icon="home" label="Início" />
        </TabTrigger>
        <TabTrigger name="bora" asChild>
          <TabButton icon="users" label="Bora" />
        </TabTrigger>
        <TrainButton />
        <TabTrigger name="arena" asChild>
          <TabButton icon="trophy" label="Arena" />
        </TabTrigger>
        <TabTrigger name="perfil" asChild>
          <TabButton icon="user" label="Perfil" />
        </TabTrigger>
      </View>

      <TabList style={{ display: 'none' }}>
        <TabTrigger name="feed" href="/(tabs)/feed" />
        <TabTrigger name="bora" href="/(tabs)/bora" />
        <TabTrigger name="arena" href="/(tabs)/arena" />
        <TabTrigger name="perfil" href="/(tabs)/perfil" />
      </TabList>
    </Tabs>
  );
}
