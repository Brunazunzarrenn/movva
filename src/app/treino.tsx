import { ComingSoon } from '@/components/ComingSoon';
import { Header, Screen } from '@/components/ui';

export default function Treino() {
  return (
    <Screen>
      <Header title="Registrar treino" />
      <ComingSoon icon="pin" title="Treino com GPS" text="Gravação do percurso, ritmo e distância chega numa das próximas etapas." />
    </Screen>
  );
}
