import { Employee, Achat, StockItem, Maintenance, Recette, Article, MonthlyArchive, SystemSettings, DashboardHistory } from "../types";
import { sqlGetEmployees, sqlSaveEmployees } from "./sqlite";

// Check if we're running in Electron environment
const isElectron = typeof window !== 'undefined' && (window as any).process && (window as any).process.type;

// For Electron, try to use node filesystem for more persistent storage
let fs: any = null;
let path: any = null;

if (isElectron) {
  try {
    fs = (window as any).require('fs');
    path = (window as any).require('path');
  } catch (e) {
    console.warn('Could not load Electron filesystem, falling back to localStorage');
  }
}

const DATA_DIR = isElectron ? path.join((window as any).process.env.APPDATA || (window as any).process.env.HOME || '.', 'cafe-management-system') : null;

// Ensure data directory exists
if (DATA_DIR && fs) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create data directory, falling back to localStorage');
  }
}

const getFilePath = (key: string): string | null => {
  if (!DATA_DIR || !fs) return null;
  return path.join(DATA_DIR, `${key}.json`);
};

const readFromFile = (key: string) => {
  const filePath = getFilePath(key);
  if (!filePath || !fs) return null;
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn(`Could not read from file ${filePath}:`, e);
  }
  return null;
};

const writeToFile = (key: string, data: any) => {
  const filePath = getFilePath(key);
  if (!filePath || !fs) return false;
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.warn(`Could not write to file ${filePath}:`, e);
    return false;
  }
};

const STORAGE_KEYS = {
  EMPLOYEES: "cafe_employees",
  ACHATS: "cafe_achats",
  STOCK: "cafe_stock",
  MAINTENANCES: "cafe_maintenances",
  RECETTES: "cafe_recettes",
  ARTICLES: "cafe_articles",
  MONTHLY_ARCHIVES: "cafe_monthly_archives",
  SYSTEM_SETTINGS: "cafe_system_settings",
  HISTORIQUE_ACHATS: "cafe_historique_achats",
  HISTORIQUE_MAINTENANCES: "cafe_historique_maintenances",
  HISTORIQUE_RECETTES: "cafe_historique_recettes",
  DASHBOARD_HISTORY: "cafe_dashboard_history",
};

// Employees
export const getEmployees = (): Employee[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.EMPLOYEES);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.EMPLOYEES, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const getEmployeesAsync = async (): Promise<Employee[]> => {
  const fromSql = await sqlGetEmployees();
  // keep a cache copy for fast loads
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(fromSql));
  return fromSql;
};

export const saveEmployees = (employees: Employee[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.EMPLOYEES, employees);
  }
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  
  // fire-and-forget persist to sqlite
  sqlSaveEmployees(employees).catch(() => {});
};

// Achats
export const getAchats = (): Achat[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.ACHATS);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.ACHATS);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.ACHATS, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveAchats = (achats: Achat[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.ACHATS, achats);
  }
  localStorage.setItem(STORAGE_KEYS.ACHATS, JSON.stringify(achats));
};

// Stock
export const getStock = (): StockItem[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.STOCK);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.STOCK);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.STOCK, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveStock = (stock: StockItem[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.STOCK, stock);
  }
  localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
};

// Maintenances
export const getMaintenances = (): Maintenance[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.MAINTENANCES);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.MAINTENANCES);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.MAINTENANCES, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveMaintenances = (maintenances: Maintenance[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.MAINTENANCES, maintenances);
  }
  localStorage.setItem(STORAGE_KEYS.MAINTENANCES, JSON.stringify(maintenances));
};

// Recettes
export const getRecettes = (): Recette[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.RECETTES);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.RECETTES);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.RECETTES, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveRecettes = (recettes: Recette[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.RECETTES, recettes);
  }
  localStorage.setItem(STORAGE_KEYS.RECETTES, JSON.stringify(recettes));
};

// Articles
export const getArticles = (): Article[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.ARTICLES);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.ARTICLES, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveArticles = (articles: Article[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.ARTICLES, articles);
  }
  localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
};

// Monthly Archives
export const getMonthlyArchives = (): MonthlyArchive[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.MONTHLY_ARCHIVES);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.MONTHLY_ARCHIVES);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.MONTHLY_ARCHIVES, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveMonthlyArchives = (archives: MonthlyArchive[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.MONTHLY_ARCHIVES, archives);
  }
  localStorage.setItem(STORAGE_KEYS.MONTHLY_ARCHIVES, JSON.stringify(archives));
};

// System Settings
export const getSystemSettings = (): SystemSettings => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.SYSTEM_SETTINGS);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.SYSTEM_SETTINGS, data);
      }
    } else {
      data = {
        maladieLimit: 30, // Default 30 days
        lastResetDate: new Date().toISOString().split('T')[0],
        currentPeriod: getCurrentMonth(),
      };
    }
  }
  return data;
};

export const saveSystemSettings = (settings: SystemSettings) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.SYSTEM_SETTINGS, settings);
  }
  localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(settings));
};

// Utility functions
export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const isCurrentMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const currentMonth = getCurrentMonth();
  const itemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return itemMonth === currentMonth;
};

export const getCurrentMonthData = () => {
  const currentMonth = getCurrentMonth();
  const allAchats = getAchats();
  const allMaintenances = getMaintenances();  
  const allRecettes = getRecettes();
  
  return {
    achats: allAchats.filter(a => isCurrentMonth(a.date)),
    maintenances: allMaintenances.filter(m => isCurrentMonth(m.date)),
    recettes: allRecettes.filter(r => isCurrentMonth(r.date)),
  };
};

// Historique Functions
export const getHistoriqueAchats = (): Achat[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.HISTORIQUE_ACHATS);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.HISTORIQUE_ACHATS);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.HISTORIQUE_ACHATS, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveHistoriqueAchats = (achats: Achat[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.HISTORIQUE_ACHATS, achats);
  }
  localStorage.setItem(STORAGE_KEYS.HISTORIQUE_ACHATS, JSON.stringify(achats));
};

export const getHistoriqueMaintenances = (): Maintenance[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.HISTORIQUE_MAINTENANCES);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.HISTORIQUE_MAINTENANCES);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.HISTORIQUE_MAINTENANCES, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveHistoriqueMaintenances = (maintenances: Maintenance[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.HISTORIQUE_MAINTENANCES, maintenances);
  }
  localStorage.setItem(STORAGE_KEYS.HISTORIQUE_MAINTENANCES, JSON.stringify(maintenances));
};

export const getHistoriqueRecettes = (): Recette[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.HISTORIQUE_RECETTES);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.HISTORIQUE_RECETTES);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.HISTORIQUE_RECETTES, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveHistoriqueRecettes = (recettes: Recette[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.HISTORIQUE_RECETTES, recettes);
  }
  localStorage.setItem(STORAGE_KEYS.HISTORIQUE_RECETTES, JSON.stringify(recettes));
};

// Reset Functions
export const resetAchats = () => {
  const currentAchats = getAchats();
  const historiqueAchats = getHistoriqueAchats();
  
  // Add current achats to historique
  const achatsWithMonth = currentAchats.map(achat => ({
    ...achat,
    archivedMonth: getCurrentMonth(),
    archivedAt: new Date().toISOString()
  }));
  
  saveHistoriqueAchats([...historiqueAchats, ...achatsWithMonth]);
  saveAchats([]);
};

export const resetMaintenances = () => {
  const currentMaintenances = getMaintenances();
  const historiqueMaintenances = getHistoriqueMaintenances();
  
  // Add current maintenances to historique
  const maintenancesWithMonth = currentMaintenances.map(maintenance => ({
    ...maintenance,
    archivedMonth: getCurrentMonth(),
    archivedAt: new Date().toISOString()
  }));
  
  saveHistoriqueMaintenances([...historiqueMaintenances, ...maintenancesWithMonth]);
  saveMaintenances([]);
};

export const resetRecettes = () => {
  const currentRecettes = getRecettes();
  const historiqueRecettes = getHistoriqueRecettes();
  
  // Add current recettes to historique
  const recettesWithMonth = currentRecettes.map(recette => ({
    ...recette,
    archivedMonth: getCurrentMonth(),
    archivedAt: new Date().toISOString()
  }));
  
  saveHistoriqueRecettes([...historiqueRecettes, ...recettesWithMonth]);
  saveRecettes([]);
};

export const resetAllData = () => {
  const currentMonth = getCurrentMonth();
  const employees = getEmployees().filter(e => !e.deleted);
  const currentMonthData = getCurrentMonthData();
  
  // Calculate dashboard data
  const salaires = employees.reduce((sum, e) => {
    if (typeof e.salaireTotal === 'number' && e.salaireTotal > 0) {
      return sum + (e.salaireTotal - e.avance);
    } else {
      const salaireBase = e.joursTravailles * e.salaireParJour;
      const deductions = (e.absences * e.salaireParJour) + e.avance;
      return sum + (salaireBase - deductions);
    }
  }, 0);
  
  const recettes = currentMonthData.recettes.reduce((sum, r) => sum + r.total, 0);
  const maintenance = currentMonthData.maintenances.reduce((sum, m) => sum + m.montant, 0);
  const achats = currentMonthData.achats.reduce((sum, a) => sum + a.montant, 0);
  const totalDepenses = salaires + maintenance + achats;
  const benefice = recettes - totalDepenses;
  const margeProfit = recettes > 0 ? (benefice / recettes) * 100 : 0;
  
  // Create monthly archive
  const monthlyArchive: MonthlyArchive = {
    id: `${currentMonth}-${Date.now()}`,
    month: currentMonth,
    employees: employees.map(e => ({ ...e })),
    expenses: {
      salaries: salaires,
      achats: achats,
      maintenances: maintenance,
      total: totalDepenses
    },
    revenues: {
      totalRecettes: recettes,
      totalItems: currentMonthData.recettes.reduce((sum, r) => sum + r.items.length, 0)
    },
    archivedAt: new Date().toISOString()
  };
  
  // Save to monthly archives
  const archives = getMonthlyArchives();
  archives.push(monthlyArchive);
  saveMonthlyArchives(archives);
  
  // Reset all data
  resetAchats();
  resetMaintenances();
  resetRecettes();
  
  // Reset employee counters
  const updatedEmployees = employees.map(e => ({
    ...e,
    joursTravailles: 0,
    avance: 0,
    absences: 0,
    presences: [],
    soldeMaladie: getSystemSettings().maladieLimit
  }));
  saveEmployees(updatedEmployees);
  
  // Update system settings
  const settings = getSystemSettings();
  settings.lastResetDate = new Date().toISOString().split('T')[0];
  settings.currentPeriod = getCurrentMonth();
  saveSystemSettings(settings);
};

// Dashboard History
export const getDashboardHistory = (): DashboardHistory[] => {
  // Try file system first, fallback to localStorage
  let data = readFromFile(STORAGE_KEYS.DASHBOARD_HISTORY);
  if (data === null) {
    const localStorageData = localStorage.getItem(STORAGE_KEYS.DASHBOARD_HISTORY);
    if (localStorageData) {
      data = JSON.parse(localStorageData);
      // Migrate to file system if available
      if (fs && DATA_DIR) {
        writeToFile(STORAGE_KEYS.DASHBOARD_HISTORY, data);
      }
    } else {
      data = [];
    }
  }
  return data;
};

export const saveDashboardHistory = (history: DashboardHistory[]) => {
  // Save to both file system and localStorage for redundancy
  if (fs && DATA_DIR) {
    writeToFile(STORAGE_KEYS.DASHBOARD_HISTORY, history);
  }
  localStorage.setItem(STORAGE_KEYS.DASHBOARD_HISTORY, JSON.stringify(history));
};

export const addDashboardHistory = (history: DashboardHistory) => {
  const currentHistory = getDashboardHistory();
  currentHistory.push(history);
  saveDashboardHistory(currentHistory);
};
