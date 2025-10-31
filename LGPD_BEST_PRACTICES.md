# 🔐 LGPD - Boas Práticas e Conformidade

## Orçamento Planejado - Gestão de Dados Pessoais

Este documento descreve as práticas implementadas para garantir conformidade com a **Lei Geral de Proteção de Dados (LGPD)** no sistema Orçamento Planejado.

---

## 📋 1. Consentimento do Usuário

### ✅ Implementação

- **Campo no banco**: `User.lgpdConsentAt` (DateTime nullable)
- **Modal de consentimento**: Exibido no primeiro login após autenticação
- **Componente**: `/components/auth/lgpd-consent-modal.tsx`
- **API**: `/api/user/consent` (POST para registrar, GET para verificar)

### 📝 Conteúdo do Consentimento

O modal inclui:
- Dados coletados (cadastrais, financeiros, uso, acesso)
- Finalidade do uso (gestão financeira, análises IA, melhorias)
- Compartilhamento com terceiros (infraestrutura, pagamentos, IA)
- Direitos do titular (acesso, correção, exclusão, portabilidade)
- Contato do encarregado de dados

### ⚡ Comportamento

- Modal **não pode ser fechado** sem aceite (ESC e click fora desabilitados)
- Após aceite, `lgpdConsentAt` recebe timestamp atual
- Modal **nunca reaparece** após consentimento dado
- Aceite é registrado mesmo após logout/login

---

## 🔒 2. Restrições de Acesso Administrativo

### 🚫 Princípio: Isolamento de Dados Sensíveis

Administradores **NÃO podem acessar**:
- ❌ Transações financeiras (`Transaction`)
- ❌ Categorias personalizadas (`Category`)
- ❌ Análises de IA (`AiAnalysis`)
- ❌ Investimentos (`Investment`)
- ❌ Metas financeiras (`Goal`)

### ✅ Administradores PODEM acessar:

- ✅ Dados cadastrais básicos: `id`, `name`, `email`, `phone`
- ✅ Dados de assinatura: `status`, `hotmartId`, `canceledAt`
- ✅ Controles: `role`, `isActive`
- ✅ Metadados: `createdAt`, `updatedAt`, `lgpdConsentAt`
- ✅ Contadores não sensíveis: `_count.sessions` (apenas quantidade)

### 🛡️ Rotas Protegidas

#### GET `/api/admin/users`
```typescript
// ✅ Implementação correta
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    isActive: true,
    hotmartId: true,
    createdAt: true,
    updatedAt: true,
    canceledAt: true,
    lgpdConsentAt: true,
    _count: {
      select: {
        sessions: true // Apenas contagem
      }
    }
  }
})

// ❌ NUNCA fazer isso
const users = await prisma.user.findMany({
  include: {
    transactions: true, // ❌ Expõe dados financeiros
    categories: true,   // ❌ Expõe dados pessoais
    aiAnalyses: true    // ❌ Expõe insights privados
  }
})
```

#### PATCH `/api/admin/users/[id]`
```typescript
// ✅ Retorna apenas campos permitidos
const user = await prisma.user.update({
  where: { id: params.id },
  select: {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    isActive: true,
    hotmartId: true,
    createdAt: true,
    updatedAt: true,
    canceledAt: true,
    lgpdConsentAt: true
  }
})
```

---

## 📊 3. Queries Prisma - Boas Práticas

### ✅ Use `select` explícito

```typescript
// ✅ BOM: Retorna apenas o necessário
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true
  }
})

// ❌ RUIM: Retorna TODOS os campos (incluindo sensíveis)
const user = await prisma.user.findUnique({
  where: { id }
})
```

### ✅ Evite `include` em contextos admin

```typescript
// ❌ NUNCA faça isso em rotas /api/admin/*
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    transactions: true,  // ❌ Dados financeiros expostos
    categories: true,     // ❌ Categorias pessoais expostas
    investments: true     // ❌ Investimentos expostos
  }
})

// ✅ Máximo permitido para admin
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    status: true,
    createdAt: true,
    lgpdConsentAt: true,
    _count: {
      select: {
        sessions: true // Apenas contagem
      }
    }
  }
})
```

### ✅ Use filtros seguros

```typescript
// ✅ BOM: Filtra por usuário logado
const transactions = await prisma.transaction.findMany({
  where: {
    userId: session.user.id // Sempre filtrar por usuário
  }
})

// ❌ RUIM: Retorna dados de TODOS os usuários
const transactions = await prisma.transaction.findMany()
```

---

## 🔐 4. Separação de Responsabilidades

### 👤 Rotas de Usuário (`/api/user/*`)

- Acesso total aos **próprios dados**
- Pode ver/editar: transações, categorias, análises, investimentos, metas
- Não pode ver dados de outros usuários

### 👨‍💼 Rotas de Admin (`/api/admin/*`)

- Gerenciamento de usuários (criar, ativar, desativar, deletar)
- Acesso apenas a campos não sensíveis
- Não pode ver: transações, categorias, análises, investimentos, metas

### 🔄 Middleware de Autorização

```typescript
// Verificar se é admin
const currentUser = await prisma.user.findUnique({
  where: { email: session.user.email! },
  select: { id: true, role: true }
})

if (currentUser?.role !== 'admin') {
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
}
```

---

## 📝 5. Logs e Auditoria

### ✅ O que registrar

- Consentimento LGPD (data/hora em `lgpdConsentAt`)
- Criação/modificação de usuários (admin)
- Cancelamento de assinaturas (webhook Hotmart)
- Tentativas de acesso não autorizado

### ❌ O que NÃO registrar

- Senhas (mesmo hasheadas nos logs)
- Valores de transações em logs públicos
- Tokens de autenticação
- Dados bancários

---

## 🛡️ 6. Direitos do Titular (LGPD)

### ✅ Direitos Implementados

1. **Acesso**: API `/api/profile` retorna dados do usuário
2. **Correção**: API `/api/profile` permite editar dados
3. **Exclusão**: API `/api/admin/users/[id]` (DELETE) remove usuário
4. **Portabilidade**: Exportar dados (a implementar)
5. **Revogação**: Usuário pode cancelar conta

### 📧 Contato do Encarregado

- Email: `suporteplanejado@gmail.com`
- Exibido no modal LGPD
- Responder em até 15 dias úteis

---

## ⚠️ 7. Checklist de Desenvolvimento

Antes de criar/modificar APIs:

- [ ] Usa `select` explícito nas queries?
- [ ] Filtra por `userId` em rotas de usuário?
- [ ] Valida `role === 'admin'` em rotas admin?
- [ ] Retorna apenas campos não sensíveis em `/api/admin/*`?
- [ ] Não expõe transações/categorias/análises para admin?
- [ ] Validou entrada de dados (sanitização)?
- [ ] Registrou logs de auditoria quando necessário?
- [ ] Testou com usuário não autorizado?

---

## 🚀 8. Próximos Passos (Roadmap LGPD)

### 📋 Funcionalidades Pendentes

1. **Exportação de Dados**
   - Endpoint `/api/user/export` (JSON/CSV)
   - Download de todas as transações, categorias, análises
   - Formato legível e estruturado

2. **Exclusão em Cascata**
   - Ao deletar usuário, remover:
     - Transações
     - Categorias
     - Análises IA
     - Investimentos
     - Metas
   - Já implementado no Prisma (`onDelete: Cascade`)

3. **Histórico de Consentimentos**
   - Tabela `ConsentHistory` para rastrear:
     - Versão dos termos aceitos
     - Data/hora de cada aceite
     - IP do usuário (opcional)

4. **Notificações de Privacidade**
   - Email quando:
     - Dados forem acessados pelo admin
     - Dados forem exportados
     - Conta for desativada/deletada

5. **Anonimização**
   - Após exclusão de conta:
     - Manter métricas agregadas
     - Remover identificadores pessoais
     - Sobrescrever dados sensíveis

---

## 📚 9. Referências

- [Lei Geral de Proteção de Dados (LGPD)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Guia de Boas Práticas LGPD - ANPD](https://www.gov.br/anpd/pt-br)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

---

**Última atualização:** 31/10/2025  
**Responsável:** Equipe Orçamento Planejado
