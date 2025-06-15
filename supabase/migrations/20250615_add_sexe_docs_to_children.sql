
ALTER TABLE public.children ADD COLUMN sexe text CHECK (sexe IN ('Garçon', 'Fille'));
ALTER TABLE public.children ADD COLUMN type_doc_pere text CHECK (type_doc_pere IN ('Carte d\'identité', 'Permis de conduire'));
ALTER TABLE public.children ADD COLUMN num_doc_pere text;
ALTER TABLE public.children ADD COLUMN type_doc_mere text CHECK (type_doc_mere IN ('Carte d\'identité', 'Permis de conduire'));
ALTER TABLE public.children ADD COLUMN num_doc_mere text;
