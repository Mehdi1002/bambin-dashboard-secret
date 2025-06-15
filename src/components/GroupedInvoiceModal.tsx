
import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import n2words from "n2words";
import html2pdf from "html2pdf.js";

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
  txt = txt.replace(/ et zéro centime\.?$/i, " ET ZÉRO CENTIME");
  txt = txt.toLocaleUpperCase("fr-FR");
  if (!txt.includes("CENTIME")) txt += " ET ZÉRO CENTIME";
  return txt;
}

const GroupedInvoiceModal: React.FC<GroupedInvoiceModalProps> = ({
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

  const totalStr = useMemo(() => totalEnLettres(total), [total]);
  const moisEtAnnees = useMemo(() => {
    // ex: "Mars 2025, Avril 2025"
    if (!mois.length) return "";
    if (dateFacturation) {
      try {
        const d = new Date(dateFacturation);
        const annee = d.getFullYear();
        return mois.map((m) => `${m} ${annee}`).join(", ");
      } catch {
        return mois.join(", ");
      }
    }
    return mois.map((m) => `${m} ${new Date().getFullYear()}`).join(", ");
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
  if (!child) return null;
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facture regroupée ({mois.length} mois)</DialogTitle>
        </DialogHeader>
        <div id="invoice-printable" className="bg-white p-6 rounded overflow-x-auto max-w-2xl mx-auto text-sm">
          {/* EN-TÊTE ADMINISTRATIF */}
          <div className="flex items-start gap-8 border-b pb-4 mb-4">
            {admin.logo && <img src={admin.logo} alt="Logo" className="w-20 h-20 rounded-full object-cover border" />}
            <div>
              <div className="font-bold text-lg">{admin.nom || "L’île des Bambins"}</div>
              <div className="text-base text-muted-foreground mb-2">Crèche et préscolaire</div>
              <div>
                <span className="font-medium">Adresse :</span> {admin.adresse || <span className="text-muted-foreground italic">Non renseignée</span>}
              </div>
              <div>
                <span className="font-medium">Tél :</span> {admin.telephone || <span className="text-muted-foreground italic">Non renseigné</span>}
              </div>
              <div>
                <span className="font-medium">Email :</span> {admin.email || <span className="text-muted-foreground italic">Non renseigné</span>}
              </div>
              {/* Numéros administratifs */}
              {admin.nif && <div className="mt-1"><span className="font-medium">NIF&nbsp;: </span>{admin.nif}</div>}
              {admin.rc && <div className="mt-1"><span className="font-medium">RC&nbsp;: </span>{admin.rc}</div>}
              {admin.article && <div className="mt-1"><span className="font-medium">N°Article&nbsp;: </span>{admin.article}</div>}
              {admin.nis && <div className="mt-1"><span className="font-medium">NIS&nbsp;: </span>{admin.nis}</div>}
              <div className="mt-2 font-semibold text-blue-700">Facture N° : {invoiceNumber}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-medium">Date facture : {date}</div>
            </div>
          </div>

          {/* TABLEAU CENTRAL DE FACTURATION */}
          <table className="w-full mb-6">
            <thead>
              <tr className="text-left bg-gray-800 text-white border-b">
                <th className="py-2 px-3">Nom & Prénom</th>
                <th className="py-2 px-3">Mois facturés</th>
                <th className="py-2 px-3 text-right">Total à payer&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3">{child.nom + " " + child.prenom}</td>
                <td className="py-2 px-3">{moisEtAnnees}</td>
                <td className="py-2 px-3 text-right">{total.toLocaleString("fr-DZ")} DA</td>
              </tr>
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
    </Dialog>;
};

export default GroupedInvoiceModal;

