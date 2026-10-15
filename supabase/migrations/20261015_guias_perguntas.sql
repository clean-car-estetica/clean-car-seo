-- 15/10/2026 — Guias (problema → solução e por público), perguntas de
-- clientes respondidas pelo console e serviços relacionados no blog.
-- (aplicado no projeto em 15/10/2026)

-- Guias: páginas /problemas/<slug> e /para/<slug>
create table if not exists guias (
  slug text primary key,
  tipo text not null check (tipo in ('problema', 'publico')),
  titulo text not null,                 -- H1 da página
  titulo_seo text not null default '',  -- título no Google (vazio = usa o H1)
  meta_descricao text not null default '',
  chamada text not null default '',     -- rótulo curto acima do título
  intro text not null default '',
  secoes jsonb not null default '[]'::jsonb,     -- [{titulo, texto}]
  perguntas jsonb not null default '[]'::jsonb,  -- [{pergunta, resposta}]
  servicos text[] not null default '{}',         -- slugs dos serviços indicados
  imagem_url text,
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  publicado_em timestamptz
);
alter table guias enable row level security;
create policy "public read guias publicadas" on guias for select using (status = 'publicado');

-- Blog: serviços relacionados e data da última edição
alter table blog_posts add column if not exists servicos text[] not null default '{}';
alter table blog_posts add column if not exists atualizado_em timestamptz not null default now();

-- Perguntas que os visitantes mandam pelo site (gravadas pelo servidor, nunca
-- direto do navegador). O dono responde no console; as publicadas viram
-- página (/perguntas/<slug>).
create table if not exists perguntas_clientes (
  id bigint generated always as identity primary key,
  pergunta text not null check (char_length(pergunta) between 10 and 600),
  titulo text,          -- pergunta revisada para publicar
  resposta text,
  slug text unique,
  servico_slug text,
  status text not null default 'nova' check (status in ('nova', 'respondida', 'publicada', 'arquivada')),
  criado_em timestamptz not null default now(),
  respondido_em timestamptz
);
alter table perguntas_clientes enable row level security;
create policy "public le perguntas publicadas" on perguntas_clientes for select using (status = 'publicada');

-- Nome e WhatsApp de quem perguntou: tabela separada, sem nenhuma policy
-- (só o console, com service_role, lê).
create table if not exists perguntas_contatos (
  pergunta_id bigint primary key references perguntas_clientes(id) on delete cascade,
  nome text check (nome is null or char_length(nome) <= 60),
  whatsapp text check (whatsapp is null or char_length(whatsapp) <= 20)
);
alter table perguntas_contatos enable row level security;
