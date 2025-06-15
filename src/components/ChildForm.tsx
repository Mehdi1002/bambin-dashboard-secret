
import { useState } from "react";
const sectionList = ["Petite", "Moyenne", "Prescolaire"] as const;
const statutList = ["Actif", "Inactif"] as const;
const sexeList = ["Garçon", "Fille"] as const;
const docList = ["Carte d'identité", "Permis de conduire"] as const;

type Props = {
  initial?: any;
  onSubmit: (c: any) => void;
  onCancel: () => void;
};

export default function ChildForm({
  initial,
  onSubmit,
  onCancel
}: Props) {
  const formatInitial = (init: any) => {
    if (!init) return undefined;
    return {
      ...init,
      dateNaissance: init.date_naissance ?? init.dateNaissance ?? "",
      dateInscription: init.date_inscription ?? init.dateInscription ?? "",
      telPere: init.tel_pere ?? init.telPere ?? "",
      telMere: init.tel_mere ?? init.telMere ?? "",
      sexe: init.sexe ?? "",
      typeDocPere: init.type_doc_pere ?? "",
      numDocPere: init.num_doc_pere ?? "",
      typeDocMere: init.type_doc_mere ?? "",
      numDocMere: init.num_doc_mere ?? "",
    };
  };
  const [form, setForm] = useState(initial ? formatInitial(initial) : {
    nom: "",
    prenom: "",
    sexe: "",
    dateNaissance: "",
    pere: "",
    telPere: "",
    typeDocPere: "",
    numDocPere: "",
    mere: "",
    telMere: "",
    typeDocMere: "",
    numDocMere: "",
    allergies: "",
    section: "Petite",
    dateInscription: "",
    statut: "Actif"
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      nom: form.nom,
      prenom: form.prenom,
      sexe: form.sexe,
      date_naissance: form.dateNaissance,
      section: form.section,
      date_inscription: form.dateInscription,
      statut: form.statut,
      pere: form.pere,
      tel_pere: form.telPere,
      type_doc_pere: form.typeDocPere,
      num_doc_pere: form.numDocPere,
      mere: form.mere,
      tel_mere: form.telMere,
      type_doc_mere: form.typeDocMere,
      num_doc_mere: form.numDocMere,
      allergies: form.allergies
    };
    if (initial && initial.id) {
      dataToSubmit["id"] = initial.id;
    }
    onSubmit(dataToSubmit);
  };
  return (
    <form className="bg-white rounded-lg shadow max-w-2xl mx-auto p-7 border" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-4">
        {initial ? "Modifier la fiche enfant" : "Ajouter un enfant"}
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs mb-1">Nom</label>
          <input name="nom" value={form.nom} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Prénom</label>
          <input name="prenom" value={form.prenom} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Sexe</label>
          <select name="sexe" value={form.sexe} onChange={handleChange} className="border px-3 py-2 w-full rounded" required>
            <option value="">Choisir</option>
            {sexeList.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Date de naissance</label>
          <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Section</label>
          <select name="section" value={form.section} onChange={handleChange} className="border px-3 py-2 w-full rounded">
            {sectionList.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Date d’inscription</label>
          <input type="date" name="dateInscription" value={form.dateInscription} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Statut</label>
          <select name="statut" value={form.statut} onChange={handleChange} className="border px-3 py-2 w-full rounded">
            {statutList.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Nom du père</label>
          <input name="pere" value={form.pere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Téléphone du père</label>
          <input name="telPere" value={form.telPere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Type document père</label>
          <select name="typeDocPere" value={form.typeDocPere} onChange={handleChange} className="border px-3 py-2 w-full rounded">
            <option value="">Choisir</option>
            {docList.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">N° document père</label>
          <input name="numDocPere" value={form.numDocPere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Nom de la mère</label>
          <input name="mere" value={form.mere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Téléphone de la mère</label>
          <input name="telMere" value={form.telMere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Type document mère</label>
          <select name="typeDocMere" value={form.typeDocMere} onChange={handleChange} className="border px-3 py-2 w-full rounded">
            <option value="">Choisir</option>
            {docList.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">N° document mère</label>
          <input name="numDocMere" value={form.numDocMere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs mb-1">Allergies</label>
          <textarea name="allergies" value={form.allergies} onChange={handleChange} className="border px-3 py-2 w-full rounded" rows={2} />
        </div>
      </div>
      <div className="flex gap-4 justify-end">
        <button type="button" onClick={onCancel} className="bg-muted text-primary border border-primary px-6 py-2 rounded hover:bg-muted/80">
          Annuler
        </button>
        <button className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition" type="submit">
          {initial ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
