
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";

export function useSectionsCount() {
  // Nombre d'enfants par section, sous forme : [{ section: string, count: number }]
  return useQuery({
    queryKey: ['kpi', 'section-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('section, count:section')
        .group('section');
      if (error) throw error;
      return data ?? [];
    }
  });
}

export function useCurrentMonthPaymentsCount() {
  // Nombre d'enfants ayant payé pour le mois courant (champ validated=true)
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
      // On veut le nombre d'enfants ayant payé, donc il faut compter les child_id distincts
      const unique = Array.from(new Set((data ?? []).map((p: any) => p.child_id)));
      return unique.length;
    }
  });
}

/**
 * KPIs retards de paiement pour un mois donné (par défaut : mois courant OU mois -1)
 * Retourne : [{ nom, prenom, month, year }]
 */
export function usePaiementRetardataires({ prevMonth }: { prevMonth: boolean }) {
  // Le mois à vérifier
  const today = new Date();
  const date = prevMonth
    ? subMonths(today, 1)
    : today;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return useQuery({
    queryKey: ['kpi', 'paiement-retardataires', year, month],
    queryFn: async () => {
      // On récupère ceux dont validated=false pour ce mois, et le lien avec l'enfant
      const { data, error } = await supabase
        .from('payments')
        .select('child_id, month, year')
        .eq('year', year)
        .eq('month', month)
        .eq('validated', false);

      if (error) throw error;

      if (!data || !data.length) return [];

      // Récupérer les informations enfants en batch
      const enfantsIds = data.map((p) => p.child_id);
      const { data: enfants, error: errorEnfants } = await supabase
        .from('children')
        .select('id, nom, prenom')
        .in('id', enfantsIds);

      if (errorEnfants) throw errorEnfants;

      // Rejoint noms/prénoms + mois
      return data.map((r) => {
        const enfant = enfants?.find((e) => e.id === r.child_id);
        return {
          nom: enfant?.nom ?? "",
          prenom: enfant?.prenom ?? "",
          month: r.month,
          year: r.year,
        };
      });
    }
  });
}

