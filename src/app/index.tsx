import { Redirect } from 'expo-router';

// Por enquanto o app sempre começa nas Boas-vindas.
// Quando o login real entrar, aqui decidimos entre cadastro e Feed.
export default function Index() {
  return <Redirect href="/boas-vindas" />;
}
