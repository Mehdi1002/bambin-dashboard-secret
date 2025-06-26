
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePaymentData, sanitizeInput } from "@/utils/validation";
import { toast } from "@/components/ui/use-toast";

type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (amountDue: number, amountPaid: number, registrationFee?: number) => void;
  initialAmountDue: number;
  initialAmountPaid: number;
  inscriptionFeeEditable?: boolean;
  initialInscriptionFee?: number;
  isEditing?: boolean;
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
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setAmountDue(initialAmountDue);
    setAmountPaid(initialAmountPaid);
    setRegistrationFee(initialInscriptionFee ?? 0);
    setErrors([]);
  }, [initialAmountDue, initialAmountPaid, initialInscriptionFee, open]);

  const handleSave = () => {
    const paymentData = {
      amount_due: amountDue,
      amount_paid: amountPaid,
      registration_fee: inscriptionFeeEditable ? registrationFee : 0,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    };

    const validationErrors = validatePaymentData(paymentData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        variant: "destructive",
        title: "Erreurs de validation",
        description: validationErrors.join(", ")
      });
      return;
    }

    // Validation supplémentaire
    if (amountPaid > amountDue + (inscriptionFeeEditable ? registrationFee : 0)) {
      toast({
        variant: "destructive",
        title: "Montant invalide",
        description: "Le montant payé ne peut pas dépasser le montant total dû"
      });
      return;
    }

    setErrors([]);
    onSave(amountDue, amountPaid, inscriptionFeeEditable ? registrationFee : undefined);
  };

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

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-red-700 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <label className="block text-xs mb-1">Montant à payer</label>
            <Input
              type="number"
              value={amountDue}
              min={0}
              max={999999}
              step={500}
              onChange={(e) => {
                const value = Math.max(0, parseInt(e.target.value) || 0);
                setAmountDue(value);
                if (errors.length > 0) setErrors([]);
              }}
            />
          </div>
          
          {inscriptionFeeEditable && (
            <div>
              <label className="block text-xs mb-1">Frais d'inscription</label>
              <Input
                type="number"
                value={registrationFee}
                min={0}
                max={99999}
                step={500}
                onChange={(e) => {
                  const value = Math.max(0, parseInt(e.target.value) || 0);
                  setRegistrationFee(value);
                  if (errors.length > 0) setErrors([]);
                }}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs mb-1">Montant versé</label>
            <Input
              type="number"
              value={amountPaid}
              min={0}
              max={999999}
              step={500}
              onChange={(e) => {
                const value = Math.max(0, parseInt(e.target.value) || 0);
                setAmountPaid(value);
                if (errors.length > 0) setErrors([]);
              }}
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
          <Button variant="default" onClick={handleSave}>
            {isEditing ? "Sauvegarder les modifications" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
