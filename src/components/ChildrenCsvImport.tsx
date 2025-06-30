
import React, { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type CsvChild = {
  Nom: string;
  Prénom: string;
  Sexe: string;
  "Date naissance": string;
  Section: string;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

const previewCount = 5;

export default function ChildrenCsvImport({ onClose, onSuccess }: Props) {
  const [csvData, setCsvData] = useState<CsvChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "preview" | "done">("select");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<CsvChild>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError("Aucune donnée trouvée dans le fichier.");
          return;
        }
        setCsvData(results.data as CsvChild[]);
        setStep("preview");
        setError(null);
      },
      error: () => {
        setError("Erreur lors de la lecture du fichier CSV.");
      }
    });
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prépare les lignes, mapping champ CSV → champ DB
      const toInsert = csvData.map(row => ({
        nom: row.Nom?.trim() || "",
        prenom: row["Prénom"]?.trim() || "",
        sexe: row.Sexe?.trim() || "",
        date_naissance: row["Date naissance"]?.trim() || "",
        section: row.Section?.trim() || "",
        statut: "Actif"
      }))
      .filter(e => e.nom && e.prenom && e.date_naissance && e.section);

      if (toInsert.length === 0) {
        setError("Aucune ligne valide à importer.");
        setLoading(false);
        return;
      }
      const { error } = await supabase
        .from("children")
        .insert(toInsert);
      if (error) {
        setError("Erreur lors de l'import : " + error.message);
        setLoading(false);
        return;
      }
      toast({ title: "Import terminé", description: `${toInsert.length} enfants ajoutés !` });
      setStep("done");
      setLoading(false);
      onSuccess();
    } catch (e: any) {
      setError("Erreur : " + e.message);
      setLoading(false);
    }
  };

  if (step === "select") {
    return (
      <div className="bg-white p-6 rounded-lg border shadow max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-4">Importer enfants depuis un CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block mb-4"
        />
        {error && <div className="text-destructive">{error}</div>}
        <div className="flex gap-3 justify-end mt-4">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Annuler</button>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="bg-white p-6 rounded-lg border shadow max-w-md mx-auto">
        <h2 className="text-lg font-bold mb-3">Aperçu du CSV</h2>
        {csvData.length > 0 ? (
          <table className="w-full text-sm border mb-3">
            <thead>
              <tr>
                <th className="border px-2 py-1">Nom</th>
                <th className="border px-2 py-1">Prénom</th>
                <th className="border px-2 py-1">Sexe</th>
                <th className="border px-2 py-1">Date naissance</th>
                <th className="border px-2 py-1">Section</th>
              </tr>
            </thead>
            <tbody>
              {csvData.slice(0, previewCount).map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.Nom}</td>
                  <td className="border px-2 py-1">{row["Prénom"]}</td>
                  <td className="border px-2 py-1">{row.Sexe}</td>
                  <td className="border px-2 py-1">{row["Date naissance"]}</td>
                  <td className="border px-2 py-1">{row.Section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="text-muted">Aucune donnée à afficher.</span>
        )}
        <p className="text-xs text-muted-foreground mb-2">Nombre total de lignes détectées : {csvData.length}</p>
        {error && <div className="text-destructive mb-2">{error}</div>}
        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Annuler</button>
          <button
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? "Import…" : "Importer"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="bg-white p-6 rounded-lg border shadow max-w-md mx-auto flex flex-col items-center">
        <span className="text-green-600 text-3xl mb-3">✓</span>
        <div className="mb-4">Importation terminée !</div>
        <button className="bg-primary text-white px-6 py-2 rounded" onClick={onClose}>Fermer</button>
      </div>
    );
  }

  return null;
}
