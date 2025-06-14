
// Page dashboard synthétique

import Layout from "@/components/Layout";
import StatCards from "@/components/StatCards";

// Les stats sont fictives pour la V1
export default function Index() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
      <StatCards />
    </Layout>
  );
}
