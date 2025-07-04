
import { Trash } from "lucide-react";
import DocumentButtons from "./DocumentButtons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Prénom</TableHead>
          <TableHead>Sexe</TableHead>
          <TableHead>Date naissance</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Date inscription</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {childrenRows && childrenRows.length > 0 ? (
          childrenRows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.nom}</TableCell>
              <TableCell>{c.prenom}</TableCell>
              <TableCell>{c.sexe ?? ""}</TableCell>
              <TableCell>{c.date_naissance}</TableCell>
              <TableCell>{c.section}</TableCell>
              <TableCell>{c.date_inscription ?? ""}</TableCell>
              <TableCell>
                <span
                  className={
                    c.statut === "Actif"
                      ? "bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
                      : "bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs"
                  }
                >
                  {c.statut}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
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
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="p-5 text-center text-muted-foreground">
              {childrenRows.length === 0 ? "Aucun enfant trouvé pour cette recherche." : "Aucun enfant enregistré."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
