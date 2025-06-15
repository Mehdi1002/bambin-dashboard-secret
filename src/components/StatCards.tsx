
import { Users } from "lucide-react";
import { useSectionsCount, useCurrentMonthPaymentsCount, useChildrenCount } from "@/hooks/useKpis";

export default function StatCards() {
  // KPIs dynamiques
  const { data: sections, isLoading: loadingSections } = useSectionsCount();
  const { data: paidCount, isLoading: loadingPaid } = useCurrentMonthPaymentsCount();
  const { data: childrenCount, isLoading: loadingChildren } = useChildrenCount();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
      <div className="bg-card rounded-lg shadow p-6 flex flex-col items-start border min-h-[120px]">
        <span className="text-muted-foreground mb-1 text-sm">Nombre total d'enfants</span>
        <div className="flex items-center gap-2 mt-2">
          <Users className="text-primary w-6 h-6" />
          <span className="text-2xl font-bold">{loadingChildren ? "…" : childrenCount ?? 0}</span>
        </div>
        <span className="mt-2 text-xs text-muted-foreground">Enfants actifs uniquement</span>
      </div>
      <div className="bg-card rounded-lg shadow p-6 flex flex-col items-start border min-h-[120px]">
        <span className="text-muted-foreground mb-1 text-sm">Enfants par section</span>
        {loadingSections ? (
          <span>Chargement…</span>
        ) : (
          <div className="flex flex-col gap-1 mt-2 w-full">
            {sections?.length
              ? sections.map((s: any) => (
                  <span key={s.section} className="font-medium text-base">
                    {s.section} : <span className="font-bold">{s.count}</span>
                  </span>
                ))
              : <span className="text-muted-foreground text-xs">Aucune donnée</span>}
          </div>
        )}
      </div>
      <div className="bg-card rounded-lg shadow p-6 flex flex-col items-start border min-h-[120px]">
        <span className="text-muted-foreground mb-1 text-sm">Paiements reçus</span>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold">{loadingPaid ? "…" : paidCount ?? 0}</span>
        </div>
        <span className="mt-2 text-xs text-muted-foreground">Mois : {new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="bg-card rounded-lg shadow p-6 flex flex-col items-start border min-h-[120px]">
        <span className="text-muted-foreground mb-1 text-sm">Statut global</span>
        <div className="mt-2">
          <span className="text-green-700 font-bold">✓ Système à jour</span>
        </div>
        <span className="text-muted-foreground mt-2 text-xs">Données dynamiques</span>
      </div>
    </div>
  );
}
