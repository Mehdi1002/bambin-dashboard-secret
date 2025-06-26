
-- Désactiver RLS sur les tables puisque pas d'authentification nécessaire
ALTER TABLE public.children DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes s'il y en a
DROP POLICY IF EXISTS "Admin can view all children" ON public.children;
DROP POLICY IF EXISTS "Admin can insert children" ON public.children;
DROP POLICY IF EXISTS "Admin can update children" ON public.children;
DROP POLICY IF EXISTS "Admin can delete children" ON public.children;

DROP POLICY IF EXISTS "Admin can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can delete payments" ON public.payments;

-- Supprimer la table admin_users si elle existe
DROP TABLE IF EXISTS public.admin_users;

-- Supprimer la fonction is_admin si elle existe
DROP FUNCTION IF EXISTS public.is_admin(UUID);
