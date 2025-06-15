import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, FileText, Check, ArrowDown, ArrowUp } from "lucide-react";
const nav = [{
  name: "Tableau de bord",
  to: "/",
  icon: FileText
}, {
  name: "Profil crèche",
  to: "/admin",
  icon: FileText
}, {
  name: "Enfants",
  to: "/enfants",
  icon: Users
}, {
  name: "Paiements",
  to: "/paiements",
  icon: Check
}, {
  name: "Facturation",
  to: "/facturation",
  icon: FileText
}, {
  name: "Documents",
  to: "/documents",
  icon: FileText
}];
export default function Layout({
  children
}: {
  children: ReactNode;
}) {
  const {
    pathname
  } = useLocation();
  return <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-10 py-4 border-b border-muted shadow-sm bg-slate-500">
        <div className="flex items-center gap-3">
          
          <span className="text-xl font-bold tracking-tight">
            L’île des Bambins
          </span>
        </div>
        <nav className="flex gap-2">
          {nav.map(item => <Link key={item.to} to={item.to} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium gap-2 hover:bg-muted transition ${pathname === item.to ? "bg-accent font-semibold" : ""}`}>
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>)}
        </nav>
      </header>
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-10 py-8">
        {children}
      </main>
    </div>;
}