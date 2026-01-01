import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Trash2, Edit, CheckCircle2, AlertCircle, Printer } from "lucide-react";
import { Employee } from "../types";
import { toast } from "sonner";

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: string) => void;
  onUpdate: (employee: Employee) => void;
  onMarkPresence: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onDelete, onUpdate, onMarkPresence }: EmployeeCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);

  const salaireBase = employee.joursTravailles * employee.salaireParJour;
  // If salaireTotal is provided, we consider it the authoritative current total after adjustments
  const salaireTotal = typeof employee.salaireTotal === 'number'
    ? employee.salaireTotal
    : (salaireBase - employee.avance);

  const handleEditEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedEmployee: Employee = {
      ...employee,
      nom: formData.get("nom") as string,
      prenom: formData.get("prenom") as string,
      poste: formData.get("poste") as string,
      salaireParJour: parseFloat(formData.get("salaireParJour") as string),
      soldeMaladie: parseFloat(formData.get("soldeMaladie") as string),
      salaireTotal: formData.get("salaireTotal") ? parseFloat(formData.get("salaireTotal") as string) : undefined,
    };

    onUpdate(updatedEmployee);
    setIsEditDialogOpen(false);
    toast.success("Employé modifié avec succès");
  };

  const handleAddAdvance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const montant = parseFloat(formData.get("montant") as string);

    const updatedEmployee: Employee = {
      ...employee,
      avance: employee.avance + montant,
    };

    onUpdate(updatedEmployee);
    setIsAdvanceDialogOpen(false);
    toast.success(`Avance de ${montant} TND ajoutée`);
  };

  const handlePrintEmployee = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Fiche Employé - ${employee.prenom} ${employee.nom}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .info-table th { background-color: #f2f2f2; font-weight: bold; }
              .presences { margin-top: 20px; }
              .presence-item { margin-bottom: 5px; padding: 5px; background-color: #f9f9f9; }
              .summary { background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Café Management System</h1>
              <h2>Fiche Employé</h2>
              <p>Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
            </div>

            <table class="info-table">
              <tr><th>Nom complet</th><td>${employee.prenom} ${employee.nom}</td></tr>
              <tr><th>Poste</th><td>${employee.poste}</td></tr>
              <tr><th>Salaire par jour</th><td>${employee.salaireParJour.toFixed(2)} TND</td></tr>
              <tr><th>Jours travaillés (mois courant)</th><td>${employee.joursTravailles}</td></tr>
              <tr><th>Absences (mois courant)</th><td>${employee.absences}</td></tr>
              <tr><th>Avance (mois courant)</th><td>${employee.avance.toFixed(2)} TND</td></tr>
              <tr><th>Solde maladie</th><td>${employee.soldeMaladie} jours</td></tr>
            </table>

            <div class="summary">
              <h3>Calcul du Salaire Total</h3>
              <p>Salaire de base: ${salaireBase.toFixed(2)} TND</p>
              <p>Avance déduite: ${employee.avance.toFixed(2)} TND</p>
              <p><strong>Salaire total: ${salaireTotal.toFixed(2)} TND</strong></p>
            </div>

            ${employee.presences.length > 0 ? `
              <div class="presences">
                <h3>Présences récentes (${employee.presences.length} jours)</h3>
                ${employee.presences.slice(-10).reverse().map(presence => {
                  const statusText = presence.status === "present" ? "Présent" :
                                   presence.status === "absent" ? "Absent" :
                                   presence.status === "malade" ? "Malade" :
                                   `Retard (${presence.retardMinutes === 31 ? "+30min" : `${presence.retardMinutes}min`})`;
                  return `<div class="presence-item">${new Date(presence.date).toLocaleDateString("fr-FR")} - ${statusText}</div>`;
                }).join('')}
              </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{employee.prenom} {employee.nom}</CardTitle>
              <Badge variant="secondary" className="mt-2">{employee.poste}</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={handlePrintEmployee}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onDelete(employee.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Salaire/jour</p>
              <p>{employee.salaireParJour.toFixed(2)} TND</p>
            </div>
            <div>
              <p className="text-muted-foreground">Jours travaillés</p>
              <p>{employee.joursTravailles}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Absences</p>
              <p className="flex items-center gap-1">
                {employee.absences}
                {employee.absences > 0 && <AlertCircle className="h-3 w-3 text-destructive" />}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Avance</p>
              <p>{employee.avance.toFixed(2)} TND</p>
            </div>
            <div>
              <p className="text-muted-foreground">Solde maladie</p>
              <p>{employee.soldeMaladie.toFixed(2)} TND</p>
            </div>
            <div>
              <p className="text-muted-foreground">Salaire total</p>
              <p className="font-semibold">{salaireTotal.toFixed(2)} TND</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => onMarkPresence(employee)} 
              className="flex-1"
              variant="outline"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marquer présence
            </Button>
            <Button 
              onClick={() => setIsAdvanceDialogOpen(true)}
              variant="outline"
            >
              Avance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'employé
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom</Label>
                <Input id="edit-nom" name="nom" defaultValue={employee.nom} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prenom">Prénom</Label>
                <Input id="edit-prenom" name="prenom" defaultValue={employee.prenom} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-poste">Poste</Label>
              <Input id="edit-poste" name="poste" defaultValue={employee.poste} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-salaireParJour">Salaire par jour (TND)</Label>
                <Input 
                  id="edit-salaireParJour" 
                  name="salaireParJour" 
                  type="number" 
                  step="0.01" 
                  defaultValue={employee.salaireParJour} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-soldeMaladie">Solde maladie (TND)</Label>
                <Input 
                  id="edit-soldeMaladie" 
                  name="soldeMaladie" 
                  type="number" 
                  step="0.01" 
                  defaultValue={employee.soldeMaladie} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salaireTotal">Salaire total (mensuel, optionnel)</Label>
              <Input 
                id="edit-salaireTotal" 
                name="salaireTotal" 
                type="number" 
                step="0.01" 
                defaultValue={typeof employee.salaireTotal === 'number' ? employee.salaireTotal : undefined}
                placeholder="Ex: 1200.00" 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Advance Dialog */}
      <Dialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une avance</DialogTitle>
            <DialogDescription>
              Enregistrez une avance qui sera déduite du salaire
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdvance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (TND)</Label>
              <Input 
                id="montant" 
                name="montant" 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAdvanceDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
