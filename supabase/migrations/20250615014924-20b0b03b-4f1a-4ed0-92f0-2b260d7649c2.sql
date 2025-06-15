
ALTER TABLE public.children
  ADD COLUMN sexe text CHECK (sexe IN ('Garçon', 'Fille')),
  ADD COLUMN type_doc_pere text CHECK (type_doc_pere IN ('Carte d''identité', 'Permis de conduire')),
  ADD COLUMN num_doc_pere text,
  ADD COLUMN type_doc_mere text CHECK (type_doc_mere IN ('Carte d''identité', 'Permis de conduire')),
  ADD COLUMN num_doc_mere text;
