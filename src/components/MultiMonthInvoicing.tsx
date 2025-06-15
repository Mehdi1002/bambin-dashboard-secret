
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import InvoiceModal from "@/components/InvoiceModal";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
  "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Année scolaire typique : septembre → juillet
const SCHOOL_MONTHS = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7];

type Child = {
  id: string;
  nom: string;
  prenom: string;
  section: string;
};

type Payment = {
  id: string;
  child_id: string;
  year: number;
  month: number;
  amount_due: number;
  registration_fee: number;
  amount_paid: number;
  validated: boolean;
};

function getSchoolYears() {
  const thisYear = new Date().getFullYear();
  return [
    thisYear - 1,
    thisYear,
    thisYear + 1
  ];
}

export default function MultiMonthInvoicing() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  // Pour la modale facture
  const [invoiceIndex, setInvoiceIndex] = useState<number>(1);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceChild, setInvoiceChild] = useState<Child | null>(null);
  const [invoiceMonth, setInvoiceMonth] = useState<string>("");
  const [invoiceTotal, setInvoiceTotal] = useState<number>(0);

  // Récupérer les enfants actifs
  const { data: children, isLoading } = useQuery({
    queryKey: ["children-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("id, nom, prenom, section, statut")
        .order("nom", { ascending: true });
      if (error) throw error;
      return (data ?? []).filter((c) => c.statut === "Actif") as Child[];
    }
  });

  // Récupérer les paiements pour tous les enfants/mois/année sélectionnés
  const { data: payments } = useQuery({
    queryKey: ["payments-multimonth", selectedYear, selectedMonths, selectedChildren],
    queryFn: async () => {
      if (selectedMonths.length === 0 || selectedChildren.length === 0) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .in("year", [selectedYear])
        .in("month", selectedMonths)
        .in("child_id", selectedChildren);
      if (error) throw error;
      return data as Payment[];
    },
    // Ne lance la requête que si on a des enfants et des mois sélectionnés
    enabled: selectedMonths.length > 0 && selectedChildren.length > 0,
  });

  // Gérer la sélection des enfants
  const handleToggleChild = (id: string) => {
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Gérer la sélection des mois
  const handleToggleMonth = (m: number) => {
    setSelectedMonths((prev) =>
      prev.includes(m) ? prev.filter((mm) => mm !== m) : [...prev, m]
    );
  };

  // Générer une ou plusieurs factures (ouvre une modale pour chaque facture, l'une après l'autre)
  const handleGenerateInvoices = () => {
    if (
      !children ||
      selectedChildren.length === 0 ||
      selectedMonths.length === 0
    )
      return;

    // Prendre premier enfant + premier mois à facturer dans la liste (on ouvre la modale pour chaque combinaison)
    const nextChild = children.find((c) => c.id === selectedChildren[0]);
    const nextMonth = selectedMonths[0];
    if (!nextChild || nextMonth == null) return;

    // Rechercher le paiement pour l’enfant/mois
    const pay = (payments ?? []).find(
      (p) =>
        p.child_id === nextChild.id &&
        p.year === selectedYear &&
        p.month === nextMonth
    );
    const total = pay ? pay.amount_due + pay.registration_fee : 10000;
    setInvoiceChild(nextChild);
    setInvoiceOpen(true);
    setInvoiceMonth(MONTHS[nextMonth - 1]);
    setInvoiceIndex(1);
    setInvoiceTotal(total);
  };

  // Pour aller à la combinaison enfant/mois suivante après fermeture modale
  const [invoiceQueue, setInvoiceQueue] = useState<{ child: Child; month: number; idx: number }[]>([]);

  // Quand on clique "Générer les factures"
  const startBatchGeneration = () => {
    if (!children) return;
    const queue: { child: Child; month: number; idx: number }[] = [];
    let idx = 1;
    for (const cid of selectedChildren) {
      const ch = children.find((c) => c.id === cid);
      if (!ch) continue;
      for (const m of selectedMonths) {
        queue.push({ child: ch, month: m, idx });
        idx += 1;
      }
    }
    if (queue.length === 0) return;
    // On ouvre la première facture
    setInvoiceChild(queue[0].child);
    setInvoiceOpen(true);
    setInvoiceMonth(MONTHS[queue[0].month - 1]);
    setInvoiceIndex(queue[0].idx);
    // Trouver paiement et total
    const pay = (payments ?? []).find(
      (p) =>
        p.child_id === queue[0].child.id &&
        p.year === selectedYear &&
        p.month === queue[0].month
    );
    setInvoiceTotal(pay ? pay.amount_due + pay.registration_fee : 10000);
    setInvoiceQueue(queue.slice(1));
  };

  // Quand une facture est fermée, ouvrir la suivante !
  const handleCloseInvoice = () => {
    if (invoiceQueue.length > 0) {
      const next = invoiceQueue[0];
      setInvoiceChild(next.child);
      setInvoiceMonth(MONTHS[next.month - 1]);
      setInvoiceIndex(next.idx);
      // Paiement et total
      const pay = (payments ?? []).find(
        (p) =>
          p.child_id === next.child.id &&
          p.year === selectedYear &&
          p.month === next.month
      );
      setInvoiceTotal(pay ? pay.amount_due + pay.registration_fee : 10000);
      setInvoiceQueue(invoiceQueue.slice(1));
      setInvoiceOpen(true);
    } else {
      setInvoiceChild(null);
      setInvoiceOpen(false);
      setInvoiceQueue([]);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row items-center gap-6">
        {/* Sélection année */}
        <div>
          <label className="block text-xs font-medium mb-1">Année scolaire</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {getSchoolYears().map(y =>
              <option key={y} value={y}>{`${y}-${y+1}`}</option>
            )}
          </select>
        </div>
        {/* Sélection des enfants */}
        <div>
          <label className="block text-xs font-medium mb-1">Enfants à facturer</label>
          <div className="flex flex-wrap gap-1 max-w-md">
            {isLoading ? <span>Chargement...</span> :
              (children ?? []).map(c => (
                <Button
                  key={c.id}
                  variant={selectedChildren.includes(c.id) ? "default" : "outline"}
                  size="sm"
                  className="px-3 py-1"
                  onClick={() => handleToggleChild(c.id)}
                >
                  {c.nom} {c.prenom}
                </Button>
              ))}
          </div>
        </div>
        {/* Sélection des mois */}
        <div>
          <label className="block text-xs font-medium mb-1">Mois à facturer</label>
          <div className="flex flex-wrap gap-1">
            {SCHOOL_MONTHS.map(m => (
              <Button
                key={m}
                variant={selectedMonths.includes(m) ? "default" : "outline"}
                size="sm"
                className="px-3 py-1"
                onClick={() => handleToggleMonth(m)}
              >
                {MONTHS[m - 1]}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={startBatchGeneration}
        disabled={
          !children ||
          selectedChildren.length === 0 ||
          selectedMonths.length === 0
        }
      >
        Générer les factures sélectionnées
      </Button>
      {/* Modale facture (réutilise InvoiceModal !) */}
      <InvoiceModal
        open={invoiceOpen}
        onClose={handleCloseInvoice}
        child={invoiceChild}
        mois={invoiceMonth}
        total={invoiceTotal}
        indexFacture={invoiceIndex}
        dateFacturation={selectedYear + "-01-01"}
      />
      <div className="mt-4 text-xs text-muted-foreground">
        Sélectionnez un ou plusieurs enfants, un ou plusieurs mois et cliquez sur "Générer les factures".
        Chaque facture s’ouvrira dans une modale (impression ou PDF possible).
      </div>
    </div>
  );
}
