
CREATE TABLE public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  date_naissance date NOT NULL,
  section text NOT NULL CHECK (section IN ('Petite', 'Moyenne', 'Prescolaire')),
  date_inscription date,
  statut text NOT NULL CHECK (statut IN ('Actif', 'Inactif')),
  pere text,
  tel_pere text,
  mere text,
  tel_mere text,
  allergies text,
  photo text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS pour un projet privé (accès total, tout utilisateur authentifié)
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access for everyone (privé)" ON public.children
  FOR ALL USING (true);

