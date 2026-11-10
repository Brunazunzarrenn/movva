import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'users' | 'plus' | 'trophy' | 'user' | 'search' | 'bell' | 'calendar' | 'coach'
  | 'back' | 'close' | 'check' | 'heart' | 'comment' | 'pin' | 'clock' | 'shield' | 'sun'
  | 'chevron' | 'settings' | 'camera' | 'trend';

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number; filled?: boolean };

// Ícones de traço desenhados para o MOVVA (sem emoji, sem pacote extra).
export function Icon({ name, size = 24, color, strokeWidth = 2, filled = false }: Props) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const shapes: Record<IconName, React.ReactNode> = {
    home: <Path {...p} d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    users: (
      <>
        <Circle {...p} cx={9} cy={8} r={4} />
        <Path {...p} d="M1 21v-1a6 6 0 0 1 12 0v1" />
        <Circle {...p} cx={17} cy={9} r={3} />
        <Path {...p} d="M15 21v-1a5 5 0 0 1 8-4" />
      </>
    ),
    plus: <Path {...p} d="M12 5v14M5 12h14" />,
    trophy: (
      <>
        <Path {...p} d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
        <Path {...p} d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
      </>
    ),
    user: (
      <>
        <Circle {...p} cx={12} cy={8} r={4} />
        <Path {...p} d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    search: (
      <>
        <Circle {...p} cx={11} cy={11} r={7} />
        <Path {...p} d="M21 21l-5-5" />
      </>
    ),
    bell: (
      <>
        <Path {...p} d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
        <Path {...p} d="M10 21a2 2 0 0 0 4 0" />
      </>
    ),
    calendar: (
      <>
        <Rect {...p} x={3} y={5} width={18} height={16} rx={2} />
        <Path {...p} d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
    coach: (
      <>
        <Path {...p} d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />
        <Path {...p} d="M8 13l2.5-2.5 2 2L16 9" />
      </>
    ),
    back: <Path {...p} d="M15 5l-7 7 7 7" />,
    close: <Path {...p} d="M6 6l12 12M18 6L6 18" />,
    check: <Path {...p} d="M5 12l5 5L20 7" />,
    heart: (
      <Path
        {...p}
        fill={filled ? color : 'none'}
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"
      />
    ),
    comment: <Path {...p} d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />,
    pin: (
      <>
        <Path {...p} d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
        <Circle {...p} cx={12} cy={9} r={2.5} />
      </>
    ),
    clock: (
      <>
        <Circle {...p} cx={12} cy={12} r={9} />
        <Path {...p} d="M12 7v5l3 2" />
      </>
    ),
    shield: (
      <>
        <Path {...p} d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />
        <Path {...p} d="M9 12l2 2 4-4" />
      </>
    ),
    sun: (
      <>
        <Circle {...p} cx={12} cy={12} r={4} />
        <Path {...p} d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    chevron: <Path {...p} d="M9 5l7 7-7 7" />,
    settings: (
      <>
        <Circle {...p} cx={12} cy={12} r={3} />
        <Path {...p} d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </>
    ),
    camera: (
      <>
        <Path {...p} d="M4 8h3l2-3h6l2 3h3v11H4z" />
        <Circle {...p} cx={12} cy={13} r={3.5} />
      </>
    ),
    trend: (
      <>
        <Path {...p} d="M3 17l6-6 4 4 8-8" />
        <Path {...p} d="M15 7h6v6" />
      </>
    ),
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shapes[name]}
    </Svg>
  );
}
