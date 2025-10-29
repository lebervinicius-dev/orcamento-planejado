
# 🚀 Instruções de Configuração - Hotmart

## ✅ **O QUE JÁ ESTÁ PRONTO:**

### 1. Sistema de Emails Configurado ✅
- **Serviço:** Resend
- **Email remetente:** suporteplanejado@gmail.com
- **Dois tipos de email:**
  - ✉️ **Boas-vindas:** Enviado automaticamente após compra com login e senha
  - 🔒 **Recuperação de senha:** Enviado quando usuário solicita

### 2. Webhook Hotmart Ativo ✅
- **Endpoint criado:** `/api/webhook/hotmart`
- **Funcionalidades:**
  - Recebe notificação de compra da Hotmart
  - Cria usuário automaticamente
  - Gera senha padrão: `12345678`
  - Envia email de boas-vindas com credenciais

---

## 📋 **PASSO A PASSO PARA CONFIGURAR A HOTMART:**

### **1. Após o Deploy**
Quando você fizer o deploy, receberá uma URL como:
```
https://orcamento-planejado.abacusai.app
```

### **2. URL Completa do Webhook**
A URL que você vai configurar na Hotmart será:
```
https://SEU-DOMINIO.com/api/webhook/hotmart
```

**Exemplos:**
- Se usar domínio temporário: `https://orcamento-planejado.abacusai.app/api/webhook/hotmart`
- Se usar domínio próprio: `https://www.orcamentoplanejado.com.br/api/webhook/hotmart`

---

### **3. Configurar na Hotmart**

#### **Passo a Passo:**

1. **Acesse o painel da Hotmart**
   - Entre em: https://app-vlc.hotmart.com/
   - Faça login com suas credenciais

2. **Vá até Webhooks**
   - No menu lateral, clique em **"Ferramentas"**
   - Depois clique em **"Webhooks"**

3. **Criar Novo Webhook**
   - Clique em **"Adicionar webhook"**
   - Ou **"Novo webhook"** (dependendo da interface)

4. **Configurar o Webhook**
   - **URL do Webhook:** Cole a URL completa
     ```
     https://SEU-DOMINIO.com/api/webhook/hotmart
     ```
   - **Versão:** Selecione **"V2"** (mais recente)
   - **Eventos:** Marque **APENAS**:
     - ✅ `PURCHASE_APPROVED` (Compra Aprovada)
     - ✅ `PURCHASE_COMPLETE` (Compra Completa)
   
5. **Testar Webhook (Opcional)**
   - A Hotmart permite enviar um teste
   - Verifique se retorna sucesso (status 200)

6. **Salvar**
   - Clique em **"Salvar"** ou **"Criar webhook"**

---

### **4. Validar se Está Funcionando**

#### **Teste Manual:**
Você pode testar o webhook manualmente antes de uma compra real:

```bash
curl -X POST https://SEU-DOMINIO.com/api/webhook/hotmart \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PURCHASE_APPROVED",
    "data": {
      "buyer": {
        "email": "teste@example.com",
        "name": "Usuário Teste"
      },
      "product": {
        "id": "prod_123",
        "name": "Orçamento Planejado"
      },
      "purchase": {
        "status": "approved"
      }
    }
  }'
```

**Resultado esperado:**
- Usuário `teste@example.com` criado no sistema
- Email de boas-vindas enviado
- Senha padrão: `12345678`

#### **Teste GET (verificar se webhook está ativo):**
```bash
curl https://SEU-DOMINIO.com/api/webhook/hotmart
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Webhook Hotmart ativo",
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

---

## 🔄 **FLUXO COMPLETO (COMO FUNCIONA):**

```
1. Cliente compra na Hotmart
         ↓
2. Hotmart envia notificação para o webhook
         ↓
3. Sistema cria conta do cliente
   - Email: o email usado na compra
   - Nome: o nome usado na compra
   - Senha: 12345678
         ↓
4. Sistema envia email automático com:
   - Boas-vindas
   - Email de login
   - Senha temporária
   - Link para acessar
   - Aviso para alterar senha
         ↓
5. Cliente acessa o sistema
   - Login: email da compra
   - Senha: 12345678
         ↓
6. Cliente muda a senha no perfil
```

---

## ⚠️ **IMPORTANTE - SEGURANÇA:**

### **1. Validação da Hotmart (Opcional mas Recomendado):**
A Hotmart envia um header `X-Hotmart-Hottok` para validação. Se quiser adicionar segurança extra, você pode:
- Configurar um **Hot Token** na Hotmart
- Adicionar validação no webhook para verificar esse token

### **2. HTTPS Obrigatório:**
- A Hotmart **só aceita webhooks HTTPS**
- O deploy já vem com HTTPS habilitado ✅

---

## 📧 **CONTEÚDO DO EMAIL DE BOAS-VINDAS:**

Os clientes receberão um email com:
- ✅ Saudação personalizada com o nome
- ✅ Email de login
- ✅ Senha temporária (12345678)
- ✅ Botão para acessar o sistema
- ✅ Aviso de segurança para trocar a senha
- ✅ Cores e identidade visual do app

---

## 🆘 **RESOLUÇÃO DE PROBLEMAS:**

### **Webhook não está recebendo eventos:**
1. Verifique se a URL está correta
2. Teste o endpoint manualmente (GET ou POST)
3. Verifique os logs no painel da Hotmart
4. Confirme que selecionou o evento `PURCHASE_APPROVED`

### **Email não está sendo enviado:**
1. Verifique se a API Key do Resend está correta
2. Verifique no dashboard do Resend: https://resend.com/emails
3. Confira os logs do servidor para erros

### **Usuário não foi criado:**
1. Verifique os logs do webhook
2. Confirme que o payload da Hotmart tem `buyer.email` e `buyer.name`
3. Verifique se o usuário já existe no banco

---

## 📞 **PRECISA DE AJUDA?**

- **Documentação Hotmart:** https://developers.hotmart.com/docs/pt-BR/v1/webhooks/
- **Dashboard Resend:** https://resend.com/emails
- **Logs do Sistema:** Verifique os logs no servidor após cada compra

---

## ✅ **CHECKLIST FINAL:**

Antes de fazer a primeira venda, confirme:
- [ ] Deploy realizado com sucesso
- [ ] URL do webhook configurada na Hotmart
- [ ] Evento `PURCHASE_APPROVED` selecionado
- [ ] Teste manual do webhook funcionando
- [ ] Email de teste recebido
- [ ] Domínio próprio configurado (se aplicável)

---

**Tudo pronto! 🎉**

Quando a primeira compra for realizada, o sistema criará o usuário automaticamente e enviará o email de boas-vindas.

