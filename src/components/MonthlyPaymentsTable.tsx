import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MonthlyPaymentRow from "./MonthlyPaymentRow";
import QuickPaymentModal from "./QuickPaymentModal";

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

  // Ajoute le bouton sur chaque enfant, même sans paiement

  // Pour l’utilisateur
  const [modalOpen, setModalOpen] = useState(false);
  const [modalChild, setModalChild] = useState<Child | null>(null);
  const [modalPay, setModalPay] = useState<Payment | null>(null);

  // On ouvre la modale pour n'importe quel enfant
  const handleOpenModal = (child: Child, pay: Payment | null | undefined) => {
    setModalChild(child);
    setModalPay(pay ?? null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalChild(null);
    setModalPay(null);
    setModalOpen(false);
  };

  // Création ou maj d'un paiement
  const mutation = useMutation({
    mutationFn: async (params: {
      child: Child,
      pay: Payment | null,
      amount_due: number,
      amount_paid: number,
      year: number,
      month: number
    }) => {
      const { child, pay, amount_due, amount_paid, year, month } = params;
      const validated = amount_paid >= amount_due;
      const updateData = {
        child_id: child.id,
        year,
        month,
        amount_due,
        registration_fee: pay ? pay.registration_fee : 0,
        amount_paid,
        validated,
        status: validated ? "validated" : "pending"
      };
      if (pay) {
        // Paiement existe : update
        const { error } = await supabase.from("payments").update(updateData).eq("id", pay.id);
        if (error) throw error;
      } else {
        // Paiement n'existe pas : insert
        const { error } = await supabase.from("payments").insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Paiement enregistré" });
      queryClient.invalidateQueries({ queryKey: ["payments", year, month] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'enregistrer ce paiement", variant: "destructive" });
    }
  });

  // Quand on valide la modale
  const handleSavePayment = (amountDue: number, amountPaid: number) => {
    if (!modalChild) return;
    mutation.mutate({
      child: modalChild,
      pay: modalPay,
      amount_due: amountDue,
      amount_paid: amountPaid,
      year,
      month,
    });
    handleCloseModal();
  };

  // --- Start returning the UI ---
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingChildren || loadingPayments ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">Chargement...</TableCell>
              </TableRow>
            ) : !children || children.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">Aucun enfant trouvé.</TableCell>
              </TableRow>
            ) : (
              children.map(child => {
                const pay = (payments ?? []).find(p => p.child_id === child.id);
                return (
                  <MonthlyPaymentRow
                    key={pay ? pay.id : child.id}
                    child={child}
                    pay={pay}
                    onEdit={() => handleOpenModal(child, pay)}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modale paiement rapide */}
      <QuickPaymentModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePayment}
        initialAmountDue={
          modalPay
            ? (modalPay.amount_due + modalPay.registration_fee)
            : 10000
        }
        initialAmountPaid={modalPay ? modalPay.amount_paid : 0}
      />
      <div className="mt-4 text-xs text-muted-foreground">
        - Cliquez sur <b>Enregistrer un paiement</b> pour saisir ou ajuster un versement.<br />
        - Le statut et le reste à payer se mettent à jour automatiquement.<br />
        - Le paiement est considéré "Validé" seulement si la totalité est réglée.
      </div>
    </div>
  );
}

// Export types for reuse in MonthlyPaymentRow
export type { Payment, Child };
