
import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import n2words from "n2words";

// Types
interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  child: {
    nom: string;
    prenom: string;
  } | null;
  mois: string;
  total: number;
  dateFacturation?: string;
}

// Fonction utilitaire pour lire le profil admin depuis localStorage
function useAdminProfile() {
  return useMemo(() => {
    try {
      const s = localStorage.getItem("admin_profile");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  }, []);
}

// Affichage principal de la facture
const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  onClose,
  child,
  mois,
  total,
  dateFacturation,
}) => {
  const admin = useAdminProfile();

  // Conversion du montant en lettres (français, DZA)
  const totalStr = useMemo(
    () =>
      n2words(total, { lang: "fr", currency: "DZD" }).replace(/^un /i, "Un "),
    [total]
  );
  const date = dateFacturation || new Date().toLocaleDateString("fr-DZ");

  // Impression du contenu de la modal
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

  if (!child) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facture du mois de {mois}</DialogTitle>
        </DialogHeader>
        <div id="invoice-printable" className="bg-white p-6 rounded overflow-x-auto max-w-2xl mx-auto text-sm">
          {/* EN-TETE */}
          <div className="flex items-start gap-8 border-b pb-4 mb-4">
            {admin.logo && <img src={admin.logo} alt="Logo" className="w-20 h-20 rounded-full object-cover border" />}
            <div>
              <div className="font-bold text-lg">{admin.nom || "L’île des Bambins"}</div>
              <div className="text-base text-muted-foreground mb-2">Crèche et préscolaire</div>
              <div><span className="font-medium">Adresse :</span> {admin.adresse || <span className="text-muted-foreground italic">Non renseignée</span>}</div>
              <div><span className="font-medium">Tél :</span> {admin.telephone || <span className="text-muted-foreground italic">Non renseigné</span>}</div>
              <div><span className="font-medium">Email :</span> {admin.email || <span className="text-muted-foreground italic">Non renseigné</span>}</div>
              <div>
                {admin.nif && <span className="mr-1">NIF : {admin.nif}</span>}
                {admin.rc && <span className="mr-1">RC : {admin.rc}</span>}
                {admin.article && <span>N°Article : {admin.article}</span>}
                {admin.nis && <span className="ml-1">NIS : {admin.nis}</span>}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-medium">Date facture : {date}</div>
            </div>
          </div>
          {/* TABLEAU */}
          <table className="w-full mb-6">
            <thead>
              <tr className="text-left bg-gray-50 border-b">
                <th className="py-2 px-3">Nom & Prénom</th>
                <th className="py-2 px-3">Mois facturé</th>
                <th className="py-2 px-3 text-right">Total à payer (DA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3">{child.nom + " " + child.prenom}</td>
                <td className="py-2 px-3">{mois}</td>
                <td className="py-2 px-3 text-right">{total.toLocaleString("fr-DZ")} DA</td>
              </tr>
            </tbody>
          </table>
          {/* TOTAUX */}
          <div className="flex flex-col items-end">
            <div className="font-bold text-lg mb-1">Total général : {total.toLocaleString("fr-DZ")} DA</div>
            <div className="italic text-muted-foreground">
              {totalStr.charAt(0).toUpperCase() + totalStr.slice(1)}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} variant="outline">Imprimer</Button>
          <Button onClick={onClose} variant="secondary">Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default InvoiceModal;
