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

  // En-tête : chaque info sur une ligne différente, marges minimales, layout vertical
  return `
    <div style="
      width:100%;
      display:flex;
      align-items:flex-start;
      border-bottom:1.5px solid #e5e7eb;
      box-sizing:border-box;
      margin-bottom:18px;
      flex-direction:row;
      font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      padding:0;
    ">
      ${
        admin.logo
          ? `<div style="flex-shrink:0;margin-right:14px">
                  <img src="${admin.logo}" alt="logo" style="width:62px;height:62px;border-radius:50%;object-fit:cover;border:1.5px solid #E0E0E0;background:#fafbfc;" />
                </div>`
          : ""
      }
      <div style="margin:0;display:flex;flex-direction:column;">
        <div style="font-size:1.13em;font-weight:700;color:#172044;line-height:1">${admin.nom}</div>
        <div style="color:#697184;font-size:1em;line-height:1;margin-bottom:4px;">Crèche et préscolaire</div>
        <div style="color:#223046;font-size:1em;line-height:1.6;"><b>Adresse :</b> ${admin.adresse}</div>
        <div style="color:#223046;font-size:1em;line-height:1.6;"><b>Tél :</b> ${admin.telephone}</div>
        <div style="color:#223046;font-size:1em;line-height:1.6;"><b>Email :</b> ${admin.email}</div>
        <div style="color:#223046;font-size:1em;line-height:1.6;"><b>NIF :</b> ${admin.nif}</div>
        <div style="color:#223046;font-size:1em;line-height:1.6;"><b>RC :</b> ${admin.rc}</div>
        <div style="color:#223046;font-size:1em;line-height:1.6;"><b>N°Article :</b> ${admin.article}</div>
      </div>
    </div>
  `;
}

function getTodayFR() {
  const now = new Date();
  return now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function DocumentButtons({ child, anneeScolaire, headerHtml }: Props) {
  const [loading, setLoading] = useState(false);
  const annee = anneeScolaire ?? DEFAULT_ANNEE();
  const header = headerHtml ?? getAdminHeader();

  // Titre parfaitement centré sur toute la largeur de la page
  function makeTitle(label: string) {
    return `
      <div style="
        width:595pt;
        text-align:center;
        margin:0;
        font-size:1.38em;
        font-weight:600;
        letter-spacing:0.2px;
        color:#172044;
        font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      ">
        ${label}
      </div>
    `;
  }

  // *** Nouveau padding latéral accru pour que le paragraphe fasse ~4 lignes ***
  const PAGE_WIDTH = 595;
  const PADDING = 50; // Augmenter la marge à gauche et à droite
  const innerWidth = PAGE_WIDTH - 2 * PADDING;

  const scolariteHtml = `
    <div style="
      background:#fff;
      width:${PAGE_WIDTH}pt;
      min-height:842pt;
      font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      color:#222;
      border-radius:0;
      margin:0;
      box-sizing:border-box;
      padding:0;
    ">
      <!-- DATE EN HAUT À DROITE -->
      <div style="
        width:${PAGE_WIDTH}pt;
        display:flex;
        justify-content:flex-end;
        align-items:flex-start;
        margin:0;
        padding:${PADDING}pt ${PADDING}pt 0 ${PADDING}pt;
        font-size:1em;
        color:#172044;
        font-weight:500;
        box-sizing:border-box;
      ">
        <span style="padding:0;margin:0;">Date : <span style="font-weight:600">${getTodayFR()}</span></span>
      </div>
      <div style="padding:0 ${PADDING}pt;">
        ${header}
        ${makeTitle("Certificat de scolarité")}
        <div style="
          margin:32px 0 42px 0;
          font-size:1.08em;
          line-height:1.72;
          text-align:justify;
          padding:0;
          width:${innerWidth}pt;
          box-sizing:border-box;
        ">
          Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’élève
          <b>${child.nom} ${child.prenom}</b> est inscrit au sein de notre établissement en
          <b>${child.section}</b> pour l’année scolaire <b>${annee}</b>.<br/><br/>
          Cette attestation est faite pour servir et valoir ce que de droit.
        </div>
        <div style="margin-top:62px;padding:0;text-align:right;font-size:1.07em;width:${innerWidth}pt;">
          Le Directeur
        </div>
      </div>
    </div>
  `;

  const inscriptionHtml = `
    <div style="
      background:#fff;
      width:${PAGE_WIDTH}pt;
      min-height:842pt;
      font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      color:#222;
      border-radius:0;
      margin:0;
      box-sizing:border-box;
      padding:0;
    ">
      <!-- DATE EN HAUT À DROITE -->
      <div style="
        width:${PAGE_WIDTH}pt;
        display:flex;
        justify-content:flex-end;
        align-items:flex-start;
        margin:0;
        padding:${PADDING}pt ${PADDING}pt 0 ${PADDING}pt;
        font-size:1em;
        color:#172044;
        font-weight:500;
        box-sizing:border-box;
      ">
        <span style="padding:0;margin:0;">Date : <span style="font-weight:600">${getTodayFR()}</span></span>
      </div>
      <div style="padding:0 ${PADDING}pt;">
        ${header}
        ${makeTitle("Attestation d’inscription")}
        <div style="
          margin:32px 0 42px 0;
          font-size:1.08em;
          line-height:1.72;
          text-align:justify;
          padding:0;
          width:${innerWidth}pt;
          box-sizing:border-box;
        ">
          Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’enfant
          <b>${child.nom} ${child.prenom}</b>, né(e) le <b>${toFrenchDate(child.date_naissance)}</b>, est inscrit(e) au sein de l’établissement pour l’année scolaire
          <b>${annee}</b>, en <b>${child.section}</b>.<br/><br/>
          Fait pour servir et valoir ce que de droit.
        </div>
        <div style="margin-top:62px;padding:0;text-align:right;font-size:1.07em;width:${innerWidth}pt;">
          Le Directeur
        </div>
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
