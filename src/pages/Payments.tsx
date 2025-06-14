import Layout from "@/components/Layout";
import MonthlyPaymentsTable from "@/components/MonthlyPaymentsTable";

export default function Payments() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Gestion des paiements</h1>
      <MonthlyPaymentsTable />
    </Layout>
  );
}
