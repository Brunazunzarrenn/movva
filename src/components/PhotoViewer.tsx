import { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StatusBar, useWindowDimensions, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PostPhoto } from '@/components/profileParts';
import { Txt } from '@/components/Txt';
import { fonts } from '@/theme/fonts';

export type ViewerPhoto = { uri?: string; art?: number };

// Foto em tela cheia: arrasta para o lado para trocar, toca no X para fechar.
// No iPhone dá para dar zoom com dois dedos.
export function PhotoViewer({ photos, start, visible, onClose }: { photos: ViewerPhoto[]; start: number; visible: boolean; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(start);
  const scroll = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (!visible) return;
    setIndex(start);
    // espera o modal montar para pular para a foto tocada
    const id = setTimeout(() => scroll.current?.scrollTo({ x: start * width, animated: false }), 0);
    return () => clearTimeout(id);
  }, [visible, start, width]);

  const go = (i: number) => {
    const n = Math.max(0, Math.min(photos.length - 1, i));
    setIndex(n);
    scroll.current?.scrollTo({ x: n * width, animated: true });
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: '#000000' }} accessibilityViewIsModal>
        <ScrollView
          ref={scroll}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        >
          {photos.map((ph, i) => (
            <ScrollView
              key={i}
              style={{ width, height }}
              contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
              maximumZoomScale={4}
              minimumZoomScale={1}
              centerContent
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <PostPhoto uri={ph.uri} art={ph.art} style={{ width, height: ph.uri ? height * 0.8 : width * 0.75, resizeMode: 'contain' }} />
            </ScrollView>
          ))}
        </ScrollView>

        <View style={{ position: 'absolute', top: insets.top + 8, left: 8, right: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar foto"
            onPress={onClose}
            hitSlop={8}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="close" size={22} color="#FFFFFF" />
          </Pressable>
          {photos.length > 1 ? (
            <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: '#FFFFFF' }}>{index + 1} de {photos.length}</Txt>
          ) : null}
          <View style={{ width: 44 }} />
        </View>

        {/* No navegador não dá para arrastar com o dedo: setas para trocar de foto. */}
        {Platform.OS === 'web' && photos.length > 1 ? (
          <View style={{ position: 'absolute', bottom: insets.bottom + 24, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Foto anterior" onPress={() => go(index - 1)} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '180deg' }] }}>
              <Icon name="chevron" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Próxima foto" onPress={() => go(index + 1)} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
