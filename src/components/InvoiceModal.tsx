

import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import n2words from "n2words";
import html2pdf from "html2pdf.js";
import { getAdminHeaderHtml } from "./AdminHeaderHtml";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  child: {
    nom: string;
    prenom: string;
  } | null;
  mois: string; // e.g. "Avril"
  total: number;
  dateFacturation?: string;
  indexFacture?: number; // 👈 Nouvelle prop pour index facture
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

// Numéro unique FAC-YYYY-XXX
function useInvoiceNumber(indexFacture?: number, dateFacturation?: string) {
  const date = dateFacturation ? new Date(dateFacturation) : new Date();
  const year = date.getFullYear();
  // Pad index avec 3 chiffres (001, 002...)
  const order = (indexFacture ?? 1).toString().padStart(3, "0");
  return `FAC-${year}-${order}`;
}

// Met en MAJUSCULES françaises et retire la devise de n2words à la fin
function totalEnLettres(total: number) {
  // n2words retourne ex : 'douze mille dinars algériens'
  let txt = n2words(total, {
    lang: "fr",
    currency: "DZD"
  });
  txt = txt.replace(/^un /i, "Un "); // Respect Maj initiale
  txt = txt.toLocaleUpperCase("fr-FR");
  // S'assurer de l'ajout DINARS si absent
  if (!txt.includes("DINARS")) {
    txt = txt.replace(/ ET ZÉRO CENTIME\.?$/, "");
    txt += " DINARS";
  }
  // Ajoute ET ZÉRO CENTIME à la fin si absent
  if (!txt.includes("CENTIME")) txt += " ET ZÉRO CENTIME";
  // Si déjà ET ZÉRO CENTIME mais pas DINARS devant, rajoute DINARS devant
  txt = txt.replace(/(?<!DINARS) ET ZÉRO CENTIME/, " DINARS ET ZÉRO CENTIME");
  return txt;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  onClose,
  child,
  mois,
  total,
  dateFacturation,
  indexFacture
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
  const moisEtAnnee = useMemo(() => {
    if (dateFacturation) {
      try {
        const d = new Date(dateFacturation);
        const annee = d.getFullYear();
        return `${mois} ${annee}`;
      } catch {
        return mois;
      }
    }
    return `${mois} ${new Date().getFullYear()}`;
  }, [mois, dateFacturation]);

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-printable");
    const win = window.open("", "FACTURE", "width=800,height=900");
    if (!win || !printContent) return;
    win.document.write(`<html><head><title>Facture</title>`);
    win.document.write('<link href="/index.css" rel="stylesheet" />');
    win.document.write("</head><body>");
    win.document.write(printContent.innerHTML);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 200);
  };

  // 👇 Fonction de génération PDF avec html2pdf.js
  const handleDownloadPdf = () => {
    const invoiceElem = document.getElementById("invoice-printable");
    if (!invoiceElem) return;

    // html2pdf utilisera l'élément HTML déjà stylé (ce que voit l'utilisateur)
    const opt = {
      margin: [0.5, 0.5],
      // pouces
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

  if (!child) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-0">
        <DialogHeader>
          <DialogTitle>Facture du mois de {moisEtAnnee}</DialogTitle>
        </DialogHeader>
        <div
          id="invoice-printable"
          className="bg-white p-3 rounded overflow-x-auto max-w-2xl my-2 mx-1 text-sm"
        >
          {/* EN-TÊTE ADMINISTRATIF avec le numéro à droite */}
          <div className="mb-4" dangerouslySetInnerHTML={{
            __html: getAdminHeaderHtml({
              right: invoiceNumber
            })
          }} />
          {/* Affiche la date de facturation alignée à droite */}
          <div className="text-right mb-3 text-xs text-gray-600 font-medium">
            Date de facturation&nbsp;: <span className="font-semibold">{date}</span>
          </div>
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
          <h2 className="text-xl font-semibold mb-3 mt-1 mx-1 text-center">Facture</h2>
          {/* TABLEAU CENTRAL DE FACTURATION */}
          <table className="w-full mb-6 border-collapse border border-gray-400">
            <thead>
              <tr className="text-left bg-gray-800 text-white border-b border-gray-400">
                <th className="py-2 px-3 text-center align-middle border border-gray-400">Nom & Prénom</th>
                <th className="py-2 px-3 text-center align-middle border border-gray-400">Mois facturé</th>
                <th className="py-2 px-3 text-center align-middle border border-gray-400">Total à payer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border border-gray-400">
                <td className="py-2 px-3 text-center align-middle border border-gray-400">{child.nom + " " + child.prenom}</td>
                <td className="py-2 px-3 text-center align-middle border border-gray-400">{moisEtAnnee}</td>
                <td className="py-2 px-3 text-center align-middle border border-gray-400">{total.toLocaleString("fr-DZ")} DA</td>
              </tr>
            </tbody>
          </table>

          {/* TOTAUX bas de page avec espacement adapté */}
          <div className="flex flex-col items-end" style={{ marginTop: '20px' }}>
            <div className="font-bold text-lg mb-4">
              Total&nbsp;: {total.toLocaleString("fr-DZ")} DA
            </div>
            <div style={{
              background: "none"
            }} className="font-medium w-full text-left px-px my-6 rounded-sm">
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

export default InvoiceModal;

