
import { useState } from "react";

export default function AdminProfileForm() {
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
    // Stocker dans localStorage / contexte plus tard
    alert("Informations enregistrées !");
  };

  return (
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
  );
}
