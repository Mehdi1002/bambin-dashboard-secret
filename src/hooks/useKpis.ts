
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/services/mockData";

export const useKpis = () => {
  return useQuery({
    queryKey: ["kpis"],
    queryFn: async () => {
      // Get total children count
      const totalChildren = await mockApi.getChildrenCount();

      // Get active children count (same as total since we filter active)
      const activeChildren = totalChildren;

      // Get current month payments stats
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const payments = await mockApi.getPayments(currentMonth, currentYear);

      const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);
      const totalDue = payments.reduce((sum, p) => sum + p.amount_due + p.registration_fee, 0);
      const validatedPayments = payments.filter(p => p.validated).length;

      return {
        totalChildren,
        activeChildren,
        totalPaid,
        totalDue,
        validatedPayments,
        pendingPayments: payments.length - validatedPayments
      };
    },
  });
};

export const useChildrenCount = () => {
  return useQuery({
    queryKey: ["children-count"],
    queryFn: async () => {
      return await mockApi.getChildrenCount();
    },
  });
};

export const useSectionsCount = () => {
  return useQuery({
    queryKey: ["sections-count"],
    queryFn: async () => {
      return await mockApi.getSectionsCount();
    },
  });
};

export const useCurrentMonthPaymentsCount = () => {
  return useQuery({
    queryKey: ["current-month-payments-count"],
    queryFn: async () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      return await mockApi.getValidatedPaymentsCount(currentYear, currentMonth);
    },
  });
};

export const usePaiementRetardataires = ({ prevMonth = false }: { prevMonth?: boolean }) => {
  return useQuery({
    queryKey: ["paiement-retardataires", prevMonth],
    queryFn: async () => {
      return await mockApi.getLatePayments(prevMonth);
    },
  });
};
