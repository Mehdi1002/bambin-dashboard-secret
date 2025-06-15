import { useState } from "react";
import ChildForm from "./ChildForm";
import { Plus, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import DocumentButtons from "./DocumentButtons";

type ChildRow = {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  section: "Petite" | "Moyenne" | "Prescolaire";
  date_inscription: string | null;
  statut: "Actif" | "Inactif";
  pere: string | null;
  tel_pere: string | null;
  mere: string | null;
  tel_mere: string | null;
  allergies: string | null;
  sexe: string | null;
};

export default function ChildTable() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<ChildRow | null>(null);

  // Récupère les enfants en veillant à gérer les nouvelles colonnes (photo retirée)
  const { data: children, isLoading, error } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Normalisation pour éviter les erreurs de typage :
      return (data || []).map((row: any) => ({
        id: row.id,
        nom: row.nom,
        prenom: row.prenom,
        date_naissance: row.date_naissance,
        section: row.section,
        date_inscription: row.date_inscription ?? "",
        statut: row.statut,
        pere: row.pere ?? "",
        tel_pere: row.tel_pere ?? "",
        mere: row.mere ?? "",
        tel_mere: row.tel_mere ?? "",
        allergies: row.allergies ?? "",
        sexe: row.sexe ?? ""
      })) as ChildRow[];
    },
  });

  const mutationUpsert = useMutation({
    mutationFn: async (child: any) => {
      const row = {
        ...child,
        date_naissance: child.date_naissance ?? child.dateNaissance,
        date_inscription: child.date_inscription ?? child.dateInscription,
        tel_pere: child.tel_pere ?? child.telPere,
        tel_mere: child.tel_mere ?? child.telMere
      };
      delete row.dateNaissance;
      delete row.dateInscription;
      delete row.telPere;
      delete row.telMere;

      if (row.id) {
        // update
        const { data, error } = await supabase
          .from("children")
          .update(row)
          .eq("id", row.id)
          .select();
        if (error) throw error;
        return data?.[0];
      } else {
        // création : NE PAS inclure la clé `id` (sinon null !)
        const insertRow = { ...row };
        delete insertRow.id;
        const { data, error } = await supabase
          .from("children")
          .insert([insertRow])
          .select();
        if (error) throw error;
        return data?.[0];
      }
    },
    onSuccess: () => {
      toast({ title: "Succès", description: "Enfant sauvegardé !" });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setShowForm(false);
      setEdit(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erreur", description: "Problème lors de la sauvegarde." });
    },
  });

  const mutationDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("children").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Enfant supprimé !" });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erreur", description: "Suppression impossible." });
    },
  });

  const handleAdd = () => {
    setEdit(null);
    setShowForm(true);
  };

  const handleEdit = (child: ChildRow) => {
    setEdit(child);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer cet enfant ?")) {
      mutationDelete.mutate(id);
    }
  };

  const handleSubmit = (c: any) => {
    const isUpdate = !!edit?.id;
    mutationUpsert.mutate({
      ...c,
      ...(isUpdate ? { id: edit.id } : {}),
    });
  };

  if (isLoading) {
    return <div>Chargement…</div>;
  }
  if (error) {
    return <div>Erreur de chargement…</div>;
  }

  return (
    <div>
      {showForm && (
        <ChildForm
          initial={edit ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      {!showForm && (
        <>
          <div className="flex justify-end mb-3">
            <button
              onClick={handleAdd}
              className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/80 transition text-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un enfant
            </button>
          </div>
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-muted">
                  {/* <th className="px-3 py-2 text-left">Photo</th> Retiré */}
                  <th className="px-3 py-2 text-left">Nom</th>
                  <th className="px-3 py-2 text-left">Prénom</th>
                  <th className="px-3 py-2 text-left">Sexe</th>
                  <th className="px-3 py-2 text-left">Date naissance</th>
                  <th className="px-3 py-2 text-left">Section</th>
                  {/* Suppression des colonnes documents parents */}
                  <th className="px-3 py-2 text-left">Date inscription</th>
                  <th className="px-3 py-2 text-left">Statut</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {children && children.length > 0 ? (
                  children.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/40">
                      {/* Photo retirée */}
                      <td className="px-3 py-2 font-medium">{c.nom}</td>
                      <td className="px-3 py-2">{c.prenom}</td>
                      <td className="px-3 py-2">{c.sexe ?? ""}</td>
                      <td className="px-3 py-2">{c.date_naissance}</td>
                      <td className="px-3 py-2">{c.section}</td>
                      {/* Suppression des colonnes doc parents */}
                      <td className="px-3 py-2">{c.date_inscription ?? ""}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            c.statut === "Actif"
                              ? "bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
                              : "bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs"
                          }
                        >
                          {c.statut}
                        </span>
                      </td>
                      <td className="px-3 py-2 flex gap-2 flex-wrap">
                        <button
                          className="text-primary hover:underline text-xs"
                          onClick={() => handleEdit(c)}
                        >
                          Modifier
                        </button>
                        <button
                          className="text-destructive hover:underline text-xs"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash className="w-4 h-4 inline" /> Supprimer
                        </button>
                        {/* DocumentButtons conserve juste l'essentiel */}
                        <DocumentButtons child={{
                          nom: c.nom,
                          prenom: c.prenom,
                          section: c.section,
                          sexe: c.sexe,
                          date_naissance: c.date_naissance
                        }} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-5 text-center text-muted-foreground">
                      Aucun enfant enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
