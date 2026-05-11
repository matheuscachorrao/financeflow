# 💰 FinanceFlow — SaaS de Controle Financeiro

Sistema completo de gestão financeira pessoal com autenticação individual, dashboard interativo, gráficos e relatórios mensais.

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Gráficos | Recharts |
| Deploy | Vercel (recomendado) |

---

## ✅ Funcionalidades

- **Autenticação segura** — cadastro, login e logout com Supabase Auth
- **Isolamento de dados** — cada usuário vê apenas suas próprias transações (RLS)
- **Entradas** — adicionar, editar, excluir e buscar receitas
- **Saídas** — adicionar, editar, excluir e buscar despesas
- **Categorias** — criar categorias personalizadas com ícone e cor
- **Dashboard** — resumo com cards, gráficos de área e pizza, filtros por período
- **Relatórios** — comparativo mensal, evolução anual e breakdown por categoria
- **Configurações** — editar perfil e alterar senha

---

## 📦 Instalação Passo a Passo

### Pré-requisitos
- Node.js 18+ instalado
- Conta gratuita no [Supabase](https://supabase.com)

---

### PASSO 1 — Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New project"**
3. Escolha um nome (ex: `financeflow`) e uma senha forte para o banco
4. Escolha a região mais próxima (ex: `South America - São Paulo`)
5. Aguarde o projeto ser criado (~2 minutos)

---

### PASSO 2 — Configurar o banco de dados

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **"New query"**
3. Cole todo o conteúdo do arquivo `supabase-schema.sql`
4. Clique em **"Run"** (ou Ctrl+Enter)
5. Você deve ver "Success. No rows returned." — isso é correto.

---

### PASSO 3 — Configurar autenticação no Supabase

1. Vá em **Authentication → Settings**
2. Em **Site URL**, coloque: `http://localhost:3000`
3. Em **Redirect URLs**, adicione: `http://localhost:3000/**`
4. Salve as configurações

> Para produção, adicione também a URL do deploy (ex: `https://seusite.vercel.app/**`)

---

### PASSO 4 — Obter as chaves do Supabase

1. Vá em **Settings → API** no painel do Supabase
2. Copie:
   - **Project URL** (ex: `https://xxxxxxxxxxx.supabase.co`)
   - **anon public** key (chave pública, começa com `eyJ...`)

---

### PASSO 5 — Configurar variáveis de ambiente

1. Na pasta do projeto, copie o arquivo de exemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edite o arquivo `.env.local` e cole suas chaves:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua_chave_aqui...
   ```

---

### PASSO 6 — Instalar dependências e rodar

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🗂️ Estrutura do Projeto

```
financeflow/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx          # Página de login
│   │   │   └── register/page.tsx       # Página de cadastro
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Layout com sidebar (autenticado)
│   │   │   ├── page.tsx                # Dashboard (server)
│   │   │   └── DashboardClient.tsx     # Dashboard com gráficos (client)
│   │   ├── entradas/
│   │   │   ├── page.tsx                # Entradas (server)
│   │   │   └── EntradasClient.tsx      # Lista de entradas (client)
│   │   ├── saidas/
│   │   │   ├── page.tsx                # Saídas (server)
│   │   │   └── SaidasClient.tsx        # Lista de saídas (client)
│   │   ├── categorias/
│   │   │   ├── page.tsx                # Categorias (server)
│   │   │   └── CategoriasClient.tsx    # CRUD de categorias (client)
│   │   ├── relatorios/
│   │   │   ├── page.tsx                # Relatórios (server)
│   │   │   └── RelatoriosClient.tsx    # Gráficos e tabelas (client)
│   │   └── configuracoes/
│   │       ├── page.tsx                # Configurações (server)
│   │       └── ConfiguracoesClient.tsx # Edição de perfil (client)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.tsx             # Menu lateral
│   │   └── ui/
│   │       ├── TransactionForm.tsx     # Formulário de transação
│   │       ├── TransactionList.tsx     # Tabela de transações
│   │       └── Modal.tsx               # Modal reutilizável
│   ├── lib/
│   │   ├── supabase.ts                 # Cliente Supabase
│   │   └── utils.ts                    # Utilitários e formatadores
│   └── types/
│       └── database.ts                 # Tipos TypeScript
├── supabase-schema.sql                 # Schema do banco de dados
├── .env.local.example                  # Exemplo de variáveis
└── package.json
```

---

## 🛡️ Segurança

- **Row Level Security (RLS)** ativado em todas as tabelas
- Cada usuário acessa **apenas seus próprios dados** — garantido no banco
- Senhas gerenciadas pelo Supabase Auth (bcrypt)
- Tokens JWT com expiração automática

---

## 🌐 Deploy no Vercel (Produção)

1. Crie uma conta em [vercel.com](https://vercel.com)
2. Importe o repositório do GitHub
3. Adicione as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**
5. Adicione a URL do deploy no Supabase → Authentication → Redirect URLs

---

## 🐛 Solução de Problemas

**Erro: "relation does not exist"**
→ Execute o SQL do `supabase-schema.sql` no Supabase

**Tela de login em loop**
→ Verifique se as variáveis `.env.local` estão corretas

**Gráficos não aparecem**
→ Verifique se há transações cadastradas no período selecionado

**Erro de CORS**
→ Adicione `http://localhost:3000` em Supabase → Auth → Site URL

---

## 📄 Licença

MIT — use à vontade para fins pessoais e comerciais.
