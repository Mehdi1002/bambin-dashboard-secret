import { useState } from "react";
import ChildForm from "./ChildForm";
import { Plus, Download, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import DocumentButtons from "./DocumentButtons";
import ChildrenListTable from "./ChildrenListTable";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchTerm, setSearchTerm] = useState("");

  // Récupère les enfants en veillant à gérer les nouvelles colonnes
  const { data: children, isLoading, error } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("[ChildTable] Erreur lors de la récupération:", error);
        throw error;
      }
      
      // Normalisation pour éviter les erreurs de typage
      return (data || []).map((row: any) => ({
        id: row.id,
        nom: row.nom || "",
        prenom: row.prenom || "",
        date_naissance: row.date_naissance,
        section: row.section || "Petite",
        date_inscription: row.date_inscription || null,
        statut: row.statut || "Actif",
        pere: row.pere || null,
        tel_pere: row.tel_pere || null,
        mere: row.mere || null,
        tel_mere: row.tel_mere || null,
        allergies: row.allergies || null,
        sexe: row.sexe || null
      })) as ChildRow[];
    },
  });

  // Filter children based on search term
  const filteredChildren = children?.filter((child) =>
    child.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const mutationUpsert = useMutation({
    mutationFn: async (child: any) => {
      console.log("[ChildTable] Données reçues:", child);
      
      // Nettoyer et préparer les données avec gestion correcte des valeurs vides
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
        // Gestion des champs de documents
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
      if (error) {
        console.error("[ChildTable] Erreur suppression:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Enfant supprimé !" });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
    onError: (error: any) => {
      console.error("[ChildTable] Erreur suppression:", error);
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: "Suppression impossible." 
      });
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

  const handleExportCSV = () => {
    if (!children || children.length === 0) {
      toast({
        variant: "destructive",
        title: "Aucune donnée",
        description: "Aucun enfant à exporter."
      });
      return;
    }

    // Préparer les données pour l'export CSV
    const csvData = children.map(child => ({
      "Nom": child.nom,
      "Prénom": child.prenom,
      "Date de naissance": child.date_naissance,
      "Date d'inscription": child.date_inscription || "",
      "Section": child.section
    }));

    // Générer le CSV
    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ";"
    });

    // Créer et télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `enfants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: "La liste des enfants a été exportée en CSV."
    });
  };

  if (isLoading) {
    return <div>Chargement…</div>;
  }
  if (error) {
    return <div>Erreur de chargement: {error.message}</div>;
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
          <div className="flex justify-between mb-3 gap-3 flex-wrap">
            <button
              onClick={handleAdd}
              className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/80 transition text-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un enfant
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou prénom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table with scroll area */}
          <ScrollArea className="h-[600px] border rounded-lg">
            <ChildrenListTable
              childrenRows={filteredChildren}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </ScrollArea>
        </>
      )}
    </div>
  );
}
