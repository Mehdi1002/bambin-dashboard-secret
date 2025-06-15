
import { Trash } from "lucide-react";
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

type Props = {
  childrenRows: ChildRow[];
  onEdit: (c: ChildRow) => void;
  onDelete: (id: string) => void;
};

export default function ChildrenListTable({ childrenRows, onEdit, onDelete }: Props) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-muted">
            <th className="px-3 py-2 text-left">Nom</th>
            <th className="px-3 py-2 text-left">Prénom</th>
            <th className="px-3 py-2 text-left">Sexe</th>
            <th className="px-3 py-2 text-left">Date naissance</th>
            <th className="px-3 py-2 text-left">Section</th>
            <th className="px-3 py-2 text-left">Date inscription</th>
            <th className="px-3 py-2 text-left">Statut</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {childrenRows && childrenRows.length > 0 ? (
            childrenRows.map((c) => (
              <tr key={c.id} className="border-b hover:bg-muted/40">
                <td className="px-3 py-2 font-medium">{c.nom}</td>
                <td className="px-3 py-2">{c.prenom}</td>
                <td className="px-3 py-2">{c.sexe ?? ""}</td>
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
                <td className="px-3 py-2 flex gap-2 flex-wrap">
                  <button
                    className="text-primary hover:underline text-xs"
                    onClick={() => onEdit(c)}
                  >
                    Modifier
                  </button>
                  <button
                    className="text-destructive hover:underline text-xs"
                    onClick={() => onDelete(c.id)}
                  >
                    <Trash className="w-4 h-4 inline" /> Supprimer
                  </button>
                  <DocumentButtons
                    child={{
                      nom: c.nom,
                      prenom: c.prenom,
                      section: c.section,
                      sexe: c.sexe,
                      date_naissance: c.date_naissance
                    }}
                  />
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
  );
}
