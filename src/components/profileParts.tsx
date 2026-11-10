import { Image, View, type StyleProp, type ImageStyle } from 'react-native';

import { PhotoArtView } from './athlete';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';
import { Button, s } from './ui';
import { useSports } from '@/data/SportsStore';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/* Esportes do perfil: os oficiais e os "em análise" (já resolvendo os aprovados/juntados). */
export function useProfileSports(sports: string[], pending: string[]) {
  const { resolvePending } = useSports();
  const official = [...sports];
  const inReview: string[] = [];
  for (const name of pending) {
    const r = resolvePending(name);
    if (r.status === 'aprovado' || r.status === 'juntado') {
      if (!official.includes(r.sport)) official.push(r.sport);
    } else if (r.status === 'pendente') {
      inReview.push(name);
    }
  }
  return { official, inReview };
}

export function SportTags({ sports, pending }: { sports: string[]; pending: string[] }) {
  const { colors } = useTheme();
  const { official, inReview } = useProfileSports(sports, pending);
  if (official.length + inReview.length === 0) return null;
  return (
    <View style={s.wrap}>
      {official.map((sp) => (
        <View key={sp} style={{ paddingHorizontal: 14, minHeight: 34, justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
          <Txt variant="small" tone="soft" style={{ fontSize: 14 }}>{sp}</Txt>
        </View>
      ))}
      {inReview.map((sp) => (
        <View key={sp} style={[s.row, { gap: 6, paddingHorizontal: 14, minHeight: 34, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accentInk, backgroundColor: colors.accentSoft }]}>
          <Txt style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.accentInk }}>{sp}</Txt>
          <Txt variant="caption" tone="muted">em análise</Txt>
        </View>
      ))}
    </View>
  );
}

/* Estado vazio com chamada para ação. */
export function EmptyState({ icon, title, text, action, onAction }: { icon: IconName; title: string; text: string; action?: string; onAction?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border }}>
      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={28} color={colors.accentInk} />
      </View>
      <Txt variant="bodyStrong" style={{ fontSize: 17, textAlign: 'center' }}>{title}</Txt>
      <Txt variant="small" tone="muted" style={{ textAlign: 'center', fontSize: 14, lineHeight: 20 }}>{text}</Txt>
      {action ? <Button label={action} size="md" onPress={onAction} style={{ marginTop: 4, alignSelf: 'stretch' }} /> : null}
    </View>
  );
}

/* Foto de post: foto real (uri) ou ilustração dos dados de exemplo. */
export function PostPhoto({ uri, art, style }: { uri?: string; art?: number; style?: StyleProp<ImageStyle> }) {
  if (uri) return <Image source={{ uri }} style={style} accessibilityIgnoresInvertColors />;
  return <PhotoArtView index={art ?? 0} style={style as never} />;
}
