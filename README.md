# Clean Car SEO

Site de SEO da Clean Car Estética Automotiva (Mogi das Cruzes e região).

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Deploy: Vercel
- Conteúdo: hoje gerado por template em `lib/content.ts`; plano é migrar para
  textos gerados via API da Anthropic, cacheados em `content/local/*.json`.

## Estrutura de páginas
- `/` — home
- `/servicos/[servico]` — página pilar de cada um dos 13 serviços
- `/servicos/[servico]/[cidade]` — página local (serviço x cidade), gera 65 páginas
- `/blog/[slug]` — a criar (conteúdo de cauda longa)

Serviços e cidades ficam centralizados em `lib/data.ts` — adicionar uma cidade
ou serviço ali já propaga para todas as páginas via `generateStaticParams`.

## Rodando local
```
npm install
npm run dev
```
