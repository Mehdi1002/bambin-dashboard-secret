
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useKpis = () => {
  return useQuery({
    queryKey: ["kpis"],
    queryFn: async () => {
      // Get total children count
      const { data: children, error: childrenError } = await supabase
        .from("children")
        .select("id")
        .eq("statut", "Actif");
      
      if (childrenError) throw childrenError;
      const totalChildren = children?.length || 0;
      const activeChildren = totalChildren;

      // Get current month payments stats
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear);

      if (paymentsError) throw paymentsError;

      const totalPaid = payments?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;
      const totalDue = payments?.reduce((sum, p) => sum + p.amount_due + p.registration_fee, 0) || 0;
      const validatedPayments = payments?.filter(p => p.validated).length || 0;

      return {
        totalChildren,
        activeChildren,
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
      const { data, error } = await supabase
        .from("children")
        .select("id")
        .eq("statut", "Actif");
      
      if (error) throw error;
      return data?.length || 0;
    },
  });
};

export const useSectionsCount = () => {
  return useQuery({
    queryKey: ["sections-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("section")
        .eq("statut", "Actif");
      
      if (error) throw error;
      
      const sectionCounts = (data || []).reduce((acc: any, child) => {
        const section = child.section || "Non définie";
        acc[section] = (acc[section] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(sectionCounts).map(([section, count]) => ({
        section,
        count: count as number
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
      
      const { data, error } = await supabase
        .from("payments")
        .select("id")
        .eq("year", currentYear)
        .eq("month", currentMonth)
        .eq("validated", true);
      
      if (error) throw error;
      return data?.length || 0;
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

      // Get active children
      const { data: activeChildren, error: childrenError } = await supabase
        .from("children")
        .select("id, nom, prenom")
        .eq("statut", "Actif");

      if (childrenError) throw childrenError;

      // Get paid children for the target month
      const { data: paidPayments, error: paymentsError } = await supabase
        .from("payments")
        .select("child_id")
        .eq("month", targetMonth)
        .eq("year", targetYear)
        .eq("validated", true);

      if (paymentsError) throw paymentsError;

      const paidChildrenIds = new Set(paidPayments?.map(p => p.child_id) || []);

      const latePayments = (activeChildren || [])
        .filter(child => !paidChildrenIds.has(child.id))
        .map(child => ({
          nom: child.nom,
          prenom: child.prenom,
          month: targetMonth,
          year: targetYear
        }));

      return latePayments;
    },
  });
};
