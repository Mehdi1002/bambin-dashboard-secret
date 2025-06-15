import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, lastDayOfMonth } from "date-fns";

// Retourne [{ section: string, count: number }]
export function useSectionsCount() {
  return useQuery({
    queryKey: ['kpi', 'section-count'],
    queryFn: async () => {
      // On récupère toutes les sections
      const { data, error } = await supabase
        .from('children')
        .select('section');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data ?? []).forEach((row: any) => {
        if (row.section) {
          counts[row.section] = (counts[row.section] || 0) + 1;
        }
      });
      // On renvoie au format [{ section, count }]
      return Object.entries(counts).map(([section, count]) => ({ section, count }));
    }
  });
}

export function useCurrentMonthPaymentsCount() {
  return useQuery({
    queryKey: ['kpi', 'current-month-payments'],
    queryFn: async () => {
      const date = new Date();
      const { data, error } = await supabase
        .from('payments')
        .select('child_id', { count: 'exact', head: false })
        .eq('year', date.getFullYear())
        .eq('month', date.getMonth() + 1)
        .eq('validated', true);
      if (error) throw error;
      const unique = Array.from(new Set((data ?? []).map((p: any) => p.child_id)));
      return unique.length;
    }
  });
}

/**
 * Nombre total d'enfants inscrits (hors archivés/supprimés).
 */
export function useChildrenCount() {
  return useQuery({
    queryKey: ['kpi', 'children-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('id, statut');
      if (error) throw error;
      // On ne compte que les enfants actifs
      const actifs = (data ?? []).filter((e: any) =>
        e.statut !== "archivé" && e.statut !== "supprimé"
      );
      return actifs.length;
    }
  });
}

/**
 * KPIs retards de paiement pour un mois donné (par défaut : mois courant OU mois -1)
 * Retourne : [{ nom, prenom, month, year }]
 */
export function usePaiementRetardataires({ prevMonth }: { prevMonth: boolean }) {
  const today = new Date();
  const date = prevMonth
    ? subMonths(today, 1)
    : today;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDay = lastDayOfMonth(date);

  return useQuery({
    queryKey: ['kpi', 'paiement-retardataires', year, month],
    queryFn: async () => {
      // 1. Récupérer tous les enfants inscrits (statut différent d'archive/supprimé ? au besoin)
      const { data: enfants, error: errorEnfants } = await supabase
        .from('children')
        .select('id, nom, prenom, statut, date_inscription');
      if (errorEnfants) throw errorEnfants;

      // Seuls ceux actifs et inscrits (date_inscription <= dernier jour du mois concerné)
      const enfantsInscrits = (enfants ?? []).filter((e: any) =>
        e.statut !== 'archivé' &&
        e.statut !== 'supprimé' &&
        e.date_inscription !== null &&
        new Date(e.date_inscription) <= lastDay
      );

      // 2. Récupérer TOUS les paiements du mois/année ciblé
      const { data: paiements, error: errorPaiements } = await supabase
        .from('payments')
        .select('child_id, validated')
        .eq('year', year)
        .eq('month', month);

      if (errorPaiements) throw errorPaiements;

      // 3. Lister les IDs des enfants qui ont AU MOINS un paiement validé (=> ne sont PAS en retard)
      const enfantsAvecPaiementValide = new Set(
        (paiements ?? [])
          .filter((p: any) => p.validated === true)
          .map((p: any) => p.child_id)
      );

      // 4. Les "retardataires" sont les enfants inscrits à cette date, sans paiement validé
      const retardataires = enfantsInscrits
        .filter((e: any) => !enfantsAvecPaiementValide.has(e.id))
        .map((e: any) => ({
          nom: e.nom,
          prenom: e.prenom,
          month,
          year,
        }));

      return retardataires;
    }
  });
}
