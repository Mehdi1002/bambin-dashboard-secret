import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { useState } from "react";

type Child = {
  nom: string;
  prenom: string;
  section: string;
  date_naissance: string;
  sexe?: string; // Ajouté
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
    nom: "L’île des Bambins",
    sousTitre: "Crèche et préscolaire",
    adresse: "1000 logt IHEDDADEN BEJAIA",
    telephone: "0553367356 / 034 11 98 27",
    email: "liledesbambins@gmail.com",
    cb: "",
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

  return `
    <div style="
      width:100%;
      box-sizing:border-box;
      margin-bottom:22px;
      font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      border-bottom:1.5px solid #e5e7eb;
      padding-bottom:18px;
    ">
      <div style="display:flex;align-items:flex-start;">
        ${
          admin.logo
            ? `<div style="flex-shrink:0;margin-right:26px">
                  <img src="${admin.logo}" alt="logo" style="width:66px;height:66px;border-radius:12px;object-fit:cover;border:2px solid #173583;background:#f5f8ff;box-shadow:0 2px 8px rgba(22,50,100,0.10);" />
                </div>`
            : ""
        }
        <div style="flex:1;">
          <div style="font-size:1.55em;font-weight:700;color:#1852a1;line-height:1;margin-bottom:3px;letter-spacing:0.1px;">
            L’île des Bambins
          </div>
          <div style="font-style:italic;color:#2e4a70;font-size:1.06em;line-height:1.2;margin-bottom:9px;">
            ${admin.sousTitre || ""}
          </div>
          <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
            <b>Adresse :</b> ${admin.adresse || ""}
          </div>
          <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
            <b>Tél :</b> ${admin.telephone || ""}
          </div>
          <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
            <b>Email :</b> ${admin.email || ""}
          </div>
          ${admin.cb ? `
            <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
              <b>C.B BNA :</b> ${admin.cb}
            </div>
          ` : ""}
          <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
            <b>NIF :</b> ${admin.nif || ""}
          </div>
          <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
            <b>N° Article :</b> ${admin.article || ""}
          </div>
          <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
            <b>RC :</b> ${admin.rc || ""}
          </div>
          ${admin.nis ? `
            <div style="margin-bottom:2.5px;color:#222;font-size:1em;line-height:1.56;">
              <b>NIS :</b> ${admin.nis}
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

function getAdminHeaderFlexCertif(date?: string) {
  const defaultData = {
    nom: "L’île des Bambins",
    sousTitre: "Crèche et préscolaire",
    adresse: "1000 logt IHEDDADEN BEJAIA",
    telephone: "0553367356 / 034 11 98 27",
    email: "liledesbambins@gmail.com",
    cb: "",
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

  return `
    <div style="
      width:100%;
      margin-bottom:28px;
      font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      display:flex;
      flex-direction:row;
      align-items:flex-start;
      border-bottom:2px solid #d1e3fc;
      padding-bottom:22px;
    ">
      <div style="flex:1;min-width:0;">
        ${admin.logo
          ? `<img src="${admin.logo}" alt="logo" style="width:62px;height:62px;border-radius:12px;object-fit:cover;border:2px solid #1852a1;background:#f5f8ff;margin-bottom:9px;margin-right:8px;vertical-align:middle;display:block;" />`
          : ""}
        <div style="font-size:1.3em;font-weight:700;color:#1852a1;letter-spacing:0.2px;margin-bottom:2px;">
          L’île des Bambins
        </div>
        <div style="font-style:italic;color:#2e4a70;font-size:1em;line-height:1.4;margin-bottom:7px;">
          ${admin.sousTitre || ""}
        </div>
        <div style="font-size:1em;line-height:1.7;margin-bottom:0px;">
          <div style="margin-bottom:2.5px;color:#222;"><b>Adresse :</b> ${admin.adresse || ""}</div>
          <div style="margin-bottom:2.5px;color:#222;"><b>Tél :</b> ${admin.telephone || ""}</div>
          <div style="margin-bottom:2.5px;color:#222;"><b>Email :</b> ${admin.email || ""}</div>
          ${admin.cb ? `<div style="margin-bottom:2.5px;color:#222;"><b>C.B BNA :</b> ${admin.cb}</div>` : ""}
        </div>
        <div style="margin-top:7px;font-size:0.98em;">
          ${admin.nif ? `<div style="margin-bottom:2.5px;color:#222;"><b>NIF :</b> ${admin.nif}</div>` : ""}
          ${admin.article ? `<div style="margin-bottom:2.5px;color:#222;"><b>N° Article :</b> ${admin.article}</div>` : ""}
          ${admin.rc ? `<div style="margin-bottom:2.5px;color:#222;"><b>RC :</b> ${admin.rc}</div>` : ""}
          ${admin.nis ? `<div style="margin-bottom:2.5px;color:#222;"><b>NIS :</b> ${admin.nis}</div>` : ""}
        </div>
      </div>
      <div style="flex-shrink:0;text-align:right;padding-left:28px;min-width:235px;">
        <div style="font-size:2em;font-weight:800;letter-spacing:1.2px;color:#1852a1;line-height:1.2;margin-bottom:14px;margin-top:6px;">
          CERTIFICAT<br/>DE SCOLARITÉ
        </div>
        <div style="background:#dbeafe;padding:7px 10px 6px 10px;display:inline-block;border-radius:6px;font-size:1.13em;font-weight:500;color:#1059b0;margin-bottom:4px;">
          Date : <span style="font-weight:700;">${date ?? getTodayFR()}</span>
        </div>
      </div>
    </div>
  `;
}

function getTodayFR() {
  const now = new Date();
  return now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Utilitaire accord genre
function genreInscrit(sexe?: string) {
  if ((sexe ?? "").toLowerCase().startsWith("f")) return "inscrite";
  return "inscrit";
}

export default function DocumentButtons({ child, anneeScolaire, headerHtml }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<null | "scolarite" | "inscription">(null);

  const annee = anneeScolaire ?? DEFAULT_ANNEE();
  const header = headerHtml ?? getAdminHeader();

  // Génère le HTML du titre — parfaitement centré même en aperçu
  function makeTitle(label: string) {
    return `
      <div style="
        width:100%;
        text-align:center;
        margin:0 auto 12px auto;
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

  // Marges latérales pour garder 4 lignes de texte (environ 50pt)
  const PAGE_WIDTH = 595;
  const PADDING = 50;
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
      ${getAdminHeaderFlexCertif()}
      <div style="
        margin:32px 0 42px 0;
        font-size:1.08em;
        line-height:1.72;
        text-align:justify;
        padding:0 50pt;
        width:495pt;
        box-sizing:border-box;
      ">
        Je soussigné, Monsieur le Directeur de la crèche <b>L’Île des Bambins</b>, atteste que l’élève
        <b>${child.nom} ${child.prenom}</b> est ${genreInscrit(child.sexe)} au sein de notre établissement en
        <b>${child.section} section</b> pour l’année scolaire <b>${annee}</b>.<br/><br/>
        Cette attestation est faite pour servir et valoir ce que de droit.
      </div>
      <div style="margin-top:62px;padding:0;text-align:right;font-size:1.07em;width:495pt;">
        Le Directeur
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
          <b>${child.nom} ${child.prenom}</b>, né(e) le <b>${toFrenchDate(child.date_naissance)}</b>, est ${genreInscrit(child.sexe)} au sein de l’établissement pour l’année scolaire
          <b>${annee}</b>, en <b>${child.section} section.</b><br/><br/> <!-- Ajout de "section" ici -->
          Fait pour servir et valoir ce que de droit.
        </div>
        <div style="margin-top:62px;padding:0;text-align:right;font-size:1.07em;width:${innerWidth}pt;">
          Le Directeur
        </div>
      </div>
    </div>
  `;

  const getHtml = (type: "scolarite" | "inscription") =>
    type === "scolarite" ? scolariteHtml : inscriptionHtml;

  const handleExport = async (type: "scolarite" | "inscription") => {
    setLoading(true);
    const opt = {
      margin: 0,
      filename: `${type === "scolarite" ? "certificat" : "attestation"}-${child.nom}-${child.prenom}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
    };
    const content = getHtml(type);
    await html2pdf().set(opt).from(content).save();
    setLoading(false);
  };

  // Affiche document dans une modal avant téléchargement :
  function PreviewModal({ type, onClose }: { type: "scolarite" | "inscription", onClose: () => void }) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        style={{ fontFamily: "'Segoe UI', Arial, 'Helvetica Neue', sans-serif" }}
      >
        {/* fond modal */}
        <div className="bg-white max-w-2xl w-[800px] rounded-lg shadow-xl border relative overflow-auto max-h-[90vh]">
          <button
            className="absolute right-2 top-2 text-muted-foreground hover:text-black p-1"
            aria-label="Fermer"
            onClick={onClose}
            style={{ background: "none", border: "none" }}
          >
            ✕
          </button>
          <div className="p-5">
            <div
              // Attention : rendu HTML "en brut" pour affichage fidèle
              dangerouslySetInnerHTML={{ __html: getHtml(type) }}
            />
          </div>
          <div className="flex gap-3 justify-end px-5 pb-5 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Fermer
            </Button>
            <Button
              variant="default"
              onClick={() => {
                handleExport(type);
                onClose();
              }}
              disabled={loading}
            >
              <Download className="w-4 h-4" /> Télécharger
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => setShowPreview("scolarite")}
          title="Aperçu du certificat de scolarité"
        >
          <Eye className="w-4 h-4" />
          Certificat
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => setShowPreview("inscription")}
          title="Aperçu de l'attestation d'inscription"
        >
          <Eye className="w-4 h-4" />
          Attestation
        </Button>
      </div>
      {showPreview && (
        <PreviewModal
          type={showPreview}
          onClose={() => setShowPreview(null)}
        />
      )}
    </>
  );
}
