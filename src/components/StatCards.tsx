
import { Users, ArrowUp, ArrowDown } from "lucide-react";

export default function StatCards() {
  // Placeholder, à connecter au contexte plus tard
  const inscrits = 18;
  const retard = 2;
  const sections = [
    { name: "Petite", count: 7 },
    { name: "Moyenne", count: 6 },
    { name: "Grande", count: 5 },
  ];
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-card rounded-lg shadow p-6 flex flex-col items-start border">
        <span className="text-muted-foreground mb-1 text-sm">Enfants inscrits</span>
        <div className="flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          <span className="text-2xl font-bold">{inscrits}</span>
        </div>
        <div className="flex mt-2 gap-2">
          {sections.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-xs text-primary font-normal mr-2"
            >
              {s.name} : {s.count}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg shadow p-6 flex flex-col items-start border">
        <span className="text-muted-foreground mb-1 text-sm">Paiements en retard</span>
        <div className="flex items-center gap-2">
          <ArrowDown className="w-7 h-7 text-destructive" />
          <span className="text-2xl font-bold text-destructive">{retard}</span>
        </div>
        <span className="text-muted-foreground mt-2 text-xs">Moins de 11 %</span>
      </div>
      <div className="bg-card rounded-lg shadow p-6 flex flex-col items-start border">
        <span className="text-muted-foreground mb-1 text-sm">Paiements validés ce mois</span>
        <div className="flex items-center gap-2">
          <ArrowUp className="w-7 h-7 text-green-600" />
          <span className="text-2xl font-bold text-green-600">{inscrits - retard}</span>
        </div>
        <span className="text-muted-foreground mt-2 text-xs">+Rappel automatique : bientôt</span>
      </div>
    </div>
  );
}
