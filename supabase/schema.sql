-- Clean Car SEO — schema inicial (Fase 2)
-- Rode este script inteiro no SQL Editor do Supabase (projeto clean-car-seo).

-- 1) Conteúdo editável dos serviços (espelha lib/data.ts, mas editável pelo console)
create table if not exists services (
  slug text primary key,
  nome text not null,
  resumo text not null,
  descricao text not null,
  duracao text,
  preco_desde numeric,
  imagem_url text not null,
  tag text,
  updated_at timestamptz not null default now()
);

-- 2) Cidades atendidas
create table if not exists cities (
  slug text primary key,
  nome text not null,
  bairros text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- 3) Conteúdo das páginas locais (serviço x cidade) — textos e imagem podem ser
-- sobrescritos aqui; se não houver registro, o site usa o template padrão.
create table if not exists local_pages_content (
  service_slug text not null references services(slug) on delete cascade,
  city_slug text not null references cities(slug) on delete cascade,
  paragrafos text[] not null default '{}',
  imagem_url text,
  updated_at timestamptz not null default now(),
  primary key (service_slug, city_slug)
);

-- 4) Posts de blog
create table if not exists blog_posts (
  slug text primary key,
  titulo text not null,
  resumo text not null,
  conteudo text not null,
  imagem_url text,
  publicado_em timestamptz not null default now(),
  status text not null default 'rascunho' check (status in ('rascunho','publicado'))
);

-- 5) Eventos de KPI (visitas, cliques, envios de formulário)
create table if not exists events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event_type text not null check (event_type in ('pageview','click_whatsapp','click_agendar','form_submit')),
  page_path text not null,
  service_slug text,
  city_slug text,
  meta jsonb not null default '{}'::jsonb
);
create index if not exists events_created_at_idx on events (created_at desc);
create index if not exists events_type_idx on events (event_type);

-- 6) Posições de palavra-chave no Google (registradas manualmente ou por API futura)
create table if not exists keyword_rankings (
  id bigint generated always as identity primary key,
  keyword text not null,
  city_slug text references cities(slug),
  posicao int,
  checked_at date not null default current_date
);

-- RLS: leitura pública de conteúdo, escrita só pelo service_role (console admin)
alter table services enable row level security;
alter table cities enable row level security;
alter table local_pages_content enable row level security;
alter table blog_posts enable row level security;
alter table events enable row level security;
alter table keyword_rankings enable row level security;

create policy "public read services" on services for select using (true);
create policy "public read cities" on cities for select using (true);
create policy "public read local content" on local_pages_content for select using (true);
create policy "public read published posts" on blog_posts for select using (status = 'publicado');

-- Qualquer visitante pode registrar um evento (mas não ler os eventos dos outros)
create policy "public insert events" on events for insert with check (true);

-- keyword_rankings não tem policy de leitura pública: só o console (service_role) acessa.

-- Fase 2.5 — conteúdo geral do site (home, etc.) editável pelo console
create table if not exists site_content (
  section text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table site_content enable row level security;
create policy "public read site_content" on site_content for select using (true);

-- Bucket de imagens (upload feito pelo console via service_role)
insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true)
on conflict (id) do nothing;

create policy "public read imagens bucket"
on storage.objects for select
using (bucket_id = 'imagens');

-- Blocos de "antes e depois" mostrados na home (editável pelo console)
create table if not exists transformacoes (
  id bigint generated always as identity primary key,
  titulo text not null,
  descricao text not null,
  imagem_antes text not null,
  imagem_depois text not null,
  ordem int not null default 0
);
alter table transformacoes enable row level security;
create policy "public read transformacoes" on transformacoes for select using (true);

-- FAQ da home (editável pelo console), também usado como dado estruturado
-- FAQPage para mecanismos de busca e assistentes de IA lerem.
create table if not exists faqs (
  id bigint generated always as identity primary key,
  pergunta text not null,
  resposta text not null,
  ordem int not null default 0
);
alter table faqs enable row level security;
create policy "public read faqs" on faqs for select using (true);

-- Fase 3 — cidades passam a ter um flag "sede" (loja física) e podem ser
-- criadas/removidas pelo console, não só editadas.
alter table cities add column if not exists sede boolean not null default false;

-- Fase 4 — respostas de NPS (satisfação do cliente)
create table if not exists nps_respostas (
  id bigint generated always as identity primary key,
  nota int not null check (nota between 0 and 10),
  comentario text,
  service_slug text,
  criado_em timestamptz not null default now()
);
alter table nps_respostas enable row level security;
create policy "public insert nps" on nps_respostas for insert with check (true);

-- Fase 5 — captação de leads (cupom primeira visita, indicacao, orcamento rapido)
create table if not exists leads (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('cupom_primeira_visita', 'indicacao', 'orcamento')),
  nome text not null,
  whatsapp text not null,
  servico_slug text,
  mensagem text,
  codigo_indicacao text,
  atendido boolean not null default false,
  criado_em timestamptz not null default now()
);
alter table leads enable row level security;
create policy "public insert leads" on leads for insert with check (true);

-- Fase 5 — depoimentos (avaliações copiadas manualmente do Google, editável pelo console)
create table if not exists depoimentos (
  id bigint generated always as identity primary key,
  autor text not null default 'Cliente Clean Car',
  nota int not null default 5 check (nota between 1 and 5),
  texto text not null,
  ordem int not null default 0
);
alter table depoimentos enable row level security;
create policy "public read depoimentos" on depoimentos for select using (true);

-- Fase 6 — textos de promoções (cupom 1a visita, indique e ganhe) editaveis pelo console
create table if not exists promocoes (
  chave text primary key,
  titulo text not null,
  texto text not null,
  regras text not null default '',
  updated_at timestamptz not null default now()
);
alter table promocoes enable row level security;
create policy "public read promocoes" on promocoes for select using (true);

-- Fase 7 — programa de fidelidade: pontos por servico + niveis de beneficio
alter table services add column if not exists pontos_fidelidade int not null default 0;

create table if not exists beneficios (
  id bigint generated always as identity primary key,
  nome text not null,
  pontos_necessarios int not null,
  ordem int not null default 0
);
alter table beneficios enable row level security;
create policy "public read beneficios" on beneficios for select using (true);

-- Fase 8 — planos mensais (assinatura) editaveis pelo console
create table if not exists planos (
  id bigint generated always as identity primary key,
  nome text not null,
  preco numeric not null,
  descricao text not null,
  itens text[] not null default '{}',
  destaque boolean not null default false,
  ordem int not null default 0
);
alter table planos enable row level security;
create policy "public read planos" on planos for select using (true);

-- Ordenacao manual dos servicos (para dar destaque a lavagem/higienizacao)
alter table services add column if not exists ordem int not null default 0;
