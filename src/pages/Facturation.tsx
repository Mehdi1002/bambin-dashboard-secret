
import Layout from "@/components/Layout";
import MultiMonthInvoicing from "@/components/MultiMonthInvoicing";

export default function Facturation() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Facturation (plusieurs mois)</h1>
      <MultiMonthInvoicing />
    </Layout>
  );
}

