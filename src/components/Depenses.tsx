import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Wrench, RotateCcw, RefreshCw, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Maintenance } from "../types";
import { getMaintenances, saveMaintenances, getEmployees, getAchats, getCurrentMonthData, resetMaintenances } from "../lib/storage";
import { toast } from "sonner";
import { exportDataToPDF } from "../lib/pdfExport";
import { Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { PinDialog } from "./PinDialog";

export function Depenses() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [stats, setStats] = useState({
    salairesTotal: 0,
    achatsTotal: 0,
    maintenanceTotal: 0,
    total: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentMonthData = getCurrentMonthData();
    setMaintenances(currentMonthData.maintenances);
    calculateStats();
  };

  const calculateStats = () => {
    const employees = getEmployees().filter(e => !e.deleted);
    const currentMonthData = getCurrentMonthData();
    
    // Calculate total salaries for all employees
    const salairesTotal = employees.reduce((sum, e) => {
      // Use salaireTotal if provided, otherwise calculate from days worked
      if (typeof e.salaireTotal === 'number' && e.salaireTotal > 0) {
        // For fixed salary, deduct advances but not absences (since it's a fixed amount)
        return sum + (e.salaireTotal - e.avance);
      } else {
        // Calculate from days worked
        const salaireBase = e.joursTravailles * e.salaireParJour;
        const deductions = (e.absences * e.salaireParJour) + e.avance;
        return sum + (salaireBase - deductions);
      }
    }, 0);

    const achatsTotal = currentMonthData.achats.reduce((sum, a) => sum + (a.paye ? a.montant : 0), 0);
    const maintenanceTotal = currentMonthData.maintenances.reduce((sum, m) => sum + m.montant, 0);

    setStats({
      salairesTotal,
      achatsTotal,
      maintenanceTotal,
      total: salairesTotal + achatsTotal + maintenanceTotal,
    });
  };

  const handleAddMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newMaintenance: Maintenance = {
      id: Date.now().toString(),
      date: formData.get("date") as string,
      service: formData.get("service") as string,
      temps: formData.get("temps") as string,
      description: formData.get("description") as string,
      montant: parseFloat(formData.get("montant") as string),
    };

    const allMaintenances = getMaintenances();
    allMaintenances.push(newMaintenance);
    saveMaintenances(allMaintenances);

    loadData();
    setIsDialogOpen(false);
    toast.success("Maintenance ajoutée avec succès");
  };

  const handleExportPDF = async () => {
    const employees = getEmployees().filter(e => !e.deleted);
    const currentMonthData = getCurrentMonthData();
    
    const success = await exportDataToPDF(
      {
        type: 'depenses',
        stats: stats,
        employees: employees,
        maintenances: maintenances,
        achats: currentMonthData.achats
      },
      'Dépenses',
      `depenses_${new Date().toISOString().split('T')[0]}`
    );
    
    if (success) {
      toast.success("PDF exporté avec succès");
    } else {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const handleResetMaintenances = () => {
    setPendingAction(() => () => {
      resetMaintenances();
      loadData();
      toast.success("Maintenances archivées dans l'historique et réinitialisées");
    });
    setIsPinDialogOpen(true);
  };

  const handleDeleteMaintenance = (maintenanceId: string) => {
    setSelectedMaintenanceId(maintenanceId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMaintenance = () => {
    if (!selectedMaintenanceId) return;
    
    setPendingAction(() => () => {
      const allMaintenances = getMaintenances();
      const updatedMaintenances = allMaintenances.filter(m => m.id !== selectedMaintenanceId);
      saveMaintenances(updatedMaintenances);
      loadData();
      toast.success("Maintenance supprimée");
    });
    setIsDeleteDialogOpen(false);
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
      <div>
        <h1>Dépenses</h1>
        <p className="text-muted-foreground">Vue d'ensemble de toutes vos dépenses - Mois en cours uniquement</p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={maintenances.length === 0}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser Maintenance
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Réinitialiser les maintenances</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va archiver toutes les maintenances actuelles dans l'historique et les supprimer de la liste actuelle. 
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetMaintenances}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Salaires Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.salairesTotal.toFixed(2)} TND</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Achats Payés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.achatsTotal.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Achats payés uniquement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.maintenanceTotal.toFixed(2)} TND</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-destructive">{stats.total.toFixed(2)} TND</div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Salaires</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Jours travaillés</TableHead>
                <TableHead>Salaire/jour</TableHead>
                <TableHead>Absences</TableHead>
                <TableHead>Avances</TableHead>
                <TableHead className="text-right">Salaire net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getEmployees().filter(e => !e.deleted).map((employee) => {
                let salaireNet;
                let calculationMethod;
                
                // Use salaireTotal if provided, otherwise calculate from days worked
                if (typeof employee.salaireTotal === 'number' && employee.salaireTotal > 0) {
                  // For fixed salary, deduct advances but not absences
                  salaireNet = employee.salaireTotal - employee.avance;
                  calculationMethod = "Salaire fixe";
                } else {
                  // Calculate from days worked
                  const salaireBase = employee.joursTravailles * employee.salaireParJour;
                  const deductions = (employee.absences * employee.salaireParJour) + employee.avance;
                  salaireNet = salaireBase - deductions;
                  calculationMethod = "Par jours travaillés";
                }
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.prenom} {employee.nom}</TableCell>
                    <TableCell>{employee.poste}</TableCell>
                    <TableCell>{employee.joursTravailles}</TableCell>
                    <TableCell>{employee.salaireParJour.toFixed(2)} TND</TableCell>
                    <TableCell>{employee.absences}</TableCell>
                    <TableCell>{employee.avance.toFixed(2)} TND</TableCell>
                    <TableCell className="text-right font-semibold">
                      {salaireNet.toFixed(2)} TND
                      <div className="text-xs text-muted-foreground">{calculationMethod}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Total Row */}
              <TableRow className="border-t-2 font-bold">
                <TableCell colSpan={6} className="text-right">Total Salaires:</TableCell>
                <TableCell className="text-right text-lg">{stats.salairesTotal.toFixed(2)} TND</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2>Frais de Maintenance</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter maintenance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer une maintenance</DialogTitle>
              <DialogDescription>
                Enregistrez les frais de maintenance ou de réparation
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMaintenance} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Input id="service" name="service" required placeholder="Ex: Plomberie, Électricité..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temps">Durée</Label>
                <Input id="temps" name="temps" required placeholder="Ex: 2 heures, 1 jour..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Nom de la panne ou rénovation</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  required 
                  placeholder="Décrivez la panne ou la rénovation effectuée..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (TND)</Label>
                <Input id="montant" name="montant" type="number" step="0.01" required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {maintenances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune maintenance enregistrée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenances.map((maintenance) => (
                  <TableRow key={maintenance.id}>
                    <TableCell>{new Date(maintenance.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{maintenance.service}</TableCell>
                    <TableCell>{maintenance.temps}</TableCell>
                    <TableCell className="max-w-xs truncate">{maintenance.description}</TableCell>
                    <TableCell className="text-right">{maintenance.montant.toFixed(2)} TND</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteMaintenance(maintenance.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la maintenance</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette maintenance ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMaintenance}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PinDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        title="Confirmation de suppression"
        description="Entrez le code PIN pour confirmer cette action"
        pinType="delete"
      />
    </div>
  );
}
