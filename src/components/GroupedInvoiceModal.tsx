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
    win.document.write("</body></html>");
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facture regroupée ({mois.length} mois)</DialogTitle>
        </DialogHeader>
        <div id="invoice-printable" className="bg-white p-6 rounded overflow-x-auto max-w-2xl mx-auto text-sm">
          {/* EN-TÊTE ADMINISTRATIF avec numéro à droite */}
          <div
            className="mb-4"
            dangerouslySetInnerHTML={{
              __html: getAdminHeaderHtml({ right: invoiceNumber })
            }}
          />
          {/* TABLEAU CENTRAL DE FACTURATION */}
          <table className="w-full mb-6">
            <thead>
              <tr className="text-left bg-gray-800 text-white border-b">
                <th className="py-2 px-3 text-center">Nom & Prénom</th>
                <th className="py-2 px-3">Mois facturé</th>
                <th className="py-2 px-3 text-right">Montant (DA)</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((p, idx) => (
                <tr key={idx}>
                  {idx === 0 ? (
                    <td
                      className="py-2 px-3 text-center align-middle font-medium"
                      rowSpan={paiements.length}
                    >
                      {child.nom + " " + child.prenom}
                    </td>
                  ) : null}
                  <td className="py-2 px-3">{p.mois}</td>
                  <td className="py-2 px-3 text-right">{p.montant.toLocaleString("fr-DZ")} DA</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TOTAUX bas de page */}
          <div className="flex flex-col items-end">
            <div className="font-bold text-lg mb-1">
              Total général&nbsp;: {total.toLocaleString("fr-DZ")} DA
            </div>
            <div className="font-medium w-full text-left px-1" style={{ background: "none" }}>
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
