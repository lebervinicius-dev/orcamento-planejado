
# 📋 Fluxo Simplificado - Hotmart + Orçamento Planejado

## ✅ Solução Manual (Simples e Funcional)

Este é o processo **manual** para adicionar clientes que compraram na Hotmart. Não depende de webhooks ou APIs complexas.

---

## 🔄 Processo Completo

### 1️⃣ Cliente Compra na Hotmart
- Cliente realiza a compra do produto na Hotmart
- Hotmart processa o pagamento

### 2️⃣ Você Recebe Notificação
- Hotmart envia email para você (produtor) com dados da compra
- Informações incluem: nome, email, telefone do cliente

### 3️⃣ Você Cria o Usuário Manualmente
1. Acesse o **Painel Admin** do app (orcamento-planejado.abacusai.app)
2. Clique em "**Criar Usuário**"
3. Preencha:
   - **Email**: do cliente (exatamente como está na Hotmart)
   - **Nome**: do cliente
   - **Telefone**: do cliente
   - **Senha**: qualquer senha temporária (ex: `temp123`)
   - **Função**: deixe como "Usuário"
4. Clique em "**Criar Usuário**"

### 4️⃣ Configure Email Automático na Hotmart
Na plataforma Hotmart, configure um **email de boas-vindas** com estas instruções:

```
Olá [NOME],

Sua compra foi aprovada! 🎉

Para acessar o Orçamento Planejado:

1. Acesse: https://orcamento-planejado.abacusai.app
2. Clique em "Esqueci minha senha"
3. Digite seu email: [EMAIL]
4. Siga as instruções enviadas por email
5. Defina sua nova senha
6. Faça login e comece a usar!

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Orçamento Planejado
```

### 5️⃣ Cliente Define a Senha
- Cliente recebe o email da Hotmart
- Acessa o app
- Usa "**Esqueci minha senha**" com o email cadastrado
- Recebe email de recuperação
- Define nova senha
- Faz login e usa o app normalmente ✅

---

## 🎯 Vantagens desta Solução

✅ **Simples**: Não depende de configurações técnicas complexas  
✅ **Confiável**: Não falha por problemas de webhook ou API  
✅ **Controle Total**: Você vê cada cliente antes de liberar acesso  
✅ **Sem Bugs**: Processo testado e funcional  
✅ **Dados Completos**: Telefone do cliente fica salvo para contato  

---

## ⚙️ Como Configurar Email na Hotmart

1. Acesse **Hotmart > Meu Produto > Configurações**
2. Vá em "**Mensagens para o comprador**"
3. Ative "**Email de Compra Aprovada**"
4. Cole o texto acima (ajuste conforme necessário)
5. Use as **variáveis da Hotmart** para nome e email do cliente
6. Salve as configurações

---

## 🔍 Monitoramento de Clientes

No **Painel Admin**, você pode:

- ✅ Ver todos os clientes cadastrados
- ✅ Ver email e telefone de cada cliente
- ✅ Ativar/desativar acessos
- ✅ Ver quantas transações cada cliente fez
- ✅ Deletar usuários se necessário
- ✅ Reenviar email de boas-vindas se o cliente não recebeu

---

## 📞 Suporte ao Cliente

Se o cliente não receber o email de recuperação:

1. Verifique se o email está correto no painel admin
2. Peça para o cliente verificar a caixa de spam
3. Use o botão "**📧**" ao lado do cliente para reenviar
4. Se necessário, redefina a senha manualmente e envie por WhatsApp

---

## 🚀 Opcional: Webhook Automático (Futuro)

Se quiser automatizar depois, o webhook já está implementado em:
- URL: `https://orcamento-planejado.abacusai.app/api/webhook/hotmart`

Mas por enquanto, o processo **manual funciona perfeitamente** e é mais confiável! 👍

---

## 📝 Checklist para Cada Cliente

- [ ] Recebi notificação da compra na Hotmart
- [ ] Criei usuário no painel admin com email, nome e telefone
- [ ] Cliente recebeu email da Hotmart com instruções
- [ ] Cliente acessou o app e redefiniu a senha
- [ ] Cliente está usando o app normalmente

---

**Pronto! Fluxo funcionando de forma simples e confiável.** ✅
