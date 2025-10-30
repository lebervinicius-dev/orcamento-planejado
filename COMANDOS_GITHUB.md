
# 🚀 Comandos para Enviar ao GitHub

## Passo 1: Entre na pasta do projeto
```bash
cd /home/ubuntu/orcamento_planejado/nextjs_space
```

## Passo 2: Inicialize o Git (se ainda não foi feito)
```bash
git init
```

## Passo 3: Adicione todos os arquivos
```bash
git add .
```

## Passo 4: Faça o primeiro commit
```bash
git commit -m "Initial commit - Orçamento Planejado MVP"
```

## Passo 5: Adicione o repositório remoto do GitHub
**⚠️ IMPORTANTE: SUBSTITUA a URL pela URL do seu repositório!**

```bash
git remote add origin https://github.com/SEU_USUARIO/orcamento-planejado.git
```

**Exemplo:**
Se seu usuário do GitHub é "joaosilva", o comando seria:
```bash
git remote add origin https://github.com/joaosilva/orcamento-planejado.git
```

## Passo 6: Renomeie a branch para "main"
```bash
git branch -M main
```

## Passo 7: Envie o código para o GitHub
```bash
git push -u origin main
```

---

## ❓ Se der erro de autenticação:

O GitHub pode pedir seu usuário e senha. **IMPORTANTE:**

- **Usuário:** Seu nome de usuário do GitHub
- **Senha:** Você precisa usar um **Personal Access Token**, NÃO a senha da sua conta!

### Como gerar um Personal Access Token:

1. No GitHub, vá em: **Settings** (no seu perfil)
2. **Developer settings** (no menu lateral esquerdo, lá embaixo)
3. **Personal access tokens** → **Tokens (classic)**
4. Clique em **"Generate new token"** → **"Generate new token (classic)"**
5. Dê um nome (ex: "Orçamento Planejado Deploy")
6. Marque a opção **"repo"** (acesso completo aos repositórios)
7. Clique em **"Generate token"**
8. **COPIE O TOKEN** (ele só aparece uma vez!)
9. Use esse token como senha quando o Git pedir

---

## ✅ Como saber se deu certo?

Depois do `git push`, você deve ver algo como:

```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
...
To https://github.com/SEU_USUARIO/orcamento-planejado.git
 * [new branch]      main -> main
```

Agora acesse seu repositório no GitHub e você verá todos os arquivos lá! 🎉

---

## 🔄 Para atualizações futuras:

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

---

## 🆘 Problemas Comuns:

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/orcamento-planejado.git
```

### Erro: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

### Erro de autenticação
Use um Personal Access Token (veja instruções acima) em vez da sua senha.

