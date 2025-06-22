
-- Seed data for local development
-- Ce fichier sera exécuté automatiquement au démarrage de Supabase local

-- Insérer quelques enfants de test
INSERT INTO public.children (nom, prenom, date_naissance, section, statut, date_inscription, pere, tel_pere, mere, tel_mere, sexe) VALUES
('Dupont', 'Alice', '2019-03-15', 'Moyenne', 'Actif', '2024-09-01', 'Jean Dupont', '0123456789', 'Marie Dupont', '0123456790', 'F'),
('Martin', 'Lucas', '2020-06-22', 'Petite', 'Actif', '2024-09-01', 'Pierre Martin', '0123456791', 'Sophie Martin', '0123456792', 'M'),
('Bernard', 'Emma', '2018-11-08', 'Prescolaire', 'Actif', '2024-09-01', 'Paul Bernard', '0123456793', 'Julie Bernard', '0123456794', 'F'),
('Petit', 'Hugo', '2019-08-12', 'Moyenne', 'Actif', '2024-10-01', 'Marc Petit', '0123456795', 'Anne Petit', '0123456796', 'M'),
('Durand', 'Léa', '2020-01-30', 'Petite', 'Actif', '2024-09-01', 'Thomas Durand', '0123456797', 'Claire Durand', '0123456798', 'F');

-- Insérer quelques paiements de test
-- On récupère les IDs des enfants créés
DO $$
DECLARE
    alice_id UUID;
    lucas_id UUID;
    emma_id UUID;
    hugo_id UUID;
    lea_id UUID;
BEGIN
    -- Récupérer les IDs
    SELECT id INTO alice_id FROM public.children WHERE nom = 'Dupont' AND prenom = 'Alice';
    SELECT id INTO lucas_id FROM public.children WHERE nom = 'Martin' AND prenom = 'Lucas';
    SELECT id INTO emma_id FROM public.children WHERE nom = 'Bernard' AND prenom = 'Emma';
    SELECT id INTO hugo_id FROM public.children WHERE nom = 'Petit' AND prenom = 'Hugo';
    SELECT id INTO lea_id FROM public.children WHERE nom = 'Durand' AND prenom = 'Léa';

    -- Paiements pour septembre 2024 (mois d'inscription pour la plupart)
    INSERT INTO public.payments (child_id, year, month, amount_due, registration_fee, amount_paid, validated, status) VALUES
    (alice_id, 2024, 9, 10000, 1000, 11000, true, 'validated'),  -- Paiement complet avec frais d'inscription
    (lucas_id, 2024, 9, 10000, 1000, 8000, false, 'pending'),   -- Paiement partiel
    (emma_id, 2024, 9, 10000, 1000, 0, false, 'pending'),       -- Pas de paiement
    (lea_id, 2024, 9, 10000, 1000, 11000, true, 'validated');   -- Paiement complet avec frais d'inscription

    -- Paiements pour octobre 2024 (mois d'inscription pour Hugo)
    INSERT INTO public.payments (child_id, year, month, amount_due, registration_fee, amount_paid, validated, status) VALUES
    (alice_id, 2024, 10, 10000, 0, 10000, true, 'validated'),   -- Paiement mensuel normal
    (hugo_id, 2024, 10, 10000, 1000, 11000, true, 'validated'), -- Premier paiement avec frais d'inscription
    (lea_id, 2024, 10, 10000, 0, 5000, false, 'pending');      -- Paiement partiel

    -- Paiements pour novembre 2024
    INSERT INTO public.payments (child_id, year, month, amount_due, registration_fee, amount_paid, validated, status) VALUES
    (alice_id, 2024, 11, 10000, 0, 10000, true, 'validated'),   -- Paiement mensuel normal
    (hugo_id, 2024, 11, 10000, 0, 10000, true, 'validated');    -- Paiement mensuel normal

END $$;
