
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Clock, X, Edit } from "lucide-react";
import type { Payment, Child } from "./MonthlyPaymentsTable";

type MonthlyPaymentRowProps = {
  child: Child;
  pay: Payment | null | undefined;
  onEdit: () => void;
  month: number;
  monthInscription: number | null;
  onInvoice: () => void;
};

export default function MonthlyPaymentRow({
  child,
  pay,
  onEdit,
  month,
  monthInscription,
  onInvoice,
}: MonthlyPaymentRowProps) {
  const showInscriptionFee = monthInscription && month === monthInscription;

  const totalDue = pay
    ? pay.amount_due + (showInscriptionFee ? pay.registration_fee : 0)
    : showInscriptionFee
      ? 10000 // suppose le montant par défaut inclut les frais d'inscription
      : 10000;
  const registrationFee = pay && showInscriptionFee ? pay.registration_fee : 0;
  const amountPaid = pay ? pay.amount_paid : 0;
  const reste = Math.max(totalDue - amountPaid, 0);
  const isValidated = pay ? pay.validated : false;
  
  // Status
  let statusLabel: { label: string, icon: React.ReactNode };
  if (!pay) {
    statusLabel = { label: "Non payé", icon: <X className="text-red-500 w-4 h-4 inline" /> };
  } else if (isValidated) {
    statusLabel = { label: "Validé", icon: <Check className="text-green-600 w-4 h-4 inline" /> };
  } else if (amountPaid === 0) {
    statusLabel = { label: "Retard", icon: <X className="text-red-500 w-4 h-4 inline" /> };
  } else if (amountPaid < totalDue) {
    statusLabel = { label: "Retard", icon: <Clock className="text-yellow-500 w-4 h-4 inline" /> };
  } else {
    statusLabel = { label: "À valider", icon: <Clock className="text-blue-500 w-4 h-4 inline" /> };
  }

  return (
    <TableRow>
      <TableCell>{child.nom}</TableCell>
      <TableCell>{child.prenom}</TableCell>
      <TableCell>{child.section}</TableCell>
      <TableCell>{totalDue}</TableCell>
      <TableCell>{registrationFee}</TableCell>
      <TableCell>{amountPaid}</TableCell>
      <TableCell>{reste}</TableCell>
      <TableCell>
        <span className="flex items-center gap-1">
          {statusLabel.icon}
          <span>{statusLabel.label}</span>
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 flex-wrap">
          {/* Bouton pour enregistrer/modifier un paiement - toujours disponible */}
          <Button
            size="sm"
            variant="default"
            className="px-2 py-1"
            onClick={onEdit}
          >
            {pay ? "Modifier" : "Enregistrer un paiement"}
          </Button>
          
          {/* Bouton modifier supplémentaire pour les paiements validés */}
          {pay && pay.validated && (
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-1"
              onClick={onEdit}
            >
              <Edit className="w-3 h-3 mr-1" />
              Corriger
            </Button>
          )}
          
          {/* Bouton facture - disponible seulement si validé */}
          {pay && pay.validated ? (
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-1"
              onClick={onInvoice}
            >
              Facture
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-1"
              disabled
            >
              Facture
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
