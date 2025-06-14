import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Clock, X } from "lucide-react";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet",
  "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Année scolaire typique : de septembre à juillet
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
  status: string;
  validated: boolean;
};

function paymentStatus(p: Payment) {
  if (p.validated) return { label: "Validé", icon: <Check className="text-green-600 w-4 h-4 inline" /> };
  if (p.amount_paid === 0) return { label: "Retard", icon: <X className="text-red-500 w-4 h-4 inline" /> };
  if (p.amount_paid < p.amount_due + p.registration_fee) return { label: "Partiel", icon: <Clock className="text-yellow-500 w-4 h-4 inline"/> };
  // Paiement complet mais non validé
  return { label: "À valider", icon: <Clock className="text-blue-500 w-4 h-4 inline"/> };
}

export default function MonthlyPaymentsTable() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  // Affiche par défaut le mois courant, ou septembre s'il n'est pas dans l'année scolaire
  const initialMonth = SCHOOL_MONTHS.includes(currentMonth) ? currentMonth : 9;
  const [month, setMonth] = useState(initialMonth);
  const queryClient = useQueryClient();

  // Récupère les enfants actifs
  const { data: children, isLoading: loadingChildren } = useQuery({
    queryKey: ["children-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("children")
        .select("id, nom, prenom, section, statut")
        .order("nom", { ascending: true });
      if (error) throw error;
      return (data ?? []).filter((c) => c.statut === "Actif") as Child[];
    }
  });

  // Récupère les paiements du mois pour tous les enfants
  const { data: payments, isLoading: loadingPayments } = useQuery({
    queryKey: ["payments", year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("year", year)
        .eq("month", month);
      if (error) throw error;
      return data as Payment[];
    }
  });

  // Mutation pour MAJ paiement
  const mutation = useMutation({
    mutationFn: async (update: Partial<Payment> & { id: string }) => {
      const { error } = await supabase.from("payments").update(update).eq("id", update.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Paiement mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["payments", year, month] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour ce paiement", variant: "destructive" });
    }
  });

  // Édition rapide du montant payé 
  const handlePaidChange = (id: string, value: number) => {
    mutation.mutate({ id, amount_paid: value });
  };
  const handleValidate = (id: string) => {
    mutation.mutate({ id, validated: true, status: "validated" });
  };

  // Pour l’utilisateur
  if (loadingChildren || loadingPayments) {
    return <div>Chargement...</div>;
  }
  if (!children || children.length === 0) {
    return <div>Aucun enfant trouvé.</div>;
  }

  // On mappe les paiements à chaque enfant
  return (
    <div>
      <div className="flex gap-4 mb-4 items-end flex-wrap">
        <div>
          <label className="block text-xs mb-1">Année scolaire</label>
          <select className="border rounded px-2 py-1" value={year} onChange={e => setYear(Number(e.target.value))}>
            {/* Génère une liste déroulante d'années autour de l'année courante */}
            {Array.from({ length: 4 }).map((_, i) => {
              const y = currentYear - 1 + i;
              return (
                <option value={y} key={y}>{`${y}-${y + 1}`}</option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Mois</label>
          <select className="border rounded px-2 py-1" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {SCHOOL_MONTHS.map(m => (
              <option key={m} value={m}>{MONTHS[m - 1]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>À payer</TableHead>
              <TableHead>Frais</TableHead>
              <TableHead>Payé</TableHead>
              <TableHead>Reste</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Valider</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map(child => {
              // Trouve le paiement de l’enfant pour ce mois, s’il existe
              const pay = (payments ?? []).find(p => p.child_id === child.id);
              if (!pay) {
                // Peut compléter la génération automatique dans une étape suivante
                return (
                  <TableRow key={child.id}>
                    <TableCell>{child.nom}</TableCell>
                    <TableCell>{child.prenom}</TableCell>
                    <TableCell>{child.section}</TableCell>
                    <TableCell colSpan={6} className="italic text-muted-foreground">
                      Paiement non généré
                    </TableCell>
                  </TableRow>
                );
              }
              const reste = pay.amount_due + pay.registration_fee - pay.amount_paid;
              return (
                <TableRow key={pay.id}>
                  <TableCell>{child.nom}</TableCell>
                  <TableCell>{child.prenom}</TableCell>
                  <TableCell>{child.section}</TableCell>
                  <TableCell>{pay.amount_due}</TableCell>
                  <TableCell>{pay.registration_fee}</TableCell>
                  <TableCell>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={pay.amount_paid}
                      onChange={e =>
                        handlePaidChange(pay.id, Number(e.target.value))}
                      min={0}
                      disabled={pay.validated}
                    />
                  </TableCell>
                  <TableCell>
                    {reste}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      {paymentStatus(pay).icon}
                      <span>{paymentStatus(pay).label}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {/* Affiche le bouton Valider SYSTÉMATIQUEMENT si non validé */}
                    {!pay.validated && (
                      <button
                        className="bg-green-600 text-white rounded px-3 py-1 text-xs hover:bg-green-700"
                        onClick={() => handleValidate(pay.id)}
                      >
                        Valider
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* <div className="mt-4 text-xs text-muted-foreground">
        Double-cliquez sur un montant pour l’éditer, puis cliquez sur “Valider” si tout est ok.
      </div> */}
    </div>
  );
}
