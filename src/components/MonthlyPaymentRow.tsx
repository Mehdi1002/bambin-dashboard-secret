
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Clock, X } from "lucide-react";
import type { Payment, Child } from "./MonthlyPaymentsTable";

type MonthlyPaymentRowProps = {
  child: Child;
  pay: Payment | null | undefined;
  onEdit: (pay: Payment) => void;
};

export default function MonthlyPaymentRow({ child, pay, onEdit }: MonthlyPaymentRowProps) {
  if (!pay) {
    // Paiement non généré (no payment for this child/month)
    return (
      <TableRow key={child.id}>
        <TableCell>{child.nom}</TableCell>
        <TableCell>{child.prenom}</TableCell>
        <TableCell>{child.section}</TableCell>
        <TableCell colSpan={6} className="italic text-muted-foreground">
          Paiement non généré
        </TableCell>
      </TableRow>
    );
  }

  const totalDue = pay.amount_due + pay.registration_fee;
  const reste = Math.max(totalDue - pay.amount_paid, 0);
  const isValidated = pay.validated;
  const statusLabel = isValidated
    ? { label: "Validé", icon: <Check className="text-green-600 w-4 h-4 inline" /> }
    : (pay.amount_paid === 0
      ? { label: "Retard", icon: <X className="text-red-500 w-4 h-4 inline" /> }
      : (pay.amount_paid < totalDue
        ? { label: "Retard", icon: <Clock className="text-yellow-500 w-4 h-4 inline" /> }
        : { label: "À valider", icon: <Clock className="text-blue-500 w-4 h-4 inline" /> })
    );

  return (
    <TableRow key={pay.id}>
      <TableCell>{child.nom}</TableCell>
      <TableCell>{child.prenom}</TableCell>
      <TableCell>{child.section}</TableCell>
      <TableCell>{pay.amount_due}</TableCell>
      <TableCell>{pay.registration_fee}</TableCell>
      <TableCell>{pay.amount_paid}</TableCell>
      <TableCell>{reste}</TableCell>
      <TableCell>
        <span className="flex items-center gap-1">
          {statusLabel.icon}
          <span>{statusLabel.label}</span>
        </span>
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="default"
          className="px-2 py-1"
          onClick={() => onEdit(pay)}
        >
          Enregistrer un paiement
        </Button>
      </TableCell>
    </TableRow>
  );
}
