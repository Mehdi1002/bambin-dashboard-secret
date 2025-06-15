
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { useState } from "react";

type Child = {
  nom: string;
  prenom: string;
  section: string;
  date_naissance: string;
};

type Props = {
  child: Child;
  anneeScolaire?: string;
  headerHtml?: string;
};

const DEFAULT_ANNEE = () => {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${year + 1}`;
};

function toFrenchDate(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// Fonction pour générer dynamiquement l’en-tête depuis les infos admin
function getAdminHeader() {
  // Par défaut si aucun profil n’est enregistré
  // DOIT correspondre à l’aperçu du module AdminProfileForm
  const defaultData = {
    nom: "Crèche et préscolaire L’île des Bambins",
    adresse: "123, Avenue de l’Exemple",
    telephone: "",
    email: "",
    nif: "",
    article: "",
    rc: "",
    nis: "",
    logo: ""
  };
  let admin = defaultData;
  try {
    const stored = localStorage.getItem("admin_profile");
    if (stored) {
      admin = { ...defaultData, ...JSON.parse(stored) };
    }
  } catch {
    // default fallback
  }
  // Compose l’en-tête HTML
  return `
    <div style="display: flex; align-items:center; gap:16px; margin-bottom: 24px;">
      <div>
        ${
          admin.logo
            ? `<img src="${admin.logo}" alt="Logo" width="64" height="64" style="border-radius: 50%;border:1px solid #ddd;object-fit:cover;"/>`
            : `<img src="/placeholder.svg" alt="Logo" width="64" height="64" style="border-radius: 50%;border:1px solid #ddd;" />`
        }
      </div>
      <div style="font-size: 1.1em; line-height:1.5;">
        <b>${admin.nom}</b><br/>
        ${admin.adresse ? admin.adresse + "<br/>" : ""}
        ${
          [admin.telephone, admin.email]
            .filter(Boolean)
            .map(
              (it) =>
                `<span style="font-size:1em;color:#555;">${it}</span>`
            )
            .join(" | ")
        }
        ${
          [admin.nif, admin.article, admin.rc, admin.nis].some(Boolean)
            ? `<div style="font-size:0.97em;color:#555;margin-top:3px;">
          ${admin.nif ? "NIF : " + admin.nif + " &nbsp; " : ""}
          ${admin.article ? "N° Article : " + admin.article + " &nbsp; " : ""}
          ${admin.rc ? "RC : " + admin.rc + " &nbsp; " : ""}
          ${admin.nis ? "NIS : " + admin.nis : ""}
          </div>`
            : ""
        }
      </div>
    </div>
  `;
}

export default function DocumentButtons({ child, anneeScolaire, headerHtml }: Props) {
  const [loading, setLoading] = useState(false);
  const annee = anneeScolaire ?? DEFAULT_ANNEE();

  // En-tête dynamique depuis admin_profile (sauf si headerHtml forcé)
  const header = headerHtml ?? getAdminHeader();

  // Certificat de scolarité
  const scolariteHtml = `
    <div style="width: 480px; font-family: Arial,sans-serif; color:#222; padding:20px;background: #fff;">
      ${header}
      <h2 style="text-align:center; margin-top:16px;">Certificat de scolarité</h2>
      <p style="margin:34px 0 44px 0;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’élève <b>${child.nom} ${child.prenom}</b> est inscrit au sein de notre établissement en <b>${child.section}</b> pour l’année scolaire <b>${annee}</b>.
        <br/><br/>Cette attestation est faite pour servir et valoir ce que de droit.
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
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’enfant <b>${child.nom} ${child.prenom}</b>, né(e) le <b>${toFrenchDate(child.date_naissance)}</b>, est inscrit(e) au sein de l’établissement pour l’année scolaire <b>${annee}</b>, en <b>${child.section}</b>.<br/><br/>
        Fait pour servir et valoir ce que de droit.
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
