
import Layout from "@/components/Layout";
import ChildTable from "@/components/ChildTable";

export default function ChildrenList() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Enfants inscrits</h1>
      <ChildTable />
    </Layout>
  );
}
