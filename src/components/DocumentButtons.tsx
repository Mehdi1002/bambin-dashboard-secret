
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { useState } from "react";

// Types simples pour props
type Child = {
  nom: string;
  prenom: string;
  section: string;
  date_naissance: string;
};

type Props = {
  child: Child;
  anneeScolaire?: string; // format: "2024-2025"
  headerHtml?: string; // Optionnel : composant d’en-tête prêt à insérer
};

const DEFAULT_ANNEE = () => {
  // Déduit automatiquement l’année scolaire en cours (ex: 2024-2025)
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${year + 1}`;
};

function toFrenchDate(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function DocumentButtons({ child, anneeScolaire, headerHtml }: Props) {
  const [loading, setLoading] = useState(false);
  const annee = anneeScolaire ?? DEFAULT_ANNEE();

  // Définir un en-tête simple si aucun n’est fourni (on peut raffiner avec le logo plus tard)
  const header = headerHtml ?? `
    <div style="display: flex; align-items:center; gap:16px; margin-bottom: 24px;">
      <div>
        <img src="/placeholder.svg" alt="Logo" width="64" height="64" style="border-radius: 50%;border:1px solid #ddd;" />
      </div>
      <div style="font-size: 1.1em;">
        <b>L’île des Bambins</b><br/>
        Crèche et Préscolaire<br/>
        123, Avenue de l’Exemple
      </div>
    </div>
  `;

  // Certificat de scolarité
  const scolariteHtml = `
    <div style="width: 480px; font-family: Arial,sans-serif; color:#222; padding:20px;background: #fff;">
      ${header}
      <h2 style="text-align:center; margin-top:16px;">Certificat de scolarité</h2>
      <p style="margin:34px 0 44px 0;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’élève <b>${child.nom} ${child.prenom}</b> est inscrit au sein de notre établissement en <b>${child.section}</b> pour l’année scolaire <b>${annee}</b>.
      </p>
      <div style="margin-top:90px; text-align:right;">
        Le Directeur
      </div>
    </div>
  `;

  // Attestation d’inscription
  const inscriptionHtml = `
    <div style="width: 480px; font-family: Arial,sans-serif; color:#222; padding:20px; background: #fff;">
      ${header}
      <h2 style="text-align:center; margin-top:16px;">Attestation d’inscription</h2>
      <p style="margin:30px 0 44px 0;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’enfant <b>${child.nom} ${child.prenom}</b>, né(e) le <b>${toFrenchDate(child.date_naissance)}</b>, est inscrit(e) au sein de l’établissement pour l’année scolaire <b>${annee}</b>, en <b>${child.section}</b>.
      </p>
      <div style="margin-top:90px; text-align:right;">
        Le Directeur
      </div>
    </div>
  `;

  const handleExport = async (type: "scolarite" | "inscription") => {
    setLoading(true);
    const opt = {
      margin: 0,
      filename: `${type === "scolarite" ? "certificat" : "attestation"}-${child.nom}-${child.prenom}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
    };
    const content = type === "scolarite" ? scolariteHtml : inscriptionHtml;
    await html2pdf().set(opt).from(content).save();
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => handleExport("scolarite")}
        title="Générer le certificat de scolarité"
      >
        <Download className="w-4 h-4" />
        Certificat
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => handleExport("inscription")}
        title="Générer l'attestation d'inscription"
      >
        <Download className="w-4 h-4" />
        Attestation
      </Button>
    </div>
  );
}
