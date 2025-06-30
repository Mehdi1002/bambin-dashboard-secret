
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
