
import { useState, useEffect } from "react";

export default function AdminProfileForm() {
  // Chargement initial depuis localStorage
  const [form, setForm] = useState({
    nom: "Crèche et préscolaire L'île des Bambins",
    adresse: "",
    telephone: "",
    email: "",
    nif: "",
    article: "",
    rc: "",
    nis: "",
    logo: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("admin_profile");
    if (stored) {
      setForm(JSON.parse(stored));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({
        ...f,
        logo: ev.target?.result?.toString() || "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("admin_profile", JSON.stringify(form));
    alert("Informations enregistrées !");
  };

  return (
    <>
      <form
        className="bg-white shadow rounded-lg max-w-2xl mx-auto p-8 space-y-5 border"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-center space-x-5">
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-muted-foreground mb-1">
              Logo
            </label>
            <input type="file" id="logo" name="logo" accept="image/*" className="block text-sm" onChange={handleImage} />
          </div>
          {form.logo && (
            <img src={form.logo} alt="Logo" className="w-20 h-20 rounded-full border object-cover" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1">Nom</label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1">Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1">NIF</label>
            <input name="nif" value={form.nif} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1">N° Article</label>
            <input name="article" value={form.article} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1">RC</label>
            <input name="rc" value={form.rc} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1">NIS</label>
            <input name="nis" value={form.nis} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
        </div>
        <div className="flex justify-end">
          <button className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition">
            Enregistrer
          </button>
        </div>
      </form>

      {/* Aperçu formaté */}
      <div className="max-w-2xl mx-auto mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          {form.logo && (
            <img src={form.logo} alt="Logo" className="w-16 h-16 rounded-full border object-cover" />
          )}
          <div>
            <span className="block text-xl font-bold">{form.nom || "L’île des Bambins"}</span>
            <span className="block text-base text-muted-foreground">crèche et préscolaire</span>
          </div>
        </div>
        <div className="text-base space-y-2">
          <div>
            <span className="font-medium">Adresse :</span> {form.adresse || <span className="text-muted-foreground italic">Non renseignée</span>}
          </div>
          <div>
            <span className="font-medium">Tél : </span>{form.telephone || <span className="text-muted-foreground italic">Non renseigné</span>}
          </div>
          <div>
            <span className="font-medium">Email : </span>{form.email || <span className="text-muted-foreground italic">Non renseigné</span>}
          </div>
          <div>
            <span className="font-medium">NIF :</span> {form.nif || <span className="text-muted-foreground italic">Non renseigné</span>}
          </div>
          <div>
            <span className="font-medium">N° Article :</span> {form.article || <span className="text-muted-foreground italic">Non renseigné</span>}
          </div>
          <div>
            <span className="font-medium">RC :</span> {form.rc || <span className="text-muted-foreground italic">Non renseigné</span>}
          </div>
          <div>
            <span className="font-medium">NIS :</span> {form.nis || <span className="text-muted-foreground italic">Non renseigné</span>}
          </div>
        </div>
      </div>
    </>
  );
}
