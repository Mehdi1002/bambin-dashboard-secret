
-- Crée la table des paiements pour chaque enfant et chaque mois (SANS trigger)
create table public.payments (
  id uuid not null default gen_random_uuid() primary key,
  child_id uuid not null references public.children(id) on delete cascade,
  year integer not null,
  month integer not null, -- (1=janvier, ..., 12=décembre)
  amount_due integer not null,         -- Montant à payer ce mois (modifiable)
  registration_fee integer not null default 0, -- 3000 DA uniquement le mois d'inscription
  amount_paid integer not null default 0,      -- Montant réellement payé
  status text not null default 'pending',      -- validated, pending, partial, late
  validated boolean not null default false,    -- Paiement validé
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_payments_child_month_year on public.payments(child_id, year, month);

-- (RLS à activer/adapter plus tard selon gestion des utilisateurs)
