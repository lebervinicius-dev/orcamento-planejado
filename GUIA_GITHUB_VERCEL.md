
# 🚀 Guia Completo: GitHub + Vercel

## 📝 Comandos para Enviar ao GitHub

Execute os seguintes comandos **no seu terminal local** (dentro da pasta do projeto):

```bash
# 1. Inicializar o repositório Git (se ainda não foi feito)
cd /home/ubuntu/orcamento_planejado/nextjs_space
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer o primeiro commit
git commit -m "Initial commit - Orçamento Planejado MVP"

# 4. Adicionar o repositório remoto (SUBSTITUA pela URL do seu repositório)
git remote add origin https://github.com/SEU_USUARIO/orcamento-planejado.git

# 5. Enviar para o GitHub
git branch -M main
git push -u origin main
```

> ⚠️ **IMPORTANTE**: Substitua `SEU_USUARIO` pela sua conta do GitHub!

---

## 🔐 Variáveis de Ambiente na Vercel

Após conectar o projeto na Vercel, você precisará configurar as seguintes variáveis de ambiente:

### Obrigatórias:

```
DATABASE_URL=sua_url_postgres_production
NEXTAUTH_SECRET=chave_secreta_aleatoria_64_caracteres
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

### Email (Gmail):

```
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_app_gmail
EMAIL_FROM=Orçamento Planejado <seu-email@gmail.com>
```

### Hotmart Webhook:

```
HOTMART_WEBHOOK_SECRET=chave_secreta_hotmart
```

### Abacus AI (para análises financeiras):

```
ABACUSAI_API_KEY=sua_chave_api_abacus
```

---

## 🎯 Passo a Passo na Vercel

### 1. Acessar a Vercel
- Acesse: https://vercel.com
- Faça login com sua conta GitHub

### 2. Importar Projeto
- Clique em **"Add New..."** → **"Project"**
- Selecione seu repositório `orcamento-planejado`
- Clique em **"Import"**

### 3. Configurar o Projeto
- **Framework Preset**: Next.js (detectado automaticamente)
- **Root Directory**: `nextjs_space` ⚠️ **IMPORTANTE!**
- **Build Command**: `yarn build`
- **Output Directory**: `.next`

### 4. Adicionar Variáveis de Ambiente
- Clique em **"Environment Variables"**
- Adicione todas as variáveis listadas acima
- Cole os valores correspondentes

### 5. Deploy
- Clique em **"Deploy"**
- Aguarde o build finalizar (2-5 minutos)

---

## 🗄️ Banco de Dados em Produção

### Opções Recomendadas:

#### 1. **Neon** (Recomendado - Mais Simples)
- Acesse: https://neon.tech
- Crie uma conta gratuita
- Crie um novo projeto
- Copie a `DATABASE_URL` fornecida
- Cole na Vercel como variável de ambiente

#### 2. **Supabase** (Alternativa Robusta)
- Acesse: https://supabase.com
- Crie um novo projeto
- Vá em **Settings** → **Database**
- Copie a **Connection String** (URI)
- Cole na Vercel como `DATABASE_URL`

#### 3. **Railway** (Alternativa)
- Acesse: https://railway.app
- Crie um projeto PostgreSQL
- Copie a variável de conexão

---

## 🔄 Após Configurar o Banco

Execute as migrations do Prisma na Vercel:

### Opção 1: Automaticamente (Recomendado)
Adicione ao `package.json`:

```json
"scripts": {
  "build": "prisma generate && prisma migrate deploy && next build",
}
```

### Opção 2: Manualmente
Após o deploy, acesse o terminal da Vercel e execute:

```bash
npx prisma migrate deploy
npx prisma generate
```

---

## ✅ Checklist Pós-Deploy

- [ ] Site acessível na URL fornecida pela Vercel
- [ ] Banco de dados conectado (teste fazendo login)
- [ ] Emails sendo enviados (teste recuperação de senha)
- [ ] Webhook Hotmart configurado com a URL da Vercel
- [ ] Análise financeira funcionando

---

## 🔧 Comandos Úteis para Futuras Atualizações

```bash
# Adicionar mudanças
git add .

# Criar commit
git commit -m "Descrição das mudanças"

# Enviar para o GitHub (deploy automático na Vercel)
git push origin main
```

> 💡 **Dica**: A Vercel faz deploy automático a cada push no GitHub!

---

## 🆘 Problemas Comuns

### Erro de Build
- Verifique se o **Root Directory** está como `nextjs_space`
- Confirme se todas as variáveis de ambiente estão configuradas

### Erro de Banco de Dados
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que as migrations foram executadas

### Emails não Funcionam
- Verifique se `GMAIL_USER` e `GMAIL_APP_PASSWORD` estão corretos
- Confirme se o `NEXTAUTH_URL` aponta para o domínio correto

---

## 📞 Suporte

Se tiver dúvidas, consulte:
- Documentação Vercel: https://vercel.com/docs
- Documentação Next.js: https://nextjs.org/docs
- Documentação Prisma: https://www.prisma.io/docs

