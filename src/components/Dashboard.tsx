import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DollarSign, TrendingUp, TrendingDown, Percent, Users, Wrench, ShoppingCart, RotateCcw, RefreshCw } from "lucide-react";
import { getRecettes, getEmployees, getAchats, getMaintenances, getCurrentMonthData, getStock, resetAllData } from "../lib/storage";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { PinDialog } from "./PinDialog";

export function Dashboard() {
  const [stats, setStats] = useState({
    recettes: 0,
    salaires: 0,
    maintenance: 0,
    achats: 0,
    totalDepenses: 0,
    benefice: 0,
    margeProfit: 0,
  });
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const currentMonthData = getCurrentMonthData();
    const employees = getEmployees().filter(e => !e.deleted);

    // Recettes (current month only)
    const recettes = currentMonthData.recettes.reduce((sum, r) => sum + r.total, 0);

    // Salaires (mois en cours) – utilise salaireTotal si disponible, sinon calcule à partir des jours travaillés
    const salaires = employees.reduce((sum, e) => {
      if (typeof e.salaireTotal === 'number' && e.salaireTotal > 0) {
        // Pour un salaire fixe, déduire seulement les avances
        return sum + (e.salaireTotal - e.avance);
      } else {
        // Calculer à partir des jours travaillés
        const salaireBase = e.joursTravailles * e.salaireParJour;
        const deductions = (e.absences * e.salaireParJour) + e.avance;
        const net = Math.max(salaireBase - deductions, 0);
        return sum + net;
      }
    }, 0);

    // Maintenance (current month only)
    const maintenance = currentMonthData.maintenances.reduce((sum, m) => sum + m.montant, 0);

    // Achats (current month only) - only count paid purchases as expenses
    const achats = currentMonthData.achats.reduce((sum, a) => sum + (a.paye ? a.montant : 0), 0);

    // Total dépenses
    const totalDepenses = salaires + maintenance + achats;

    // Bénéfice: Recettes - (Salaires + Maintenance + Achats)
    const benefice = recettes - totalDepenses;
    const margeProfit = recettes > 0 ? (benefice / recettes) * 100 : 0;

    setStats({
      recettes,
      salaires,
      maintenance,
      achats,
      totalDepenses,
      benefice,
      margeProfit,
    });
  };

  const handleResetAllData = () => {
    setPendingAction(() => () => {
      resetAllData();
      calculateStats();
      toast.success("Toutes les données ont été archivées et réinitialisées");
    });
    setIsResetDialogOpen(false);
    setIsPinDialogOpen(true);
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre café - Mois en cours uniquement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={calculateStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser Tout
            </Button>
          </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser toutes les données</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va archiver TOUTES les données actuelles (recettes, achats, maintenances, personnel) 
              dans les archives mensuelles et réinitialiser complètement le système. 
              Cette action est irréversible et affecte tous les modules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAllData}>
              Confirmer la réinitialisation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Recettes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.recettes.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Total des ventes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Salaires</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.salaires.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Total salaires employés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.maintenance.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Frais de maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Achats</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.achats.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Achats payés (dépenses)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalDepenses.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Salaires + Maintenance + Achats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Bénéfice</CardTitle>
            <TrendingUp className={`h-4 w-4 ${stats.benefice >= 0 ? 'text-green-600' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${stats.benefice >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {stats.benefice.toFixed(2)} TND
            </div>
            <p className="text-xs text-muted-foreground">Recettes - Dépenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Marge de Profit</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${stats.margeProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {stats.margeProfit.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Rentabilité</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nombre d'employés actifs</span>
              <span className="text-sm">{getEmployees().filter(e => !e.deleted).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total recettes enregistrées</span>
              <span className="text-sm">{getRecettes().length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Articles en stock</span>
              <span className="text-sm">{getStock().length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conseils</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Enregistrez les présences quotidiennement pour un suivi précis</li>
              <li>• Mettez à jour le stock après chaque recette</li>
              <li>• Vérifiez régulièrement les dépenses de maintenance</li>
              <li>• Analysez la marge de profit pour optimiser les coûts</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <PinDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        title="Confirmation de réinitialisation"
        description="Entrez le code PIN pour confirmer la réinitialisation complète"
        pinType="delete"
      />
    </div>
  );
}
