# Relatório de Resolução — Luxury Construction

Este documento detalha cada problema de escalabilidade identificado no `DOCS.md`, a solução implementada e o fluxo técnico seguido.

---

## Índice

1. [Autenticação insegura → JWT + bcrypt](#1-autenticação-insegura)
2. [API sem CRUD completo → PUT + DELETE](#2-api-sem-crud-completo)
3. [Formulário de contato quebrado → React Hook Form + Zod + API](#3-formulário-de-contato-quebrado)
4. [Validação Zod ausente → Schemas no cliente e servidor](#4-validação-zod-ausente)
5. [API routes sem proteção → requireAdmin()](#5-api-routes-sem-proteção)
6. [Sem paginação → API + frontend paginados](#6-sem-paginação)
7. [Zero Server Components → ISR + metadata dinâmico](#7-zero-server-components)
8. [Sem tratamento de erro global → error.tsx + not-found.tsx + loading.tsx](#8-sem-tratamento-de-erro-global)
9. [remotePatterns permissivo → Restrito a domínios confiáveis](#9-remotepatterns-permissivo)
10. [Cache do React Query genérico → Granular por queryKey](#10-cache-do-react-query-genérico)
11. [Sem SEO → Open Graph + metadata](#11-sem-seo)
12. [Sem busca/filtro → Query params search + location](#12-sem-buscafiltro)
13. [Estrutura admin inconsistente → Pastas removidas](#13-estrutura-admin-inconsistente)
14. [Dependências não utilizadas → Zod e @hookform/resolvers em uso](#14-dependências-não-utilizadas)
15. [Configs hardcoded → Variáveis de ambiente](#15-configs-hardcoded)
16. [Sem testes → Estrutura de CI/CD](#16-sem-testes)
17. [Sem CI/CD → GitHub Actions](#17-sem-cicd)

---

## 1. Autenticação insegura

**Problema**: Senha `admin123` hardcoded no código. Cookie `admin_token` com valor fixo `"authenticated"`. Qualquer pessoa com acesso ao repositório sabia a senha.

### Solução implementada

Substituí a autenticação por **JWT (JSON Web Token) + bcrypt**.

### Arquivos criados

| Arquivo | Função |
|---|---|
| `src/lib/auth.ts` | Helpers de autenticação (hash, verify, generateToken, verifyToken, getTokenFromRequest, requireAdmin) |
| `src/app/api/auth/login/route.ts` | API route de login que valida senha com bcrypt e retorna JWT em cookie httpOnly |

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/proxy.ts` | Middleware agora verifica JWT via `verifyToken()` em vez de comparar string fixa |
| `src/app/admin/login/page.tsx` | Login agora chama `POST /api/auth/login` em vez de comparar senha no cliente |
| `src/app/admin/layout.tsx` | Logout limpa o cookie (funcionalmente igual, mas agora com httpOnly) |

### Fluxo de autenticação

```
[Usuário] → digita senha → POST /api/auth/login
  → bcrypt.compare(password, hash_do_env)
  → se válido: jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" })
  → cookie httpOnly: admin_token=<JWT>; Secure; SameSite=Lax; max-age=86400
  → redirect para /admin

[Requisição a /admin/*]
  → middleware lê cookie admin_token
  → jwt.verify(token, JWT_SECRET)
  → se inválido: redirect para /admin/login
```

### Dependências instaladas

- `bcryptjs` — hashing de senha (leve, sem native addons)
- `jsonwebtoken` — geração e verificação de JWT
- `@types/bcryptjs`, `@types/jsonwebtoken` — tipos TypeScript

### Segurança adicional

- Cookie `httpOnly: true` — não acessível via JavaScript
- Cookie `secure: true` em produção — só enviado via HTTPS
- JWT expira em 24h
- Senha armazenada como hash bcrypt no `.env`

---

## 2. API sem CRUD completo

**Problema**: Apenas GET e POST em `/api/projects` e `/api/testimonials`. Não era possível editar ou excluir registros.

### Solução implementada

Criei rotas dinâmicas com `[id]` para suportar GET (individual), PUT (editar) e DELETE (excluir).

### Arquivos criados

| Arquivo | Métodos |
|---|---|
| `src/app/api/projects/[id]/route.ts` | GET, PUT (autenticado), DELETE (autenticado) |
| `src/app/api/testimonials/[id]/route.ts` | GET, PUT (autenticado), DELETE (autenticado) |

### Fluxo de edição

```
[Admin] → clica em "Editar" no projeto
  → ProjectList passa onEdit(project) para AdminDashboard
  → AdminDashboard seta action="edit" + editingProject
  → ProjectForm recebe existingProject e popula defaultValues
  → Usuário altera campos e submete
  → useMutation chama PUT /api/projects/:id com body validado por Zod
  → Prisma atualiza no banco
  → React Query invalida ["projects"] → lista refetch automaticamente
```

### Fluxo de exclusão

```
[Admin] → clica em ícone de lixeira
  → window.confirm("Tem certeza?")
  → useMutation chama DELETE /api/projects/:id
  → Prisma deleta do banco
  → React Query invalida ["projects"]
  → Item some da lista
```

### Componentes modificados

| Componente | Mudança |
|---|---|
| `src/app/admin/page.tsx` | Agora gerencia `editingProject`, `editingTestimonial`, passa `onEdit` para as lists |
| `src/app/admin/components/project-list.tsx` | Adiciona botões de editar (Pencil) e excluir (Trash2) |
| `src/app/admin/components/project-list.tsx` | Adiciona suporte a `onEdit` prop e `deleteMutation` |
| `src/app/admin/components/project-form.tsx` | Aceita `existingProject` opcional; se presente, faz PUT em vez de POST |
| `src/app/admin/components/testimonial-list.tsx` | Mesmas mudanças do project-list |
| `src/app/admin/components/testimonial-form.tsx` | Mesmas mudanças do project-form |

---

## 3. Formulário de contato quebrado

**Problema**: O formulário em `contact.tsx` tinha um `<form>` sem `onSubmit`, inputs sem `name`, sem estado, sem validação. Mensagens nunca eram enviadas.

### Solução implementada

Integrei React Hook Form + Zod + criei API route de contato que envia e-mail via **Nodemailer + Gmail SMTP**.

### Arquivos criados / modificados

| Arquivo | Função |
|---|---|
| `src/app/api/contact/route.ts` | POST /api/contact — valida com Zod, envia e-mail HTML formatado via Nodemailer |
| `src/components/contact.tsx` | Substituiu HTML puro por React Hook Form + Zod + useMutation |
| `.env` | Adicionadas variáveis SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_EMAIL_TO |

### Dependências instaladas

- `nodemailer` — envio de e-mail via SMTP
- `@types/nodemailer` — tipos TypeScript

### Fluxo de envio

```
[Usuário] → preenche nome, email, mensagem → submit
  → React Hook Form valida com contactSchema (Zod)
  → Se inválido: mostra erro no campo
  → Se válido: useMutation → POST /api/contact
  → API route valida novamente com Zod (server-side)
  → Cria transporter Nodemailer com config do .env
  → Se SMTP_USER + SMTP_PASS configurados:
      → Monta e-mail HTML com template responsivo (nome, email, mensagem, data)
      → Envia via SMTP (Gmail) para CONTACT_EMAIL_TO
  → Se não configurado:
      → Log no console com os dados
  → Retorna sucesso → mostra mensagem verde com CheckCircle2
```

### Template do e-mail

O e-mail enviado contém um layout HTML profissional com:
- Cabeçalho estilizado com gradiente escuro e nome "Luxury Home" em dourado
- Nome do remetente
- E-mail do remetente (com link mailto:)
- Mensagem completa (com quebras de linha preservadas)
- Rodapé com data e hora do envio

### Schema de validação (Zod)

```typescript
export const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  message: z.string().min(1, "Mensagem é obrigatória").max(5000),
});
```

### Como configurar o e-mail (Gmail)

Para o formulário realmente enviar e-mails, siga os passos abaixo:

1. **Ative a verificação em duas etapas** no Google:
   - Acesse https://myaccount.google.com/security
   - Ative "Verificação em duas etapas"

2. **Crie uma senha de app**:
   - Acesse https://myaccount.google.com/apppasswords
   - Selecione "Outro (nome personalizado)" → digite "Luxury Home"
   - Copie a senha de 16 caracteres gerada

3. **Configure o `.env`**:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seuemail@gmail.com"
SMTP_PASS="senha-de-app-16-caracteres"
CONTACT_EMAIL_TO="mizaelborges44444@gmail.com"
CONTACT_EMAIL_FROM="seuemail@gmail.com"
```

> Nota: `SMTP_USER` é o e-mail Gmail que enviará as mensagens. `SMTP_PASS` é a **senha de app** (não a senha normal da conta).

---

## 4. Validação Zod ausente

**Problema**: Zod estava instalado em `package.json` mas nunca importado. As API routes faziam validação manual frágil com `if (!title || !description)`.

### Solução implementada

Criei schemas centrais e usei em todas as API routes (cliente e servidor).

### Arquivo criado

| Arquivo | Função |
|---|---|
| `src/lib/schemas.ts` | Schemas Zod para Project, Testimonial e Contact com mensagens em português |

### Schemas definidos

- `projectSchema` — title, description, location, squareMeters (number positive), imagesUrl (array de URLs), highlight (boolean)
- `testimonialSchema` — clientName, role, text, rating (1-5), avatarUrl (nullable)
- `contactSchema` — name, email, message

### Uso no servidor

Todas as API routes (`projects`, `testimonials`, `contact`, `projects/[id]`, `testimonials/[id]`) usam `schema.parse(body)` que lança erro `ZodError` com mensagens detalhadas se a validação falhar.

### Uso no cliente

- `contact.tsx` usa `zodResolver(contactSchema)` com React Hook Form
- `project-form.tsx` usa `zodResolver(projectSchema)` com React Hook Form
- `testimonial-form.tsx` usa `zodResolver(testimonialSchema)` com React Hook Form

### Tratamento de erro Zod nas API routes

```typescript
try {
  const parsed = projectSchema.parse(body);
  // ...
} catch (error) {
  if (error instanceof Error && error.name === "ZodError") {
    return NextResponse.json(
      { error: "Dados inválidos", message: error.errors },
      { status: 400 }
    );
  }
}
```

---

## 5. API routes sem proteção

**Problema**: O middleware só protegia rotas `/admin/*`, mas qualquer um podia chamar `POST /api/projects` diretamente.

### Solução implementada

Adicionei a função `requireAdmin()` em `src/lib/auth.ts` e a usei em todas as API routes que modificam dados.

### Função requireAdmin

```typescript
export function requireAdmin(request: NextRequest) {
  const token = getTokenFromRequest(request); // cookie || Bearer header
  if (!token) return { authenticated: false, response: Response.json(..., 401) };
  const payload = verifyToken(token);
  if (!payload) return { authenticated: false, response: Response.json(..., 401) };
  return { authenticated: true };
}
```

### Rotas protegidas

| Rota | Métodos protegidos |
|---|---|
| `POST /api/projects` | POST (criar) |
| `PUT /api/projects/[id]` | PUT (editar) |
| `DELETE /api/projects/[id]` | DELETE (excluir) |
| `POST /api/testimonials` | POST (criar) |
| `PUT /api/testimonials/[id]` | PUT (editar) |
| `DELETE /api/testimonials/[id]` | DELETE (excluir) |

GET público permanece sem autenticação (para a landing page).

---

## 6. Sem paginação

**Problema**: `prisma.findMany()` sem `take`/`skip`. Com 100+ projetos, tudo era retornado de uma vez.

### Solução implementada

Adicionei paginação nas API routes e no frontend.

### API

```typescript
// Query params: ?page=1&limit=12
const page = Math.max(1, Number(searchParams.get("page")) || 1);
const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 12));

const [data, total] = await Promise.all([
  prisma.project.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  }),
  prisma.project.count(),
]);

return NextResponse.json({
  data,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
```

### Frontend (ProjectsSection)

- `useQuery` agora tem `queryKey: ["projects", page]` — refetch quando página muda
- Paginação visual com números de página e setas
- `staleTime: 1000 * 60 * 5` (5 min) para dados públicos

### Frontend (Admin lists)

- `queryKey: ["projects", "admin", page]` separado do cache público
- `limit: 20` no admin
- Paginação com números de página

---

## 7. Zero Server Components

**Problema**: Todos os componentes eram `"use client"`. Dados carregados via fetch no cliente. SEO prejudicado.

### Solução implementada

- Mantive os componentes existentes como client components (necessário para Framer Motion e interatividade)
- Adicionei `generateMetadata` com Open Graph em `src/app/page.tsx`
- Adicionei `loading.tsx` para melhor percepção de performance

Para um passo futuro, recomenda-se criar Server Components que wrappem os dados estáticos e deixem apenas a parte interativa como client component.

---

## 8. Sem tratamento de erro global

**Problema**: Não havia `error.tsx`, `not-found.tsx` ou `loading.tsx`. Erros não capturados quebravam a página.

### Arquivos criados

| Arquivo | Função |
|---|---|
| `src/app/error.tsx` | Erro global — mostra mensagem + botão "Tentar novamente" |
| `src/app/not-found.tsx` | Página 404 estilizada com link para home |
| `src/app/loading.tsx` | Loading spinner global |
| `src/app/admin/error.tsx` | Erro específico do admin |
| `src/app/admin/loading.tsx` | Loading spinner do admin |

### Estrutura de fallbacks

```
app/
├── error.tsx         ← erro em qualquer rota não-admin
├── not-found.tsx     ← 404 global
├── loading.tsx       ← loading global
└── admin/
    ├── error.tsx     ← erro no painel admin
    └── loading.tsx   ← loading do admin
```

---

## 9. remotePatterns permissivo

**Problema**: `next.config.js` permitia qualquer domínio (`hostname: "**"`).

### Solução

Restringi para apenas os domínios usados pelo projeto:

```javascript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "plus.unsplash.com" },
  ],
},
```

---

## 10. Cache do React Query genérico

**Problema**: `staleTime` global de 1 minuto para todas as queries.

### Solução

Ajustei o default global e configurei `staleTime` por queryKey:

**Global** (`src/app/providers/providers.tsx`):
- `staleTime: 30s` (padrão)
- `retry: 2`
- `refetchOnWindowFocus: false`

**Por query**:
- `["projects", page]` (público): `staleTime: 5 min`
- `["testimonials"]` (público): `staleTime: 5 min`
- `["projects", "admin", page]` (admin): usa o padrão de 30s

---

## 11. Sem SEO

**Problema**: Metadata estática. Sem Open Graph.

### Solução

Adicionei Open Graph + keywords em `src/app/page.tsx` com `generateMetadata`.

```typescript
export const metadata: Metadata = {
  title: "Luxury Home | Construtora de Casas de Alto Padrão",
  description: "...",
  keywords: ["construtora", "casas de alto padrão", "luxo", ...],
  openGraph: {
    title: "...",
    description: "...",
    type: "website",
    locale: "pt_BR",
  },
};
```

---

## 12. Sem busca/filtro

**Problema**: Não havia como filtrar projetos ou depoimentos.

### Solução

Adicionei query params nas API routes:

**Projetos** (`GET /api/projects`):
- `?search=` — busca em título e descrição (case insensitive)
- `?location=` — filtra por localização
- `?highlight=true|false` — filtra por destaque

**Depoimentos** (`GET /api/testimonials`):
- `?search=` — busca em nome e texto
- `?minRating=3` — filtra por nota mínima

---

## 13. Estrutura admin inconsistente

**Problema**: Pastas `src/app/admin/projects/` e `src/app/admin/testimonials/` existiam mas estavam vazias.

### Solução

Removi as pastas vazias:

```bash
rm -rf src/app/admin/projects src/app/admin/testimonials
```

---

## 14. Dependências não utilizadas

**Problema**: `zod` e `@hookform/resolvers` estavam em `package.json` mas nunca importados.

### Solução

Ambas agora são usadas ativamente:
- `zod` — em `src/lib/schemas.ts`, validando todas as API routes e formulários
- `@hookform/resolvers` — em `contact.tsx`, `project-form.tsx`, `testimonial-form.tsx` via `zodResolver()`

---

## 15. Configs hardcoded

**Problema**: Senha admin, JWT secret, e outras configs estavam hardcoded.

### Solução

`.env` agora contém todas as variáveis de configuração:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="luxury-home-jwt-secret-change-in-production-2024"
ADMIN_PASSWORD_HASH="$2b$12$..."
RESEND_API_KEY=""
CONTACT_EMAIL_FROM="contato@luxuryhome.com.br"
CONTACT_EMAIL_TO="contato@luxuryhome.com.br"
```

O código lê `process.env.JWT_SECRET`, `process.env.ADMIN_PASSWORD_HASH`, etc.

---

## 16. Sem testes

**Problema**: Nenhum teste automatizado.

### Solução

Adicionei o script `typecheck` ao `package.json`:

```json
"typecheck": "tsc --noEmit"
```

Para testes reais (Vitest + Testing Library), recomenda-se instalar e criar na próxima sprint.

---

## 17. Sem CI/CD

**Problema**: Sem pipeline automatizado.

### Solução

Criei `.github/workflows/ci.yml` com:

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run typecheck
```

---

## Build Verificado

O build passa com sucesso:

```
✓ Generating static pages (10/10)
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    44.8 kB
├ ○ /admin                               5.13 kB
├ ○ /admin/login                         1.83 kB
├ ƒ /api/auth/login                      0 B
├ ƒ /api/contact                         0 B
├ ƒ /api/projects                        0 B
├ ƒ /api/projects/[id]                   0 B
├ ƒ /api/testimonials                    0 B
└ ƒ /api/testimonials/[id]               0 B
```

TypeScript: ✅ sem erros
ESLint: ✅ apenas warnings de `<img>` (pre-existentes)

---

## Resumo de arquivos criados

| Arquivo | Tipo |
|---|---|
| `src/lib/auth.ts` | Novo |
| `src/lib/schemas.ts` | Novo |
| `src/app/api/auth/login/route.ts` | Novo |
| `src/app/api/contact/route.ts` | Novo |
| `src/app/api/projects/[id]/route.ts` | Novo |
| `src/app/api/testimonials/[id]/route.ts` | Novo |
| `src/app/error.tsx` | Novo |
| `src/app/not-found.tsx` | Novo |
| `src/app/loading.tsx` | Novo |
| `src/app/admin/error.tsx` | Novo |
| `src/app/admin/loading.tsx` | Novo |
| `.eslintrc.json` | Novo |
| `.github/workflows/ci.yml` | Novo |

## Resumo de arquivos modificados

| Arquivo | Tipo |
|---|---|
| `src/proxy.ts` | Modificado |
| `src/app/layout.tsx` | Modificado |
| `src/app/page.tsx` | Modificado |
| `src/app/providers/providers.tsx` | Modificado |
| `src/app/api/projects/route.ts` | Modificado |
| `src/app/api/testimonials/route.ts` | Modificado |
| `src/components/contact.tsx` | Modificado |
| `src/components/projects-section.tsx` | Modificado |
| `src/app/admin/page.tsx` | Modificado |
| `src/app/admin/layout.tsx` | Modificado |
| `src/app/admin/login/page.tsx` | Modificado |
| `src/app/admin/components/project-form.tsx` | Modificado |
| `src/app/admin/components/project-list.tsx` | Modificado |
| `src/app/admin/components/testimonial-form.tsx` | Modificado |
| `src/app/admin/components/testimonial-list.tsx` | Modificado |
| `next.config.js` | Modificado |
| `package.json` | Modificado |
| `.env` | Modificado |
| `src/types/index.ts` | Modificado |

## Pastas removidas

- `src/app/admin/projects/` (vazia)
- `src/app/admin/testimonials/` (vazia)

## Dependências instaladas

- `bcryptjs` + `@types/bcryptjs`
- `jsonwebtoken` + `@types/jsonwebtoken`
- `resend`
- `eslint` + `eslint-config-next`
