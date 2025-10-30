
# 💰 Orçamento Planejado

Sistema inteligente de gestão financeira pessoal com análise por IA.

## 🚀 Funcionalidades

- ✅ Autenticação segura com NextAuth
- 📊 Dashboard financeiro completo
- 💸 Gestão de receitas e despesas
- 📈 Gráficos interativos (pizza mensal e linha anual)
- 🤖 Análise financeira por IA (1x por dia)
- 📱 PWA - Funciona como app nativo
- 🎨 Interface moderna e responsiva
- 👥 Painel administrativo completo
- 🔐 Recuperação de senha por email
- 💳 Integração com Hotmart (webhook)

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco**: PostgreSQL
- **Autenticação**: NextAuth.js
- **Email**: Gmail (SMTP com Nodemailer)
- **IA**: Abacus AI
- **Charts**: Recharts

## 📦 Instalação Local

```bash
# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Executar migrations
yarn prisma migrate dev

# Gerar Prisma Client
yarn prisma generate

# Popular banco (opcional)
yarn prisma db seed

# Iniciar em desenvolvimento
yarn dev
```

Acesse: `http://localhost:3000`

## 🌐 Deploy na Vercel

1. Crie um repositório no GitHub
2. Faça push do código
3. Importe na Vercel
4. Configure **Root Directory**: `nextjs_space`
5. Adicione as variáveis de ambiente
6. Deploy!

Veja o guia completo em `GUIA_GITHUB_VERCEL.md`

## 🔐 Variáveis de Ambiente

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GMAIL_USER="seu-email@gmail.com"
GMAIL_APP_PASSWORD="..."
EMAIL_FROM="Orçamento Planejado <email@gmail.com>"
HOTMART_WEBHOOK_SECRET="..."
ABACUSAI_API_KEY="..."
```

## 👤 Usuário de Teste

- **Email**: admin@example.com
- **Senha**: admin123

## 📝 Licença

Propriedade privada - Todos os direitos reservados.

---

Desenvolvido com ❤️ para ajudar você a organizar suas finanças!
