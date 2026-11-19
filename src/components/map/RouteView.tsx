// Versão para o navegador: o mapa nativo não roda na web, então desenha o percurso em SVG.
import { RouteMap } from '@/components/ui';
import { pathFromCoords } from '@/data/activity';

export type RouteViewProps = {
  coords: [number, number][];
  height?: number;
  live?: boolean; // gravando: acompanha a posição atual
};

export function RouteView({ coords, height = 180 }: RouteViewProps) {
  return <RouteMap path={pathFromCoords(coords)} height={height} />;
}
