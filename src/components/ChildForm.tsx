
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateChildData, sanitizeInput } from "@/utils/validation";
import { toast } from "@/components/ui/use-toast";

type ChildFormProps = {
  initial?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export default function ChildForm({ initial, onSubmit, onCancel }: ChildFormProps) {
  const [formData, setFormData] = useState({
    nom: initial?.nom || "",
    prenom: initial?.prenom || "",
    date_naissance: initial?.date_naissance || "",
    section: initial?.section || "Petite",
    date_inscription: initial?.date_inscription || "",
    statut: initial?.statut || "Actif",
    pere: initial?.pere || "",
    tel_pere: initial?.tel_pere || "",
    mere: initial?.mere || "",
    tel_mere: initial?.tel_mere || "",
    allergies: initial?.allergies || "",
    sexe: initial?.sexe || "",
    type_doc_pere: initial?.type_doc_pere || "",
    num_doc_pere: initial?.num_doc_pere || "",
    type_doc_mere: initial?.type_doc_mere || "",
    num_doc_mere: initial?.num_doc_mere || "",
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nettoyer les données
    const cleanedData = Object.keys(formData).reduce((acc, key) => {
      acc[key] = typeof formData[key] === 'string' ? sanitizeInput(formData[key]) : formData[key];
      return acc;
    }, {} as any);

    // Valider les données
    const validationErrors = validateChildData(cleanedData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        variant: "destructive",
        title: "Erreurs de validation",
        description: validationErrors.join(", ")
      });
      return;
    }

    setErrors([]);
    onSubmit(cleanedData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer les erreurs quand l'utilisateur modifie un champ
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-6 bg-white shadow">
      <h2 className="text-xl font-semibold mb-4">
        {initial ? "Modifier l'enfant" : "Ajouter un enfant"}
      </h2>
      
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <ul className="text-red-700 text-sm">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <Input
            value={formData.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
            required
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prénom *</label>
          <Input
            value={formData.prenom}
            onChange={(e) => handleChange("prenom", e.target.value)}
            required
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date de naissance *</label>
          <Input
            type="date"
            value={formData.date_naissance}
            onChange={(e) => handleChange("date_naissance", e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Section *</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.section}
            onChange={(e) => handleChange("section", e.target.value)}
            required
          >
            <option value="Petite">Petite</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Prescolaire">Préscolaire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date d'inscription</label>
          <Input
            type="date"
            value={formData.date_inscription}
            onChange={(e) => handleChange("date_inscription", e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sexe</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.sexe}
            onChange={(e) => handleChange("sexe", e.target.value)}
          >
            <option value="">Non spécifié</option>
            <option value="Garçon">Garçon</option>
            <option value="Fille">Fille</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Père</label>
          <Input
            value={formData.pere}
            onChange={(e) => handleChange("pere", e.target.value)}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone père</label>
          <Input
            value={formData.tel_pere}
            onChange={(e) => handleChange("tel_pere", e.target.value)}
            type="tel"
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type doc père</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.type_doc_pere}
            onChange={(e) => handleChange("type_doc_pere", e.target.value)}
          >
            <option value="">Aucun</option>
            <option value="Carte d'identité">Carte d'identité</option>
            <option value="Permis de conduire">Permis de conduire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Numéro doc père</label>
          <Input
            value={formData.num_doc_pere}
            onChange={(e) => handleChange("num_doc_pere", e.target.value)}
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mère</label>
          <Input
            value={formData.mere}
            onChange={(e) => handleChange("mere", e.target.value)}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Téléphone mère</label>
          <Input
            value={formData.tel_mere}
            onChange={(e) => handleChange("tel_mere", e.target.value)}
            type="tel"
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type doc mère</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.type_doc_mere}
            onChange={(e) => handleChange("type_doc_mere", e.target.value)}
          >
            <option value="">Aucun</option>
            <option value="Carte d'identité">Carte d'identité</option>
            <option value="Permis de conduire">Permis de conduire</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Numéro doc mère</label>
          <Input
            value={formData.num_doc_mere}
            onChange={(e) => handleChange("num_doc_mere", e.target.value)}
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.statut}
            onChange={(e) => handleChange("statut", e.target.value)}
          >
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Allergies</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={formData.allergies}
            onChange={(e) => handleChange("allergies", e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="md:col-span-2 flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {initial ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
