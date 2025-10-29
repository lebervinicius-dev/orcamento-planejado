
# 📧 Configuração do Gmail para Envio de Emails

## 🎯 O que você precisa

Para enviar emails pelo seu aplicativo usando Gmail, você precisa de:

1. **Uma conta Gmail** (pode ser a mesma que você usa normalmente)
2. **Uma "Senha de App"** (não é a senha normal do Gmail!)

---

## 📝 Passo a Passo para Obter a Senha de App

### 1️⃣ Ativar a Verificação em Duas Etapas

Antes de criar uma senha de app, você PRECISA ativar a verificação em duas etapas:

1. Acesse: https://myaccount.google.com/security
2. Na seção **"Como fazer login no Google"**, clique em **"Verificação em duas etapas"**
3. Siga as instruções para ativar (vai pedir seu número de celular)
4. Confirme a ativação

### 2️⃣ Criar uma Senha de App

Depois de ativar a verificação em duas etapas:

1. Acesse: https://myaccount.google.com/apppasswords
   - **OU** vá em https://myaccount.google.com/security
   - Role até **"Como fazer login no Google"**
   - Clique em **"Senhas de app"**

2. Você pode precisar fazer login novamente

3. Na página de Senhas de app:
   - **Nome do app:** Digite "Orçamento Planejado" (ou qualquer nome que você queira)
   - Clique em **"Criar"**

4. O Google vai mostrar uma senha de 16 caracteres, tipo: **`xxxx xxxx xxxx xxxx`**
   - ⚠️ **COPIE ESTA SENHA IMEDIATAMENTE!** Você não vai conseguir vê-la novamente
   - Remova os espaços ao copiar (cole como: `xxxxxxxxxxxxxxxx`)

### 3️⃣ Configurar no Arquivo .env

Abra o arquivo `.env` dentro da pasta `nextjs_space` e substitua:

```env
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=sua-senha-de-app-aqui
```

Por:

```env
GMAIL_USER=seuemail@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

**Exemplo real:**
```env
GMAIL_USER=contato.orcamento@gmail.com
GMAIL_APP_PASSWORD=abcdwxyzefgh1234
```

---

## ⚠️ IMPORTANTE

### ✅ O QUE USAR:
- ✅ Sua **Senha de App** de 16 caracteres
- ✅ Sem espaços entre os caracteres

### ❌ O QUE NÃO USAR:
- ❌ Sua senha normal do Gmail (não vai funcionar!)
- ❌ Senha com espaços

---

## 🔒 Segurança

### Por que usar Senha de App?

1. **Mais seguro:** Não expõe sua senha real do Gmail
2. **Controle:** Você pode revogar a senha de app a qualquer momento sem afetar sua conta
3. **Necessário:** Google não permite mais usar a senha normal em aplicativos

### Como revogar uma Senha de App?

Se precisar desativar:

1. Acesse: https://myaccount.google.com/apppasswords
2. Clique em **"Revogar"** ao lado da senha que criou
3. O app para de funcionar imediatamente (útil se a senha vazar)

---

## 🧪 Como Testar

Depois de configurar, você pode testar:

1. **Cadastrar um novo usuário** no painel admin
   - Você receberá um email de boas-vindas

2. **Solicitar recuperação de senha**
   - Vá em "Esqueci minha senha" no login
   - Digite seu email
   - Você receberá um email com link de redefinição

---

## ❓ Problemas Comuns

### "Senha de App não aparece"
- ✅ Certifique-se que ativou a **Verificação em Duas Etapas** primeiro

### "Email não está sendo enviado"
- ✅ Verifique se copiou a senha SEM ESPAÇOS
- ✅ Confirme que o email no `.env` está correto
- ✅ Verifique os logs do servidor para mensagens de erro

### "Erro 534: Please log in via your web browser"
- ✅ Isso significa que você tentou usar sua senha normal
- ✅ Use a **Senha de App** de 16 caracteres

### "Less secure apps"
- ✅ Senhas de App resolvem este problema automaticamente
- ✅ Você NÃO precisa ativar "apps menos seguros"

---

## 📱 Qual Email Usar?

Você pode usar:

1. **Seu email pessoal** (ex: joao.silva@gmail.com)
   - ✅ Mais fácil de começar
   - ⚠️ Emails saem do seu nome pessoal

2. **Um email dedicado** (ex: contato.orcamento@gmail.com)
   - ✅ Mais profissional
   - ✅ Separado da sua conta pessoal
   - ✅ Recomendado para produção

---

## 🎓 Resumo Rápido

1. ✅ Ative a Verificação em Duas Etapas no Google
2. ✅ Crie uma Senha de App em https://myaccount.google.com/apppasswords
3. ✅ Copie a senha de 16 caracteres (sem espaços)
4. ✅ Cole no arquivo `.env` em `GMAIL_APP_PASSWORD`
5. ✅ Coloque seu email completo em `GMAIL_USER`
6. ✅ Salve o arquivo e teste!

---

## 💡 Dica Extra

**Crie um email Gmail específico para o app!**

Exemplo: `orcamentoplanejado@gmail.com`

Vantagens:
- 💚 Emails mais profissionais
- 💚 Não mistura com emails pessoais
- 💚 Melhor para rastrear problemas
- 💚 Mais fácil de gerenciar

---

Qualquer dúvida, entre em contato! 💚
