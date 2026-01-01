// Excel export using SheetJS (XLSX) package
// Builds a monthly workbook from current data and triggers a download

import * as XLSX from 'xlsx';
import { Employee, Achat, StockItem, Maintenance, Recette, Article } from '../types';
import { getEmployees, getAchats, getStock, getMaintenances, getRecettes, getArticles, getCurrentMonth } from './storage';

const getSheet = (data: any[], headerOrder?: string[]) => {
  const ws = XLSX.utils.json_to_sheet(data, { header: headerOrder });
  return ws;
};

export const exportMonthlyExcel = async () => {
  try {

  const month = getCurrentMonth();
  const employees = getEmployees();
  const achats = getAchats();
  const stock = getStock();
  const maintenances = getMaintenances();
  const recettes = getRecettes();
  const articles = getArticles();

  const wb = XLSX.utils.book_new();

  // Employees with computed totals
  const employeesRows = employees.map(e => ({
    id: e.id,
    nom: e.nom,
    prenom: e.prenom,
    poste: e.poste,
    salaireParJour: e.salaireParJour,
    salaireTotal: e.salaireTotal,
    joursTravailles: e.joursTravailles,
    absences: e.absences,
    soldeMaladie: e.soldeMaladie,
    avance: e.avance,
  }));
  XLSX.utils.book_append_sheet(wb, getSheet(employeesRows), 'Employes');

  XLSX.utils.book_append_sheet(wb, getSheet(achats), 'Achats');
  XLSX.utils.book_append_sheet(wb, getSheet(stock), 'Stock');
  XLSX.utils.book_append_sheet(wb, getSheet(maintenances), 'Maintenances');
  XLSX.utils.book_append_sheet(wb, getSheet(recettes), 'Recettes');
  XLSX.utils.book_append_sheet(wb, getSheet(articles), 'Articles');

    const fileName = `Cafe_Export_${month}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Excel export failed:', error);
    alert('Erreur lors de l\'export Excel. Veuillez réessayer.');
  }
};


