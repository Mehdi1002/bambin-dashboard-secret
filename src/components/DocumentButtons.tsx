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

// On adapte la fonction d’en-tête :
function getAdminHeader() {
  const defaultData = {
    nom: "Crèche et préscolaire L’île des Bambins",
    adresse: "1000 logt IHEDDADEN BEJAIA",
    telephone: "0553367356 / 034 11 98 27",
    email: "liledesbambins@gmail.com",
    nif: "196506010063735",
    article: "06017732933",
    rc: "06/01-0961315A10",
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
  // Le bloc d'entête ne contient plus la date ni le titre :
  return `
    <div style="
      display:flex;
      align-items:flex-start;
      justify-content:flex-start;
      border-bottom:1.2px solid #e5e7eb;
      padding-bottom:14px;
      margin-bottom:32px;
      font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
    ">
      ${
        admin.logo
          ? `<div style="flex-shrink:0;margin-right:28px;">
                <img src="${admin.logo}" alt="logo" style="width:62px; height:62px; border-radius:50%; object-fit:cover; border:1.5px solid #E0E0E0; background:#fafbfc; margin-top:2px;" />
              </div>`
          : ""
      }
      <div style="min-width: 270px;">
        <div style="font-size:1.22em; font-weight:700; color:#0f192d; letter-spacing:0;">
          ${admin.nom}
        </div>
        <div style="color:#667085; font-size:0.97em;">
          Crèche et préscolaire
        </div>
        <div style="color:#162039; font-size:1em; margin-top:8px; margin-bottom:2px;">
          <b>Adresse :</b> ${admin.adresse}
        </div>
        <div style="color:#162039; font-size:1em;">
          <b>Tél :</b> ${admin.telephone}
        </div>
        <div style="color:#162039; font-size:1em;">
          <b>Email :</b> ${admin.email}
        </div>
        <div style="color:#162039; font-size:1em;">
          <b>NIF :</b> ${admin.nif} <br/>
          <b>RC :</b> ${admin.rc}<br/>
          <b>N°Article :</b> ${admin.article}
        </div>
      </div>
    </div>
  `;
}

// On génère la date à afficher, toujours au format fr-FR
function getTodayFR() {
  const now = new Date();
  return now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function DocumentButtons({ child, anneeScolaire, headerHtml }: Props) {
  const [loading, setLoading] = useState(false);
  const annee = anneeScolaire ?? DEFAULT_ANNEE();

  const header = headerHtml ?? getAdminHeader();

  // Titre centré :
  function makeTitle(label: string) {
    return `
      <h2 style="
        text-align:center;
        margin: 18px 0 28px 0;
        font-size:1.3em;
        font-weight:600;
        letter-spacing:0.2px;
        color:#172044;
        font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      ">${label}</h2>
    `;
  }

  // Certificat de scolarité
  const scolariteHtml = `
    <div style="width:500px; font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif; color:#222; padding:32px 32px 28px 32px; background:#fff; border-radius:10px;">
      <div style="display:flex; justify-content:flex-end;">
        <span style="font-size:1em; color:#172044; font-weight:500;">Date&nbsp;: <span style="font-weight:600">${getTodayFR()}</span></span>
      </div>
      ${header}
      ${makeTitle("Certificat de scolarité")}
      <div style="margin:36px 0 47px 0; font-size:1.07em; line-height:1.7; text-align:justify;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’élève <b>${child.nom} ${child.prenom}</b> est inscrit au sein de notre établissement en <b>${child.section}</b> pour l’année scolaire <b>${annee}</b>.<br/><br/>
        Cette attestation est faite pour servir et valoir ce que de droit.
      </div>
      <div style="margin-top:78px; text-align:right; font-size:1.06em;">
        Le Directeur
      </div>
    </div>
  `;

  // Attestation d’inscription
  const inscriptionHtml = `
    <div style="width:500px; font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif; color:#222; padding:32px 32px 28px 32px; background:#fff; border-radius:10px;">
      <div style="display:flex; justify-content:flex-end;">
        <span style="font-size:1em; color:#172044; font-weight:500;">Date&nbsp;: <span style="font-weight:600">${getTodayFR()}</span></span>
      </div>
      ${header}
      ${makeTitle("Attestation d’inscription")}
      <div style="margin:36px 0 47px 0; font-size:1.07em; line-height:1.7; text-align:justify;">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’enfant <b>${child.nom} ${child.prenom}</b>, né(e) le <b>${toFrenchDate(child.date_naissance)}</b>, est inscrit(e) au sein de l’établissement pour l’année scolaire <b>${annee}</b>, en <b>${child.section}</b>.<br/><br/>
        Fait pour servir et valoir ce que de droit.
      </div>
      <div style="margin-top:78px; text-align:right; font-size:1.06em;">
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
