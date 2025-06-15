
import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import n2words from "n2words";

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
}

function useAdminProfile() {
  return useMemo(() => {
    try {
      const s = localStorage.getItem("admin_profile");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  }, []);
}

// Fonction pour générer un numéro unique de facture : FAC-YYYY-MM-XXX
function useInvoiceNumber(child: { nom: string; prenom: string } | null, mois: string, dateFacturation?: string) {
  // On essaie d'utiliser l’enfant, l’année, le mois pour générer un numéro lisible et (quasi) unique : FAC-2025-04-NOMPRE (troncation)
  if (!child) return "";
  const date = dateFacturation ? new Date(dateFacturation) : new Date();
  const year = date.getFullYear();
  // Trouver le numéro du mois : on suppose que mois est ex : "Avril"
  const monthMap = {
    Janvier: "01", Février: "02", Mars: "03", Avril: "04", Mai: "05", Juin: "06", Juillet: "07",
    Août: "08", Septembre: "09", Octobre: "10", Novembre: "11", Décembre: "12"
  } as Record<string, string>;
  let mm = Object.entries(monthMap).find(([k]) => mois.startsWith(k));
  const monthStr = mm ? mm[1] : (date.getMonth() + 1).toString().padStart(2, "0");

  // Générer un hash du nom pour l’ordre (ou troncature)
  const initials =
    (child.nom.substring(0, 3).toUpperCase() + child.prenom.substring(0, 2).toUpperCase());
  // Numéro d’ordre fictif pour test demo (ajuster via une variable incrémentale côté back/db dans le futur)
  return `FAC-${year}-${monthStr}-${initials}`;
}

// Met en MAJUSCULES françaises et retire la devise de n2words à la fin
function totalEnLettres(total: number) {
  // n2words retourne ex : ‘douze mille dinars algériens’
  let txt = n2words(total, { lang: "fr", currency: "DZD" });
  txt = txt.replace(/^un /i, "Un "); // Respect Maj initiale
  txt = txt.replace(/ et zéro centime\.?$/i, " ET ZÉRO CENTIME");
  // Force en majuscules
  txt = txt.toLocaleUpperCase("fr-FR");
  // Harmonise la fin : DZD => DINARS ET ZÉRO CENTIME, ou bien laisse par défaut la structure fournie
  if (!txt.includes("CENTIME")) txt += " ET ZÉRO CENTIME";
  return txt;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  onClose,
  child,
  mois,
  total,
  dateFacturation,
}) => {
  const admin = useAdminProfile();

  const date = dateFacturation || new Date().toLocaleDateString("fr-DZ");
  const invoiceNumber = useInvoiceNumber(child, mois, dateFacturation);

  const totalStr = useMemo(() => totalEnLettres(total), [total]);

  const moisEtAnnee = useMemo(() => {
    // Ex : Avril 2025
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

  if (!child) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facture du mois de {moisEtAnnee}</DialogTitle>
        </DialogHeader>
        <div id="invoice-printable" className="bg-white p-6 rounded overflow-x-auto max-w-2xl mx-auto text-sm">
          {/* EN-TÊTE ADMINISTRATIF */}
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
              {/* Numéro unique de facture */}
              <div className="mt-2 font-semibold text-blue-700">Facture N° : {invoiceNumber}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-medium">Date facture : {date}</div>
            </div>
          </div>

          {/* TABLEAU CENTRAL DE FACTURATION */}
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
                <td className="py-2 px-3">{moisEtAnnee}</td>
                <td className="py-2 px-3 text-right">{total.toLocaleString("fr-DZ")} DA</td>
              </tr>
            </tbody>
          </table>
          {/* TOTAUX bas de page */}
          <div className="flex flex-col items-end">
            <div className="font-bold text-lg mb-1">Total général : {total.toLocaleString("fr-DZ")} DA</div>
            <div className="italic text-muted-foreground mb-2">
              {totalStr}
            </div>
            <div className="font-medium mt-2">
              Arrêtée la présente facture à la somme de :<br />
              <span className="uppercase text-black">{totalStr}</span>.
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
