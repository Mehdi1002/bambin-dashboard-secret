
import { useState } from "react";
import ChildForm from "./ChildForm";
import { Plus, Trash } from "lucide-react";
import avatar from "/placeholder.svg";

type Child = {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  section: "Petite" | "Moyenne" | "Grande";
  dateInscription: string;
  statut: "Actif" | "Inactif";
  photo?: string;
};

const initial: Child[] = [
  {
    id: 1,
    nom: "BOUCHAKOUR",
    prenom: "Yasmine",
    dateNaissance: "2018-09-13",
    section: "Grande",
    dateInscription: "2023-09-01",
    statut: "Actif",
    photo: "",
  },
  {
    id: 2,
    nom: "AHMED",
    prenom: "Adem",
    dateNaissance: "2020-03-05",
    section: "Moyenne",
    dateInscription: "2024-02-11",
    statut: "Actif",
    photo: "",
  },
];

export default function ChildTable() {
  const [children, setChildren] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<Child | null>(null);

  const handleAdd = () => {
    setEdit(null);
    setShowForm(true);
  };

  const handleEdit = (child: Child) => {
    setEdit(child);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Supprimer cet enfant ?")) {
      setChildren(children.filter((c) => c.id !== id));
    }
  };

  const handleSubmit = (c: Child) => {
    if (edit) {
      setChildren(children.map((child) => (child.id === c.id ? c : child)));
    } else {
      setChildren([...children, { ...c, id: Date.now() }]);
    }
    setShowForm(false);
  };

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
                {children.map((c) => (
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
                    <td className="px-3 py-2">{c.dateNaissance}</td>
                    <td className="px-3 py-2">{c.section}</td>
                    <td className="px-3 py-2">{c.dateInscription}</td>
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
                ))}
                {children.length === 0 && (
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
