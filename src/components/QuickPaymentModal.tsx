
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (amountDue: number, amountPaid: number, registrationFee?: number) => void;
  initialAmountDue: number;
  initialAmountPaid: number;
  inscriptionFeeEditable?: boolean;
  initialInscriptionFee?: number;
  isEditing?: boolean; // Nouvelle prop pour indiquer si on modifie
};

export default function QuickPaymentModal({
  open,
  onClose,
  onSave,
  initialAmountDue,
  initialAmountPaid,
  inscriptionFeeEditable = false,
  initialInscriptionFee = 0,
  isEditing = false,
}: PaymentModalProps) {
  const [amountDue, setAmountDue] = useState(initialAmountDue);
  const [amountPaid, setAmountPaid] = useState(initialAmountPaid);
  const [registrationFee, setRegistrationFee] = useState(initialInscriptionFee);

  useEffect(() => {
    setAmountDue(initialAmountDue);
    setAmountPaid(initialAmountPaid);
    setRegistrationFee(initialInscriptionFee ?? 0);
  }, [initialAmountDue, initialAmountPaid, initialInscriptionFee, open]);

  const reste = Math.max(amountDue + (inscriptionFeeEditable ? registrationFee : 0) - amountPaid, 0);
  const isValidated = amountPaid >= (amountDue + (inscriptionFeeEditable ? registrationFee : 0));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le paiement" : "Enregistrer un paiement"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Vous modifiez un paiement existant. Les changements seront appliqués immédiatement.
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-xs mb-1">Montant à payer</label>
            <Input
              type="number"
              value={amountDue}
              min={0}
              step={500}
              onChange={(e) => setAmountDue(Number(e.target.value))}
            />
          </div>
          {inscriptionFeeEditable && (
            <div>
              <label className="block text-xs mb-1">Frais d'inscription</label>
              <Input
                type="number"
                value={registrationFee}
                min={0}
                step={500}
                onChange={(e) => setRegistrationFee(Number(e.target.value))}
              />
            </div>
          )}
          <div>
            <label className="block text-xs mb-1">Montant versé</label>
            <Input
              type="number"
              value={amountPaid}
              min={0}
              step={500}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
            />
          </div>
          <div className="text-sm">
            <span className="font-medium">Reste à payer : </span>
            <span className={reste > 0 ? "text-red-500" : "text-green-600"}>
              {reste > 0 ? `${reste} DA` : "0 DA"}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Statut automatique : </span>
            <span className={isValidated ? "text-green-600" : "text-red-500"}>
              {isValidated ? "Validé" : "Retard"}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={() => onSave(amountDue, amountPaid, inscriptionFeeEditable ? registrationFee : undefined)}
          >
            {isEditing ? "Sauvegarder les modifications" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
