
import { usePaiementRetardataires } from "@/hooks/useKpis";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

type Props = { prevMonth?: boolean };

export default function PaymentLateTable({ prevMonth = false }: Props) {
  const { data, isLoading, error } = usePaiementRetardataires({ prevMonth });
  if (isLoading) return <div>Chargement…</div>;
  if (error) return <div className="text-red-500">Erreur lors du chargement des retards</div>;
  if (!data || data.length === 0) return <div>Aucun retard</div>;

  // Affichage du nombre d'enfants en retard
  return (
    <div className="mt-3">
      <div className="font-semibold mb-2">
        {data.length} enfant{data.length > 1 ? "s" : ""} en retard
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Mois non payé</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.nom}</TableCell>
              <TableCell>{r.prenom}</TableCell>
              <TableCell>{`${String(r.month).padStart(2, "0")}/${r.year}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
