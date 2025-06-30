
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useKpis = () => {
  return useQuery({
    queryKey: ["kpis"],
    queryFn: async () => {
      // Get total children count
      const { count: totalChildren } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true });

      // Get active children count
      const { count: activeChildren } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true })
        .eq("statut", "Actif");

      // Get current month payments stats
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: payments } = await supabase
        .from("payments")
        .select("amount_paid, amount_due, registration_fee, validated")
        .eq("month", currentMonth)
        .eq("year", currentYear);

      const totalPaid = payments?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;
      const totalDue = payments?.reduce((sum, p) => sum + p.amount_due + p.registration_fee, 0) || 0;
      const validatedPayments = payments?.filter(p => p.validated).length || 0;

      return {
        totalChildren: totalChildren || 0,
        activeChildren: activeChildren || 0,
        totalPaid,
        totalDue,
        validatedPayments,
        pendingPayments: (payments?.length || 0) - validatedPayments
      };
    },
  });
};

export const useChildrenCount = () => {
  return useQuery({
    queryKey: ["children-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true })
        .eq("statut", "Actif");
      return count || 0;
    },
  });
};

export const useSectionsCount = () => {
  return useQuery({
    queryKey: ["sections-count"],
    queryFn: async () => {
      const { data } = await supabase
        .from("children")
        .select("section")
        .eq("statut", "Actif");

      if (!data) return [];

      const sectionCounts = data.reduce((acc: any, child) => {
        const section = child.section || "Non définie";
        acc[section] = (acc[section] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(sectionCounts).map(([section, count]) => ({
        section,
        count
      }));
    },
  });
};

export const useCurrentMonthPaymentsCount = () => {
  return useQuery({
    queryKey: ["current-month-payments-count"],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { count } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .eq("validated", true);

      return count || 0;
    },
  });
};

export const usePaiementRetardataires = ({ prevMonth = false }: { prevMonth?: boolean }) => {
  return useQuery({
    queryKey: ["paiement-retardataires", prevMonth],
    queryFn: async () => {
      const now = new Date();
      const targetMonth = prevMonth ? now.getMonth() : now.getMonth() + 1;
      const targetYear = prevMonth && now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

      // Get children who don't have payments for the target month
      const { data: children } = await supabase
        .from("children")
        .select("id, nom, prenom")
        .eq("statut", "Actif");

      if (!children) return [];

      const { data: payments } = await supabase
        .from("payments")
        .select("child_id")
        .eq("month", targetMonth)
        .eq("year", targetYear)
        .eq("validated", true);

      const paidChildrenIds = new Set(payments?.map(p => p.child_id) || []);

      return children
        .filter(child => !paidChildrenIds.has(child.id))
        .map(child => ({
          ...child,
          month: targetMonth,
          year: targetYear
        }));
    },
  });
};
