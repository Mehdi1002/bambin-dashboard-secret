
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

// Nouvel en-tête identique au modèle facture, sans numéro de facture
function getAdminHeader() {
  const defaultData = {
    nom: "Crèche et préscolaire L’île des Bambins",
    adresse: "",
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
  } catch {}
  const now = new Date();
  const today = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  // Bloc : TITRE, toutes infos à gauche, date à droite (table pour faciliter l’alignement PDF)
  return `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom:1px solid #e5e7eb; padding-bottom:10px; margin-bottom:18px;">
      <div>
        <div style="font-size:1.18em; font-weight:bold; letter-spacing:0.2px; color:#222;">
          ${admin.nom}
        </div>
        <div style="color:#64748b; font-size:1em; margin-bottom:2px;">Crèche et préscolaire</div>

        <div style="margin-top:6px; font-size:1em;">
          <b>Adresse :</b> ${admin.adresse || "<span style='color:#aaa'>Non renseignée</span>"}
        </div>
        <div style="font-size:1em;">
          <b>Tél :</b> ${admin.telephone || "<span style='color:#aaa'>Non renseigné</span>"}
        </div>
        <div style="font-size:1em;">
          <b>Email :</b> ${admin.email || "<span style='color:#aaa'>Non renseigné</span>"}
        </div>
        <div style="font-size:1em;">
          <b>NIF :</b> ${admin.nif || "<span style='color:#aaa'>Non renseigné</span>"} 
          <b>RC :</b> ${admin.rc || "<span style='color:#aaa'>Non renseigné</span>"} 
          <b>N°Article&nbsp;:</b> ${admin.article || "<span style='color:#aaa'>Non renseigné</span>"}
        </div>
      </div>
      <div style="text-align:right;margin-left:32px; font-size:1em;">
        <div style="color:#222; font-weight:500;">Date&nbsp;: <span style="font-weight:bold;">${today}</span></div>
      </div>
    </div>
  `;
}

export default function DocumentButtons({ child, anneeScolaire, headerHtml }: Props) {
  const [loading, setLoading] = useState(false);
  const annee = anneeScolaire ?? DEFAULT_ANNEE();

  const header = headerHtml ?? getAdminHeader();

  // Certificat de scolarité
  const scolariteHtml = `
    <div style="width: 480px; font-family: Arial,sans-serif; color:#222; padding:20px; background: #fff;">
      ${header}
      <h2 style="text-align:center; margin-top:26px; margin-bottom:26px; font-size:1.18em; font-weight:500;">Certificat de scolarité</h2>
      <p style="margin:34px 0 44px 0; text-align:justify;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’élève <b>${child.nom} ${child.prenom}</b> est inscrit au sein de notre établissement en <b>${child.section}</b> pour l’année scolaire <b>${annee}</b>.<br/><br/>
        Cette attestation est faite pour servir et valoir ce que de droit.
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
      <h2 style="text-align:center; margin-top:26px; margin-bottom:26px; font-size:1.18em; font-weight:500;">Attestation d’inscription</h2>
      <p style="margin:30px 0 44px 0; text-align:justify;">
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
