import { useState } from "react";

const sectionList = ["Petite", "Moyenne", "Prescolaire"] as const;
const statutList = ["Actif", "Inactif"] as const;

type Props = {
  initial?: any;
  onSubmit: (c: any) => void;
  onCancel: () => void;
};

export default function ChildForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState(
    initial ?? {
      nom: "",
      prenom: "",
      dateNaissance: "",
      pere: "",
      telPere: "",
      mere: "",
      telMere: "",
      allergies: "",
      section: "Petite",
      dateInscription: "",
      statut: "Actif",
      photo: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f: any) => ({
        ...f,
        photo: ev.target?.result?.toString() || "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="bg-white rounded-lg shadow max-w-2xl mx-auto p-7 border" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-4">{initial ? "Modifier la fiche enfant" : "Ajouter un enfant"}</h2>
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
          <label className="block text-xs mb-1">Date de naissance</label>
          <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={handleChange} className="border px-3 py-2 w-full rounded" required />
        </div>
        <div>
          <label className="block text-xs mb-1">Section</label>
          <select name="section" value={form.section} onChange={handleChange} className="border px-3 py-2 w-full rounded">
            {sectionList.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Date d’inscription</label>
          <input type="date" name="dateInscription" value={form.dateInscription} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Statut</label>
          <select name="statut" value={form.statut} onChange={handleChange} className="border px-3 py-2 w-full rounded">
            {statutList.map((s) => (
              <option key={s}>{s}</option>
            ))}
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
          <label className="block text-xs mb-1">Nom de la mère</label>
          <input name="mere" value={form.mere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div>
          <label className="block text-xs mb-1">Téléphone de la mère</label>
          <input name="telMere" value={form.telMere} onChange={handleChange} className="border px-3 py-2 w-full rounded" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs mb-1">Allergies</label>
          <textarea name="allergies" value={form.allergies} onChange={handleChange} className="border px-3 py-2 w-full rounded" rows={2} />
        </div>
        <div>
          <label className="block text-xs mb-1">Photo</label>
          <input type="file" name="photo" accept="image/*" onChange={handleImage} className="block text-xs" />
          {form.photo && (
            <img src={form.photo} alt="Photo" className="w-14 h-14 mt-2 rounded-full object-cover border" />
          )}
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
