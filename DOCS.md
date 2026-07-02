# Análise de Escalabilidade - Luxury Construction

## Status: ❌ Não escalável no estado atual

O projeto possui uma base sólida (Next.js 14, TypeScript, Prisma, React Query), mas apresenta problemas críticos que impedem escalabilidade. Abaixo, tudo que deve ser melhorado, organizado por prioridade.

---

## 🔴 Crítico (impede escalabilidade)

### 1. Autenticação insegura e insustentável
- **Problema**: Senha hardcoded (`admin123`) em `src/app/admin/login/page.tsx`. Cookie `admin_token` fixo em `src/proxy.ts`. Qualquer pessoa com acesso ao código sabe a senha. Não há hash, JWT, OAuth ou sessão.
- **Impacto**: Impossível ter múltiplos admins, sessões individuais, permissões diferentes. Qualquer deploy expõe a senha.
- **Solução**: Implementar NextAuth.js/Auth.js com bcrypt + JWT ou session-based auth. Remover senha do código-fonte para variável de ambiente.

### 2. API routes sem CRUD completo
- **Problema**: Apenas GET e POST em `/api/projects` e `/api/testimonials`. Não há PUT/PATCH (editar) nem DELETE (excluir).
- **Impacto**: Se um admin cadastrar algo errado, não há como corrigir ou remover pelo sistema. Qualquer aplicação que consuma a API fica limitada.
- **Solução**: Criar `src/app/api/projects/[id]/route.ts` e `src/app/api/testimonials/[id]/route.ts` com PUT e DELETE.

### 3. Formulário de contato sem funcionar
- **Problema**: `src/components/contact.tsx` tem um `<form>` mas não possui `onSubmit`. Inputs sem `name`, `id` ou registro em React Hook Form.
- **Impacto**: Mensagens de contato nunca são enviadas. O formulário é puramente decorativo.
- **Solução**: Implementar React Hook Form + Zod + API route + serviço de email (Resend, Nodemailer, ou SendGrid).

### 4. API routes sem validação de schema
- **Problema**: As routes aceitam `request.json()` sem validar tipos. A verificação `if (!title || !description...)` é frágil e manual. Zod está instalado mas nunca importado.
- **Impacto**: Payloads malformados, tipos inesperados ou campos extras podem quebrar a API. Sem validação consistente entre cliente e servidor.
- **Solução**: Usar Zod com `@hookform/resolvers` no cliente e Zod no servidor para validar o body de todas as requests.

---

## 🟠 Alto (piora com o crescimento)

### 5. Middleware de autenticação sem proteção nas API routes
- **Problema**: O middleware `src/proxy.ts` só protege rotas `/admin/*`, mas não as API routes (`/api/*`). Teoricamente, qualquer um pode chamar POST /api/projects diretamente.
- **Impacto**: Qualquer pessoa pode criar/alterar dados do banco sem autenticação.
- **Solução**: Adicionar verificação de token/cookie nas API routes, seja via middleware global ou helper function.

### 6. Sem paginação nas listagens
- **Problema**: `prisma.findMany()` sem `take` ou `skip`. A interface também não tem paginação ou scroll infinito.
- **Impacto**: Com 100+ projetos, a query retorna tudo de uma vez, sobrecarregando banco, rede e renderização.
- **Solução**: Adicionar query params `?page=1&limit=12` nas API routes e implementar paginação ou infinite scroll no frontend.

### 7. Zero Server Components (SSR/SSG/ISR)
- **Problema**: Todos os componentes são `"use client"`. Projetos e depoimentos são carregados via fetch no cliente.
- **Impacto**: SEO prejudicado, primeira renderização mais lenta, sem suporte a crawlers que não executam JS.
- **Solução**: Mover dados públicos (projetos, depoimentos) para Server Components com ISR (revalidate) ou SSR. Manter `"use client"` apenas onde interação é necessária.

### 8. Sem tratamento de erro global
- **Problema**: Não há `error.tsx`, `not-found.tsx` ou `loading.tsx` em nenhum nível do App Router.
- **Impacto**: Erros não capturados quebram a página inteira com white screen, sem feedback para o usuário.
- **Solução**: Implementar `error.tsx`, `not-found.tsx` e `loading.tsx` no layout raiz e em seções relevantes.

---

## 🟡 Médio (boas práticas)

### 9. Configuração de imagens muito permissiva
- **Problema**: `next.config.js` permite qualquer domínio (`hostname: "**"`).
- **Impacto**: Risco de segurança e SEO. Qualquer URL pode ser carregada como imagem.
- **Solução**: Restringir para domínios específicos ou implementar upload local (S3, Cloudinary, etc.).

### 10. Cache do React Query sem granularidade
- **Problema**: `staleTime` global de 1 minuto para todas as queries.
- **Impacto**: Dados públicos (que mudam pouco) poderiam ter cache maior; dados admin poderiam ser configurados separadamente.
- **Solução**: Configurar `staleTime` e `gcTime` por queryKey.

### 11. Sem meta tags dinâmicas para SEO
- **Problema**: Metadata estática no `layout.tsx`. Não há `generateMetadata` ou `metadata` dinâmico por página/projeto.
- **Impacto**: Cada página mostra o mesmo título/descrição. Projetos individuais não aparecem bem em buscadores.
- **Solução**: Implementar `generateMetadata()` nas páginas e considerar Open Graph para redes sociais.

### 12. Projetos e depoimentos sem busca/filtro
- **Problema**: Não há endpoint ou interface para filtrar por título/local/destaque.
- **Impacto**: Conforme o catálogo cresce, fica inviável encontrar projetos específicos.
- **Solução**: Adicionar query params `?search=&location=&highlight=true` nas API routes e campo de busca no frontend.

### 13. Estrutura de pastas admin inconsistente
- **Problema**: `src/app/admin/projects/page.tsx` e `testimonials/page.tsx` existem mas estão vazios. Todo CRUD está na página raiz `/admin`.
- **Impacto**: Código desorganizado, difícil de navegar e manter.
- **Solução**: Mover as abas de CRUD para suas respectivas páginas ou remover as pastas vazias.

### 14. Dependências não utilizadas
- **Problema**: `zod`, `@hookform/resolvers` estão em `package.json` mas nunca são importados.
- **Impacto**: Aumenta desnecessariamente o bundle e o install time.
- **Solução**: Usar Zod de fato ou remover as dependências.

---

## 🟢 Leve (dívida técnica)

### 15. Sem variáveis de ambiente para configs
- **Problema**: `.env` só contém `DATABASE_URL`. Senha admin, tempo de cache, limites de paginação estão hardcoded.
- **Solução**: Mover todas as configs para variáveis de ambiente.

### 16. Sem testes automatizados
- **Problema**: Nenhum teste (unitário, integração, e2e).
- **Impacto**: Sem segurança para refatorar ou adicionar funcionalidades.
- **Solução**: Adicionar Vitest + Testing Library para componentes e Supertest ou MSW para API routes.

### 17. Sem CI/CD
- **Problema**: Não há pipeline de lint, testes, typecheck ou deploy automatizado.
- **Solução**: Configurar GitHub Actions com `npm run lint`, `npm run typecheck`, `npx prisma generate`, `npx vitest run`.

---

## Resumo da Arquitetura Atual

```
[Browser/Cliente]
  │  React Query (cache + fetch)
  ▼
[Next.js App Router]
  ├── / (página pública - client-side)
  ├── /admin (protegido por cookie)
  └── /api/* (sem proteção)
        │
        ▼
[Prisma ORM] → [PostgreSQL]
```

## Pontos Fortes (que facilitam escalar)

- ✅ Next.js 14 + App Router — arquitetura moderna e modular
- ✅ TypeScript com interfaces bem definidas
- ✅ Prisma ORM — schema declarativo, migrations, type-safe
- ✅ React Query — server state gerenciado com cache
- ✅ Tailwind CSS com tema customizado — design system coeso
- ✅ Componentização clara e responsiva
- ✅ Framer Motion para animações fluidas

---

> **Conclusão**: O projeto precisa de refatorações médias para se tornar escalável. Os 4 problemas críticos (auth, CRUD incompleto, contato quebrado, validação ausente) devem ser resolvidos antes de qualquer novo feature. Com essas correções + SSR + paginação, o projeto estará pronto para crescer.
