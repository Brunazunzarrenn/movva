-- =====================================================================
-- MOVVA · banco de dados (Supabase / Postgres)
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo → Run.
-- Pode rodar de novo sem problema (usa "if not exists" / "or replace").
-- Toda tabela tem RLS: cada pessoa só altera o que é dela, e só vê o
-- que é público, de quem segue (quando "Seguidores") ou dela mesma.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Perfis ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  username text not null unique check (username ~ '^[a-z0-9._]{3,24}$'),
  photo_url text,
  bio text check (char_length(bio) <= 150),
  sports text[] not null default '{}',
  pending_sports text[] not null default '{}',
  level text not null check (level in ('Iniciante', 'Intermediário', 'Avançado', 'Profissional')),
  region text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ninguém se promove a admin pelo app: is_admin só muda direto no banco.
create or replace function public.protect_admin_flag() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.is_admin := false;
  elsif new.is_admin is distinct from old.is_admin and current_user in ('authenticated', 'anon') then
    new.is_admin := old.is_admin;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_admin on public.profiles;
create trigger profiles_protect_admin before insert or update on public.profiles
  for each row execute function public.protect_admin_flag();

-- Dados privados (nascimento): só a própria pessoa lê e grava.
create table if not exists public.profile_private (
  id uuid primary key references public.profiles (id) on delete cascade,
  birth_date date not null
);

-- ---------- Seguir ----------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- Quem pode ver algo de "owner" com essa visibilidade?
create or replace function public.can_see(owner uuid, visibility text) returns boolean
language sql stable security definer set search_path = public as $$
  select owner = auth.uid()
      or visibility = 'Público'
      or (visibility = 'Seguidores' and exists (
            select 1 from public.follows f where f.follower_id = auth.uid() and f.following_id = owner));
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- Treinos ----------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  sport text not null,
  kind text not null check (kind in ('gps', 'piscina', 'tempo', 'multi')),
  title text not null check (char_length(title) <= 60),
  start_at timestamptz not null,
  sec integer not null check (sec >= 0),
  elapsed_sec integer not null check (elapsed_sec >= 0),
  km numeric(8, 3) not null default 0 check (km >= 0 and km < 2000),
  elevation integer not null default 0 check (elevation >= 0),
  coords jsonb not null default '[]',
  legs jsonb,
  pool_length smallint,
  laps smallint,
  rpe smallint not null check (rpe between 1 and 10),
  kcal integer not null default 0,
  notes text check (char_length(notes) <= 300),
  visibility text not null check (visibility in ('Público', 'Seguidores', 'Só eu')),
  source text not null check (source in ('gps', 'cronometro', 'manual', 'simulado')),
  created_at timestamptz not null default now()
);
create index if not exists workouts_user_start on public.workouts (user_id, start_at desc);

-- ---------- Posts, curtidas e comentários ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  text text not null default '' check (char_length(text) <= 300),
  photo_urls text[] not null default '{}',
  workout_id uuid references public.workouts (id) on delete cascade,
  visibility text not null check (visibility in ('Público', 'Seguidores', 'Só eu')),
  created_at timestamptz not null default now()
);
create index if not exists posts_created on public.posts (created_at desc);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now()
);

-- ---------- Bora Treinar? ----------
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  sport text not null,
  title text not null check (char_length(title) <= 60),
  start_at timestamptz not null,
  place text not null,
  level text not null,
  pace text,
  distance text,
  spots smallint not null check (spots between 2 and 40),
  visibility text not null check (visibility in ('Público', 'Seguidores', 'Só convidados')),
  note text check (char_length(note) <= 140),
  canceled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.invite_members (
  invite_id uuid not null references public.invites (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('convidado', 'confirmado', 'recusado')),
  checked_in_at timestamptz,
  primary key (invite_id, user_id)
);

create table if not exists public.invite_messages (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now()
);

create or replace function public.invite_role(inv uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.invites i where i.id = inv and i.host_id = auth.uid()) then 'host'
    else (select m.status from public.invite_members m where m.invite_id = inv and m.user_id = auth.uid())
  end;
$$;

create or replace function public.can_see_invite(inv uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.invites i
    where i.id = inv
      and (i.host_id = auth.uid()
        or public.invite_role(inv) is not null
        or (not i.canceled and (i.visibility = 'Público'
          or (i.visibility = 'Seguidores' and exists (
                select 1 from public.follows f where f.follower_id = auth.uid() and f.following_id = i.host_id))))));
$$;

-- ---------- Desafios ----------
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 40),
  sport text not null,
  goal text not null check (goal in ('dist', 'dias', 'tempo', 'treinos', 'alt')),
  target numeric not null check (target > 0),
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  visibility text not null check (visibility in ('Público', 'Privado')),
  description text,
  medal jsonb not null,
  official boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.challenge_members (
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('convidado', 'participando')),
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create or replace function public.can_see_challenge(ch uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.challenges c
    where c.id = ch and (c.visibility = 'Público' or c.creator_id = auth.uid()
      or exists (select 1 from public.challenge_members m where m.challenge_id = ch and m.user_id = auth.uid())));
$$;

-- Oficial só quem é admin cria.
create or replace function public.protect_official() returns trigger language plpgsql as $$
begin
  if new.official and not public.is_admin() and current_user in ('authenticated', 'anon') then
    new.official := false;
  end if;
  return new;
end $$;
drop trigger if exists challenges_protect_official on public.challenges;
create trigger challenges_protect_official before insert or update on public.challenges
  for each row execute function public.protect_official();

-- ---------- Duelos 1×1 ----------
create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  opponent_id uuid not null references public.profiles (id) on delete cascade,
  metric text not null check (metric in ('km', 'treinos', 'subida', 'horas')),
  days smallint not null check (days in (3, 7, 14)),
  note text check (char_length(note) <= 100),
  status text not null default 'aguardando' check (status in ('aguardando', 'aceito', 'recusado')),
  created_at timestamptz not null default now(),
  answered_at timestamptz,
  check (challenger_id <> opponent_id)
);

-- Quem desafiou não pode aceitar o próprio desafio; quem foi desafiado só responde.
create or replace function public.guard_duel() returns trigger language plpgsql as $$
begin
  if current_user not in ('authenticated', 'anon') then return new; end if;
  if new.status is distinct from old.status then
    if old.status <> 'aguardando' or auth.uid() <> old.opponent_id then
      raise exception 'Só quem foi desafiado responde ao duelo.';
    end if;
    new.answered_at := now();
  end if;
  new.challenger_id := old.challenger_id; new.opponent_id := old.opponent_id;
  new.metric := old.metric; new.days := old.days; new.created_at := old.created_at;
  return new;
end $$;
drop trigger if exists duels_guard on public.duels;
create trigger duels_guard before update on public.duels for each row execute function public.guard_duel();

-- ---------- Esportes sugeridos ("Outro") ----------
create table if not exists public.sport_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,
  count integer not null default 1,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado', 'juntado')),
  category_id text,
  merged_into text,
  first_at timestamptz not null default now()
);

-- Sugere um esporte (ou soma +1 se já sugeriram). Chamado pelo app: rpc('suggest_sport', { sport_name }).
create or replace function public.suggest_sport(sport_name text) returns public.sport_suggestions
language plpgsql security definer set search_path = public as $$
declare
  k text := lower(regexp_replace(translate(trim(sport_name),
    'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'), '\s+', ' ', 'g'));
  row public.sport_suggestions;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para sugerir.'; end if;
  if char_length(k) < 2 or char_length(k) > 40 then raise exception 'Nome de esporte inválido.'; end if;
  insert into public.sport_suggestions (name, name_key) values (initcap(trim(sport_name)), k)
    on conflict (name_key) do update set count = public.sport_suggestions.count + 1
    returning * into row;
  return row;
end $$;

-- =====================================================================
-- RLS (regras de acesso)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.follows enable row level security;
alter table public.workouts enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.invites enable row level security;
alter table public.invite_members enable row level security;
alter table public.invite_messages enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.duels enable row level security;
alter table public.sport_suggestions enable row level security;

do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "perfil: todos veem" on public.profiles for select to authenticated using (true);
create policy "perfil: cria o seu" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "perfil: edita o seu" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "perfil: apaga o seu" on public.profiles for delete to authenticated using (id = auth.uid());

create policy "privado: só o dono" on public.profile_private for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "seguir: todos veem" on public.follows for select to authenticated using (true);
create policy "seguir: você segue" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "seguir: você deixa de seguir" on public.follows for delete to authenticated using (follower_id = auth.uid());

create policy "treino: ver" on public.workouts for select to authenticated using (public.can_see(user_id, visibility));
create policy "treino: criar" on public.workouts for insert to authenticated with check (user_id = auth.uid());
create policy "treino: editar" on public.workouts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "treino: apagar" on public.workouts for delete to authenticated using (user_id = auth.uid());

create policy "post: ver" on public.posts for select to authenticated using (public.can_see(user_id, visibility));
create policy "post: criar" on public.posts for insert to authenticated with check (
  user_id = auth.uid() and (workout_id is null or exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())));
create policy "post: editar" on public.posts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "post: apagar" on public.posts for delete to authenticated using (user_id = auth.uid());

create policy "curtida: ver" on public.post_likes for select to authenticated using (
  exists (select 1 from public.posts p where p.id = post_id and public.can_see(p.user_id, p.visibility)));
create policy "curtida: curtir" on public.post_likes for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id and public.can_see(p.user_id, p.visibility)));
create policy "curtida: descurtir" on public.post_likes for delete to authenticated using (user_id = auth.uid());

create policy "comentário: ver" on public.post_comments for select to authenticated using (
  exists (select 1 from public.posts p where p.id = post_id and public.can_see(p.user_id, p.visibility)));
create policy "comentário: comentar" on public.post_comments for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.posts p where p.id = post_id and public.can_see(p.user_id, p.visibility)));
create policy "comentário: apagar (autor ou dono do post)" on public.post_comments for delete to authenticated using (
  user_id = auth.uid() or exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid()));

create policy "convite: ver" on public.invites for select to authenticated using (public.can_see_invite(id));
create policy "convite: criar" on public.invites for insert to authenticated with check (host_id = auth.uid());
create policy "convite: editar" on public.invites for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy "convite: apagar" on public.invites for delete to authenticated using (host_id = auth.uid());

create policy "participante: ver" on public.invite_members for select to authenticated using (public.can_see_invite(invite_id));
create policy "participante: entrar ou convidar" on public.invite_members for insert to authenticated with check (
  (user_id = auth.uid() and status = 'confirmado' and public.can_see_invite(invite_id)
     and (select count(*) from public.invite_members m where m.invite_id = invite_members.invite_id and m.status = 'confirmado')
         < (select spots - 1 from public.invites i where i.id = invite_id))
  or (status = 'convidado' and public.invite_role(invite_id) = 'host'));
create policy "participante: responder, check-in" on public.invite_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "participante: sair ou remover" on public.invite_members for delete to authenticated
  using (user_id = auth.uid() or public.invite_role(invite_id) = 'host');

create policy "chat: ver" on public.invite_messages for select to authenticated using (public.invite_role(invite_id) in ('host', 'confirmado'));
create policy "chat: escrever" on public.invite_messages for insert to authenticated with check (
  user_id = auth.uid() and public.invite_role(invite_id) in ('host', 'confirmado'));

create policy "desafio: ver" on public.challenges for select to authenticated using (public.can_see_challenge(id));
create policy "desafio: criar" on public.challenges for insert to authenticated with check (creator_id = auth.uid());
create policy "desafio: editar" on public.challenges for update to authenticated using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "desafio: apagar" on public.challenges for delete to authenticated using (creator_id = auth.uid());

create policy "membro: ver" on public.challenge_members for select to authenticated using (public.can_see_challenge(challenge_id));
create policy "membro: entrar ou convidar" on public.challenge_members for insert to authenticated with check (
  (user_id = auth.uid() and status = 'participando' and public.can_see_challenge(challenge_id))
  or (status = 'convidado' and exists (select 1 from public.challenges c where c.id = challenge_id and c.creator_id = auth.uid())));
create policy "membro: aceitar" on public.challenge_members for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "membro: sair" on public.challenge_members for delete to authenticated using (user_id = auth.uid());

create policy "duelo: ver" on public.duels for select to authenticated using (auth.uid() in (challenger_id, opponent_id));
create policy "duelo: desafiar" on public.duels for insert to authenticated with check (challenger_id = auth.uid() and status = 'aguardando');
create policy "duelo: responder" on public.duels for update to authenticated using (auth.uid() = opponent_id);
create policy "duelo: cancelar" on public.duels for delete to authenticated using (challenger_id = auth.uid() and status = 'aguardando');

create policy "sugestão: ver" on public.sport_suggestions for select to authenticated using (true);
create policy "sugestão: admin modera" on public.sport_suggestions for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Ninguém de fora (anon) acessa nada.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.suggest_sport(text) to authenticated;

-- ---------- Fotos (perfil e posts) ----------
-- Bucket público para leitura; cada pessoa só grava na pasta com o próprio id: fotos/<id>/arquivo.jpg
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) on conflict (id) do nothing;
drop policy if exists "fotos: enviar na sua pasta" on storage.objects;
create policy "fotos: enviar na sua pasta" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "fotos: apagar as suas" on storage.objects;
create policy "fotos: apagar as suas" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
