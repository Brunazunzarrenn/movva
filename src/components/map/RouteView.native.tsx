// Mapa de verdade no celular (Apple Maps no iPhone, Google Maps no Android) com o percurso.
import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { useTheme } from '@/theme/ThemeProvider';

import type { RouteViewProps } from './RouteView';

export type { RouteViewProps };

const BH = { latitude: -19.9191, longitude: -43.9386 };

export function RouteView({ coords, height = 180, live }: RouteViewProps) {
  const { colors, isDark } = useTheme();
  const ref = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const line = useMemo(() => coords.map(([latitude, longitude]) => ({ latitude, longitude })), [coords]);
  const first = line[0];
  const last = line[line.length - 1];
  const stroke = isDark ? colors.accent : '#189A06';

  // Gravando: segue o último ponto. Treino salvo: enquadra o percurso inteiro.
  useEffect(() => {
    if (!ready || !ref.current) return;
    if (live) {
      if (last) ref.current.animateCamera({ center: last, zoom: 16 }, { duration: 400 });
    } else if (line.length > 1) {
      ref.current.fitToCoordinates(line, { edgePadding: { top: 30, right: 30, bottom: 30, left: 30 }, animated: false });
    }
  }, [ready, live, last, line]);

  return (
    <MapView
      ref={ref}
      style={{ width: '100%', height }}
      onMapReady={() => setReady(true)}
      initialRegion={{ ...(last ?? BH), latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      showsUserLocation={live}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      userInterfaceStyle={isDark ? 'dark' : 'light'}
      accessibilityLabel={live ? 'Mapa com sua posição e o percurso gravado' : 'Mapa do percurso do treino'}
    >
      {line.length > 1 ? <Polyline coordinates={line} strokeColor={stroke} strokeWidth={5} lineCap="round" lineJoin="round" /> : null}
      {first && !live ? (
        <Marker coordinate={first} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: stroke }} />
        </Marker>
      ) : null}
      {last && !live && line.length > 1 ? (
        <Marker coordinate={last} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: stroke, borderWidth: 3, borderColor: '#FFFFFF' }} />
        </Marker>
      ) : null}
    </MapView>
  );
}
