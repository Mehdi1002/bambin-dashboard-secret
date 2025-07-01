
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { useState } from "react";
import { getAdminHeaderHtml } from "./AdminHeaderHtml";

type Child = {
  nom: string;
  prenom: string;
  section: string;
  date_naissance: string;
  sexe?: string;
};

type Props = {
  child: Child;
  anneeScolaire?: string;
  headerHtml?: string;
  dateFacturation?: string;
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

function genreInscrit(sexe?: string) {
  if ((sexe ?? "").toLowerCase().startsWith("f")) return "inscrite";
  return "inscrit";
}

function formatSection(section: string) {
  if (section === "Prescolaire") return "section préscolaire";
  return `${section} section`;
}

export default function DocumentButtons({ child, anneeScolaire, headerHtml, dateFacturation }: Props) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<null | "scolarite" | "inscription">(null);

  const annee = anneeScolaire ?? DEFAULT_ANNEE();

  // ✅ Date formatée EXACTEMENT comme dans la facture
  const dateFacture = dateFacturation
    ? new Date(dateFacturation).toLocaleDateString("fr-DZ")
    : new Date().toLocaleDateString("fr-DZ");

  // ✅ Header unifié IDENTIQUE à la facture
  const unifiedHeader = getAdminHeaderHtml({
    right: `Date&nbsp;: <span style="font-weight:700">${dateFacture}</span>`
  });

  // ✅ Titre avec style IDENTIQUE à la facture
  function makeDocumentTitle(label: string) {
    return `
      <h2 style="
        text-align: center;
        margin: 0 auto 22px auto;
        font-size: 1.25rem;
        font-weight: 600;
        color: #000000 !important;
        font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
        line-height: 1.2;
      ">
        ${label}
      </h2>
    `;
  }

  // ✅ Contenu principal avec EXACTEMENT les mêmes paramètres que la facture
  function getDocumentHtml(type: "scolarite" | "inscription") {
    return `
      <div class="bg-white p-3 rounded overflow-x-auto max-w-2xl my-2 mx-1 text-sm" style="
        background: #fff;
        padding: 0.75rem;
        border-radius: 0.375rem;
        overflow-x: auto;
        max-width: 32rem;
        margin: 0.5rem 0.25rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: #000000 !important;
        font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
      ">
        ${unifiedHeader}
        
        ${makeDocumentTitle(type === "scolarite" ? "CERTIFICAT DE SCOLARITÉ" : "ATTESTATION D'INSCRIPTION")}
        
        <div style="
          margin: 32px 0 44px 0;
          font-size: 0.875rem;
          line-height: 1.7;
          text-align: justify;
          width: 100%;
          color: #000000 !important;
          font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
        ">
          ${
            type === "scolarite"
              ? `Je soussigné, Monsieur le Directeur de la crèche <strong style="color: #000000 !important;">L'Île des Bambins</strong>, atteste que <strong style="color: #000000 !important;">${child.nom} ${child.prenom}</strong> est <strong style="color: #000000 !important;">${genreInscrit(child.sexe)}</strong> au sein de notre établissement en <strong style="color: #000000 !important;">${formatSection(child.section)}</strong> pour l'année scolaire <strong style="color: #000000 !important;">${annee}</strong>.<br/><br/>Cette attestation est faite pour servir et valoir ce que de droit.`
              : `Je soussigné, Monsieur le Directeur de la crèche <strong style="color: #000000 !important;">L'Île des Bambins</strong>, atteste que <strong style="color: #000000 !important;">${child.nom} ${child.prenom}</strong>, né(e) le <strong style="color: #000000 !important;">${toFrenchDate(child.date_naissance)}</strong>, est <strong style="color: #000000 !important;">${genreInscrit(child.sexe)}</strong> au sein de l'établissement pour l'année scolaire <strong style="color: #000000 !important;">${annee}</strong>, en <strong style="color: #000000 !important;">${formatSection(child.section)}.</strong><br/><br/>Fait pour servir et valoir ce que de droit.`
          }
        </div>
        
        <div style="
          margin-top: 68px; 
          text-align: right;
          font-size: 0.875rem;
          font-family: 'Segoe UI', Arial, 'Helvetica Neue', sans-serif;
          width: 100%;
          color: #000000 !important;
        ">
          Le Directeur
        </div>
      </div>
    `;
  }

  // ✅ Export PDF avec options IDENTIQUES à la facture
  const handleExport = async (type: "scolarite" | "inscription") => {
    setLoading(true);
    const opt = {
      margin: [0.5, 0.5], // EXACTEMENT comme la facture
      filename: `${type === "scolarite" ? "certificat" : "attestation"}-${child.nom}-${child.prenom}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    const content = getDocumentHtml(type);
    await html2pdf().set(opt).from(content).save();
    setLoading(false);
  };

  // ✅ Modal d'aperçu responsive
  function PreviewModal({ type, onClose }: { type: "scolarite" | "inscription", onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-2xl h-auto flex flex-col items-center justify-center p-4 relative">
          <button
            className="absolute right-4 top-4 text-gray-600 hover:text-black p-2 z-10 bg-white rounded-full shadow-md"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="border bg-white shadow-lg overflow-auto w-full max-w-2xl" style={{
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
            maxHeight: "80vh"
          }}>
            <div
              style={{ width: "100%", background: "#fff", overflow: "hidden" }}
              dangerouslySetInnerHTML={{ __html: getDocumentHtml(type) }}
            />
          </div>
          <div className="flex gap-3 justify-end w-full max-w-2xl mt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Fermer
            </Button>
            <Button
              variant="default"
              onClick={() => { handleExport(type); onClose(); }}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
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
        >
          <Eye className="w-4 h-4 mr-2" />
          Certificat
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => setShowPreview("inscription")}
        >
          <Eye className="w-4 h-4 mr-2" />
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
