import { useState } from "react";
import ChildForm from "./ChildForm";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import DocumentButtons from "./DocumentButtons";
import ChildrenCsvImport from "./ChildrenCsvImport";
import ChildrenListTable from "./ChildrenListTable";

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
  const [showCsvImport, setShowCsvImport] = useState(false);

  // Récupère les enfants en veillant à gérer les nouvelles colonnes (photo retirée)
  const { data: children, isLoading, error } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Normalisation pour éviter les erreurs de typage :
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
      console.log("[ChildTable] Données reçues:", child);
      
      // Nettoyer et préparer les données
      const cleanedData = {
        nom: child.nom || "",
        prenom: child.prenom || "",
        date_naissance: child.date_naissance,
        section: child.section || "Petite",
        date_inscription: child.date_inscription || null,
        statut: child.statut || "Actif",
        pere: child.pere || null,
        tel_pere: child.tel_pere || null,
        mere: child.mere || null,
        tel_mere: child.tel_mere || null,
        allergies: child.allergies || null,
        sexe: child.sexe || null,
        type_doc_pere: child.type_doc_pere || null,
        num_doc_pere: child.num_doc_pere || null,
        type_doc_mere: child.type_doc_mere || null,
        num_doc_mere: child.num_doc_mere || null,
      };

      console.log("[ChildTable] Données nettoyées:", cleanedData);

      if (child.id) {
        // Mise à jour
        const { data, error } = await supabase
          .from("children")
          .update(cleanedData)
          .eq("id", child.id)
          .select();
        
        if (error) {
          console.error("[ChildTable] Erreur mise à jour:", error);
          throw error;
        }
        return data?.[0];
      } else {
        // Création
        const { data, error } = await supabase
          .from("children")
          .insert([cleanedData])
          .select();
        
        if (error) {
          console.error("[ChildTable] Erreur création:", error);
          throw error;
        }
        return data?.[0];
      }
    },
    onSuccess: () => {
      toast({ title: "Succès", description: "Enfant sauvegardé !" });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setShowForm(false);
      setEdit(null);
    },
    onError: (error: any) => {
      console.error("[ChildTable] Erreur sauvegarde:", error);
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: `Problème lors de la sauvegarde: ${error?.message || "Erreur inconnue"}` 
      });
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
    if (confirm("Supprimer cet enfant ?")) {
      mutationDelete.mutate(id);
    }
  };

  const handleSubmit = (formData: any) => {
    console.log("[ChildTable] Soumission formulaire:", formData);
    const dataToSave = {
      ...formData,
      ...(edit?.id ? { id: edit.id } : {}),
    };
    mutationUpsert.mutate(dataToSave);
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
      {showCsvImport && (
        <ChildrenCsvImport
          onClose={() => setShowCsvImport(false)}
          onSuccess={() => {
            setShowCsvImport(false);
            queryClient.invalidateQueries({ queryKey: ["children"] });
          }}
        />
      )}
      {!showForm && !showCsvImport && (
        <>
          <div className="flex justify-between mb-3 gap-3 flex-wrap">
            <button
              onClick={handleAdd}
              className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/80 transition text-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un enfant
            </button>
            <button
              onClick={() => setShowCsvImport(true)}
              className="flex items-center bg-muted text-primary border border-primary px-4 py-2 rounded hover:bg-muted/80 transition text-sm gap-2"
            >
              Importer CSV
            </button>
          </div>
          <ChildrenListTable
            childrenRows={children}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
