import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import n2words from "n2words";
import html2pdf from "html2pdf.js";
import { getAdminHeaderHtml } from "./AdminHeaderHtml";

interface PaiementParMois {
  mois: string; // "Mars"
  montant: number; // montant total de ce mois
}

interface GroupedInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  child: {
    nom: string;
    prenom: string;
  } | null;
  mois: string[]; // Array of month names, e.g. ["Mars", "Avril"]
  total: number;
  dateFacturation?: string;
  indexFacture?: number;
  paiements: PaiementParMois[]; // 🆕 détails par mois (Mois + montant)
}

function useAdminProfile() {
  return useMemo(() => {
    try {
      const s = localStorage.getItem("admin_profile");
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  }, []);
}

function useInvoiceNumber(indexFacture?: number, dateFacturation?: string) {
  const date = dateFacturation ? new Date(dateFacturation) : new Date();
  const year = date.getFullYear();
  const order = (indexFacture ?? 1).toString().padStart(3, "0");
  return `FAC-${year}-${order}`;
}

function totalEnLettres(total: number) {
  let txt = n2words(total, {
    lang: "fr",
    currency: "DZD"
  });
  txt = txt.replace(/^un /i, "Un ");
  txt = txt.toLocaleUpperCase("fr-FR");
  if (!txt.includes("DINARS")) {
    txt = txt.replace(/ ET ZÉRO CENTIME\.?$/, "");
    txt += " DINARS";
  }
  if (!txt.includes("CENTIME")) txt += " ET ZÉRO CENTIME";
  txt = txt.replace(/(?<!DINARS) ET ZÉRO CENTIME/, " DINARS ET ZÉRO CENTIME");
  return txt;
}

const GroupedInvoiceModal: React.FC<GroupedInvoiceModalProps> = ({
  open,
  onClose,
  child,
  mois,
  total,
  dateFacturation,
  indexFacture,
  paiements
}) => {
  const admin = useAdminProfile();
  const date = dateFacturation || new Date().toLocaleDateString("fr-DZ");
  const invoiceNumber = useInvoiceNumber(indexFacture, dateFacturation);

  // Format date pour "Béjaïa, le JJ/MM/AAAA" - utilise la date actuelle
  const formatBejaiDate = useMemo(() => {
    const d = new Date(); // Toujours utiliser la date actuelle
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `Béjaïa, le ${day}/${month}/${year}`;
  }, []);

  const totalStr = useMemo(() => totalEnLettres(total), [total]);

  if (!child) return null;

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-printable");
    const win = window.open("", "FACTURE", "width=800,height=900");
    if (!win || !printContent) return;
    win.document.write(`<html><head><title>Facture</title>`);
    win.document.write('<link href="/index.css" rel="stylesheet" />');
    win.document.write("</head><body>");
    win.document.write(printContent.innerHTML);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 200);
  };

  const handleDownloadPdf = () => {
    const invoiceElem = document.getElementById("invoice-printable");
    if (!invoiceElem) return;

    const opt = {
      margin: [0.5, 0.5],
      filename: `${invoiceNumber}.pdf`,
      image: {
        type: 'jpeg',
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy']
      }
    };
    html2pdf().set(opt).from(invoiceElem).save();
  };

  // Calcul de l'espacement adapté au nombre de lignes
  const dynamicSpacing = Math.max(20, paiements.length * 5);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facture regroupée ({mois.length} mois)</DialogTitle>
        </DialogHeader>
        <div
          id="invoice-printable"
          className="bg-white p-3 rounded overflow-x-auto max-w-2xl my-2 mx-1 text-sm"
        >
          {/* EN-TÊTE ADMINISTRATIF avec numéro à droite */}
          <div
            className="mb-4"
            dangerouslySetInnerHTML={{
              __html: getAdminHeaderHtml({ right: invoiceNumber })
            }}
          />
          {/* Date au format Béjaïa */}
          <div className="text-right mb-4" style={{
            fontSize: '0.875rem',
            color: '#000000',
            fontFamily: "'Segoe UI', Arial, 'Helvetica Neue', sans-serif",
            fontWeight: '400'
          }}>
            {formatBejaiDate}
          </div>
          {/* Titre "Facture" */}
          <h2 className="text-xl font-semibold text-center mb-3 mt-1 mx-1">Facture</h2>
          
          {/* TABLEAU SIMPLIFIÉ SANS BORDURES INTERNES */}
          <div className="w-full mb-6 border border-gray-400" style={{ borderCollapse: 'collapse' }}>
            {/* EN-TÊTE */}
            <div className="flex bg-gray-800 text-white">
              <div className="w-1/3 py-2 px-3 text-center font-medium border-r border-gray-400">
                Nom & Prénom
              </div>
              <div className="w-1/3 py-2 px-3 text-center font-medium border-r border-gray-400">
                Mois facturé
              </div>
              <div className="w-1/3 py-2 px-3 text-center font-medium">
                Montant (DA)
              </div>
            </div>
            
            {/* DONNÉES - STRUCTURE SIMPLIFIÉE */}
            <div className="flex" style={{ minHeight: `${paiements.length * 40}px` }}>
              {/* COLONNE NOM - SANS BORDURES INTERNES */}
              <div 
                className="w-1/3 border-r border-gray-400 bg-white flex items-center justify-center text-center font-medium"
                style={{ 
                  padding: '8px 12px',
                  borderBottom: 'none',
                  minHeight: `${paiements.length * 40}px`
                }}
              >
                {child.nom + " " + child.prenom}
              </div>
              
              {/* COLONNES MOIS ET MONTANTS */}
              <div className="w-2/3 flex">
                <div className="w-1/2 border-r border-gray-400">
                  {paiements.map((p, idx) => (
                    <div 
                      key={idx} 
                      className="py-2 px-3 text-center"
                      style={{ 
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: idx < paiements.length - 1 ? '1px solid #9ca3af' : 'none'
                      }}
                    >
                      {p.mois}
                    </div>
                  ))}
                </div>
                <div className="w-1/2">
                  {paiements.map((p, idx) => (
                    <div 
                      key={idx} 
                      className="py-2 px-3 text-center"
                      style={{ 
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: idx < paiements.length - 1 ? '1px solid #9ca3af' : 'none'
                      }}
                    >
                      {p.montant.toLocaleString("fr-DZ")} DA
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* TOTAUX bas de page avec espacement dynamique */}
          <div className="flex flex-col items-end" style={{ marginTop: `${dynamicSpacing}px` }}>
            <div className="font-bold text-lg mb-4">
              Total&nbsp;: {total.toLocaleString("fr-DZ")} DA
            </div>
            <div className="font-medium w-full text-left px-1 my-6" style={{ background: "none" }}>
              Arrêtée la présente facture à la somme de&nbsp;:
              <span className="uppercase text-black">&nbsp;{totalStr}</span>.
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleDownloadPdf} variant="default">Télécharger PDF</Button>
          <Button onClick={handlePrint} variant="outline">Imprimer</Button>
          <Button onClick={onClose} variant="secondary">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupedInvoiceModal;
