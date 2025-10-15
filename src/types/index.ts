export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  salaireParJour: number;
  salaireTotal?: number; // optional fixed monthly total salary
  joursTravailles: number;
  soldeMaladie: number;
  avance: number;
  absences: number;
  presences: PresenceRecord[];
  deleted?: boolean;
  deletedAt?: string;
}

export interface PresenceRecord {
  date: string;
  status: "present" | "absent" | "malade" | "off"; // off = day off, no impact
}

export interface Achat {
  id: string;
  date: string;
  article: string;
  quantite: number;
  montant: number;
  paye: boolean; // New field for payment status
  archivedMonth?: string; // For historique
  archivedAt?: string; // For historique
}

export interface StockItem {
  id: string;
  nom: string;
  quantite: number;
  unite: string;
  dateAjout: string;
}

export interface Maintenance {
  id: string;
  date: string;
  service: string;
  temps: string;
  description: string;
  montant: number;
  archivedMonth?: string; // For historique
  archivedAt?: string; // For historique
}

export interface Recette {
  id: string;
  date: string;
  items: RecetteItem[];
  total: number;
  archivedMonth?: string; // For historique
  archivedAt?: string; // For historique
}

export interface RecetteItem {
  article: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Article {
  id: string;
  nom: string;
  consommationStock: ConsommationStock[];
}

export interface ConsommationStock {
  stockItemId: string;
  stockItemNom: string;
  quantite: number;
}

export interface MonthlyArchive {
  id: string;
  month: string; // Format: YYYY-MM
  employees: Employee[];
  expenses: {
    salaries: number;
    achats: number;
    maintenances: number;
    total: number;
  };
  revenues: {
    totalRecettes: number;
    totalItems: number;
  };
  archivedAt: string;
}

export interface SystemSettings {
  maladieLimit: number;
  lastResetDate: string;
  currentPeriod: string; // Current month in YYYY-MM format
}

export interface DashboardHistory {
  id: string;
  date: string;
  month: string;
  totalRecettes: number;
  totalDepenses: number;
  benefice: number;
  totalAchats: number;
  totalMaintenances: number;
  totalSalaires: number;
  archivedAt: string;
}
