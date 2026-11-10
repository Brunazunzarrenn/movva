import { ComingSoon } from '@/components/ComingSoon';
import { Txt } from '@/components/Txt';
import { Screen } from '@/components/ui';

export default function Arena() {
  return (
    <Screen inTabs>
      <Txt variant="title" accessibilityRole="header">Arena</Txt>
      <ComingSoon icon="trophy" title="Em construção" text="Desafios, duelos, territórios, competições e rankings." />
    </Screen>
  );
}
