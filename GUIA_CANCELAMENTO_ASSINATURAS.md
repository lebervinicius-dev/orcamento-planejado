
# 🔴 GUIA COMPLETO: Sistema de Cancelamento de Assinaturas

## 📊 PARTE 1: QUAL WEBHOOK CONFIGURAR NO HOTMART

### ✅ Eventos Recomendados:

Selecione **ESTES 3 EVENTOS** no painel da Hotmart:

1. **PURCHASE_APPROVED** (ou PURCHASE_COMPLETE)
   - Quando: Pagamento aprovado (cartão, boleto compensado)
   - Ação: Cria usuário + envia email de boas-vindas
   - ✅ **ESSENCIAL**

2. **PURCHASE_CANCELED**
   - Quando: Cliente cancela assinatura
   - Ação: Bloqueia acesso + envia email de cancelamento
   - ✅ **ESSENCIAL**

3. **PURCHASE_REFUNDED** (opcional)
   - Quando: Reembolso processado
   - Ação: Bloqueia acesso + envia email de cancelamento
   - ⚠️ **RECOMENDADO**

---

## 🔧 PARTE 2: COMO FUNCIONA O SISTEMA

### **Fluxo de Compra Aprovada:**
```
Cliente compra no Hotmart
         ↓
Hotmart envia PURCHASE_APPROVED
         ↓
Sistema cria usuário com status ACTIVE
         ↓
Envia email com credenciais
         ↓
Cliente acessa normalmente ✅
```

### **Fluxo de Cancelamento:**
```
Cliente cancela/reembolsa
         ↓
Hotmart envia PURCHASE_CANCELED ou PURCHASE_REFUNDED
         ↓
Sistema muda status para CANCELED
         ↓
Salva data do cancelamento (canceledAt)
         ↓
Envia email de despedida
         ↓
Bloqueio automático de acesso ❌
```

### **Fluxo de Reativação (Nova Compra):**
```
Cliente cancelado compra novamente
         ↓
Hotmart envia PURCHASE_APPROVED
         ↓
Sistema detecta email existente
         ↓
Muda status de CANCELED → ACTIVE
         ↓
Remove data de cancelamento
         ↓
Cliente pode acessar novamente ✅
```

---

## 🎯 PARTE 3: STATUS DO USUÁRIO

O sistema agora usa **3 status diferentes**:

| Status | Significado | Pode logar? | Email automático? |
|--------|-------------|-------------|-------------------|
| **ACTIVE** | Assinatura ativa | ✅ SIM | Boas-vindas |
| **SUSPENDED** | Temporariamente suspenso | ❌ NÃO | Manual (admin) |
| **CANCELED** | Assinatura cancelada | ❌ NÃO | Cancelamento |

### **Quando cada status é usado:**

- **ACTIVE**: Webhook PURCHASE_APPROVED ou reativação
- **SUSPENDED**: Apenas manualmente pelo admin (casos especiais)
- **CANCELED**: Webhook PURCHASE_CANCELED ou PURCHASE_REFUNDED

---

## 📧 PARTE 4: EMAILS AUTOMÁTICOS

### **1. Email de Boas-vindas (ATIVO)**
- **Quando**: Compra aprovada
- **Conteúdo**: Credenciais de acesso + link do app
- **Cor**: Verde (#00bf63)
- **CTA**: "Acessar minha conta"

### **2. Email de Cancelamento (NOVO!)**
- **Quando**: Assinatura cancelada ou reembolsada
- **Conteúdo**: 
  - Notificação de cancelamento
  - Explicação do que acontece com os dados
  - Opção de reassinar
- **Cor**: Vermelho (#dc3545)
- **CTA**: "Quero assinar novamente"

### **3. Email de Recuperação de Senha**
- **Quando**: Cliente esquece senha
- **Conteúdo**: Link único válido por 1h
- **Cor**: Verde (#00bf63)
- **CTA**: "Redefinir minha senha"

---

## 🚫 PARTE 5: BLOQUEIO DE ACESSO

### **Como funciona:**

1. **Middleware verifica status em TODA requisição ao dashboard**
2. **Se usuário está CANCELED ou SUSPENDED:**
   - Redireciona para: `/auth/access-denied`
   - Mostra mensagem explicativa
   - Oferece opção de reassinar (se cancelado)
   - Oferece contato com suporte (se suspenso)

3. **Página de Acesso Negado:**
   - Design profissional e empático
   - Explicação clara do motivo
   - Botão "Voltar para a página inicial"
   - Botão "Fazer nova assinatura" (se cancelado)
   - Link de contato do suporte

---

## ⚙️ PARTE 6: CONFIGURAÇÃO NO HOTMART

### **Passo a Passo:**

1. **Acesse o painel da Hotmart**
   - https://app.hotmart.com/

2. **Vá em: Ferramentas > Postback de vendas**

3. **Configure a URL do webhook:**
   ```
   https://orcamento-planejado.vercel.app/api/webhook/hotmart
   ```

4. **Selecione os eventos:**
   - [x] Purchase Approved (PURCHASE_APPROVED)
   - [x] Purchase Canceled (PURCHASE_CANCELED)
   - [x] Purchase Refunded (PURCHASE_REFUNDED)

5. **Clique em "Salvar"**

6. **Teste com uma compra sandbox:**
   - Hotmart > Ferramentas > Sandbox
   - Faça uma compra de teste
   - Verifique os logs: `/api/webhook/hotmart/monitor`

---

## 📊 PARTE 7: MONITORAMENTO

### **Ver logs do webhook:**
```
https://orcamento-planejado.vercel.app/api/webhook/hotmart/monitor
```

### **Painel Admin:**
```
URL: /dashboard/admin
Login: admin@orcamento.com
Senha: admin123
```

### **No Painel Admin você verá:**
- Lista de todos os usuários
- Status de cada usuário (ACTIVE, SUSPENDED, CANCELED)
- Data de criação
- Data de cancelamento (se cancelado)
- Opção de reenviar email
- Opção de adicionar usuário manualmente

### **Consultas SQL úteis:**

```sql
-- Ver todos os usuários cancelados
SELECT name, email, status, "canceledAt" 
FROM "User" 
WHERE status = 'CANCELED';

-- Ver total de usuários por status
SELECT status, COUNT(*) as total 
FROM "User" 
GROUP BY status;

-- Ver usuários que cancelaram nos últimos 7 dias
SELECT name, email, "canceledAt" 
FROM "User" 
WHERE status = 'CANCELED' 
AND "canceledAt" >= NOW() - INTERVAL '7 days';

-- Ver taxa de cancelamento (%)
SELECT 
  COUNT(CASE WHEN status = 'CANCELED' THEN 1 END) * 100.0 / COUNT(*) as taxa_cancelamento
FROM "User";
```

---

## 🔄 PARTE 8: REATIVAÇÃO AUTOMÁTICA

### **Quando um cliente cancelado compra novamente:**

O sistema **automaticamente**:
1. ✅ Detecta que o email já existe
2. ✅ Verifica o status (CANCELED)
3. ✅ Muda para ACTIVE
4. ✅ Remove a data de cancelamento
5. ✅ NÃO envia novo email (usuário já conhece as credenciais)
6. ✅ Cliente pode logar imediatamente

**Logs gerados:**
```
👤 Usuário já existe, reativando acesso: cliente@email.com
✅ Acesso reativado para: cliente@email.com
```

---

## 🛠️ PARTE 9: ADMINISTRAÇÃO MANUAL

### **Suspender usuário manualmente (Admin):**

Via SQL (Supabase):
```sql
UPDATE "User"
SET status = 'SUSPENDED', "isActive" = false
WHERE email = 'usuario@email.com';
```

### **Reativar usuário manualmente:**

Via SQL (Supabase):
```sql
UPDATE "User"
SET status = 'ACTIVE', "isActive" = true, "canceledAt" = NULL
WHERE email = 'usuario@email.com';
```

### **Deletar dados de usuário cancelado (após 90 dias):**

⚠️ **CUIDADO**: Isso é irreversível!

```sql
DELETE FROM "User"
WHERE status = 'CANCELED'
AND "canceledAt" < NOW() - INTERVAL '90 days';
```

---

## 📝 PARTE 10: ESTRUTURA DO BANCO DE DADOS

### **Modelo User atualizado:**

```prisma
model User {
  id               String     @id @default(cuid())
  name             String?
  email            String     @unique
  password         String?
  role             String     @default("user")
  status           UserStatus @default(ACTIVE)      // 🆕 NOVO
  isActive         Boolean    @default(true)         // Legado (mantido)
  hotmartId        String?    @unique
  canceledAt       DateTime?                        // 🆕 NOVO
  // ... outros campos
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  CANCELED
}
```

---

## 🎯 PARTE 11: TROUBLESHOOTING

### **Problema: Webhook não está chegando**

**Soluções:**
1. Verifique a URL no Hotmart
2. Confirme que os eventos estão selecionados
3. Veja os logs do Vercel: `https://vercel.com/.../logs`
4. Teste manualmente com curl:
   ```bash
   curl -X POST https://orcamento-planejado.vercel.app/api/webhook/hotmart \
     -H "Content-Type: application/json" \
     -d '{"event":"PURCHASE_CANCELED","data":{"buyer":{"email":"teste@teste.com","name":"João"}}}'
   ```

### **Problema: Email de cancelamento não enviou**

**Soluções:**
1. Verifique `GMAIL_USER` e `GMAIL_APP_PASSWORD` no Vercel
2. Veja os logs do webhook (deve mostrar erro específico)
3. O acesso é bloqueado MESMO se o email falhar
4. Admin pode reenviar manualmente

### **Problema: Usuário cancelado consegue logar**

**Soluções:**
1. Verifique o status no banco:
   ```sql
   SELECT status, "isActive" FROM "User" WHERE email = 'email@cliente.com';
   ```
2. Se status está errado, atualize:
   ```sql
   UPDATE "User" SET status = 'CANCELED', "isActive" = false WHERE email = 'email@cliente.com';
   ```
3. Limpe cache do navegador (Ctrl+Shift+Delete)
4. Usuário deve fazer logout e login novamente

### **Problema: Cliente reclama que foi bloqueado sem motivo**

**Investigação:**
1. Verifique no banco:
   ```sql
   SELECT status, "canceledAt", "updatedAt" FROM "User" WHERE email = 'email@cliente.com';
   ```
2. Verifique logs do webhook no Vercel
3. Confirme com Hotmart se houve cancelamento
4. Se foi erro, reative manualmente:
   ```sql
   UPDATE "User" SET status = 'ACTIVE', "isActive" = true, "canceledAt" = NULL WHERE email = 'email@cliente.com';
   ```

---

## ✅ PARTE 12: CHECKLIST FINAL

Antes de considerar o sistema completo, confirme:

- [ ] Webhook configurado no Hotmart
- [ ] Eventos selecionados: APPROVED, CANCELED, REFUNDED
- [ ] Teste de compra aprovada funcionando
- [ ] Teste de cancelamento funcionando
- [ ] Email de boas-vindas enviando
- [ ] Email de cancelamento enviando
- [ ] Bloqueio de acesso funcionando
- [ ] Página /auth/access-denied carregando
- [ ] Reativação automática funcionando
- [ ] Painel admin mostrando status

---

## 💡 DICAS DE OURO

1. **Monitore a taxa de cancelamento semanalmente**
   - Meta: < 5% de cancelamentos por mês
   - Se > 10%, investigue os motivos

2. **Entre em contato com quem cancelou**
   - Use os emails do banco de dados
   - Pergunte o motivo do cancelamento
   - Ofereça incentivo para retornar

3. **Mantenha dados por 90 dias**
   - Cliente pode mudar de ideia
   - Facilita análise de churn
   - Depois de 90 dias, pode deletar

4. **Automatize relatórios**
   - Total de cancelamentos/mês
   - Motivos principais
   - Taxa de reativação
   - LTV (Lifetime Value)

---

## 🆘 SUPORTE

**Dúvidas sobre o sistema:**
- Consulte este guia primeiro
- Veja os logs do Vercel
- Entre em contato com o desenvolvedor

**Contato do suporte (para seus clientes):**
- Email: suporteplanejado@gmail.com
- Responda em até 24h

---

## 📚 RECURSOS ADICIONAIS

- [Documentação Hotmart Webhooks](https://developers.hotmart.com/docs/pt-BR/v1/)
- [Guia Prisma Status](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
- [NextAuth Middleware](https://next-auth.js.org/configuration/nextjs#middleware)

---

**✅ Sistema implementado e testado com sucesso!**
**📅 Data: {{ date }}**
**🚀 Versão: 1.0.0**
