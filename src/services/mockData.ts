
// Mock data service to replace Supabase
export type ChildRow = {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  section: "Petite" | "Moyenne" | "Prescolaire";
  date_inscription: string | null;
  statut: "Actif" | "Inactif";
  pere: string | null;
  tel_pere: string | null;
  mere: string | null;
  tel_mere: string | null;
  allergies: string | null;
  sexe: string | null;
};

export type PaymentRow = {
  id: string;
  child_id: string;
  month: number;
  year: number;
  amount_due: number;
  amount_paid: number;
  registration_fee: number;
  validated: boolean;
  payment_date: string | null;
};

// Mock data storage
let mockChildren: ChildRow[] = [
  {
    id: "1",
    nom: "Dupont",
    prenom: "Marie",
    date_naissance: "2019-05-15",
    section: "Moyenne",
    date_inscription: "2024-09-01",
    statut: "Actif",
    pere: "Jean Dupont",
    tel_pere: "0123456789",
    mere: "Anne Dupont", 
    tel_mere: "0123456788",
    allergies: null,
    sexe: "F"
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Paul",
    date_naissance: "2020-03-22",
    section: "Petite",
    date_inscription: "2024-09-01",
    statut: "Actif",
    pere: "Pierre Martin",
    tel_pere: "0123456787",
    mere: "Sophie Martin",
    tel_mere: "0123456786",
    allergies: "Arachides",
    sexe: "M"
  },
  {
    id: "3",
    nom: "Bernard",
    prenom: "Julie",
    date_naissance: "2018-11-08",
    section: "Prescolaire",
    date_inscription: "2024-09-01",
    statut: "Actif",
    pere: "Michel Bernard",
    tel_pere: "0123456785",
    mere: "Isabelle Bernard",
    tel_mere: "0123456784",
    allergies: null,
    sexe: "F"
  }
];

let mockPayments: PaymentRow[] = [
  {
    id: "1",
    child_id: "1",
    month: 12,
    year: 2024,
    amount_due: 150,
    amount_paid: 150,
    registration_fee: 50,
    validated: true,
    payment_date: "2024-12-01"
  },
  {
    id: "2", 
    child_id: "2",
    month: 12,
    year: 2024,
    amount_due: 150,
    amount_paid: 0,
    registration_fee: 50,
    validated: false,
    payment_date: null
  },
  {
    id: "3",
    child_id: "3",
    month: 11,
    year: 2024,
    amount_due: 150,
    amount_paid: 0,
    registration_fee: 50,
    validated: false,
    payment_date: null
  }
];

export const mockApi = {
  // Children operations
  async getChildren(): Promise<ChildRow[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([...mockChildren]), 100);
    });
  },

  async getChildrenCount(): Promise<number> {
    return new Promise(resolve => {
      setTimeout(() => resolve(mockChildren.filter(c => c.statut === "Actif").length), 100);
    });
  },

  async getSectionsCount(): Promise<Array<{section: string, count: number}>> {
    return new Promise(resolve => {
      setTimeout(() => {
        const activeChildren = mockChildren.filter(c => c.statut === "Actif");
        const sectionCounts = activeChildren.reduce((acc: any, child) => {
          const section = child.section || "Non définie";
          acc[section] = (acc[section] || 0) + 1;
          return acc;
        }, {});

        const result = Object.entries(sectionCounts).map(([section, count]) => ({
          section,
          count: count as number
        }));
        resolve(result);
      }, 100);
    });
  },

  async createChild(child: Omit<ChildRow, 'id'>): Promise<ChildRow> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newChild = {
          ...child,
          id: Date.now().toString()
        };
        mockChildren.push(newChild);
        resolve(newChild);
      }, 100);
    });
  },

  async updateChild(id: string, updates: Partial<ChildRow>): Promise<ChildRow> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockChildren.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Child not found'));
          return;
        }
        mockChildren[index] = { ...mockChildren[index], ...updates };
        resolve(mockChildren[index]);
      }, 100);
    });
  },

  async deleteChild(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockChildren.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Child not found'));
          return;
        }
        mockChildren.splice(index, 1);
        resolve();
      }, 100);
    });
  },

  // Payment operations
  async getPayments(month?: number, year?: number): Promise<PaymentRow[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        let filtered = [...mockPayments];
        if (month !== undefined) {
          filtered = filtered.filter(p => p.month === month);
        }
        if (year !== undefined) {
          filtered = filtered.filter(p => p.year === year);
        }
        resolve(filtered);
      }, 100);
    });
  },

  async getValidatedPaymentsCount(year: number, month: number): Promise<number> {
    return new Promise(resolve => {
      setTimeout(() => {
        const count = mockPayments.filter(p => 
          p.year === year && p.month === month && p.validated
        ).length;
        resolve(count);
      }, 100);
    });
  },

  async getLatePayments(prevMonth: boolean = false): Promise<Array<{nom: string, prenom: string, month: number, year: number}>> {
    return new Promise(resolve => {
      setTimeout(() => {
        const now = new Date();
        const targetMonth = prevMonth ? now.getMonth() : now.getMonth() + 1;
        const targetYear = prevMonth && now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        const activeChildren = mockChildren.filter(c => c.statut === "Actif");
        const paidChildrenIds = new Set(
          mockPayments.filter(p => 
            p.month === targetMonth && p.year === targetYear && p.validated
          ).map(p => p.child_id)
        );

        const latePayments = activeChildren
          .filter(child => !paidChildrenIds.has(child.id))
          .map(child => ({
            nom: child.nom,
            prenom: child.prenom,
            month: targetMonth,
            year: targetYear
          }));

        resolve(latePayments);
      }, 100);
    });
  },

  async updatePayment(id: string, updates: Partial<PaymentRow>): Promise<PaymentRow> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockPayments.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Payment not found'));
          return;
        }
        mockPayments[index] = { ...mockPayments[index], ...updates };
        resolve(mockPayments[index]);
      }, 100);
    });
  }
};
