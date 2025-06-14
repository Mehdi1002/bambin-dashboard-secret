import { useState } from "react";
import ChildForm from "./ChildForm";
import { Plus, Trash } from "lucide-react";
import avatar from "/placeholder.svg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
  photo: string | null;
};

export default function ChildTable() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<ChildRow | null>(null);

  // Charge les enfants depuis Supabase
  const { data: children, isLoading, error } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ChildRow[];
    },
  });

  // Ajout/enregistrement : mapping snake_case avant mutation
  const mutationUpsert = useMutation({
    mutationFn: async (child: any) => {
      const row = {
        ...child,
        // On s'assure que les clés sont en snake_case !
        date_naissance: child.date_naissance ?? child.dateNaissance, // on accepte date_naissance (normal) ou dateNaissance (remonté du formulaire)
        date_inscription: child.date_inscription ?? child.dateInscription,
        tel_pere: child.tel_pere ?? child.telPere,
        tel_mere: child.tel_mere ?? child.telMere,
        // camelCase à snake_case
        photo: child.photo ?? null,
      };
      // Élimine toutes les variantes camelCase pour éviter la confusion
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
        // insert
        const { data, error } = await supabase
          .from("children")
          .insert([row])
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

  // Suppression
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
    mutationUpsert.mutate({
      ...c,
      id: edit?.id,
      // Les clés sont déjà en snake_case depuis ChildForm
    });
  };

  // Chargement/erreur
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
                  <th className="px-3 py-2 text-left">Photo</th>
                  <th className="px-3 py-2 text-left">Nom</th>
                  <th className="px-3 py-2 text-left">Prénom</th>
                  <th className="px-3 py-2 text-left">Date naissance</th>
                  <th className="px-3 py-2 text-left">Section</th>
                  <th className="px-3 py-2 text-left">Date inscription</th>
                  <th className="px-3 py-2 text-left">Statut</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {children && children.length > 0 ? (
                  children.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/40">
                      <td className="px-3 py-2">
                        {c.photo ? (
                          <img
                            src={c.photo}
                            alt={c.nom}
                            className="w-10 h-10 rounded-full border object-cover"
                          />
                        ) : (
                          <img
                            src={avatar}
                            alt="Enfant"
                            className="w-10 h-10 rounded-full border object-cover opacity-80"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">{c.nom}</td>
                      <td className="px-3 py-2">{c.prenom}</td>
                      <td className="px-3 py-2">{c.date_naissance}</td>
                      <td className="px-3 py-2">{c.section}</td>
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
                      <td className="px-3 py-2 flex gap-2">
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
