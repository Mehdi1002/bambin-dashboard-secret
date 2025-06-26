
// Utilitaires de validation pour sécuriser les données
export const validateChildData = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.nom || data.nom.trim().length < 2) {
    errors.push("Le nom doit contenir au moins 2 caractères");
  }
  
  if (!data.prenom || data.prenom.trim().length < 2) {
    errors.push("Le prénom doit contenir au moins 2 caractères");
  }
  
  if (!data.date_naissance) {
    errors.push("La date de naissance est requise");
  } else {
    const birthDate = new Date(data.date_naissance);
    const today = new Date();
    const maxAge = new Date();
    maxAge.setFullYear(today.getFullYear() - 18);
    
    if (birthDate > today) {
      errors.push("La date de naissance ne peut pas être dans le futur");
    }
    if (birthDate < maxAge) {
      errors.push("L'enfant ne peut pas avoir plus de 18 ans");
    }
  }
  
  if (!data.section || !['Petite', 'Moyenne', 'Prescolaire'].includes(data.section)) {
    errors.push("Section invalide");
  }
  
  if (data.tel_pere && !/^[0-9+\-\s()]+$/.test(data.tel_pere)) {
    errors.push("Numéro de téléphone du père invalide");
  }
  
  if (data.tel_mere && !/^[0-9+\-\s()]+$/.test(data.tel_mere)) {
    errors.push("Numéro de téléphone de la mère invalide");
  }
  
  return errors;
};

export const validatePaymentData = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.amount_due || data.amount_due < 0) {
    errors.push("Le montant dû doit être positif");
  }
  
  if (data.amount_paid < 0) {
    errors.push("Le montant payé ne peut pas être négatif");
  }
  
  if (data.registration_fee && data.registration_fee < 0) {
    errors.push("Les frais d'inscription ne peuvent pas être négatifs");
  }
  
  if (!data.year || data.year < 2020 || data.year > 2030) {
    errors.push("Année invalide");
  }
  
  if (!data.month || data.month < 1 || data.month > 12) {
    errors.push("Mois invalide");
  }
  
  return errors;
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.toString().trim().replace(/[<>]/g, '');
};
