import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertTriangle, RotateCcw, Settings, Download, Printer } from "lucide-react";
import { Employee, MonthlyArchive, SystemSettings } from "../types";
import { 
  getEmployees, 
  saveEmployees, 
  getAchats, 
  getMaintenances, 
  getRecettes,
  getMonthlyArchives, 
  saveMonthlyArchives,
  getSystemSettings,
  saveSystemSettings,
    getCurrentMonth,
    addDashboardHistory
} from "../lib/storage";
import { exportMonthlyExcel } from "../lib/exportExcel";
import { toast } from "sonner";
import { PinDialog } from "./PinDialog";

export function MonthlyReset() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(getSystemSettings());

  const createMonthlyArchive = (): MonthlyArchive => {
    const currentMonth = getCurrentMonth();
    const employees = getEmployees().filter(e => !e.deleted);
    const allAchats = getAchats();
    const allMaintenances = getMaintenances();  
    const allRecettes = getRecettes();

    // Filter data for current month
    const monthAchats = allAchats.filter(a => {
      const date = new Date(a.date);
      const monthData = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthData === currentMonth;
    });

    const monthMaintenances = allMaintenances.filter(m => {
      const date = new Date(m.date);
      const monthData = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthData === currentMonth;
    });

    const monthRecettes = allRecettes.filter(r => {
      const date = new Date(r.date);
      const monthData = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthData === currentMonth;
    });

    // Calculate totals
    const salariesTotal = employees.reduce((sum, e) => {
      const salaireBase = e.joursTravailles * e.salaireParJour;
      const deductions = (e.absences * e.salaireParJour) + e.avance;
      return sum + (salaireBase - deductions);
    }, 0);

    const achatsTotal = monthAchats.reduce((sum, a) => sum + a.montant, 0);
    const maintenancesTotal = monthMaintenances.reduce((sum, m) => sum + m.montant, 0);
    const revenuesTotal = monthRecettes.reduce((sum, r) => sum + r.total, 0);

    return {
      id: Date.now().toString(),
      month: currentMonth,
      employees: [...employees], // Copy of current employees
      expenses: {
        salaries: salariesTotal,
        achats: achatsTotal,
        maintenances: maintenancesTotal,
        total: salariesTotal + achatsTotal + maintenancesTotal,
      },
      revenues: {
        totalRecettes: revenuesTotal,
        totalItems: monthRecettes.length,
      },
      archivedAt: new Date().toISOString(),
    };
  };

  const handleMonthlyReset = () => {
    setIsPinDialogOpen(true);
  };

  const handlePinSuccess = async () => {
    try {
      // Export to Excel before resetting
      toast.info("Exportation des données en cours...");
      await exportMonthlyExcel();
      
      // Create archive before resetting
      const archive = createMonthlyArchive();
      const archives = getMonthlyArchives();
      archives.push(archive);
      saveMonthlyArchives(archives);

      // Record dashboard history (CD et bénéfices)
      addDashboardHistory({
        id: `${archive.month}-${Date.now()}`,
        date: new Date().toISOString(),
        month: archive.month,
        totalRecettes: archive.revenues.totalRecettes,
        totalDepenses: archive.expenses.total,
        benefice: archive.revenues.totalRecettes - archive.expenses.total,
        totalAchats: archive.expenses.achats,
        totalMaintenances: archive.expenses.maintenances,
        totalSalaires: archive.expenses.salaries,
        archivedAt: archive.archivedAt,
      });

      // Reset employee data
      const employees = getEmployees();
      const updatedEmployees = employees.map(employee => {
        if (!employee.deleted) {
          // Preserve basic info, reset counters
          employee.joursTravailles = 0;
          employee.avance = 0;
          employee.absences = 0;
          employee.presences = [];
          employee.soldeMaladie = settings.maladieLimit; // Reset to user-defined limit
        }
        return employee;
      });
      saveEmployees(updatedEmployees);

      // Update system settings
      const currentDate = new Date().toISOString().split('T')[0];
      const updatedSettings: SystemSettings = {
        ...settings,
        lastResetDate: currentDate,
        currentPeriod: getCurrentMonth(),
      };
      saveSystemSettings(updatedSettings);
      setSettings(updatedSettings);

      setIsResetDialogOpen(false);
      toast.success("Réinitialisation mensuelle terminée - données archivées");
    } catch (error) {
      console.error('Error during monthly reset:', error);
      toast.error("Erreur lors de la réinitialisation. Veuillez réessayer.");
    }
  };

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newSettings: SystemSettings = {
      maladieLimit: parseFloat(formData.get("maladieLimit") as string),
      lastResetDate: settings.lastResetDate,
      currentPeriod: getCurrentMonth(),
    };

    saveSystemSettings(newSettings);
    setSettings(newSettings);
    setIsSettingsDialogOpen(false);
    toast.success("Paramètres mis à jour");
  };

  const handlePrintCurrentMonth = () => {
    const archive = createMonthlyArchive();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ];
      const [year, month] = archive.month.split('-');
      const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;

      printWindow.document.write(`
        <html>
          <head>
            <title>Rapport Mensuel - ${monthName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
              .total { font-weight: bold; color: #2c5aa0; }
              .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Café Management System</h1>
              <h2>Rapport Mensuel - ${monthName}</h2>
              <p>Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
            </div>

            <div class="warning">
              <strong>⚠️ Attention:</strong> Ce rapport montre les données du mois en cours. 
              Pour archiver ces données et réinitialiser le système pour le mois suivant, 
              utilisez la fonction "Réinitialisation Mensuelle".
            </div>

            <div class="section">
              <h3>Résumé Financier</h3>
              <div class="summary">
                <p><strong>Chiffre d'affaires:</strong> ${archive.revenues.totalRecettes.toFixed(2)} TND</p>
                <p><strong>Salaires totaux:</strong> ${archive.expenses.salaries.toFixed(2)} TND</p>
                <p><strong>Achats totaux:</strong> ${archive.expenses.achats.toFixed(2)} TND</p>
                <p><strong>Maintenance:</strong> ${archive.expenses.maintenances.toFixed(2)} TND</p>
                <p class="total">Total dépenses: ${archive.expenses.total.toFixed(2)} TND</p>
                <p class="total">Bénéfice: ${(archive.revenues.totalRecettes - archive.expenses.total).toFixed(2)} TND</p>
              </div>
            </div>

            <div class="section">
              <h3>Employés (${archive.employees.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Jours travaillés</th>
                    <th>Absences</th>
                    <th>Solde maladie</th>
                    <th>Salaire total</th>
                  </tr>
                </thead>
                <tbody>
                  ${archive.employees.map(emp => {
                    const salaireTotal = (emp.joursTravailles * emp.salaireParJour) - 
                                      (emp.absences * emp.salaireParJour) - emp.avance;
                    return `
                      <tr>
                        <td>${emp.prenom} ${emp.nom}</td>
                        <td>${emp.poste}</td>
                        <td>${emp.joursTravailles}</td>
                        <td>${emp.absences}</td>
                        <td>${emp.soldeMaladie} jours</td>
                        <td>${salaireTotal.toFixed(2)} TND</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadCurrentMonth = () => {
    const archive = createMonthlyArchive();
    const jsonData = JSON.stringify(archive, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-mensuel-${archive.month}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Rapport téléchargé");
  };

  const isNewMonth = () => {
    const now = new Date();
    const currentMonth = getCurrentMonth();
    return settings.currentPeriod !== currentMonth;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Gestion Mensuelle</h1>
        <p className="text-muted-foreground">Réinitialisation automatique et paramètres mensuels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Solde maladie par défaut</p>
              <p className="text-xl">{settings.maladieLimit} jours</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dernière réinitialisation</p>
              <p className="text-lg">{new Date(settings.lastResetDate).toLocaleDateString("fr-FR")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Période actuelle</p>
              <p className="text-lg">{new Date(Date.parse(settings.currentPeriod + "-01")).toLocaleDateString("fr-FR", { month: 'long', year: 'numeric' })}</p>
            </div>
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Modifier les paramètres
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paramètres du système</DialogTitle>
                  <DialogDescription>
                    Configurez les paramètres globaux du système
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maladieLimit">Solde maladie par défaut (jours)</Label>
                    <Input 
                      id="maladieLimit" 
                      name="maladieLimit" 
                      type="number" 
                      min="0"
                      max="365"
                      defaultValue={settings.maladieLimit}
                      required 
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">Enregistrer</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Monthly Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Actions mensuelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isNewMonth() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yallow-800 font-medium">Nouveau mois détecté</p>
                    <p className="text-xs text-yellow-700">Il est recommandé de faire une réinitialisation mensuelle</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => setIsResetDialogOpen(true)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialisation Mensuelle
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handlePrintCurrentMonth}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleDownloadCurrentMonth}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={exportMonthlyExcel}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Archive automatiquement toutes les données</p>
              <p>• Remet à zéro : présences, absences, avances</p>
              <p>• Réinitialise le solde maladie</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Confirmation de réinitialisation mensuelle
            </DialogTitle>
            <DialogDescription>
              Cette action va archiver toutes les données du mois en cours et réinitialiser les compteurs des employés.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800 mb-2">Actions qui seront effectuées :</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Création automatique d'une archive mensuelle</li>
                <li>• Réinitialisation des présences, absences et avances à zéro</li>
                <li>• Restauration du solde maladie au seuil défini</li>
                <li>• Conservation de toutes les informations de base des employés</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800">⚠️ Cette action est irréversible</p>
              <p className="text-xs text-red-700">Assurez-vous d'avoir sauvegardé vos données importantes</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              Annuler
            </Button>
            <Button onClick={handleMonthlyReset} className="bg-red-600 hover:bg-red-700">
              Oui, procéder à la réinitialisation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PinDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        title="Confirmation de réinitialisation"
        description="Entrez le code PIN pour confirmer la réinitialisation mensuelle"
        pinType="delete"
      />
    </div>
  );
}
