
import Layout from "@/components/Layout";
import AdminProfileForm from "@/components/AdminProfileForm";

export default function AdminProfile() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Profil administratif</h1>
      <AdminProfileForm />
    </Layout>
  );
}
