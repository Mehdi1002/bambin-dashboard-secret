
import Layout from "@/components/Layout";
import StatCards from "@/components/StatCards";
import PaymentLateTable from "@/components/PaymentLateTable";

export default function Index() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Tableau de bord</h1>
      <StatCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow p-6 border">
          <h2 className="text-lg font-semibold mb-2">🔸 Retards pour le mois précédent</h2>
          <PaymentLateTable prevMonth />
        </div>
        <div className="bg-white rounded-lg shadow p-6 border">
          <h2 className="text-lg font-semibold mb-2">🔸 Retards pour le mois en cours</h2>
          <PaymentLateTable />
        </div>
      </div>
    </Layout>
  );
}
