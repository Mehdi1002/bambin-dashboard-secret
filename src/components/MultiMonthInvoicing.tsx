
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import GroupedInvoiceModal from "@/components/GroupedInvoiceModal";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
  "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

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

  // Pour la modale facture groupée
  const [modalIdx, setModalIdx] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalChild, setModalChild] = useState<Child | null>(null);

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

  // Pour ouvrir la modale groupée pour chaque enfant sélectionné
  const [modalQueue, setModalQueue] = useState<{ child: Child; idx: number }[]>([]);

  const startBatchGeneration = () => {
    if (!children || selectedChildren.length === 0 || selectedMonths.length === 0) return;
    // Construire une file d'attente : une entrée par enfant sélectionné
    const queue: { child: Child; idx: number }[] = [];
    let idx = 1;
    for (const cid of selectedChildren) {
      const ch = children.find((c) => c.id === cid);
      if (!ch) continue;
      queue.push({ child: ch, idx });
      idx += 1;
    }
    if (queue.length === 0) return;
    setModalChild(queue[0].child);
    setModalIdx(queue[0].idx);
    setModalQueue(queue.slice(1));
    setModalOpen(true);
  };

  // Lorsqu'une facture est fermée, ouvrir la suivante
  const handleCloseModal = () => {
    if (modalQueue.length > 0) {
      const next = modalQueue[0];
      setModalChild(next.child);
      setModalIdx(next.idx);
      setModalQueue(modalQueue.slice(1));
      setModalOpen(true);
    } else {
      setModalChild(null);
      setModalOpen(false);
      setModalQueue([]);
    }
  };

  // Pour chaque enfant, on calcule les mois sélectionnés + le total à facturer
  const getMonthsForChild = (child: Child): string[] => {
    return selectedMonths
      .filter((m) =>
        (payments ?? []).some(
          (p) => p.child_id === child.id && p.month === m && p.year === selectedYear
        ) || true // même si pas de paiement (pour test), on affiche quand même
      )
      .map((m) => MONTHS[m - 1]);
  };

  const getTotalForChild = (child: Child): number => {
    // Somme des amount_due + registration_fee pour chaque mois sélectionné
    return selectedMonths.reduce((sum, m) => {
      const p = (payments ?? []).find(
        (pay) =>
          pay.child_id === child.id &&
          pay.year === selectedYear &&
          pay.month === m
      );
      return sum + (p ? p.amount_due + p.registration_fee : 10000); // valeur par défaut 10 000 DA si pas de payment trouvé
    }, 0);
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
        Générer les factures regroupées par enfant
      </Button>
      {/* Modale facture groupée */}
      <GroupedInvoiceModal
        open={modalOpen}
        onClose={handleCloseModal}
        child={modalChild}
        mois={modalChild ? getMonthsForChild(modalChild) : []}
        total={modalChild ? getTotalForChild(modalChild) : 0}
        indexFacture={modalIdx}
        dateFacturation={selectedYear + "-01-01"}
      />
      <div className="mt-4 text-xs text-muted-foreground">
        Sélectionnez un ou plusieurs enfants, un ou plusieurs mois et cliquez sur "Générer les factures regroupées".<br />
        Chaque facture sera générée pour un enfant avec l’ensemble des mois sélectionnés regroupés sur une seule facture (impression ou PDF possible).
      </div>
    </div>
  );
}
