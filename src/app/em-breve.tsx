import { ComingSoon } from '@/components/ComingSoon';
import { Header, Screen } from '@/components/ui';

export default function EmBreve() {
  return (
    <Screen>
      <Header title="Em breve" />
      <ComingSoon title="Tela em construção" text="Essa parte do MOVVA já está desenhada e entra numa das próximas etapas." />
    </Screen>
  );
}
