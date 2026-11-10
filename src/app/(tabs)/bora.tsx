import { ComingSoon } from '@/components/ComingSoon';
import { Txt } from '@/components/Txt';
import { Screen } from '@/components/ui';

export default function Bora() {
  return (
    <Screen inTabs>
      <Txt variant="title" accessibilityRole="header">Bora Treinar?</Txt>
      <ComingSoon icon="users" title="Próxima etapa" text="Convites para treinar junto, parceiros compatíveis e chat do treino." />
    </Screen>
  );
}
