# ESPECIFICAÇÃO TÉCNICA - Luxury Construction Landing Page

## 1. ESTRUTURA DE PASTAS

```
luxury-construction/
├── .env                              # Variáveis de ambiente (DB, JWT, SMTP, Admin)
├── .eslintrc.json                    # Config ESLint (next/core-web-vitals)
├── .gitignore                        # Arquivos ignorados pelo git
├── next-env.d.ts                     # Declarações TypeScript do Next.js
├── next.config.js                    # Config Next.js (remotePatterns de imagens)
├── package.json                      # Dependências e scripts do projeto
├── package-lock.json                 # Lock file de dependências
├── postcss.config.js                 # PostCSS (Tailwind + Autoprefixer)
├── tailwind.config.ts                # Tema Tailwind (cores graphite, bronze, gold)
├── tsconfig.json                     # Config TypeScript (strict, bundler)
│
├── prisma/
│   ├── schema.prisma                 # Schema do banco (Project, Testimonial)
│   └── migrations/
│       └── 20260702205233_init/
│           └── migration.sql         # Migração inicial do banco
│
├── public/                           # Assets estáticos (vazio)
│
└── src/
    ├── proxy.ts                      # Middleware (proteção /admin/*)
    ├── types/
    │   └── index.ts                  # Interfaces TypeScript
    │
    ├── lib/
    │   ├── auth.ts                   # JWT + bcrypt (autenticação)
    │   ├── prisma.ts                 # Cliente Prisma singleton
    │   └── schemas.ts                # Schemas Zod de validação
    │
    ├── components/
    │   ├── animations/
    │   │   └── fade-in-view.tsx      # Animação scroll-triggered (Framer Motion)
    │   ├── header.tsx                # Header fixo com navegação + menu mobile
    │   ├── hero.tsx                  # Hero section full-screen
    │   ├── differencials.tsx         # Seção de diferenciais (3 colunas)
    │   ├── projects-section.tsx      # Lista de projetos com paginação + modal
    │   ├── project-modal.tsx         # Modal de detalhes do projeto
    │   ├── testimonials-section.tsx   # Carrossel de depoimentos
    │   ├── contact.tsx               # Formulário de contato
    │   └── footer.tsx                # Footer com links + scroll-to-top
    │
    └── app/
        ├── globals.css               # Estilos globais + classes utilitárias
        ├── layout.tsx                # Layout raiz (metadata + Providers)
        ├── page.tsx                  # Página inicial (monta todas as seções)
        ├── loading.tsx               # Loading global (spinner)
        ├── error.tsx                 # Error boundary global
        ├── not-found.tsx             # Página 404
        │
        ├── providers/
        │   └── providers.tsx         # Provider do TanStack React Query
        │
        ├── admin/
        │   ├── layout.tsx            # Layout do admin (header + logout)
        │   ├── page.tsx              # Dashboard admin (tabs Projetos/Depoimentos)
        │   ├── loading.tsx           # Loading do admin
        │   ├── error.tsx             # Error boundary do admin
        │   ├── login/
        │   │   └── page.tsx          # Página de login do admin
        │   └── components/
        │       ├── project-form.tsx      # Formulário criar/editar projeto
        │       ├── project-list.tsx      # Lista de projetos com CRUD
        │       ├── testimonial-form.tsx  # Formulário criar/editar depoimento
        │       └── testimonial-list.tsx  # Lista de depoimentos com CRUD
        │
        └── api/
            ├── auth/login/
            │   └── route.ts          # POST /api/auth/login (gerar JWT)
            ├── contact/
            │   └── route.ts          # POST /api/contact (enviar email)
            ├── projects/
            │   ├── route.ts          # GET + POST /api/projects
            │   └── [id]/
            │       └── route.ts      # GET + PUT + DELETE /api/projects/[id]
            └── testimonials/
                ├── route.ts          # GET + POST /api/testimonials
                └── [id]/
                    └── route.ts      # GET + PUT + DELETE /api/testimonials/[id]
```

---

## 2. DESCRIÇÃO DETALHADA DE CADA ARQUIVO

### Configuração

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Nome: luxury-construction. Scripts: dev, build, start, lint, typecheck, postinstall (prisma generate). Deps: Next.js 14, React 18, Prisma, TanStack Query, Framer Motion, Zod, React Hook Form, bcryptjs, jsonwebtoken, lucide-react, nodemailer |
| `next.config.js` | Permite imagens apenas de `images.unsplash.com` e `plus.unsplash.com` |
| `tailwind.config.ts` | Paletas customizadas: graphite (neutro), bronze (metálico), gold (dourado). Fontes: Inter (sans), Playfair Display (display). Animações: fade-in, slide-up, slide-down |
| `tsconfig.json` | Strict mode, bundler moduleResolution, alias `@/*` → `./src/*` |
| `.env` | `DATABASE_URL` (Neon PostgreSQL), `JWT_SECRET`, `ADMIN_PASSWORD`, `SMTP_*`, `CONTACT_EMAIL_*` |

### Banco de Dados (Prisma)

| Arquivo | Descrição |
|---------|-----------|
| `prisma/schema.prisma` | Provider PostgreSQL. Modelos: `Project` (id, title, description, location, squareMeters, imagesUrl[], highlight, timestamps) e `Testimonial` (id, clientName, role, text, rating, avatarUrl?, timestamps) |
| `prisma/migrations/.../migration.sql` | Migração inicial criando as tabelas projects e testimonials |

### Tipos

| Arquivo | Descrição |
|---------|-----------|
| `src/types/index.ts` | Interfaces: `Project`, `Testimonial`, `Pagination` (page, limit, total, totalPages), `ApiResponse<T>`, `ApiError` |

### Lib (Utilitários)

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/prisma.ts` | Singleton do Prisma Client para evitar múltiplas instâncias em hot-reload |
| `src/lib/auth.ts` | `verifyAdminPassword()` - bcrypt compare. `generateToken()` - JWT 24h. `verifyToken()` - verifica JWT. `getTokenFromRequest()` - extrai token de cookie/header. `requireAdmin()` - guard de rotas API |
| `src/lib/schemas.ts` | Schemas Zod: `projectSchema`, `testimonialSchema`, `contactSchema`. Types inferidos: `ProjectInput`, `TestimonialInput`, `ContactInput` |

### Middleware

| Arquivo | Descrição |
|---------|-----------|
| `src/proxy.ts` | Middleware Next.js que protege todas as rotas `/admin/*` exceto `/admin/login`. Verifica JWT em cookie/header e redireciona para login se inválido |

### Layout Raiz e Páginas Públicas

| Arquivo | Descrição |
|---------|-----------|
| `src/app/globals.css` | Tailwind directives, Google Fonts, estilos base (border-box, seleção customizada), classes utilitárias: `.section-container`, `.section-padding`, `.gradient-text`, `.glass-card`, `.btn-primary`, `.btn-gold`, `.btn-outline`, `.scrollbar-hide` |
| `src/app/layout.tsx` | Server component. Metadata: título "Luxury Home | Construtora de Casas de Alto Padrão", descrição, keywords. HTML lang="pt-BR", smooth scroll. Wrapper `<Providers>` |
| `src/app/page.tsx` | Server component. Compõe todas as seções: `<Header />` + `<Hero />` + `<Differencials />` + `<ProjectsSection />` + `<TestimonialsSection />` + `<Contact />` + `<Footer />` |
| `src/app/loading.tsx` | Client component. Spinner centralizado `Loader2` animado, fundo graphite-50 |
| `src/app/error.tsx` | Client component. Exibe ícone de erro, mensagem, botão "Tentar novamente" |
| `src/app/not-found.tsx` | Server component. Página 404 com texto gradiente e link para home |

### Providers

| Arquivo | Descrição |
|---------|-----------|
| `src/app/providers/providers.tsx` | Client component. Provider do TanStack React Query com staleTime 30s, retry 2, refetchOnWindowFocus false |

### Componentes da Landing Page

| Arquivo | Descrição |
|---------|-----------|
| `src/components/animations/fade-in-view.tsx` | Wrapper reutilizável de animação scroll-triggered com Framer Motion `whileInView`. Props: children, className, delay, direction (up/down/left/right/none), duration, once. Offset 40px, easing cubic-bezier |
| `src/components/header.tsx` | Header sticky. Fundo transparente → branco ao scroll > 40px. Nav: Projetos, Diferenciais, Depoimentos, Contato. Desktop: horizontal com botão "Solicitar Orçamento". Mobile: menu hamburguer com overlay animado (Framer Motion). Trava scroll do body quando menu aberto |
| `src/components/hero.tsx` | Hero full-screen. Background Unsplash com overlay gradiente (40% opacidade). Elementos animados: tagline "Excelência em Construção", heading "Sua Casa dos Sonhos", descrição, CTAs: "Ver Projetos" (btn-gold) e "Fale Conosco" (btn-outline). Chevron pulsante indicando scroll |
| `src/components/differencials.tsx` | Grid 3 colunas. Cards: 1) Projeto 3D Personalizado (ícone Ruler) 2) Acabamento Premium (ícone Home) 3) Entrega Garantida (ícone ShieldCheck). Efeitos hover (borda, sombra) |
| `src/components/projects-section.tsx` | Client component. Fetch `/api/projects?page=&limit=6` via React Query. Estados: loading (spinner), erro (mensagem), vazio (aviso), populado (grid). Grid responsivo 1/2/3 colunas. Card: thumbnail com zoom hover, título, localização (MapPin), m² (Ruler). Paginação com setas + números. Clique abre ProjectModal |
| `src/components/project-modal.tsx` | Overlay full-screen com backdrop blur. Galeria de imagens com navegação anterior/próximo e dots. Detalhes: título, localização, m², descrição. CTA "Solicitar projeto parecido" → ancora Contato. Animações Framer Motion |
| `src/components/testimonials-section.tsx` | Client component. Fetch `/api/testimonials`. Carrossel com navegação anterior/próximo + dots. AnimatePresence para transições. Subcomponente TestimonialCard: aspas (bronze), texto itálico, estrelas (gold), avatar + nome + cargo |
| `src/components/contact.tsx` | Layout 2 colunas: info (esquerda) + formulário (direita). Info: Telefone, Email, Endereço, Horários com ícones e links. Form: React Hook Form + Zod (contactSchema). Campos: name, email, message. Validação com erro por campo. Status: loading (spinner), sucesso (banner verde + CheckCircle2), erro (banner vermelho) |
| `src/components/footer.tsx` | Footer escuro. Logo "LuxuryHome" gradiente, copyright ano atual, links de navegação, botão scroll-to-top |

### Admin

| Arquivo | Descrição |
|---------|-----------|
| `src/app/admin/layout.tsx` | Client component. Header admin: logo, "Painel Administrativo", "Ver site" (nova aba), "Sair" (limpa cookie, redireciona login) |
| `src/app/admin/page.tsx` | Dashboard com abas "Projetos" / "Depoimentos". State: tab, action (list/create/edit), editingProject, editingTestimonial. Alterna entre listas e formulários |
| `src/app/admin/login/page.tsx` | Formulário de login centralizado. Input password. Fetch POST /api/auth/login. Redireciona para /admin em sucesso, mostra erro em falha |
| `src/app/admin/loading.tsx` | Spinner bronze centralizado |
| `src/app/admin/error.tsx` | Mensagem de erro com botão "Tentar novamente" |
| `src/app/admin/components/project-form.tsx` | Form criar/editar projeto. React Hook Form (sem Zod resolver direto, usa Zod na mutation). Campos: title, location, description (textarea), squareMeters (number), highlight (checkbox), imagesUrlStr (textarea, 1 URL por linha). Parse de imagesUrlStr → array. Validação Zod. POST ou PUT conforme ação |
| `src/app/admin/components/project-list.tsx` | Lista projetos com paginação (20/page). Cada item: thumbnail, título, localização, m², badge highlight, data criação, botões editar/excluir. Exclusão com confirmação, loading individual |
| `src/app/admin/components/testimonial-form.tsx` | Form criar/editar depoimento. React Hook Form + Zod resolver. Campos: clientName, role, text, rating (estrelas clicáveis), avatarUrl. POST ou PUT |
| `src/app/admin/components/testimonial-list.tsx` | Lista depoimentos com paginação (20/page). Cada item: avatar, nome, cargo, estrelas, preview texto, data criação, botões editar/excluir |

### API Routes

| Arquivo | Rota | Método | Descrição |
|---------|------|--------|-----------|
| `api/auth/login/route.ts` | `/api/auth/login` | POST | Verifica senha com bcrypt, gera JWT, seta cookie httpOnly (24h, Secure em prod, SameSite=Lax) |
| `api/contact/route.ts` | `/api/contact` | POST | Valida com Zod, envia email HTML via Nodemailer (SMTP). Fallback: console.log se SMTP não configurado |
| `api/projects/route.ts` | `/api/projects` | GET | Lista projetos com paginação (`page`, `limit`), busca (`search`), filtros (`location`, `highlight`). Retorna `{data, pagination}` |
| `api/projects/route.ts` | `/api/projects` | POST | Protegido por `requireAdmin()`. Valida com Zod, cria projeto |
| `api/projects/[id]/route.ts` | `/api/projects/[id]` | GET | Retorna projeto por ID ou 404 |
| `api/projects/[id]/route.ts` | `/api/projects/[id]` | PUT | Protegido. Valida com Zod, atualiza projeto |
| `api/projects/[id]/route.ts` | `/api/projects/[id]` | DELETE | Protegido. Deleta projeto |
| `api/testimonials/route.ts` | `/api/testimonials` | GET | Lista depoimentos com paginação, busca (`search`), filtro (`minRating`) |
| `api/testimonials/route.ts` | `/api/testimonials` | POST | Protegido. Valida com Zod, cria depoimento |
| `api/testimonials/[id]/route.ts` | `/api/testimonials/[id]` | GET | Retorna depoimento por ID ou 404 |
| `api/testimonials/[id]/route.ts` | `/api/testimonials/[id]` | PUT | Protegido. Valida com Zod, atualiza depoimento |
| `api/testimonials/[id]/route.ts` | `/api/testimonials/[id]` | DELETE | Protegido. Deleta depoimento |

---

## 3. FLUXO COMPLETO DA LANDING PAGE

### 3.1. Carregamento Inicial

```
Requisição → Next.js Server (RSC)
  ├── layout.tsx
  │   ├── Seta metadata (SEO)
  │   └── Renderiza <Providers> (React Query)
  │
  └── page.tsx (Server Component)
      ├── Header (client) → hidrata no cliente
      ├── Hero (client) → animação de entrada
      ├── Differencials (client) → fade-in ao scroll
      ├── ProjectsSection (client)
      │   └── useQuery → GET /api/projects?page=1&limit=6
      │       ├── Loading → spinner
      │       ├── Error → mensagem de erro
      │       └── Success → grid de cards
      ├── TestimonialsSection (client)
      │   └── useQuery → GET /api/testimonials
      │       ├── Loading → skeleton
      │       ├── Error → mensagem
      │       └── Success → carrossel
      ├── Contact (client)
      │   └── Formulário pronto para input
      └── Footer (client) → links + scroll-top
```

### 3.2. Interação do Usuário (Landing Page)

```
Navegação (Header):
  Usuário clica link nav → scroll suave até a seção alvo (#projetos, #diferenciais, #depoimentos, #contato)

Projetos:
  Usuário navega páginas → useQuery invalida → fetch nova página → re-renderiza grid
  Usuário clica projeto → ProjectModal abre com overlay
    ├── Galeria: navegação anterior/próximo → setState currentImage
    ├── Clique "Solicitar projeto parecido" → fecha modal + scroll para #contato
    └── Clique backdrop/X/fecha → modal fecha com animação

Depoimentos:
  Usuário clica setas/dots → setState currentIndex → AnimatePresence troca slide

Contato:
  Usuário preenche formulário → React Hook Form valida (Zod)
    ├── Erro → mensagem vermelha no campo específico
    └── Sucesso → useMutation → POST /api/contact
        ├── Loading → botão desabilitado + spinner
        ├── Sucesso → banner verde "Mensagem enviada!" + form reset
        └── Erro → banner vermelho "Erro ao enviar"

Scroll-to-top:
  Footer → clique → window.scrollTo({ top: 0, behavior: 'smooth' })
```

### 3.3. Fluxo de Autenticação (Admin)

```
Acesso /admin → Middleware (proxy.ts)
  ├── Sem token → redirect /admin/login?redirect=/admin
  └── Token válido → renderiza AdminLayout

Login:
  Usuário envia senha → POST /api/auth/login
    ├── bcrypt verify(ADMIN_PASSWORD)
    │   ├── Falha → JSON { error: "Senha inválida" }
    │   └── Sucesso → JWT em httpOnly cookie + redirect /admin
    └── Erro → mensagem na tela

Logout:
  Usuário clica "Sair" → remove cookie admin_token → redirect /admin/login
```

### 3.4. Fluxo CRUD (Admin)

```
Admin Dashboard:
  Aba "Projetos" → ProjectList (useQuery GET /api/projects?page=&limit=20)
  Aba "Depoimentos" → TestimonialList (useQuery GET /api/testimonials?page=&limit=20)

Criar:
  Clica "Novo Projeto"/"Novo Depoimento" → action='create' → renderiza form vazio
    → Preenche → submit → useMutation →
      ├── POST /api/projects (ou /api/testimonials)
      ├── onSuccess: invalida queries → volta para list
      └── onError: mostra erro

Editar:
  Clica editar → action='edit', editingItem={...} → form preenchido
    → Altera → submit → useMutation →
      ├── PUT /api/projects/[id] (ou /api/testimonials/[id])
      ├── onSuccess: invalida queries → volta para list
      └── onError: mostra erro

Excluir:
  Clica excluir → confirm("Tem certeza?") → useMutation →
    ├── DELETE /api/projects/[id] (ou /api/testimonials/[id])
    ├── onSuccess: invalida queries
    └── onError: mostra erro
```

### 3.5. Fluxo de Dados (API → Banco)

```
Client → React Query → fetch → Next.js API Route
  ├── Zod schema validation
  ├── requireAdmin() (se aplicável)
  ├── Prisma ORM query
  └── PostgreSQL (Neon)

Resposta: ApiResponse<T> { data, pagination?, message? }
         ou ApiError { error, message }
```

---

## 4. SKILLS E TECNOLOGIAS

| Skill/Tecnologia | Uso no Projeto |
|------------------|----------------|
| **Next.js 14 App Router** | Sistema de rotas baseado em arquivos, layout aninhado, Server Components, Metadata API |
| **TypeScript Strict** | Tipagem forte em 100% do código, alias `@/*` |
| **Prisma ORM** | Schema declarativo, migrations, queries type-safe com PostgreSQL (Neon) |
| **TanStack React Query** | Gerenciamento de estado servidor: caching (staleTime 30s), paginação retida, mutações com auto-invalidação |
| **Zod** | Schemas de validação compartilhados entre client e server, tipos inferidos via `z.infer` |
| **React Hook Form** | Gerenciamento de formulários com resolvers Zod |
| **Framer Motion** | Animações: `whileInView` (scroll), `AnimatePresence` (transições), variantes (hover/tap) |
| **Tailwind CSS** | Design system completo: paletas customizadas (graphite/bronze/gold), breakpoints responsivos, classes utilitárias |
| **JWT + bcrypt** | Autenticação stateless com httpOnly cookies, hash de senha |
| **Nodemailer** | Envio de email SMTP com template HTML profissional para formulário de contato |
| **Lucide React** | Ícones consistentes em toda a interface |

---

## 5. HIERARQUIA DE COMPONENTES

```
<RootLayout> (server)
  └── <Providers> (client) [React Query]
      └── Páginas

Landing Page (/):
  ├── <Header /> (client)
  │   ├── NavLinks → scroll smooth
  │   ├── Botão "Solicitar Orçamento" → #contato
  │   └── MobileMenu (Framer Motion overlay)
  ├── <Hero /> (client)
  │   ├── Background image + overlay
  │   └── CTAs animados
  ├── <Differencials /> (client)
  │   └── 3x <FadeInView> → Card
  ├── <ProjectsSection /> (client)
  │   ├── useQuery → /api/projects
  │   ├── Grid de ProjectCard
  │   ├── Pagination
  │   └── <ProjectModal /> (client)
  ├── <TestimonialsSection /> (client)
  │   ├── useQuery → /api/testimonials
  │   ├── AnimatePresence
  │   └── TestimonialCard
  ├── <Contact /> (client)
  │   ├── Info display
  │   └── Form (RHF + Zod + useMutation)
  └── <Footer /> (client)

Admin (/admin):
  └── <AdminLayout /> (client)
      ├── <AdminLogin /> → POST /api/auth/login
      ├── <Dashboard /> (client)
      │   ├── Aba Projetos:
      │   │   ├── <ProjectList /> → useQuery /api/projects
      │   │   └── <ProjectForm /> → useMutation POST/PUT
      │   └── Aba Depoimentos:
      │       ├── <TestimonialList /> → useQuery /api/testimonials
      │       └── <TestimonialForm /> → useMutation POST/PUT
```

---

## 6. SISTEMA DE DESIGN

### Cores
- **Graphite** (#1a1a1a base): 10 shades (50-950) para backgrounds, textos, bordas
- **Bronze** (#b8833e base): 10 shades para destaques, badges, ícones
- **Gold** (#c8a84e base): 9 shades para CTAs principais, estrelas, gradientes

### Tipografia
- **Inter**: textos corporativos, navegação, labels
- **Playfair Display**: headings, títulos de seção, logo

### Componentes Utilitários (globals.css)
| Classe | Propósito |
|--------|-----------|
| `.section-container` | Container max-w-7xl centralizado com padding |
| `.section-padding` | Padding vertical py-20 md:py-32 |
| `.gradient-text` | Gradiente bronze-to-gold no texto |
| `.glass-card` | Efeito vidro (fundo semi-transparente, blur, borda sutil) |
| `.btn-primary` | Botão graphite escuro com hover |
| `.btn-gold` | Botão gold com brilho hover |
| `.btn-outline` | Botão com borda bronze |
| `.scrollbar-hide` | Esconde scrollbar (útil para carrosséis) |

### Animações (Tailwind + Framer Motion)
| Animação | Trigger | Detalhes |
|----------|---------|----------|
| `fade-in` | Scroll | Opacidade 0→1 |
| `slide-up` | Scroll | Translação Y 40px→0 + fade |
| `slide-down` | Scroll | Translação Y -40px→0 + fade |
| `whileInView` | Scroll | Configurável: direção, delay, duração, once |
| `AnimatePresence` | State | Transições de entrada/saída (modal, carrossel) |
| Hover cards | Mouse | Escala, borda, sombra |

---

## 7. PAGINAÇÃO

### API
- Parâmetros: `page` (default 1), `limit` (default 6 público, 20 admin)
- Retorno: `{ data: T[], pagination: { page, limit, total, totalPages } }`
- Filtros: `search` (busca texto), `location`, `highlight` (projetos), `minRating` (depoimentos)

### Frontend
- React Query mantém cache por página (queryKey inclui page)
- Componente `Pagination` com: setas anterior/próximo, botões numerados, página atual destacada
- 6 itens por página na landing page, 20 no admin

---

## 8. SEGURANÇA

| Medida | Implementação |
|--------|---------------|
| Proteção rotas admin | Middleware Next.js (proxy.ts) verifica JWT |
| Proteção API mutações | `requireAdmin()` → 401 se sem token |
| Senha hasheada | bcrypt.compare contra `ADMIN_PASSWORD` |
| JWT httpOnly | Cookie `admin_token` sem acesso JS, Secure em produção |
| Validação dados | Zod em todas as rotas API (server-side) |
| Rate limit implícito | Next.js Edge/Functions lidam com abuso básico |
| XSS | React escapa output por padrão |
| Imagens externas | Whitelist apenas Unsplash |

---

## 9. VARIÁVEIS DE AMBIENTE

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon) |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
| `ADMIN_PASSWORD` | Senha do admin (hasheada com bcrypt em runtime) |
| `SMTP_HOST` | Servidor SMTP (ex: smtp.gmail.com) |
| `SMTP_PORT` | Porta SMTP (ex: 587) |
| `SMTP_USER` | Usuário SMTP |
| `SMTP_PASS` | Senha SMTP |
| `CONTACT_EMAIL_TO` | Email que recebe mensagens do formulário |
| `CONTACT_EMAIL_FROM` | Email remetente |

---

## 10. SCRIPTS DISPONÍVEIS

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento Next.js |
| `npm run build` | Build de produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | ESLint (next lint) |
| `npm run typecheck` | TypeScript strict check (tsc --noEmit) |
| `npm run postinstall` | Gera Prisma Client automaticamente |
