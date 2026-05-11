-- =============================================
-- FinanceFlow - Schema do Banco de Dados
-- Execute este SQL no editor SQL do Supabase
-- =============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: profiles
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários criam apenas seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários atualizam apenas seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- TABELA: categories
-- =============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida', 'ambos')),
  color TEXT NOT NULL DEFAULT '#22c55e',
  icon TEXT NOT NULL DEFAULT '💰',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas suas categorias"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam suas categorias"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam suas categorias"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários excluem suas categorias"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TABELA: transactions
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL DEFAULT 'pix' CHECK (
    payment_method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'outro')
  ),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas suas transações"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam suas transações"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam suas transações"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários excluem suas transações"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- =============================================
-- FUNÇÃO: auto-criar perfil no cadastro
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CATEGORIAS PADRÃO (inserir após criar um usuário)
-- Substitua 'SEU_USER_ID' pelo UUID do usuário
-- =============================================

-- Exemplo de categorias padrão (execute manualmente se quiser seeds)
-- INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
--   ('SEU_USER_ID', 'Salário', 'entrada', '#22c55e', '💼'),
--   ('SEU_USER_ID', 'Freelance', 'entrada', '#3b82f6', '💻'),
--   ('SEU_USER_ID', 'Investimentos', 'entrada', '#f59e0b', '📈'),
--   ('SEU_USER_ID', 'Alimentação', 'saida', '#ef4444', '🍽️'),
--   ('SEU_USER_ID', 'Moradia', 'saida', '#f97316', '🏠'),
--   ('SEU_USER_ID', 'Transporte', 'saida', '#06b6d4', '🚗'),
--   ('SEU_USER_ID', 'Saúde', 'saida', '#ec4899', '❤️'),
--   ('SEU_USER_ID', 'Lazer', 'saida', '#8b5cf6', '🎮'),
--   ('SEU_USER_ID', 'Educação', 'saida', '#14b8a6', '📚');
