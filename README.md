# MOVVA — aplicativo

App nativo (iPhone e Android) feito com **Expo SDK 58**, **React Native** e **Expo Router**.

## Como rodar no seu celular

1. Instale o **Node.js 20 ou mais novo** no computador.
2. No celular, instale o app **Expo Go** (App Store ou Google Play).
3. No terminal, dentro desta pasta:

   ```bash
   npm install
   npx expo start
   ```

4. Vai aparecer um QR code no terminal.
   - **iPhone:** abra a câmera e aponte para o QR code.
   - **Android:** abra o Expo Go e toque em "Scan QR code".

O computador e o celular precisam estar na mesma rede Wi-Fi. Se não conectar, use `npx expo start --tunnel`.

Para ver no navegador do computador: `npx expo start --web`.

## Organização

```
src/
  app/                 telas (cada arquivo é uma rota)
    (auth)/            boas-vindas e cadastro
    (tabs)/            feed, bora, arena, perfil + barra inferior
    configuracoes.tsx  tema claro/escuro e privacidade
    treino.tsx         registrar treino (próxima etapa: GPS)
  components/          peças reutilizáveis (botões, chips, cartões, ícones…)
  theme/               cores dos temas, fontes e o controle de tema
  data/mock.ts         dados fictícios até o banco (Supabase) entrar
```

## Comandos úteis

```bash
npx tsc --noEmit     # confere os tipos
npx expo start -c    # inicia limpando o cache
```

## Etapas

- [x] Etapa 1 — base, tema claro/escuro, boas-vindas, cadastro, feed, barra inferior, configurações
- [x] Etapa 2 — perfil completo: galeria, treinos, posts, medalha, detalhe do treino, post com comentários, novo post (fotos reais da galeria), Minha Evolução, Recordes
- [x] Esportes: lista completa, opção "Outro" e painel de aprovação
- [x] Perfil real: o cadastro (nome, @, foto, esportes, nível, região, nascimento) cria o seu perfil; editar perfil; posts próprios; telas vazias para conta nova

> **Comunidade de teste:** os atletas em `src/data/community.ts` são fictícios e respondem sozinhos (comentário, chat, duelo e convite) para dar para testar sem outra pessoa. Saem quando o banco de dados entrar.
>
> **Versão no celular:** em Configurações, no fim da tela, aparece a etapa da versão (ex.: "Etapa 7 · Treino com GPS"). Se aparecer outra, o celular está com a versão antiga: rode `npm install` e `npx expo start -c` (o `-c` limpa o cache).
>
> **GPS no teste:** no Expo Go o GPS grava com o app aberto na tela. Gravar com a tela bloqueada exige o app instalado de verdade (build), que vem na etapa de publicação. Para testar parado, ligue "Simular GPS".
>
> **Testes:** a conta fica salva só no aparelho. Em Configurações → Sair, ela é apagada e dá para cadastrar outra do zero. Em Configurações → Administração → "Mostrar dados de exemplo" o perfil fica cheio de medalhas e treinos de exemplo.
- [x] Bora Treinar?: convites, criar convite, check-in, chat do treino e parceiros compatíveis
- [x] Comunidade de teste: 6 atletas + 1 clube com treinos para curtir, comentar, seguir e desafiar (duelo 1×1 na Arena)
- [x] Arena: desafios (oficiais, da comunidade e criados por você, com medalha personalizada), trechos sem inscrição, rankings, duelos e territórios
- [x] Treino: GPS (corrida, pedal, águas abertas), piscina por voltas, só cronômetro (jiu-jítsu, musculação, vôlei…), multiesporte com transições (triathlon) e lançamento manual; treinos contam em desafios, duelos e rankings
- [ ] Login real e banco de dados (Supabase)
- [ ] Assinaturas (MOVVA Pro) e publicação nas lojas

## Ligar o banco de dados (Supabase)

Sem isso o app funciona no **modo de teste local** (conta só no aparelho). Para contas de verdade:

1. Crie um projeto grátis em supabase.com (região São Paulo).
2. **SQL Editor → New query**: cole todo o arquivo `supabase/schema.sql` e clique em **Run**. Ele cria as tabelas, as regras de acesso (RLS) e o espaço das fotos. Pode rodar de novo sem problema.
3. **Authentication → Emails → Magic Link**: no texto do e-mail, coloque o código, por exemplo:
   `<h2>Seu código do MOVVA: {{ .Token }}</h2>`
4. **Project Settings → API**: copie a **Project URL** e a chave **anon / public**. Crie o arquivo `.env` (igual ao `.env.example`) com elas. **Nunca** use a chave `service_role` no app.
5. Rode `npx expo start -c`. Em Configurações deve aparecer "Conta salva na nuvem".
6. Para virar admin (ver os esportes sugeridos): no SQL Editor rode
   `update public.profiles set is_admin = true where username = 'seu_usuario';`

O e-mail grátis do Supabase manda poucos e-mails por hora (bom para teste). Para lançar, configure um SMTP próprio (ex.: Resend) em Authentication → SMTP.
