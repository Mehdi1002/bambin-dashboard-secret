
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

// Récupération de l’entête type facture, sans n° de facture, logo à gauche si présent
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

  // Style professionnel : 2 colonnes, logo à gauche, infos à côté, date à droite.
  return `
    <div style="
      display:flex; 
      align-items:flex-start;
      justify-content:space-between;
      border-bottom:1.2px solid #e5e7eb;
      padding-bottom:14px;
      margin-bottom:32px;
      font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
    ">
      <div style="display:flex; gap:20px; align-items:flex-start;">
        ${
          admin.logo
            ? `<div style="flex-shrink:0;">
                <img src="${admin.logo}" alt="logo" style="width:58px; height:58px; border-radius:50%; object-fit:cover; border:1.5px solid #E0E0E0; background:#fafbfc; margin-top:2px;" />
              </div>`
            : ""
        }
        <div style="min-width:220px;">
          <div style="font-size:1.14em; font-weight:700; line-height:1.12; color:#0f192d; margin-bottom:0; letter-spacing:0.0px;">
            ${admin.nom}
          </div>
          <div style="color:#667085; font-size:1em; font-weight:400; margin-bottom:5px;">
            Crèche et préscolaire
          </div>
          <div style="color:#162039; font-size:0.96em; line-height:1.3; margin-bottom:3px;">
            <b>Adresse :</b> ${admin.adresse || "<span style='color:#aaa'>Non renseignée</span>"}
          </div>
          <div style="color:#162039; font-size:0.96em; line-height:1.3; margin-bottom:3px;">
            <b>Tél :</b> ${admin.telephone || "<span style='color:#aaa'>Non renseigné</span>"}
          </div>
          <div style="color:#162039; font-size:0.96em; line-height:1.3; margin-bottom:3px;">
            <b>Email :</b> ${admin.email || "<span style='color:#aaa'>Non renseigné</span>"}
          </div>
          <div style="color:#162039; font-size:0.96em; line-height:1.2;">
            <b>NIF :</b> ${admin.nif || "<span style='color:#aaa'>Non renseigné</span>"}<br/>
            <b>RC :</b> ${admin.rc || "<span style='color:#aaa'>Non renseigné</span>"}<br/>
            <b>N°Article :</b> ${admin.article || "<span style='color:#aaa'>Non renseigné</span>"}
          </div>
        </div>
      </div>
      <div style="text-align:right; margin-left:44px;">
        <div style="color:#192038; font-weight:500; font-size:1.04em;">
          Date&nbsp;: <span style="font-weight:700;">${today}</span>
        </div>
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
    <div style="width:480px; font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif; color:#222; padding:32px 26px 26px 26px; background:#fff; border-radius:10px;">
      ${header}
      <h2 style="text-align:center;margin-top:34px;margin-bottom:28px; font-size:1.19em; font-weight:500; letter-spacing:0.2px;color:#182345;">
        Certificat de scolarité
      </h2>
      <p style="margin:38px 0 50px 0; text-align:justify; font-size:1.06em; line-height:1.7;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’élève <b>${child.nom} ${child.prenom}</b> est inscrit au sein de notre établissement en <b>${child.section}</b> pour l’année scolaire <b>${annee}</b>.<br/><br/>
        Cette attestation est faite pour servir et valoir ce que de droit.
      </p>
      <div style="margin-top:87px; text-align:right; font-size:1.04em;">
        Le Directeur
      </div>
    </div>
  `;

  // Attestation d’inscription
  const inscriptionHtml = `
    <div style="width:480px; font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif; color:#222; padding:32px 26px 26px 26px; background:#fff; border-radius:10px;">
      ${header}
      <h2 style="text-align:center;margin-top:34px;margin-bottom:28px; font-size:1.19em; font-weight:500; letter-spacing:0.2px; color:#182345;">
        Attestation d’inscription
      </h2>
      <p style="margin:36px 0 50px 0; text-align:justify; font-size:1.06em; line-height:1.7;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’enfant <b>${child.nom} ${child.prenom}</b>, né(e) le <b>${toFrenchDate(child.date_naissance)}</b>, est inscrit(e) au sein de l’établissement pour l’année scolaire <b>${annee}</b>, en <b>${child.section}</b>.<br/><br/>
        Fait pour servir et valoir ce que de droit.
      </p>
      <div style="margin-top:87px; text-align:right; font-size:1.04em;">
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

