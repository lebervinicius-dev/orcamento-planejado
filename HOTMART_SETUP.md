
# 🚀 Configuração do Webhook Hotmart

Este guia explica como configurar a integração automática com a Hotmart para criar logins automaticamente quando um cliente comprar seu produto.

## 📋 Requisitos

- Conta ativa na Hotmart como produtor
- Produto cadastrado na Hotmart
- Aplicação deployada e acessível via URL pública

## 🔧 Passo 1: Configurar Webhook na Hotmart

### 1.1 Acessar o Painel Hotmart

1. Faça login em https://app.hotmart.com/login
2. No menu lateral, clique em **"Ferramentas"**
3. Clique em **"Ver todas"** ou busque por **"Webhook (API e notificações)"**

### 1.2 Criar Nova Configuração

1. Clique em **"+ Cadastrar Webhook"**
2. Preencha os campos:
   - **Nome da Segmentação**: `Orçamento Planejado - Criação de Login`
   - **URL para notificação**: `https://SEU-DOMINIO.com/api/webhook/hotmart`
     - ⚠️ Substitua `SEU-DOMINIO.com` pela URL real do seu app deployado
   - **Aplicar a**: Selecione **"Produto específico"** e escolha seu produto

### 1.3 Selecionar Eventos

Marque os seguintes eventos para criar/ativar logins:

✅ **Compras**
- [x] Compra Aprovada (PURCHASE_APPROVED)
- [x] Compra Completa (PURCHASE_COMPLETE)

✅ **Assinaturas** (se aplicável)
- [x] Assinatura Ativa (SUBSCRIPTION_ACTIVE)

Para desativar logins automaticamente:

✅ **Cancelamentos**
- [x] Compra Cancelada (PURCHASE_CANCELED)
- [x] Cancelamento de Assinatura (SUBSCRIPTION_CANCELLATION)

### 1.4 Salvar Configuração

1. Clique em **"Salvar"**
2. A Hotmart ativará o webhook automaticamente

## 🧪 Passo 2: Testar o Webhook

### 2.1 Teste via Interface Hotmart

1. Na mesma página de configuração do webhook
2. Clique na aba **"Teste"**
3. Selecione o evento **"Compra Completa"**
4. Clique em **"Enviar teste"**

### 2.2 Verificar Resultado

Após o teste, você pode verificar no **Painel Administrativo** se o usuário foi criado:

1. Faça login no app com credenciais de admin:
   - Email: `admin@orcamento.com`
   - Senha: `admin123`

2. No dashboard, clique em **"Admin"** no menu
3. Verifique se o usuário de teste aparece na lista

### 2.3 Teste Manual via API

Você também pode testar enviando uma requisição POST diretamente:

```bash
curl -X POST https://SEU-DOMINIO.com/api/webhook/hotmart \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "creation_date": 1234567890,
    "event": "PURCHASE_COMPLETE",
    "version": "2.0.0",
    "data": {
      "buyer": {
        "email": "cliente@teste.com",
        "name": "Cliente Teste"
      },
      "purchase": {
        "transaction": "HP12345678910",
        "status": "COMPLETED"
      },
      "product": {
        "id": 12345,
        "name": "Orçamento Planejado"
      }
    }
  }'
```

## 👥 Painel Administrativo

### Acessar o Painel

1. Faça login com uma conta admin
2. Clique em **"Admin"** no menu superior

### Funcionalidades Disponíveis

#### 📊 Estatísticas
- Total de usuários cadastrados
- Usuários ativos vs inativos
- Usuários criados via Hotmart

#### 🔍 Buscar Usuários
- Busque por email ou nome
- Veja informações detalhadas de cada usuário

#### ➕ Criar Usuário Manualmente
1. Clique em **"Criar Usuário"**
2. Preencha:
   - Email (obrigatório)
   - Nome (opcional)
   - Senha (obrigatório)
   - Função: Usuário ou Administrador
3. Clique em **"Criar Usuário"**

#### ⚙️ Gerenciar Usuários
- **Ativar/Desativar**: Clique no botão de status para bloquear/desbloquear acesso
- **Deletar**: Clique no ícone de lixeira para remover permanentemente

## 📧 Envio de Credenciais por Email

### Configuração Atual

Por padrão, as credenciais são exibidas apenas no **console do servidor** (logs).

**Para ver as credenciais geradas:**
```bash
# No servidor, verifique os logs
tail -f logs/app.log
```

### Integrar Serviço de Email (Opcional)

Para enviar emails automaticamente aos clientes, você pode integrar um serviço de email.

#### Opção 1: Resend (Recomendado)
```bash
# Instalar dependência
yarn add resend

# Adicionar variável de ambiente
echo "RESEND_API_KEY=re_sua_chave_aqui" >> .env
```

#### Opção 2: SendGrid
```bash
# Instalar dependência
yarn add @sendgrid/mail

# Adicionar variável de ambiente
echo "SENDGRID_API_KEY=SG.sua_chave_aqui" >> .env
```

#### Opção 3: Nodemailer (SMTP)
```bash
# Instalar dependência
yarn add nodemailer

# Adicionar variáveis de ambiente
echo "SMTP_HOST=smtp.gmail.com" >> .env
echo "SMTP_PORT=587" >> .env
echo "SMTP_USER=seu_email@gmail.com" >> .env
echo "SMTP_PASS=sua_senha_app" >> .env
```

Após configurar, edite o arquivo:
`/app/api/webhook/hotmart/route.ts`

E descomente/implemente a função `sendWelcomeEmail()`.

## 🔐 Segurança

### Validação do Webhook

A Hotmart envia um header especial para validar requisições:
- Header: `X-Hotmart-Hottok`

Para adicionar validação extra, edite:
`/app/api/webhook/hotmart/route.ts`

```typescript
// Adicione no início do POST handler:
const hottok = request.headers.get('X-Hotmart-Hottok')
if (!hottok) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Proteção de Rotas

O painel administrativo está protegido por:
1. Autenticação NextAuth (usuário precisa estar logado)
2. Verificação de role (apenas `role: "admin"` tem acesso)

## 📱 Fluxo Completo

```
1. Cliente compra na Hotmart
   ↓
2. Hotmart envia POST para /api/webhook/hotmart
   ↓
3. Sistema verifica se é evento de compra aprovada
   ↓
4. Sistema cria usuário com senha aleatória
   ↓
5. Email com credenciais é enviado (se configurado)
   ↓
6. Cliente recebe email e faz primeiro acesso
   ↓
7. Cliente usa o sistema normalmente
```

## 🆘 Solução de Problemas

### Webhook não está funcionando

1. **Verifique a URL**: Certifique-se que a URL está correta e acessível publicamente
2. **Teste o endpoint**: Acesse `https://SEU-DOMINIO.com/api/webhook/hotmart` via GET
   - Deve retornar: `{"status":"ok","message":"Webhook Hotmart endpoint funcionando"}`
3. **Verifique logs**: Analise os logs do servidor para ver erros

### Usuário não foi criado

1. Verifique se o evento está configurado na Hotmart
2. Acesse o histórico de webhooks na Hotmart
3. Veja se há erros na resposta
4. Verifique se o email já existe no sistema

### Erro ao criar usuário admin

Se você não consegue acessar o painel admin:

```bash
# Crie manualmente via seed
cd nextjs_space
yarn prisma db seed
```

Isso criará:
- Email: `admin@orcamento.com`
- Senha: `admin123`

## 📚 Recursos Adicionais

- [Documentação Hotmart Webhooks](https://developers.hotmart.com/docs/pt-BR/1.0.0/webhook/using-webhook/)
- [Guia de Configuração Hotmart](https://help.hotmart.com/pt-br/article/como-configurar-sua-api-atraves-do-webhook-postback-)

## 🎯 Próximos Passos

1. ✅ Configurar webhook na Hotmart
2. ✅ Testar criação de usuários
3. 🔄 Configurar serviço de email (opcional)
4. 🔄 Personalizar email de boas-vindas (opcional)
5. 🔄 Configurar validação de segurança adicional (opcional)

---

**Dúvidas?** Entre em contato com o suporte técnico.
