-- Avaliações do Google (caminhos A: Places e B: Perfil da Empresa)
create table if not exists avaliacoes_google (
  chave text primary key,
  fonte text not null check (fonte in ('places','perfil')),
  id_externo text,
  autor text not null,
  foto_url text,
  nota int not null check (nota between 1 and 5),
  texto text,
  publicado_em timestamptz not null,
  resposta text,
  respondido_em timestamptz,
  visivel boolean not null default true,
  visivel_manual boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists avaliacoes_google_pub_idx on avaliacoes_google (publicado_em desc);
alter table avaliacoes_google enable row level security;
drop policy if exists "public read avaliacoes visiveis" on avaliacoes_google;
create policy "public read avaliacoes visiveis" on avaliacoes_google for select using (visivel = true);
